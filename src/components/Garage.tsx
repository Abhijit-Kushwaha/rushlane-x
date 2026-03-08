import React from 'react';
import {
  PlayerData, PlayerUpgrades, UPGRADE_COSTS, UPGRADE_INFO, CARS,
} from '@/game3d/progression';

interface GarageProps {
  player: PlayerData;
  onUpdate: (p: PlayerData) => void;
  onBack: () => void;
}

const MAX_LEVEL = 4;

const Garage: React.FC<GarageProps> = ({ player, onUpdate, onBack }) => {
  const upgrades = player.upgrades;

  const buyUpgrade = (key: keyof PlayerUpgrades) => {
    const lvl = upgrades[key];
    if (lvl >= MAX_LEVEL) return;
    const cost = UPGRADE_COSTS[lvl];
    if (player.money < cost) return;
    onUpdate({
      ...player,
      money: player.money - cost,
      upgrades: { ...upgrades, [key]: lvl + 1 },
    });
  };

  const buyCar = (carId: string) => {
    const car = CARS.find((c) => c.id === carId);
    if (!car || player.ownedCars.includes(carId)) return;
    if (player.money < car.price) return;
    onUpdate({
      ...player,
      money: player.money - car.price,
      ownedCars: [...player.ownedCars, carId],
      selectedCar: carId,
    });
  };

  const selectCar = (carId: string) => {
    if (!player.ownedCars.includes(carId)) return;
    onUpdate({ ...player, selectedCar: carId });
  };

  const selectedCar = CARS.find((c) => c.id === player.selectedCar) || CARS[0];

  return (
    <div className="min-h-screen bg-background flex flex-col items-center py-8 px-4" style={{ fontFamily: 'Orbitron, sans-serif' }}>
      {/* Header */}
      <div className="w-full max-w-3xl flex items-center justify-between mb-8">
        <button
          onClick={onBack}
          className="px-4 py-2 rounded-lg font-display text-sm font-bold tracking-wider border border-border bg-muted/50 text-foreground/70 hover:bg-muted transition-all active:scale-95"
        >
          ← BACK
        </button>
        <div className="flex items-center gap-2">
          <span className="text-accent text-2xl font-black">💰 ${player.money}</span>
        </div>
      </div>

      <h1 className="font-display text-3xl md:text-4xl font-black text-primary text-glow-cyan mb-8 tracking-wider">
        GARAGE
      </h1>

      {/* Cars section */}
      <div className="w-full max-w-3xl mb-10">
        <h2 className="font-display text-lg font-bold text-foreground/80 mb-4 tracking-wider">CARS</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {CARS.map((car) => {
            const owned = player.ownedCars.includes(car.id);
            const selected = player.selectedCar === car.id;
            return (
              <button
                key={car.id}
                onClick={() => owned ? selectCar(car.id) : buyCar(car.id)}
                className="flex flex-col items-center p-4 rounded-xl border transition-all active:scale-95"
                style={{
                  borderColor: selected ? 'hsl(var(--primary))' : 'hsl(var(--border))',
                  background: selected ? 'hsl(var(--primary) / 0.1)' : 'hsl(var(--muted) / 0.5)',
                  boxShadow: selected ? '0 0 20px hsl(var(--primary) / 0.2)' : 'none',
                }}
              >
                {/* Car preview */}
                <div
                  className="w-12 h-8 rounded-md mb-2"
                  style={{ background: car.color, boxShadow: `0 2px 8px ${car.color}44` }}
                />
                <span className="font-display text-xs font-bold text-foreground/90 tracking-wider">{car.name}</span>
                <div className="flex gap-2 mt-1 text-[10px] text-muted-foreground">
                  <span>SPD {(car.baseStats.speed * 10).toFixed(0)}</span>
                  <span>ACC {(car.baseStats.accel * 10).toFixed(0)}</span>
                </div>
                {!owned && (
                  <span
                    className="mt-2 text-xs font-bold px-2 py-0.5 rounded"
                    style={{
                      color: player.money >= car.price ? 'hsl(var(--accent))' : 'hsl(var(--destructive))',
                      background: player.money >= car.price ? 'hsl(var(--accent) / 0.15)' : 'hsl(var(--destructive) / 0.15)',
                    }}
                  >
                    ${car.price}
                  </span>
                )}
                {owned && selected && (
                  <span className="mt-2 text-[10px] font-bold text-primary tracking-widest">EQUIPPED</span>
                )}
                {owned && !selected && (
                  <span className="mt-2 text-[10px] font-bold text-muted-foreground tracking-widest">OWNED</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Upgrades section */}
      <div className="w-full max-w-3xl">
        <h2 className="font-display text-lg font-bold text-foreground/80 mb-4 tracking-wider">UPGRADES</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {(Object.keys(UPGRADE_INFO) as (keyof typeof UPGRADE_INFO)[]).map((key) => {
            const info = UPGRADE_INFO[key];
            const lvl = upgrades[key];
            const maxed = lvl >= MAX_LEVEL;
            const cost = maxed ? 0 : UPGRADE_COSTS[lvl];
            const canAfford = player.money >= cost;

            return (
              <div
                key={key}
                className="flex items-center gap-4 p-4 rounded-xl border border-border bg-muted/30"
              >
                <span className="text-2xl">{info.icon}</span>
                <div className="flex-1">
                  <div className="font-display text-sm font-bold text-foreground/90 tracking-wider">{info.label}</div>
                  <div className="text-[10px] text-muted-foreground mb-2">{info.desc}</div>
                  {/* Level bar */}
                  <div className="flex gap-1">
                    {Array.from({ length: MAX_LEVEL }).map((_, i) => (
                      <div
                        key={i}
                        className="h-2 flex-1 rounded-full"
                        style={{
                          background: i < lvl ? 'hsl(var(--primary))' : 'hsl(var(--muted))',
                          boxShadow: i < lvl ? '0 0 6px hsl(var(--primary) / 0.4)' : 'none',
                        }}
                      />
                    ))}
                  </div>
                </div>
                <button
                  onClick={() => buyUpgrade(key as keyof PlayerUpgrades)}
                  disabled={maxed || !canAfford}
                  className="px-3 py-2 rounded-lg font-display text-xs font-bold tracking-wider transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{
                    background: maxed ? 'hsl(var(--muted))' : canAfford ? 'hsl(var(--primary) / 0.2)' : 'hsl(var(--destructive) / 0.15)',
                    color: maxed ? 'hsl(var(--muted-foreground))' : canAfford ? 'hsl(var(--primary))' : 'hsl(var(--destructive))',
                    border: `1px solid ${maxed ? 'hsl(var(--border))' : canAfford ? 'hsl(var(--primary) / 0.3)' : 'hsl(var(--destructive) / 0.3)'}`,
                  }}
                >
                  {maxed ? 'MAX' : `$${cost}`}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Garage;

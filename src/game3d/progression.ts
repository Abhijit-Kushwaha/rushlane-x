export interface UpgradeLevel {
  level: number;
  maxLevel: number;
  cost: number[];
}

export interface PlayerUpgrades {
  engine: number;    // 0-4
  nitro: number;     // 0-4
  tires: number;     // 0-4
  handling: number;  // 0-4
}

export interface CarOption {
  id: string;
  name: string;
  color: string;
  price: number;
  baseStats: { speed: number; accel: number; grip: number };
}

export interface PlayerData {
  money: number;
  upgrades: PlayerUpgrades;
  selectedCar: string;
  ownedCars: string[];
}

export const DEFAULT_PLAYER: PlayerData = {
  money: 500,
  upgrades: { engine: 0, nitro: 0, tires: 0, handling: 0 },
  selectedCar: 'starter',
  ownedCars: ['starter'],
};

export const CARS: CarOption[] = [
  { id: 'starter', name: 'SPRINT', color: '#1a6fff', price: 0, baseStats: { speed: 1, accel: 1, grip: 1 } },
  { id: 'racer', name: 'BLITZ', color: '#cc2222', price: 1500, baseStats: { speed: 1.1, accel: 1.05, grip: 1.05 } },
  { id: 'muscle', name: 'TITAN', color: '#2a2a2a', price: 3000, baseStats: { speed: 1.2, accel: 1.15, grip: 0.95 } },
  { id: 'super', name: 'PHANTOM', color: '#8822cc', price: 5000, baseStats: { speed: 1.3, accel: 1.2, grip: 1.1 } },
];

export const UPGRADE_COSTS = [200, 400, 800, 1500]; // cost per level (0→1, 1→2, etc.)

export const UPGRADE_INFO = {
  engine: { label: 'ENGINE', desc: 'Top speed & acceleration', icon: '🔧' },
  nitro: { label: 'NITRO', desc: 'Boost power & capacity', icon: '🔥' },
  tires: { label: 'TIRES', desc: 'Grip & off-road penalty', icon: '🛞' },
  handling: { label: 'HANDLING', desc: 'Steering responsiveness', icon: '🎯' },
};

export function applyUpgradesToPhysics(upgrades: PlayerUpgrades) {
  const eng = upgrades.engine;
  const nit = upgrades.nitro;
  const tir = upgrades.tires;
  const han = upgrades.handling;

  return {
    maxSpeedMult: 1 + eng * 0.06,
    accelMult: 1 + eng * 0.05,
    nitroBoostMult: 1 + nit * 0.08,
    nitroDrainMult: 1 - nit * 0.08,
    nitroRegenMult: 1 + nit * 0.1,
    frictionMult: 1 + tir * 0.003,   // higher = more grip
    offtrackMult: 1 - tir * 0.05,    // less speed loss off-track
    steerMult: 1 + han * 0.06,
    driftSteerMult: 1 + han * 0.05,
  };
}

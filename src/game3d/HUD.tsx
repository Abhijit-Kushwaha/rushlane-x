import React from 'react';
import { RaceState } from './types';

interface HUDProps {
  raceState: RaceState & { speed?: number; nitro?: number; maxNitro?: number };
  onBack: () => void;
}

const HUD: React.FC<HUDProps> = ({ raceState, onBack }) => {
  const speed = Math.abs(raceState.speed || 0) * 200;
  const nitro = raceState.nitro ?? 100;
  const maxNitro = raceState.maxNitro ?? 100;
  const nitroPercent = (nitro / maxNitro) * 100;

  const positionColors: Record<number, string> = {
    1: '#ffd700',
    2: '#c0c0c0',
    3: '#cd7f32',
    4: '#888888',
  };

  const formatTime = (t: number) => {
    const mins = Math.floor(t / 60);
    const secs = Math.floor(t % 60);
    const ms = Math.floor((t % 1) * 100);
    return `${mins}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
  };

  return (
    <div className="absolute inset-0 pointer-events-none" style={{ fontFamily: 'Orbitron, sans-serif' }}>
      {/* Back button */}
      <button
        onClick={onBack}
        className="absolute top-3 left-3 pointer-events-auto px-3 py-1.5 rounded-lg text-xs font-bold tracking-wider"
        style={{
          background: 'rgba(0,0,0,0.6)',
          color: '#aabbcc',
          border: '1px solid #333',
          backdropFilter: 'blur(4px)',
        }}
      >
        ← BACK
      </button>

      {/* Speed */}
      <div className="absolute bottom-6 right-6 text-right">
        <div className="text-5xl font-black" style={{ color: '#00e5ff', textShadow: '0 0 20px #00e5ff88' }}>
          {Math.floor(speed)}
        </div>
        <div className="text-xs tracking-widest" style={{ color: '#668899' }}>KM/H</div>
      </div>

      {/* Nitro bar */}
      <div className="absolute bottom-6 left-6" style={{ width: 180 }}>
        <div className="text-xs tracking-widest mb-1" style={{ color: '#668899' }}>NITRO</div>
        <div className="rounded-full overflow-hidden" style={{ height: 8, background: 'rgba(0,0,0,0.5)' }}>
          <div
            className="h-full rounded-full transition-all duration-100"
            style={{
              width: `${nitroPercent}%`,
              background: nitroPercent > 30
                ? 'linear-gradient(90deg, #0088ff, #00ccff)'
                : 'linear-gradient(90deg, #ff4400, #ff8800)',
              boxShadow: nitroPercent > 30 ? '0 0 10px #00ccff88' : '0 0 10px #ff440088',
            }}
          />
        </div>
      </div>

      {/* Position */}
      <div className="absolute top-4 right-6 text-right">
        <div
          className="text-5xl font-black"
          style={{ color: positionColors[raceState.position] || '#fff', textShadow: '0 0 15px rgba(255,255,255,0.3)' }}
        >
          {raceState.position}<sup className="text-lg">{getOrdinal(raceState.position)}</sup>
        </div>
      </div>

      {/* Lap */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 text-center">
        <div className="text-xs tracking-widest" style={{ color: '#668899' }}>LAP</div>
        <div className="text-2xl font-bold" style={{ color: '#ffffff' }}>
          {Math.min(raceState.lap + 1, raceState.totalLaps)} / {raceState.totalLaps}
        </div>
      </div>

      {/* Time */}
      <div className="absolute top-16 left-1/2 -translate-x-1/2 text-center">
        <div className="text-lg font-mono" style={{ color: '#aabbcc' }}>
          {formatTime(raceState.raceTime)}
        </div>
      </div>

      {/* Countdown */}
      {raceState.status === 'countdown' && raceState.countdownTimer > 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className="text-8xl font-black animate-pulse"
            style={{ color: '#ff4400', textShadow: '0 0 40px #ff440088' }}
          >
            {raceState.countdownTimer > 1 ? Math.ceil(raceState.countdownTimer) : 'GO!'}
          </div>
        </div>
      )}

      {/* Race finished */}
      {raceState.status === 'finished' && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-auto">
          <div
            className="text-center p-8 rounded-2xl"
            style={{
              background: 'rgba(0,0,0,0.85)',
              border: '2px solid #333',
              backdropFilter: 'blur(8px)',
            }}
          >
            <div className="text-4xl font-black mb-4" style={{ color: '#ffd700', textShadow: '0 0 20px #ffd70088' }}>
              RACE COMPLETE
            </div>
            <div className="text-6xl font-black mb-2" style={{ color: positionColors[raceState.position] }}>
              {raceState.position}<sup className="text-2xl">{getOrdinal(raceState.position)}</sup> PLACE
            </div>
            <div className="text-lg mb-2" style={{ color: '#aabbcc' }}>
              Time: {formatTime(raceState.raceTime)}
            </div>
            <div className="text-2xl font-bold mb-6" style={{ color: '#00ff88' }}>
              💰 ${raceState.money}
            </div>
            <button
              onClick={onBack}
              className="px-8 py-3 rounded-xl text-lg font-bold tracking-wider"
              style={{
                background: 'linear-gradient(135deg, #00ccff, #0066ff)',
                color: '#fff',
                boxShadow: '0 0 20px #00ccff44',
              }}
            >
              CONTINUE
            </button>
          </div>
        </div>
      )}

      {/* Controls hint */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2">
        <div className="text-[10px] tracking-wider" style={{ color: '#334455' }}>
          W/S – Accel/Brake | A/D – Steer | SHIFT – Nitro | SPACE – Drift | C – Camera
        </div>
      </div>
    </div>
  );
};

function getOrdinal(n: number): string {
  if (n === 1) return 'st';
  if (n === 2) return 'nd';
  if (n === 3) return 'rd';
  return 'th';
}

export default HUD;

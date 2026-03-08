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
    1: '#d4a017',
    2: '#888888',
    3: '#8b5e3c',
    4: '#555555',
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
          background: 'rgba(255,255,255,0.85)',
          color: '#333',
          border: '1px solid #ccc',
          backdropFilter: 'blur(4px)',
        }}
      >
        ← BACK
      </button>

      {/* Speed */}
      <div className="absolute bottom-6 right-6 text-right">
        <div className="text-5xl font-black" style={{ color: '#1a1a1a', textShadow: '0 2px 8px rgba(0,0,0,0.2)' }}>
          {Math.floor(speed)}
        </div>
        <div className="text-xs tracking-widest" style={{ color: '#555' }}>KM/H</div>
      </div>

      {/* Nitro bar */}
      <div className="absolute bottom-6 left-6" style={{ width: 180 }}>
        <div className="text-xs tracking-widest mb-1" style={{ color: '#555' }}>NITRO</div>
        <div className="rounded-full overflow-hidden" style={{ height: 8, background: 'rgba(0,0,0,0.15)' }}>
          <div
            className="h-full rounded-full transition-all duration-100"
            style={{
              width: `${nitroPercent}%`,
              background: nitroPercent > 30
                ? 'linear-gradient(90deg, #1a6fff, #4a9fff)'
                : 'linear-gradient(90deg, #cc3300, #ff6600)',
            }}
          />
        </div>
      </div>

      {/* Position */}
      <div className="absolute top-4 right-6 text-right">
        <div
          className="text-5xl font-black"
          style={{ color: positionColors[raceState.position] || '#333', textShadow: '0 2px 6px rgba(0,0,0,0.15)' }}
        >
          {raceState.position}<sup className="text-lg">{getOrdinal(raceState.position)}</sup>
        </div>
      </div>

      {/* Lap */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 text-center">
        <div className="text-xs tracking-widest" style={{ color: '#555' }}>LAP</div>
        <div className="text-2xl font-bold" style={{ color: '#1a1a1a' }}>
          {Math.min(raceState.lap + 1, raceState.totalLaps)} / {raceState.totalLaps}
        </div>
      </div>

      {/* Time */}
      <div className="absolute top-16 left-1/2 -translate-x-1/2 text-center">
        <div className="text-lg font-mono" style={{ color: '#333' }}>
          {formatTime(raceState.raceTime)}
        </div>
      </div>

      {/* Countdown */}
      {raceState.status === 'countdown' && raceState.countdownTimer > 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className="text-8xl font-black animate-pulse"
            style={{ color: '#cc2200', textShadow: '0 4px 20px rgba(200,0,0,0.3)' }}
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
              background: 'rgba(255,255,255,0.92)',
              border: '2px solid #ddd',
              backdropFilter: 'blur(12px)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
            }}
          >
            <div className="text-4xl font-black mb-4" style={{ color: '#d4a017' }}>
              RACE COMPLETE
            </div>
            <div className="text-6xl font-black mb-2" style={{ color: positionColors[raceState.position] }}>
              {raceState.position}<sup className="text-2xl">{getOrdinal(raceState.position)}</sup> PLACE
            </div>
            <div className="text-lg mb-2" style={{ color: '#555' }}>
              Time: {formatTime(raceState.raceTime)}
            </div>
            <div className="text-2xl font-bold mb-6" style={{ color: '#2d8a4e' }}>
              💰 ${raceState.money}
            </div>
            <button
              onClick={onBack}
              className="px-8 py-3 rounded-xl text-lg font-bold tracking-wider"
              style={{
                background: 'linear-gradient(135deg, #1a6fff, #0044cc)',
                color: '#fff',
                boxShadow: '0 4px 15px rgba(26,111,255,0.3)',
              }}
            >
              CONTINUE
            </button>
          </div>
        </div>
      )}

      {/* Controls hint */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2">
        <div className="text-[10px] tracking-wider" style={{ color: 'rgba(0,0,0,0.3)' }}>
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

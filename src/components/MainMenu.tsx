import React, { useState } from 'react';
import { GameSettings } from '@/game3d/types';

interface MainMenuProps {
  onPlay: (settings: GameSettings) => void;
}

const MainMenu: React.FC<MainMenuProps> = ({ onPlay }) => {
  const [difficulty, setDifficulty] = useState<GameSettings['difficulty']>('medium');

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background relative overflow-hidden">
      {/* Animated background lines */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-px bg-gradient-to-b from-transparent via-primary/20 to-transparent"
            style={{
              left: `${15 + i * 15}%`,
              height: '120%',
              top: '-10%',
              animation: `scroll ${3 + i * 0.5}s linear infinite`,
              animationDelay: `${i * 0.3}s`,
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center gap-8 px-4">
        {/* Title */}
        <div className="text-center animate-slide-up">
          <h1 className="font-display text-5xl md:text-7xl font-black tracking-wider text-primary text-glow-cyan">
            RUSHLANE
          </h1>
          <div className="flex items-center justify-center gap-3 mt-1">
            <div className="h-px w-12 bg-gradient-to-r from-transparent to-secondary" />
            <span className="font-display text-2xl md:text-3xl font-bold text-secondary text-glow-magenta tracking-[0.3em]">
              X
            </span>
            <div className="h-px w-12 bg-gradient-to-l from-transparent to-secondary" />
          </div>
          <p className="font-body text-muted-foreground text-sm mt-2 tracking-widest">3D CIRCUIT RACING</p>
        </div>

        {/* Difficulty selector */}
        <div className="flex flex-col items-center gap-3 animate-slide-up" style={{ animationDelay: '0.15s' }}>
          <p className="font-body text-muted-foreground text-sm tracking-wider">DIFFICULTY</p>
          <div className="flex gap-2">
            {(['easy', 'medium', 'hard'] as const).map((d) => (
              <button
                key={d}
                onClick={() => setDifficulty(d)}
                className="px-4 py-2 rounded-lg font-display text-sm font-bold tracking-wider transition-all active:scale-95"
                style={{
                  background: difficulty === d ? 'rgba(0,204,255,0.2)' : 'rgba(255,255,255,0.05)',
                  color: difficulty === d ? '#00ccff' : '#667788',
                  border: `1px solid ${difficulty === d ? '#00ccff44' : '#333'}`,
                  boxShadow: difficulty === d ? '0 0 15px #00ccff22' : 'none',
                }}
              >
                {d.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Play button */}
        <button
          onClick={() => onPlay({ difficulty, cameraMode: 'third' })}
          className="group relative mt-4 animate-slide-up"
          style={{ animationDelay: '0.3s' }}
        >
          <div className="absolute inset-0 rounded-2xl bg-primary/20 blur-xl group-hover:bg-primary/30 transition-all" />
          <div className="relative px-12 py-4 rounded-2xl neon-border bg-muted/60 backdrop-blur font-display text-xl font-bold text-primary tracking-widest hover:bg-muted/80 transition-all active:scale-95">
            ▶ RACE
          </div>
        </button>

        {/* Controls hint */}
        <div className="flex flex-col items-center gap-2 mt-6 animate-slide-up" style={{ animationDelay: '0.5s' }}>
          <p className="font-body text-muted-foreground text-sm">CONTROLS</p>
          <div className="grid grid-cols-4 gap-2 text-center">
            {[
              { key: 'W/S', label: 'Accel/Brake' },
              { key: 'A/D', label: 'Steer' },
              { key: 'SHIFT', label: 'Nitro' },
              { key: 'SPACE', label: 'Drift' },
            ].map(({ key, label }) => (
              <div key={key} className="flex flex-col items-center gap-1">
                <div className="px-3 py-1.5 rounded-lg border border-border bg-muted/50 font-display text-foreground/70 text-xs">
                  {key}
                </div>
                <span className="text-[10px] text-muted-foreground/60">{label}</span>
              </div>
            ))}
          </div>
          <p className="font-body text-muted-foreground/40 text-xs mt-2">Press C to toggle camera</p>
        </div>
      </div>

      <style>{`
        @keyframes scroll {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100%); }
        }
      `}</style>
    </div>
  );
};

export default MainMenu;

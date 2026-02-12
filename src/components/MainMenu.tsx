import React from 'react';

interface MainMenuProps {
  onPlay: () => void;
}

const MainMenu: React.FC<MainMenuProps> = ({ onPlay }) => {
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

      {/* Road lines decoration */}
      <div className="absolute inset-0 flex justify-center pointer-events-none">
        <div className="w-px h-full bg-gradient-to-b from-primary/0 via-primary/10 to-primary/0" />
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
        </div>

        {/* Tagline */}
        <p className="font-body text-muted-foreground text-lg tracking-wider animate-slide-up" style={{ animationDelay: '0.15s' }}>
          ENDLESS HIGHWAY RACING
        </p>

        {/* Play button */}
        <button
          onClick={onPlay}
          className="group relative mt-4 animate-slide-up"
          style={{ animationDelay: '0.3s' }}
        >
          <div className="absolute inset-0 rounded-2xl bg-primary/20 blur-xl group-hover:bg-primary/30 transition-all" />
          <div className="relative px-12 py-4 rounded-2xl neon-border bg-muted/60 backdrop-blur font-display text-xl font-bold text-primary tracking-widest hover:bg-muted/80 transition-all active:scale-95">
            ▶ PLAY
          </div>
        </button>

        {/* Controls hint */}
        <div className="flex flex-col items-center gap-2 mt-8 animate-slide-up" style={{ animationDelay: '0.5s' }}>
          <p className="font-body text-muted-foreground text-sm">CONTROLS</p>
          <div className="flex gap-2">
            {['←', '↓', '→'].map((key) => (
              <div
                key={key}
                className="w-10 h-10 rounded-lg border border-border bg-muted/50 flex items-center justify-center font-display text-foreground/70 text-sm"
              >
                {key}
              </div>
            ))}
          </div>
          <p className="font-body text-muted-foreground/60 text-xs mt-1">
            Switch lanes · Brake · Dodge traffic · Collect coins
          </p>
        </div>

        {/* High score placeholder */}
        <div className="mt-4 text-center animate-slide-up" style={{ animationDelay: '0.6s' }}>
          <p className="font-body text-accent/60 text-sm tracking-wider">
            🪙 NEAR MISS = COMBO BONUS
          </p>
        </div>
      </div>

      {/* Inline keyframe */}
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

import React, { useState, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import Scene from './Scene';
import HUD from './HUD';
import { RaceState, GameSettings, TOTAL_LAPS } from './types';

interface Game3DProps {
  onBack: () => void;
  settings?: GameSettings;
}

const Game3D: React.FC<Game3DProps> = ({ onBack, settings }) => {
  const gameSettings: GameSettings = settings || { difficulty: 'medium', cameraMode: 'third' };
  const [raceState, setRaceState] = useState<RaceState & { speed?: number; nitro?: number; maxNitro?: number }>({
    status: 'countdown',
    lap: 0,
    totalLaps: TOTAL_LAPS,
    position: 4,
    countdownTimer: 3.5,
    raceTime: 0,
    money: 0,
    checkpointIndex: 0,
  });

  const handleRaceUpdate = (state: RaceState) => {
    setRaceState(state as any);
  };

  const handleRaceEnd = (state: RaceState) => {
    setRaceState(state as any);
  };

  return (
    <div className="relative w-full h-screen" style={{ background: '#87ceeb' }}>
      <Canvas
        shadows
        camera={{ fov: 65, near: 0.1, far: 500, position: [0, 6, -12] }}
        gl={{
          antialias: true,
          toneMapping: 3, // ACESFilmicToneMapping
          toneMappingExposure: 1.4,
        }}
        style={{ width: '100%', height: '100%' }}
      >
        <Suspense fallback={null}>
          <Scene
            settings={gameSettings}
            onRaceUpdate={handleRaceUpdate}
            onRaceEnd={handleRaceEnd}
          />
        </Suspense>
      </Canvas>
      <HUD raceState={raceState} onBack={onBack} />
    </div>
  );
};

export default Game3D;

import React, { useState } from 'react';
import MainMenu from '@/components/MainMenu';
import GameCanvas from '@/game/GameCanvas';

const Index: React.FC = () => {
  const [screen, setScreen] = useState<'menu' | 'game'>('menu');

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      {screen === 'menu' ? (
        <MainMenu onPlay={() => setScreen('game')} />
      ) : (
        <div className="py-4">
          <GameCanvas onBack={() => setScreen('menu')} />
        </div>
      )}
    </div>
  );
};

export default Index;

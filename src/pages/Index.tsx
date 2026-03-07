import React, { useState } from 'react';
import MainMenu from '@/components/MainMenu';
import Game3D from '@/game3d/Game3D';
import { GameSettings } from '@/game3d/types';

const Index: React.FC = () => {
  const [screen, setScreen] = useState<'menu' | 'game'>('menu');
  const [settings, setSettings] = useState<GameSettings>({ difficulty: 'medium', cameraMode: 'third' });

  return (
    <div className="min-h-screen bg-background">
      {screen === 'menu' ? (
        <MainMenu onPlay={(s) => { setSettings(s); setScreen('game'); }} />
      ) : (
        <Game3D onBack={() => setScreen('menu')} settings={settings} />
      )}
    </div>
  );
};

export default Index;

import React, { useState, useCallback } from 'react';
import MainMenu from '@/components/MainMenu';
import Garage from '@/components/Garage';
import Game3D from '@/game3d/Game3D';
import { GameSettings } from '@/game3d/types';
import { PlayerData, DEFAULT_PLAYER, applyUpgradesToPhysics } from '@/game3d/progression';

const STORAGE_KEY = 'rushlane_player';

function loadPlayer(): PlayerData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { ...DEFAULT_PLAYER };
}

function savePlayer(p: PlayerData) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
}

const Index: React.FC = () => {
  const [screen, setScreen] = useState<'menu' | 'garage' | 'game'>('menu');
  const [settings, setSettings] = useState<GameSettings>({ difficulty: 'medium', cameraMode: 'third' });
  const [player, setPlayer] = useState<PlayerData>(loadPlayer);

  const updatePlayer = useCallback((p: PlayerData) => {
    setPlayer(p);
    savePlayer(p);
  }, []);

  const handleRaceEnd = useCallback((money: number) => {
    const updated = { ...player, money: player.money + money };
    updatePlayer(updated);
  }, [player, updatePlayer]);

  return (
    <div className="min-h-screen bg-background">
      {screen === 'menu' && (
        <MainMenu
          onPlay={(s) => { setSettings(s); setScreen('game'); }}
          onGarage={() => setScreen('garage')}
          money={player.money}
        />
      )}
      {screen === 'garage' && (
        <Garage
          player={player}
          onUpdate={updatePlayer}
          onBack={() => setScreen('menu')}
        />
      )}
      {screen === 'game' && (
        <Game3D
          onBack={() => setScreen('menu')}
          settings={settings}
          playerUpgrades={player.upgrades}
          onRaceEnd={handleRaceEnd}
        />
      )}
    </div>
  );
};

export default Index;

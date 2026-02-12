import React, { useRef, useEffect, useCallback, useState } from 'react';
import {
  GameState, Car, Coin, Particle, SpeedLine,
  GAME_WIDTH, GAME_HEIGHT, LANE_COUNT, CAR_WIDTH, CAR_HEIGHT,
} from './types';
import {
  INITIAL_SPEED, MAX_SPEED, SPEED_INCREMENT, BRAKE_DECEL,
  LANE_SWITCH_SPEED, TRAFFIC_SPAWN_INTERVAL, COIN_SPAWN_INTERVAL,
  COMBO_TIMEOUT,
} from './constants';
import {
  createInitialState, createPlayerCar, spawnTraffic, spawnCoin,
  checkCollision, checkNearMiss, checkCoinCollection,
  createParticles, updateParticles, createSpeedLine, updateSpeedLines,
  aiLaneChange,
} from './engine';
import {
  drawRoad, drawCar, drawCoin, drawParticles, drawSpeedLines,
  drawHUD, drawGameOver, getLaneX,
} from './renderer';

interface GameCanvasProps {
  onBack: () => void;
}

const GameCanvas: React.FC<GameCanvasProps> = ({ onBack }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef<GameState>(createInitialState());
  const trafficRef = useRef<Car[]>([]);
  const coinsRef = useRef<Coin[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const speedLinesRef = useRef<SpeedLine[]>([]);
  const frameRef = useRef(0);
  const roadOffsetRef = useRef(0);
  const keysRef = useRef<Set<string>>(new Set());
  const nearMissSetRef = useRef<Set<Car>>(new Set());
  const animFrameRef = useRef<number>(0);
  const [, forceUpdate] = useState(0);

  const startGame = useCallback(() => {
    const s = createInitialState();
    s.status = 'playing';
    stateRef.current = s;
    trafficRef.current = [];
    coinsRef.current = [];
    particlesRef.current = [];
    speedLinesRef.current = [];
    frameRef.current = 0;
    roadOffsetRef.current = 0;
    nearMissSetRef.current = new Set();
    forceUpdate((v) => v + 1);
  }, []);

  const gameLoop = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const state = stateRef.current;
    const traffic = trafficRef.current;
    const coins = coinsRef.current;
    const keys = keysRef.current;

    if (state.status !== 'playing') {
      // Still draw current frame
      ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
      drawRoad(ctx, roadOffsetRef.current);
      traffic.forEach((c) => drawCar(ctx, c, false));
      coins.forEach((c) => drawCoin(ctx, c));
      const player = createPlayerCar(state);
      drawCar(ctx, player, true);
      drawHUD(ctx, state);
      if (state.status === 'gameover') drawGameOver(ctx, state);
      animFrameRef.current = requestAnimationFrame(gameLoop);
      return;
    }

    frameRef.current++;

    // Input
    if (keys.has('ArrowLeft') || keys.has('a')) {
      if (state.targetLane > 0) {
        state.targetLane = Math.max(0, state.playerLane - 1);
        keys.delete('ArrowLeft');
        keys.delete('a');
      }
    }
    if (keys.has('ArrowRight') || keys.has('d')) {
      if (state.targetLane < LANE_COUNT - 1) {
        state.targetLane = Math.min(LANE_COUNT - 1, state.playerLane + 1);
        keys.delete('ArrowRight');
        keys.delete('d');
      }
    }
    state.braking = keys.has('ArrowDown') || keys.has('s');

    // Lane switching
    const targetX = getLaneX(state.targetLane);
    const currentX = getLaneX(state.playerLane);
    if (state.targetLane !== state.playerLane) {
      state.playerLane = state.targetLane;
    }

    // Speed
    if (state.braking) {
      state.speed = Math.max(INITIAL_SPEED * 0.5, state.speed - BRAKE_DECEL);
    } else {
      state.speed = Math.min(MAX_SPEED, state.speed + SPEED_INCREMENT);
    }
    if (state.speed > state.maxSpeed) state.maxSpeed = state.speed;

    // Road scroll
    roadOffsetRef.current += state.speed * 3;

    // Score & distance
    state.score += state.speed * 0.1 * (1 + state.combo * 0.1);
    state.distance += state.speed * 0.05;

    // Combo decay
    if (state.comboTimer > 0) {
      state.comboTimer--;
      if (state.comboTimer <= 0) {
        state.combo = 0;
      }
    }

    // Screen shake
    if (state.shakeTimer > 0) {
      state.shakeTimer--;
      state.shakeX = (Math.random() - 0.5) * 6;
      state.shakeY = (Math.random() - 0.5) * 6;
    } else {
      state.shakeX = 0;
      state.shakeY = 0;
    }

    // Spawn traffic
    const spawnRate = Math.max(20, TRAFFIC_SPAWN_INTERVAL - state.speed * 2);
    if (frameRef.current % Math.floor(spawnRate) === 0) {
      const car = spawnTraffic(state, traffic);
      if (car) traffic.push(car);
    }

    // Spawn coins
    if (frameRef.current % COIN_SPAWN_INTERVAL === 0) {
      coins.push(spawnCoin(state));
    }

    // Update traffic
    const player = createPlayerCar(state);
    for (let i = traffic.length - 1; i >= 0; i--) {
      const car = traffic[i];
      const relSpeed = state.speed - car.speed;
      car.y += relSpeed * 1.5;

      // AI lane changes
      const newLane = aiLaneChange(car, traffic, state);
      if (newLane !== car.lane) {
        car.lane = newLane;
      }
      car.x += (getLaneX(car.lane) - car.x) * 0.1;

      // Remove off-screen
      if (car.y > GAME_HEIGHT + 100 || car.y < -200) {
        traffic.splice(i, 1);
        continue;
      }

      // Collision
      if (checkCollision(player, car)) {
        state.status = 'gameover';
        state.shakeTimer = 15;
        particlesRef.current.push(
          ...createParticles(player.x, player.y, '#ff0066', 30)
        );
        forceUpdate((v) => v + 1);
        break;
      }

      // Near miss
      if (checkNearMiss(player, car) && !nearMissSetRef.current.has(car)) {
        nearMissSetRef.current.add(car);
        state.combo++;
        state.comboTimer = COMBO_TIMEOUT;
        state.score += 50 * state.combo;
        particlesRef.current.push(
          ...createParticles(player.x, player.y - 20, '#00ff88', 8)
        );
      }
    }

    // Update coins
    for (let i = coins.length - 1; i >= 0; i--) {
      const coin = coins[i];
      coin.y += state.speed * 1.5;
      coin.angle += 0.05;

      if (checkCoinCollection(player, coin)) {
        coin.collected = true;
        state.coins++;
        state.score += 100;
        particlesRef.current.push(
          ...createParticles(coin.x, coin.y, '#ffd700', 10)
        );
      }

      if (coin.y > GAME_HEIGHT + 50 || coin.collected) {
        coins.splice(i, 1);
      }
    }

    // Particles
    particlesRef.current = updateParticles(particlesRef.current);

    // Speed lines
    speedLinesRef.current = updateSpeedLines(speedLinesRef.current, state.speed);

    // DRAW
    ctx.save();
    ctx.translate(state.shakeX, state.shakeY);

    ctx.clearRect(-10, -10, GAME_WIDTH + 20, GAME_HEIGHT + 20);
    drawRoad(ctx, roadOffsetRef.current);
    drawSpeedLines(ctx, speedLinesRef.current);
    coins.forEach((c) => drawCoin(ctx, c));
    traffic.forEach((c) => drawCar(ctx, c, false));
    drawCar(ctx, player, true);
    drawParticles(ctx, particlesRef.current);
    drawHUD(ctx, state);

    ctx.restore();

    animFrameRef.current = requestAnimationFrame(gameLoop);
  }, []);

  // Keyboard
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysRef.current.add(e.key);

      if (stateRef.current.status === 'gameover' && e.key === 'Enter') {
        startGame();
      }
      if (stateRef.current.status === 'menu' && e.key === 'Enter') {
        startGame();
      }
      if (e.key === 'Escape') {
        onBack();
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      keysRef.current.delete(e.key);
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [startGame, onBack]);

  // Touch controls
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let touchStartX = 0;

    const handleTouchStart = (e: TouchEvent) => {
      e.preventDefault();
      touchStartX = e.touches[0].clientX;

      if (stateRef.current.status === 'gameover' || stateRef.current.status === 'menu') {
        startGame();
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      const dx = e.touches[0].clientX - touchStartX;
      if (Math.abs(dx) > 30) {
        if (dx > 0) {
          keysRef.current.add('ArrowRight');
          setTimeout(() => keysRef.current.delete('ArrowRight'), 50);
        } else {
          keysRef.current.add('ArrowLeft');
          setTimeout(() => keysRef.current.delete('ArrowLeft'), 50);
        }
        touchStartX = e.touches[0].clientX;
      }
    };

    canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });

    return () => {
      canvas.removeEventListener('touchstart', handleTouchStart);
      canvas.removeEventListener('touchmove', handleTouchMove);
    };
  }, [startGame]);

  // Game loop start
  useEffect(() => {
    stateRef.current.status = 'playing';
    startGame();
    animFrameRef.current = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [gameLoop, startGame]);

  return (
    <div className="flex flex-col items-center gap-4">
      <canvas
        ref={canvasRef}
        width={GAME_WIDTH}
        height={GAME_HEIGHT}
        className="rounded-lg border border-border"
        style={{
          maxWidth: '100%',
          maxHeight: '85vh',
          imageRendering: 'pixelated',
        }}
      />
      {/* Mobile controls */}
      <div className="flex gap-3 md:hidden">
        <button
          className="w-16 h-16 rounded-xl bg-muted/50 border border-primary/30 flex items-center justify-center text-primary font-display text-xl active:bg-primary/20 select-none"
          onTouchStart={(e) => {
            e.preventDefault();
            keysRef.current.add('ArrowLeft');
          }}
          onTouchEnd={() => keysRef.current.delete('ArrowLeft')}
        >
          ◀
        </button>
        <button
          className="w-16 h-16 rounded-xl bg-muted/50 border border-accent/30 flex items-center justify-center text-accent font-display text-xl active:bg-accent/20 select-none"
          onTouchStart={(e) => {
            e.preventDefault();
            keysRef.current.add('ArrowDown');
          }}
          onTouchEnd={() => keysRef.current.delete('ArrowDown')}
        >
          ▼
        </button>
        <button
          className="w-16 h-16 rounded-xl bg-muted/50 border border-primary/30 flex items-center justify-center text-primary font-display text-xl active:bg-primary/20 select-none"
          onTouchStart={(e) => {
            e.preventDefault();
            keysRef.current.add('ArrowRight');
          }}
          onTouchEnd={() => keysRef.current.delete('ArrowRight')}
        >
          ▶
        </button>
      </div>
      <p className="text-muted-foreground text-sm font-body hidden md:block">
        ← → Arrow keys to switch lanes · ↓ Brake · ESC Menu
      </p>
    </div>
  );
};

export default GameCanvas;

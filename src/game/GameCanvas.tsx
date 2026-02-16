import React, { useRef, useEffect, useCallback, useState } from 'react';
import { Settings } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Switch } from '@/components/ui/switch';
import {
  GameState, Car, Coin, Particle, SpeedLine, Obstacle, PowerUp,
  AbilityState, BossState,
  GAME_WIDTH, GAME_HEIGHT, LANE_COUNT, CAR_WIDTH, CAR_HEIGHT,
  BOSS_OBSTACLE_INTERVAL, BOSS_SURVIVE_DISTANCE,
  BOSS_SPAWN_MIN, BOSS_SPAWN_MAX,
  ENERGY_PER_PICKUP, POWERUP_SPAWN_INTERVAL,
} from './types';
import {
  INITIAL_SPEED, MAX_SPEED, SPEED_INCREMENT, BRAKE_DECEL,
  TRAFFIC_SPAWN_INTERVAL, COIN_SPAWN_INTERVAL,
  COMBO_TIMEOUT,
} from './constants';
import {
  createInitialState, createInitialAbility, createInitialBoss,
  createPlayerCar, spawnTraffic, spawnCoin, spawnPowerUp, spawnBoss, spawnBossObstacle,
  getAbilityDuration, findSafeLane,
  checkCollision, checkNearMiss, checkCoinCollection, checkObstacleCollision,
  createParticles, updateParticles, updateSpeedLines,
  aiLaneChange,
} from './engine';
import {
  drawRoad, drawCar, drawCoin, drawPowerUp, drawObstacle,
  drawParticles, drawSpeedLines, drawHUD, drawGameOver,
  drawSlowMotionOverlay, getLaneX,
} from './renderer';

interface GameCanvasProps {
  onBack: () => void;
}

const GameCanvas: React.FC<GameCanvasProps> = ({ onBack }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef<GameState>(createInitialState());
  const abilityRef = useRef<AbilityState>(createInitialAbility());
  const bossRef = useRef<BossState>(createInitialBoss());
  const trafficRef = useRef<Car[]>([]);
  const coinsRef = useRef<Coin[]>([]);
  const obstaclesRef = useRef<Obstacle[]>([]);
  const powerUpsRef = useRef<PowerUp[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const speedLinesRef = useRef<SpeedLine[]>([]);
  const frameRef = useRef(0);
  const roadOffsetRef = useRef(0);
  const keysRef = useRef<Set<string>>(new Set());
  const nearMissSetRef = useRef<Set<Car>>(new Set());
  const animFrameRef = useRef<number>(0);
  const [, forceUpdate] = useState(0);
  const [showMobileControls, setShowMobileControls] = useState(() => {
    const saved = localStorage.getItem('rushlane-mobile-controls');
    return saved !== null ? saved === 'true' : true;
  });

  const startGame = useCallback(() => {
    const s = createInitialState();
    s.status = 'playing';
    stateRef.current = s;
    abilityRef.current = createInitialAbility();
    bossRef.current = createInitialBoss();
    trafficRef.current = [];
    coinsRef.current = [];
    obstaclesRef.current = [];
    powerUpsRef.current = [];
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
    const ability = abilityRef.current;
    const boss = bossRef.current;
    const traffic = trafficRef.current;
    const coins = coinsRef.current;
    const obstacles = obstaclesRef.current;
    const powerUps = powerUpsRef.current;
    const keys = keysRef.current;

    if (state.status !== 'playing') {
      ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
      drawRoad(ctx, roadOffsetRef.current);
      traffic.forEach((c) => drawCar(ctx, c, false));
      coins.forEach((c) => drawCoin(ctx, c));
      obstacles.forEach((o) => drawObstacle(ctx, o));
      powerUps.forEach((p) => drawPowerUp(ctx, p));
      const player = createPlayerCar(state);
      drawCar(ctx, player, true, ability.active === 'shield');
      drawHUD(ctx, state, ability, boss);
      if (state.status === 'gameover') drawGameOver(ctx, state);
      animFrameRef.current = requestAnimationFrame(gameLoop);
      return;
    }

    frameRef.current++;
    const speedMult = state.slowMotion ? 0.4 : 1;

    // Input
    if (keys.has('ArrowLeft') || keys.has('a')) {
      if (state.targetLane > 0) {
        state.targetLane = Math.max(0, state.playerLane - 1);
        keys.delete('ArrowLeft'); keys.delete('a');
      }
    }
    if (keys.has('ArrowRight') || keys.has('d')) {
      if (state.targetLane < LANE_COUNT - 1) {
        state.targetLane = Math.min(LANE_COUNT - 1, state.playerLane + 1);
        keys.delete('ArrowRight'); keys.delete('d');
      }
    }
    state.braking = keys.has('ArrowDown') || keys.has('s');

    // Ability activation
    if (keys.has(' ')) {
      keys.delete(' ');
      if (ability.energy >= ability.maxEnergy && !ability.active) {
        // Pick random ability
        const types = ['slowmo', 'shield', 'doublecoins', 'autododge'] as const;
        const chosen = types[Math.floor(Math.random() * types.length)];
        ability.active = chosen;
        ability.activeTimer = getAbilityDuration(chosen);
        ability.energy = 0;
        if (chosen === 'shield') ability.shieldHits = 1;
        if (chosen === 'slowmo') state.slowMotion = true;
        particlesRef.current.push(
          ...createParticles(getLaneX(state.playerLane), state.playerY, '#00ff88', 20)
        );
      }
    }

    // Auto-dodge ability
    if (ability.active === 'autododge') {
      const safeLane = findSafeLane(state.playerLane, traffic, state.playerY);
      if (safeLane !== state.playerLane) {
        state.targetLane = safeLane;
      }
    }

    // Lane switch
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

    const effectiveSpeed = state.speed * speedMult;

    roadOffsetRef.current += effectiveSpeed * 3;
    state.score += effectiveSpeed * 0.1 * (1 + state.combo * 0.1);
    state.distance += effectiveSpeed * 0.05;

    // Combo decay
    if (state.comboTimer > 0) {
      state.comboTimer--;
      if (state.comboTimer <= 0) state.combo = 0;
    }

    // Screen shake
    if (state.shakeTimer > 0) {
      state.shakeTimer--;
      state.shakeX = (Math.random() - 0.5) * 6;
      state.shakeY = (Math.random() - 0.5) * 6;
    } else {
      state.shakeX = 0; state.shakeY = 0;
    }

    // Ability timer
    if (ability.active) {
      ability.activeTimer--;
      if (ability.activeTimer <= 0) {
        if (ability.active === 'slowmo') state.slowMotion = false;
        ability.active = null;
        ability.shieldHits = 0;
      }
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

    // Spawn power-ups
    if (frameRef.current % POWERUP_SPAWN_INTERVAL === 0) {
      powerUps.push(spawnPowerUp());
    }

    // ===== BOSS LOGIC =====
    if (!boss.active && boss.warningTimer <= 0) {
      boss.spawnTimer--;
      if (boss.spawnTimer <= 0) {
        boss.warningTimer = 120; // 2 sec warning
      }
    }

    if (boss.warningTimer > 0 && !boss.active) {
      boss.warningTimer--;
      if (boss.warningTimer <= 0) {
        boss.active = true;
        boss.boss = spawnBoss();
        boss.escapeDist = 0;
        boss.obstacleTimer = BOSS_OBSTACLE_INTERVAL;
        boss.survived = false;
        state.shakeTimer = 20;
      }
    }

    if (boss.active && boss.boss) {
      // Move boss down to target position
      const targetY = 60;
      if (boss.boss.y < targetY) {
        boss.boss.y += 3;
      }

      // Track survival distance
      boss.escapeDist += effectiveSpeed * 0.1;

      // Drop obstacles
      boss.obstacleTimer--;
      if (boss.obstacleTimer <= 0) {
        obstacles.push(spawnBossObstacle(boss.boss));
        boss.obstacleTimer = BOSS_OBSTACLE_INTERVAL;
      }

      // Check if survived
      if (boss.escapeDist >= BOSS_SURVIVE_DISTANCE) {
        boss.active = false;
        boss.survived = true;
        boss.boss = null;
        boss.spawnTimer = BOSS_SPAWN_MIN + Math.floor(Math.random() * (BOSS_SPAWN_MAX - BOSS_SPAWN_MIN));
        state.score += 2000;
        state.shakeTimer = 10;
        particlesRef.current.push(
          ...createParticles(GAME_WIDTH / 2, 100, '#ffaa00', 40)
        );
      }
    }

    // Update traffic
    const player = createPlayerCar(state);
    for (let i = traffic.length - 1; i >= 0; i--) {
      const car = traffic[i];
      const relSpeed = effectiveSpeed - car.speed * speedMult;
      car.y += relSpeed * 1.5;

      const newLane = aiLaneChange(car, traffic, state);
      if (newLane !== car.lane) car.lane = newLane;
      car.x += (getLaneX(car.lane) - car.x) * 0.1;

      if (car.y > GAME_HEIGHT + 100 || car.y < -200) {
        traffic.splice(i, 1);
        continue;
      }

      if (checkCollision(player, car)) {
        if (ability.active === 'shield' && ability.shieldHits > 0) {
          ability.shieldHits--;
          traffic.splice(i, 1);
          particlesRef.current.push(...createParticles(player.x, player.y, '#00ff88', 15));
          state.shakeTimer = 5;
          if (ability.shieldHits <= 0) {
            ability.active = null;
            ability.activeTimer = 0;
          }
          continue;
        }
        state.status = 'gameover';
        state.shakeTimer = 15;
        if (state.slowMotion) state.slowMotion = false;
        particlesRef.current.push(...createParticles(player.x, player.y, '#ff0066', 30));
        forceUpdate((v) => v + 1);
        break;
      }

      if (checkNearMiss(player, car) && !nearMissSetRef.current.has(car)) {
        nearMissSetRef.current.add(car);
        state.combo++;
        state.comboTimer = COMBO_TIMEOUT;
        state.score += 50 * state.combo;
        particlesRef.current.push(...createParticles(player.x, player.y - 20, '#00ff88', 8));
      }
    }

    // Boss collision
    if (boss.active && boss.boss) {
      if (checkCollision(player, boss.boss)) {
        if (ability.active === 'shield' && ability.shieldHits > 0) {
          ability.shieldHits--;
          state.shakeTimer = 10;
          particlesRef.current.push(...createParticles(player.x, player.y, '#00ff88', 15));
          if (ability.shieldHits <= 0) { ability.active = null; ability.activeTimer = 0; }
        } else {
          state.status = 'gameover';
          state.shakeTimer = 15;
          if (state.slowMotion) state.slowMotion = false;
          particlesRef.current.push(...createParticles(player.x, player.y, '#ff0066', 30));
          forceUpdate((v) => v + 1);
        }
      }
    }

    // Update obstacles
    for (let i = obstacles.length - 1; i >= 0; i--) {
      obstacles[i].y += effectiveSpeed * 1.5;
      if (obstacles[i].y > GAME_HEIGHT + 50) {
        obstacles.splice(i, 1);
        continue;
      }
      if (checkObstacleCollision(player, obstacles[i])) {
        if (ability.active === 'shield' && ability.shieldHits > 0) {
          ability.shieldHits--;
          obstacles.splice(i, 1);
          particlesRef.current.push(...createParticles(player.x, player.y, '#00ff88', 10));
          if (ability.shieldHits <= 0) { ability.active = null; ability.activeTimer = 0; }
          continue;
        }
        state.status = 'gameover';
        state.shakeTimer = 15;
        if (state.slowMotion) state.slowMotion = false;
        particlesRef.current.push(...createParticles(player.x, player.y, '#ff0066', 30));
        forceUpdate((v) => v + 1);
        break;
      }
    }

    // Update coins
    const coinMultiplier = ability.active === 'doublecoins' ? 2 : 1;
    for (let i = coins.length - 1; i >= 0; i--) {
      coins[i].y += effectiveSpeed * 1.5;
      coins[i].angle += 0.05;
      if (checkCoinCollection(player, coins[i])) {
        coins[i].collected = true;
        state.coins += coinMultiplier;
        state.score += 100 * coinMultiplier;
        ability.energy = Math.min(ability.maxEnergy, ability.energy + 5);
        particlesRef.current.push(
          ...createParticles(coins[i].x, coins[i].y, coinMultiplier > 1 ? '#ffff00' : '#ffd700', 10)
        );
      }
      if (coins[i].y > GAME_HEIGHT + 50 || coins[i].collected) coins.splice(i, 1);
    }

    // Update power-ups
    for (let i = powerUps.length - 1; i >= 0; i--) {
      powerUps[i].y += effectiveSpeed * 1.5;
      powerUps[i].angle += 0.03;
      if (checkCoinCollection(player, powerUps[i] as any)) {
        powerUps[i].collected = true;
        ability.energy = Math.min(ability.maxEnergy, ability.energy + ENERGY_PER_PICKUP);
        particlesRef.current.push(
          ...createParticles(powerUps[i].x, powerUps[i].y, '#00ff88', 15)
        );
      }
      if (powerUps[i].y > GAME_HEIGHT + 50 || powerUps[i].collected) powerUps.splice(i, 1);
    }

    // Particles & speed lines
    particlesRef.current = updateParticles(particlesRef.current);
    speedLinesRef.current = updateSpeedLines(speedLinesRef.current, effectiveSpeed);

    // ===== DRAW =====
    ctx.save();
    ctx.translate(state.shakeX, state.shakeY);
    ctx.clearRect(-10, -10, GAME_WIDTH + 20, GAME_HEIGHT + 20);

    drawRoad(ctx, roadOffsetRef.current);
    if (state.slowMotion) drawSlowMotionOverlay(ctx);
    drawSpeedLines(ctx, speedLinesRef.current);
    obstacles.forEach((o) => drawObstacle(ctx, o));
    coins.forEach((c) => drawCoin(ctx, c));
    powerUps.forEach((p) => drawPowerUp(ctx, p));
    traffic.forEach((c) => drawCar(ctx, c, false));
    if (boss.active && boss.boss) drawCar(ctx, boss.boss, false);
    drawCar(ctx, player, true, ability.active === 'shield');
    drawParticles(ctx, particlesRef.current);
    drawHUD(ctx, state, ability, boss);

    ctx.restore();

    animFrameRef.current = requestAnimationFrame(gameLoop);
  }, []);

  // Keyboard
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysRef.current.add(e.key);
      if (stateRef.current.status === 'gameover' && e.key === 'Enter') startGame();
      if (stateRef.current.status === 'menu' && e.key === 'Enter') startGame();
      if (e.key === 'Escape') onBack();
      if (e.key === ' ') e.preventDefault();
    };
    const handleKeyUp = (e: KeyboardEvent) => keysRef.current.delete(e.key);
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
      if (stateRef.current.status === 'gameover' || stateRef.current.status === 'menu') startGame();
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

  const handleToggleMobileControls = (checked: boolean) => {
    setShowMobileControls(checked);
    localStorage.setItem('rushlane-mobile-controls', String(checked));
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative w-full flex justify-center">
        <canvas
          ref={canvasRef}
          width={GAME_WIDTH}
          height={GAME_HEIGHT}
          className="rounded-lg border border-border"
          style={{ maxWidth: '100%', maxHeight: '85vh', imageRendering: 'pixelated' }}
        />
        <div className="absolute top-2 right-2 md:hidden">
          <Popover>
            <PopoverTrigger asChild>
              <button className="w-8 h-8 rounded-lg bg-muted/70 border border-border flex items-center justify-center text-muted-foreground hover:text-foreground">
                <Settings size={16} />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-48 p-3" align="end">
              <label className="flex items-center justify-between gap-2 text-sm font-body">
                <span>Mobile Controls</span>
                <Switch checked={showMobileControls} onCheckedChange={handleToggleMobileControls} />
              </label>
            </PopoverContent>
          </Popover>
        </div>
      </div>
      {showMobileControls && (
        <div className="flex gap-3 md:hidden">
          <button
            className="w-14 h-14 rounded-xl bg-muted/50 border border-primary/30 flex items-center justify-center text-primary font-display text-lg active:bg-primary/20 select-none"
            onTouchStart={(e) => { e.preventDefault(); keysRef.current.add('ArrowLeft'); }}
            onTouchEnd={() => keysRef.current.delete('ArrowLeft')}
          >◀</button>
          <button
            className="w-14 h-14 rounded-xl bg-muted/50 border border-accent/30 flex items-center justify-center text-accent font-display text-lg active:bg-accent/20 select-none"
            onTouchStart={(e) => { e.preventDefault(); keysRef.current.add('ArrowDown'); }}
            onTouchEnd={() => keysRef.current.delete('ArrowDown')}
          >▼</button>
          <button
            className="w-14 h-14 rounded-xl bg-muted/50 border border-primary/30 flex items-center justify-center text-primary font-display text-lg active:bg-primary/20 select-none"
            onTouchStart={(e) => { e.preventDefault(); keysRef.current.add('ArrowRight'); }}
            onTouchEnd={() => keysRef.current.delete('ArrowRight')}
          >▶</button>
          <button
            className="w-14 h-14 rounded-xl bg-muted/50 border border-neon-green/30 flex items-center justify-center text-neon-green font-display text-xs active:bg-neon-green/20 select-none"
            onTouchStart={(e) => { e.preventDefault(); keysRef.current.add(' '); }}
            onTouchEnd={() => keysRef.current.delete(' ')}
          >⚡</button>
        </div>
      )}
      <p className="text-muted-foreground text-sm font-body hidden md:block">
        ← → Lanes · ↓ Brake · SPACE Ability · ESC Menu
      </p>
    </div>
  );
};

export default GameCanvas;

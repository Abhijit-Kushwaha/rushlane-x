import {
  GameState, Car, Coin, Particle, SpeedLine, Obstacle, PowerUp,
  AbilityState, AbilityType, BossState,
  GAME_WIDTH, GAME_HEIGHT, LANE_COUNT, ROAD_WIDTH, ROAD_LEFT,
  CAR_WIDTH, CAR_HEIGHT, COIN_RADIUS,
  BOSS_WIDTH, BOSS_HEIGHT, BOSS_OBSTACLE_INTERVAL, BOSS_SURVIVE_DISTANCE,
  BOSS_SPAWN_MIN, BOSS_SPAWN_MAX,
  MAX_ENERGY, ENERGY_PER_PICKUP, POWERUP_SPAWN_INTERVAL,
  SLOWMO_DURATION, SHIELD_DURATION, DOUBLECOIN_DURATION, AUTODODGE_DURATION,
} from './types';
import {
  INITIAL_SPEED, MAX_SPEED, SPEED_INCREMENT, BRAKE_DECEL,
  LANE_SWITCH_SPEED, TRAFFIC_SPAWN_INTERVAL, COIN_SPAWN_INTERVAL,
  NEAR_MISS_DISTANCE, COMBO_TIMEOUT, COLORS,
} from './constants';
import { getLaneX } from './renderer';

export function createInitialState(): GameState {
  return {
    status: 'menu',
    score: 0,
    distance: 0,
    coins: 0,
    speed: INITIAL_SPEED,
    maxSpeed: INITIAL_SPEED,
    combo: 0,
    comboTimer: 0,
    playerLane: Math.floor(LANE_COUNT / 2),
    targetLane: Math.floor(LANE_COUNT / 2),
    playerY: GAME_HEIGHT - 120,
    braking: false,
    shakeX: 0,
    shakeY: 0,
    shakeTimer: 0,
    slowMotion: false,
  };
}

export function createInitialAbility(): AbilityState {
  return {
    energy: 0,
    maxEnergy: MAX_ENERGY,
    active: null,
    activeTimer: 0,
    shieldHits: 0,
  };
}

export function createInitialBoss(): BossState {
  return {
    active: false,
    spawnTimer: BOSS_SPAWN_MIN + Math.floor(Math.random() * (BOSS_SPAWN_MAX - BOSS_SPAWN_MIN)),
    boss: null,
    health: 0,
    maxHealth: 0,
    obstacleTimer: 0,
    warningTimer: 0,
    survived: false,
    escapeDist: 0,
  };
}

export function createPlayerCar(state: GameState): Car {
  return {
    x: getLaneX(state.playerLane),
    y: state.playerY,
    width: CAR_WIDTH,
    height: CAR_HEIGHT,
    lane: state.playerLane,
    speed: 0,
    color: COLORS.player,
    type: 'player',
    glowColor: COLORS.playerGlow,
  };
}

export function spawnTraffic(state: GameState, traffic: Car[]): Car | null {
  const lane = Math.floor(Math.random() * LANE_COUNT);
  const tooClose = traffic.some((c) => c.lane === lane && c.y < 100);
  if (tooClose) return null;

  const rand = Math.random();
  let type: 'truck' | 'car' | 'fast';
  let speed: number;
  let width: number;
  let height: number;
  let color: string;
  let glowColor: string;

  if (rand < 0.2) {
    type = 'truck'; speed = state.speed * 0.4 + Math.random() * 0.5;
    width = 42; height = 80; color = COLORS.truck; glowColor = COLORS.truckGlow;
  } else if (rand < 0.85) {
    type = 'car'; speed = state.speed * 0.5 + Math.random() * 1.5;
    width = 34; height = 58; color = COLORS.car; glowColor = COLORS.carGlow;
  } else {
    type = 'fast'; speed = state.speed * 0.8 + Math.random() * 2;
    width = 32; height = 54; color = COLORS.fastCar; glowColor = COLORS.fastCarGlow;
  }

  return { x: getLaneX(lane), y: -height, width, height, lane, speed, color, type, glowColor };
}

export function spawnBoss(): Car {
  const centerLane = Math.floor(LANE_COUNT / 2);
  return {
    x: getLaneX(centerLane),
    y: -BOSS_HEIGHT - 50,
    width: BOSS_WIDTH,
    height: BOSS_HEIGHT,
    lane: centerLane,
    speed: 0,
    color: COLORS.boss,
    type: 'boss',
    glowColor: COLORS.bossGlow,
  };
}

export function spawnBossObstacle(boss: Car): Obstacle {
  const types: Obstacle['type'][] = ['barrel', 'crate', 'spike'];
  const w = 20 + Math.random() * 15;
  return {
    x: boss.x + (Math.random() - 0.5) * boss.width * 0.8,
    y: boss.y + boss.height / 2 + 10,
    width: w,
    height: w,
    type: types[Math.floor(Math.random() * types.length)],
  };
}

export function spawnCoin(state: GameState): Coin {
  const lane = Math.floor(Math.random() * LANE_COUNT);
  return { x: getLaneX(lane), y: -20, lane, collected: false, radius: COIN_RADIUS, angle: 0 };
}

export function spawnPowerUp(): PowerUp {
  const lane = Math.floor(Math.random() * LANE_COUNT);
  const types: AbilityType[] = ['slowmo', 'shield', 'doublecoins', 'autododge'];
  return {
    x: getLaneX(lane),
    y: -20,
    lane,
    type: types[Math.floor(Math.random() * types.length)],
    radius: 13,
    angle: 0,
    collected: false,
  };
}

export function getAbilityDuration(type: AbilityType): number {
  switch (type) {
    case 'slowmo': return SLOWMO_DURATION;
    case 'shield': return SHIELD_DURATION;
    case 'doublecoins': return DOUBLECOIN_DURATION;
    case 'autododge': return AUTODODGE_DURATION;
  }
}

export function checkCollision(a: Car, b: { x: number; y: number; width: number; height: number }): boolean {
  return (
    Math.abs(a.x - b.x) < (a.width + b.width) / 2 - 4 &&
    Math.abs(a.y - b.y) < (a.height + b.height) / 2 - 4
  );
}

export function checkNearMiss(player: Car, other: Car): boolean {
  const dx = Math.abs(player.x - other.x);
  const dy = Math.abs(player.y - other.y);
  const collW = (player.width + other.width) / 2;
  const collH = (player.height + other.height) / 2;
  return (
    dx < collW + NEAR_MISS_DISTANCE && dy < collH + NEAR_MISS_DISTANCE &&
    dx >= collW - 4 && dy < collH + 10
  );
}

export function checkCoinCollection(player: Car, coin: { x: number; y: number; radius: number; collected?: boolean }): boolean {
  if (coin.collected) return false;
  const dx = Math.abs(player.x - coin.x);
  const dy = Math.abs(player.y - coin.y);
  return dx < player.width / 2 + coin.radius && dy < player.height / 2 + coin.radius;
}

export function checkObstacleCollision(player: Car, obs: Obstacle): boolean {
  return (
    Math.abs(player.x - obs.x) < (player.width + obs.width) / 2 - 2 &&
    Math.abs(player.y - obs.y) < (player.height + obs.height) / 2 - 2
  );
}

export function findSafeLane(playerLane: number, traffic: Car[], playerY: number): number {
  // Used by auto-dodge: find nearest lane without imminent danger
  let bestLane = playerLane;
  let bestDist = Infinity;
  for (let lane = 0; lane < LANE_COUNT; lane++) {
    const danger = traffic.filter(
      (c) => c.lane === lane && Math.abs(c.y - playerY) < 150
    ).length;
    if (danger === 0) {
      const dist = Math.abs(lane - playerLane);
      if (dist < bestDist) {
        bestDist = dist;
        bestLane = lane;
      }
    }
  }
  return bestLane;
}

export function createParticles(x: number, y: number, color: string, count: number): Particle[] {
  const particles: Particle[] = [];
  for (let i = 0; i < count; i++) {
    particles.push({
      x, y,
      vx: (Math.random() - 0.5) * 6, vy: (Math.random() - 0.5) * 6,
      life: 20 + Math.random() * 20, maxLife: 40,
      color, size: 2 + Math.random() * 3,
    });
  }
  return particles;
}

export function updateParticles(particles: Particle[]): Particle[] {
  return particles
    .map((p) => ({ ...p, x: p.x + p.vx, y: p.y + p.vy, life: p.life - 1, vx: p.vx * 0.95, vy: p.vy * 0.95 }))
    .filter((p) => p.life > 0);
}

export function createSpeedLine(): SpeedLine {
  return {
    x: ROAD_LEFT + Math.random() * ROAD_WIDTH,
    y: -10, length: 15 + Math.random() * 30,
    speed: 8 + Math.random() * 8, opacity: 0.1 + Math.random() * 0.3,
  };
}

export function updateSpeedLines(lines: SpeedLine[], speed: number): SpeedLine[] {
  const updated = lines.map((l) => ({ ...l, y: l.y + l.speed + speed })).filter((l) => l.y < GAME_HEIGHT + 50);
  if (speed > 6 && Math.random() < (speed - 6) / 20) updated.push(createSpeedLine());
  return updated;
}

export function aiLaneChange(car: Car, traffic: Car[], _state: GameState): number {
  if (Math.random() > 0.005) return car.lane;
  const newLane = car.lane + (Math.random() > 0.5 ? 1 : -1);
  if (newLane < 0 || newLane >= LANE_COUNT) return car.lane;
  const blocked = traffic.some((c) => c !== car && c.lane === newLane && Math.abs(c.y - car.y) < 120);
  return blocked ? car.lane : newLane;
}

import {
  GameState, Car, Coin, Particle, SpeedLine,
  GAME_WIDTH, GAME_HEIGHT, LANE_COUNT, ROAD_WIDTH, ROAD_LEFT,
  CAR_WIDTH, CAR_HEIGHT, COIN_RADIUS,
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

  // Don't spawn too close to existing cars in same lane
  const tooClose = traffic.some(
    (c) => c.lane === lane && c.y < 100
  );
  if (tooClose) return null;

  const rand = Math.random();
  let type: 'truck' | 'car' | 'fast';
  let speed: number;
  let width: number;
  let height: number;
  let color: string;
  let glowColor: string;

  if (rand < 0.2) {
    type = 'truck';
    speed = state.speed * 0.4 + Math.random() * 0.5;
    width = 42;
    height = 80;
    color = COLORS.truck;
    glowColor = COLORS.truckGlow;
  } else if (rand < 0.85) {
    type = 'car';
    speed = state.speed * 0.5 + Math.random() * 1.5;
    width = 34;
    height = 58;
    color = COLORS.car;
    glowColor = COLORS.carGlow;
  } else {
    type = 'fast';
    speed = state.speed * 0.8 + Math.random() * 2;
    width = 32;
    height = 54;
    color = COLORS.fastCar;
    glowColor = COLORS.fastCarGlow;
  }

  return {
    x: getLaneX(lane),
    y: -height,
    width,
    height,
    lane,
    speed,
    color,
    type,
    glowColor,
  };
}

export function spawnCoin(state: GameState): Coin {
  const lane = Math.floor(Math.random() * LANE_COUNT);
  return {
    x: getLaneX(lane),
    y: -20,
    lane,
    collected: false,
    radius: COIN_RADIUS,
    angle: 0,
  };
}

export function checkCollision(a: Car, b: Car): boolean {
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
    dx < collW + NEAR_MISS_DISTANCE &&
    dy < collH + NEAR_MISS_DISTANCE &&
    dx >= collW - 4 &&
    dy < collH + 10
  );
}

export function checkCoinCollection(player: Car, coin: Coin): boolean {
  if (coin.collected) return false;
  const dx = Math.abs(player.x - coin.x);
  const dy = Math.abs(player.y - coin.y);
  return dx < player.width / 2 + coin.radius && dy < player.height / 2 + coin.radius;
}

export function createParticles(x: number, y: number, color: string, count: number): Particle[] {
  const particles: Particle[] = [];
  for (let i = 0; i < count; i++) {
    particles.push({
      x,
      y,
      vx: (Math.random() - 0.5) * 6,
      vy: (Math.random() - 0.5) * 6,
      life: 20 + Math.random() * 20,
      maxLife: 40,
      color,
      size: 2 + Math.random() * 3,
    });
  }
  return particles;
}

export function updateParticles(particles: Particle[]): Particle[] {
  return particles
    .map((p) => ({
      ...p,
      x: p.x + p.vx,
      y: p.y + p.vy,
      life: p.life - 1,
      vx: p.vx * 0.95,
      vy: p.vy * 0.95,
    }))
    .filter((p) => p.life > 0);
}

export function createSpeedLine(): SpeedLine {
  return {
    x: ROAD_LEFT + Math.random() * ROAD_WIDTH,
    y: -10,
    length: 15 + Math.random() * 30,
    speed: 8 + Math.random() * 8,
    opacity: 0.1 + Math.random() * 0.3,
  };
}

export function updateSpeedLines(lines: SpeedLine[], speed: number): SpeedLine[] {
  const updated = lines
    .map((l) => ({ ...l, y: l.y + l.speed + speed }))
    .filter((l) => l.y < GAME_HEIGHT + 50);

  // Add new lines based on speed
  if (speed > 6 && Math.random() < (speed - 6) / 20) {
    updated.push(createSpeedLine());
  }

  return updated;
}

// AI lane change logic
export function aiLaneChange(car: Car, traffic: Car[], _state: GameState): number {
  if (Math.random() > 0.005) return car.lane;
  const newLane = car.lane + (Math.random() > 0.5 ? 1 : -1);
  if (newLane < 0 || newLane >= LANE_COUNT) return car.lane;
  // check if new lane is clear
  const blocked = traffic.some(
    (c) => c !== car && c.lane === newLane && Math.abs(c.y - car.y) < 120
  );
  return blocked ? car.lane : newLane;
}

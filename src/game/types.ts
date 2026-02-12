export interface Car {
  x: number;
  y: number;
  width: number;
  height: number;
  lane: number;
  speed: number;
  color: string;
  type: 'player' | 'truck' | 'car' | 'fast' | 'boss';
  glowColor: string;
}

export interface Coin {
  x: number;
  y: number;
  lane: number;
  collected: boolean;
  radius: number;
  angle: number;
}

export interface Obstacle {
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'barrel' | 'crate' | 'spike';
}

export interface PowerUp {
  x: number;
  y: number;
  lane: number;
  type: AbilityType;
  radius: number;
  angle: number;
  collected: boolean;
}

export type AbilityType = 'slowmo' | 'shield' | 'doublecoins' | 'autododge';

export interface AbilityState {
  energy: number;
  maxEnergy: number;
  active: AbilityType | null;
  activeTimer: number;
  shieldHits: number;
}

export interface BossState {
  active: boolean;
  spawnTimer: number;
  boss: Car | null;
  health: number;
  maxHealth: number;
  obstacleTimer: number;
  warningTimer: number;
  survived: boolean;
  escapeDist: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}

export interface SpeedLine {
  x: number;
  y: number;
  length: number;
  speed: number;
  opacity: number;
}

export interface GameState {
  status: 'menu' | 'playing' | 'paused' | 'gameover';
  score: number;
  distance: number;
  coins: number;
  speed: number;
  maxSpeed: number;
  combo: number;
  comboTimer: number;
  playerLane: number;
  targetLane: number;
  playerY: number;
  braking: boolean;
  shakeX: number;
  shakeY: number;
  shakeTimer: number;
  slowMotion: boolean;
}

export interface RoadSegment {
  y: number;
  type: 'highway' | 'desert' | 'snow' | 'tunnel';
}

export const LANE_COUNT = 5;
export const GAME_WIDTH = 400;
export const GAME_HEIGHT = 700;
export const LANE_WIDTH = GAME_WIDTH / (LANE_COUNT + 2);
export const ROAD_LEFT = LANE_WIDTH;
export const ROAD_RIGHT = GAME_WIDTH - LANE_WIDTH;
export const ROAD_WIDTH = ROAD_RIGHT - ROAD_LEFT;
export const CAR_WIDTH = 36;
export const CAR_HEIGHT = 64;
export const COIN_RADIUS = 10;

// Boss
export const BOSS_SPAWN_MIN = 60 * 120; // ~2 min at 60fps
export const BOSS_SPAWN_MAX = 60 * 180; // ~3 min
export const BOSS_WIDTH = 120;
export const BOSS_HEIGHT = 160;
export const BOSS_OBSTACLE_INTERVAL = 40;
export const BOSS_SURVIVE_DISTANCE = 600;

// Abilities
export const MAX_ENERGY = 100;
export const ENERGY_PER_PICKUP = 35;
export const SLOWMO_DURATION = 120; // 2sec at 60fps
export const SHIELD_DURATION = 300; // 5sec
export const DOUBLECOIN_DURATION = 600; // 10sec
export const AUTODODGE_DURATION = 180; // 3sec
export const POWERUP_SPAWN_INTERVAL = 200;

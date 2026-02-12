export interface Car {
  x: number;
  y: number;
  width: number;
  height: number;
  lane: number;
  speed: number;
  color: string;
  type: 'player' | 'truck' | 'car' | 'fast';
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
}

export interface RoadSegment {
  y: number;
  type: 'highway' | 'desert' | 'snow' | 'tunnel';
}

export const LANE_COUNT = 5;
export const GAME_WIDTH = 400;
export const GAME_HEIGHT = 700;
export const LANE_WIDTH = GAME_WIDTH / (LANE_COUNT + 2); // extra margin
export const ROAD_LEFT = LANE_WIDTH;
export const ROAD_RIGHT = GAME_WIDTH - LANE_WIDTH;
export const ROAD_WIDTH = ROAD_RIGHT - ROAD_LEFT;
export const CAR_WIDTH = 36;
export const CAR_HEIGHT = 64;
export const COIN_RADIUS = 10;

import * as THREE from 'three';

export interface CarState {
  position: THREE.Vector3;
  rotation: number; // Y-axis heading in radians
  speed: number;
  lateralSpeed: number;
  nitro: number;
  maxNitro: number;
  drifting: boolean;
  driftAngle: number;
  health: number;
  maxHealth: number;
}

export interface AICarState extends CarState {
  waypointIndex: number;
  personality: 'cautious' | 'normal' | 'aggressive';
  color: string;
  name: string;
}

export interface RaceState {
  status: 'countdown' | 'racing' | 'finished';
  lap: number;
  totalLaps: number;
  position: number; // 1st, 2nd, etc.
  countdownTimer: number;
  raceTime: number;
  money: number;
  checkpointIndex: number;
}

export interface GameSettings {
  difficulty: 'easy' | 'medium' | 'hard';
  cameraMode: 'third' | 'first';
}

// Track definition
export const TRACK_POINTS: [number, number, number][] = [
  [0, 0, 0],
  [80, 0, 10],
  [140, 0, -20],
  [180, 0, -80],
  [170, 0, -150],
  [120, 0, -200],
  [60, 0, -220],
  [0, 0, -210],
  [-50, 0, -170],
  [-70, 0, -120],
  [-60, 0, -60],
  [-30, 0, -20],
];

export const TRACK_WIDTH = 16;
export const TOTAL_LAPS = 3;

export const AI_COLORS = ['#cc2222', '#dd8800', '#227744'];
export const AI_NAMES = ['BLAZE', 'STORM', 'VENOM'];

export const PHYSICS = {
  acceleration: 0.065,
  brakeForce: 0.12,
  maxSpeed: 1.6,
  nitroBoost: 0.1,
  nitroDrain: 0.7,
  nitroRegen: 0.03,
  steerSpeed: 0.028,
  friction: 0.98,
  driftFriction: 0.96,
  driftSteerMultiplier: 1.6,
  driftLateralGrip: 0.88,
  gravity: 0.01,
};

export const DIFFICULTY_SETTINGS = {
  easy: { aiSpeedMult: 0.8, aiAccuracy: 0.85, reward: [500, 300, 100] },
  medium: { aiSpeedMult: 0.95, aiAccuracy: 0.92, reward: [800, 500, 250] },
  hard: { aiSpeedMult: 1.1, aiAccuracy: 0.98, reward: [1200, 800, 400] },
};

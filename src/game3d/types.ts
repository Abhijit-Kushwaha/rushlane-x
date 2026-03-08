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
  acceleration: 0.05,
  brakeForce: 0.1,
  maxSpeed: 1.5,
  nitroBoost: 0.08,
  nitroDrain: 0.9,
  nitroRegen: 0.02,
  steerSpeed: 0.022,
  friction: 0.975,
  driftFriction: 0.95,
  driftSteerMultiplier: 1.4,
  driftLateralGrip: 0.82,
  gravity: 0.01,
};

export const DIFFICULTY_SETTINGS = {
  easy: { aiSpeedMult: 0.9, aiAccuracy: 0.88, reward: [400, 250, 80] },
  medium: { aiSpeedMult: 1.05, aiAccuracy: 0.94, reward: [700, 400, 200] },
  hard: { aiSpeedMult: 1.25, aiAccuracy: 0.99, reward: [1000, 700, 350] },
};

// Colors
export const COLORS = {
  road: '#0a0e1a',
  roadEdge: '#00e5ff',
  laneLine: '#00e5ff33',
  laneLineBright: '#00e5ff88',
  grass: '#050a12',
  player: '#00e5ff',
  playerGlow: '#00e5ff66',
  truck: '#ff6b35',
  truckGlow: '#ff6b3566',
  car: '#aabbcc',
  carGlow: '#aabbcc44',
  fastCar: '#ff0066',
  fastCarGlow: '#ff006644',
  coin: '#ffd700',
  coinGlow: '#ffd70066',
  combo: '#ff0066',
  score: '#00e5ff',
  speed: '#ffd700',
  particle: '#00e5ff',
  nearMiss: '#00ff88',
  roadMarkWhite: '#ffffff44',
  boss: '#ff2200',
  bossGlow: '#ff220088',
  obstacle: '#ff8800',
  slowmo: '#00ccff',
  shield: '#00ff88',
  doublecoins: '#ffd700',
  autododge: '#cc66ff',
  energy: '#00ff88',
};

export const ABILITY_COLORS: Record<string, string> = {
  slowmo: '#00ccff',
  shield: '#00ff88',
  doublecoins: '#ffd700',
  autododge: '#cc66ff',
};

export const ABILITY_LABELS: Record<string, string> = {
  slowmo: 'SLOW MO',
  shield: 'SHIELD',
  doublecoins: '2x COINS',
  autododge: 'AUTO DODGE',
};

export const INITIAL_SPEED = 3;
export const MAX_SPEED = 18;
export const SPEED_INCREMENT = 0.003;
export const BRAKE_DECEL = 0.15;
export const LANE_SWITCH_SPEED = 8;
export const TRAFFIC_SPAWN_INTERVAL = 60;
export const COIN_SPAWN_INTERVAL = 90;
export const NEAR_MISS_DISTANCE = 15;
export const COMBO_TIMEOUT = 120;

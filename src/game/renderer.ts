import {
  GameState, Car, Coin, Particle, SpeedLine,
  GAME_WIDTH, GAME_HEIGHT, LANE_COUNT, ROAD_LEFT, ROAD_WIDTH, LANE_WIDTH, ROAD_RIGHT,
  CAR_WIDTH, CAR_HEIGHT,
} from './types';
import { COLORS } from './constants';

export function getLaneX(lane: number): number {
  return ROAD_LEFT + (lane + 0.5) * (ROAD_WIDTH / LANE_COUNT);
}

export function drawRoad(ctx: CanvasRenderingContext2D, offset: number) {
  // Background
  ctx.fillStyle = COLORS.grass;
  ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

  // Road surface
  const grad = ctx.createLinearGradient(ROAD_LEFT, 0, ROAD_RIGHT, 0);
  grad.addColorStop(0, '#0d1220');
  grad.addColorStop(0.5, '#111827');
  grad.addColorStop(1, '#0d1220');
  ctx.fillStyle = grad;
  ctx.fillRect(ROAD_LEFT, 0, ROAD_WIDTH, GAME_HEIGHT);

  // Road edges - neon glow
  ctx.shadowColor = COLORS.roadEdge;
  ctx.shadowBlur = 15;
  ctx.strokeStyle = COLORS.roadEdge;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(ROAD_LEFT, 0);
  ctx.lineTo(ROAD_LEFT, GAME_HEIGHT);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(ROAD_RIGHT, 0);
  ctx.lineTo(ROAD_RIGHT, GAME_HEIGHT);
  ctx.stroke();
  ctx.shadowBlur = 0;

  // Lane dashes
  const dashLength = 40;
  const gapLength = 30;
  const totalDash = dashLength + gapLength;
  const laneW = ROAD_WIDTH / LANE_COUNT;

  for (let i = 1; i < LANE_COUNT; i++) {
    const x = ROAD_LEFT + i * laneW;
    ctx.strokeStyle = i === Math.floor(LANE_COUNT / 2) ? COLORS.laneLineBright : COLORS.laneLine;
    ctx.lineWidth = 2;
    ctx.setLineDash([dashLength, gapLength]);
    ctx.lineDashOffset = -(offset % totalDash);
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, GAME_HEIGHT);
    ctx.stroke();
  }
  ctx.setLineDash([]);
}

export function drawCar(ctx: CanvasRenderingContext2D, car: Car, isPlayer: boolean) {
  const cx = car.x;
  const cy = car.y;
  const w = car.width;
  const h = car.height;

  ctx.save();

  // Glow
  if (isPlayer) {
    ctx.shadowColor = car.glowColor;
    ctx.shadowBlur = 25;
  } else {
    ctx.shadowColor = car.glowColor;
    ctx.shadowBlur = 10;
  }

  // Car body
  const bodyGrad = ctx.createLinearGradient(cx - w / 2, cy - h / 2, cx + w / 2, cy + h / 2);
  if (isPlayer) {
    bodyGrad.addColorStop(0, '#00cfff');
    bodyGrad.addColorStop(1, '#0066ff');
  } else if (car.type === 'truck') {
    bodyGrad.addColorStop(0, '#ff8c42');
    bodyGrad.addColorStop(1, '#cc5500');
  } else if (car.type === 'fast') {
    bodyGrad.addColorStop(0, '#ff3388');
    bodyGrad.addColorStop(1, '#cc0044');
  } else {
    bodyGrad.addColorStop(0, '#8899aa');
    bodyGrad.addColorStop(1, '#556677');
  }

  // Main body rectangle with rounded corners
  const r = 6;
  ctx.fillStyle = bodyGrad;
  ctx.beginPath();
  ctx.roundRect(cx - w / 2, cy - h / 2, w, h, r);
  ctx.fill();

  ctx.shadowBlur = 0;

  // Windshield
  const wsW = w * 0.6;
  const wsH = h * 0.18;
  const wsY = isPlayer ? cy - h * 0.15 : cy - h * 0.15;
  ctx.fillStyle = isPlayer ? '#003355aa' : '#22334488';
  ctx.beginPath();
  ctx.roundRect(cx - wsW / 2, wsY, wsW, wsH, 3);
  ctx.fill();

  // Headlights (at front of car)
  if (isPlayer) {
    const hlY = cy - h / 2 - 2;
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = '#ffffff';
    ctx.shadowBlur = 8;
    ctx.fillRect(cx - w / 2 + 4, hlY, 6, 4);
    ctx.fillRect(cx + w / 2 - 10, hlY, 6, 4);
    ctx.shadowBlur = 0;
  }

  // Tail lights (at back)
  if (!isPlayer) {
    const tlY = cy + h / 2 - 4;
    ctx.fillStyle = '#ff2222';
    ctx.shadowColor = '#ff0000';
    ctx.shadowBlur = 6;
    ctx.fillRect(cx - w / 2 + 3, tlY, 5, 3);
    ctx.fillRect(cx + w / 2 - 8, tlY, 5, 3);
    ctx.shadowBlur = 0;
  } else {
    // Player tail lights
    const tlY = cy + h / 2 - 4;
    ctx.fillStyle = '#ff4444';
    ctx.shadowColor = '#ff0000';
    ctx.shadowBlur = 8;
    ctx.fillRect(cx - w / 2 + 3, tlY, 6, 4);
    ctx.fillRect(cx + w / 2 - 9, tlY, 6, 4);
    ctx.shadowBlur = 0;
  }

  // Truck extra details
  if (car.type === 'truck') {
    ctx.fillStyle = '#995533';
    ctx.fillRect(cx - w / 2 + 2, cy + 2, w - 4, h * 0.35);
  }

  ctx.restore();
}

export function drawCoin(ctx: CanvasRenderingContext2D, coin: Coin) {
  if (coin.collected) return;
  ctx.save();
  ctx.translate(coin.x, coin.y);
  ctx.rotate(coin.angle);

  ctx.shadowColor = COLORS.coinGlow;
  ctx.shadowBlur = 15;
  ctx.fillStyle = COLORS.coin;
  ctx.beginPath();
  ctx.arc(0, 0, coin.radius, 0, Math.PI * 2);
  ctx.fill();

  ctx.shadowBlur = 0;
  ctx.fillStyle = '#aa8800';
  ctx.font = 'bold 12px Orbitron';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('$', 0, 1);

  ctx.restore();
}

export function drawParticles(ctx: CanvasRenderingContext2D, particles: Particle[]) {
  for (const p of particles) {
    const alpha = p.life / p.maxLife;
    ctx.globalAlpha = alpha;
    ctx.fillStyle = p.color;
    ctx.shadowColor = p.color;
    ctx.shadowBlur = 5;
    ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
  }
  ctx.globalAlpha = 1;
  ctx.shadowBlur = 0;
}

export function drawSpeedLines(ctx: CanvasRenderingContext2D, lines: SpeedLine[]) {
  for (const line of lines) {
    ctx.globalAlpha = line.opacity;
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(line.x, line.y);
    ctx.lineTo(line.x, line.y + line.length);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
}

export function drawHUD(
  ctx: CanvasRenderingContext2D,
  state: GameState
) {
  ctx.save();

  // Score - top left
  ctx.font = '600 16px Orbitron';
  ctx.fillStyle = COLORS.score;
  ctx.shadowColor = COLORS.score;
  ctx.shadowBlur = 10;
  ctx.textAlign = 'left';
  ctx.fillText(`SCORE`, 12, 28);
  ctx.font = '700 22px Orbitron';
  ctx.fillText(`${Math.floor(state.score)}`, 12, 54);

  // Distance
  ctx.font = '500 12px Rajdhani';
  ctx.fillStyle = '#aabbcc';
  ctx.shadowBlur = 0;
  ctx.fillText(`${(state.distance / 100).toFixed(1)} km`, 12, 72);

  // Coins
  ctx.fillStyle = COLORS.coin;
  ctx.shadowColor = COLORS.coin;
  ctx.shadowBlur = 6;
  ctx.font = '600 14px Orbitron';
  ctx.fillText(`🪙 ${state.coins}`, 12, 94);

  // Speed - top right
  ctx.textAlign = 'right';
  ctx.fillStyle = COLORS.speed;
  ctx.shadowColor = COLORS.speed;
  ctx.shadowBlur = 10;
  ctx.font = '600 14px Orbitron';
  ctx.fillText('SPEED', GAME_WIDTH - 12, 28);
  ctx.font = '700 24px Orbitron';
  const displaySpeed = Math.floor(state.speed * 20);
  ctx.fillText(`${displaySpeed}`, GAME_WIDTH - 50, 54);
  ctx.font = '500 12px Rajdhani';
  ctx.fillStyle = '#aabbcc';
  ctx.shadowBlur = 0;
  ctx.fillText('km/h', GAME_WIDTH - 12, 54);

  // Combo
  if (state.combo > 1) {
    ctx.textAlign = 'center';
    ctx.fillStyle = COLORS.combo;
    ctx.shadowColor = COLORS.combo;
    ctx.shadowBlur = 15;
    ctx.font = '800 28px Orbitron';
    ctx.fillText(`x${state.combo}`, GAME_WIDTH / 2, 50);
    ctx.font = '500 12px Rajdhani';
    ctx.fillStyle = COLORS.nearMiss;
    ctx.shadowBlur = 0;
    ctx.fillText('COMBO', GAME_WIDTH / 2, 68);
  }

  ctx.restore();
}

export function drawGameOver(ctx: CanvasRenderingContext2D, state: GameState) {
  // Overlay
  ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
  ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

  ctx.save();
  ctx.textAlign = 'center';

  // Title
  ctx.font = '800 32px Orbitron';
  ctx.fillStyle = '#ff0066';
  ctx.shadowColor = '#ff0066';
  ctx.shadowBlur = 20;
  ctx.fillText('GAME OVER', GAME_WIDTH / 2, GAME_HEIGHT / 2 - 100);

  ctx.shadowBlur = 0;

  // Stats
  ctx.font = '600 16px Orbitron';
  ctx.fillStyle = '#00e5ff';
  ctx.fillText(`SCORE: ${Math.floor(state.score)}`, GAME_WIDTH / 2, GAME_HEIGHT / 2 - 40);

  ctx.fillStyle = '#ffd700';
  ctx.fillText(`COINS: ${state.coins}`, GAME_WIDTH / 2, GAME_HEIGHT / 2 - 10);

  ctx.fillStyle = '#aabbcc';
  ctx.font = '500 14px Rajdhani';
  ctx.fillText(`Distance: ${(state.distance / 100).toFixed(1)} km`, GAME_WIDTH / 2, GAME_HEIGHT / 2 + 20);
  ctx.fillText(`Top Speed: ${Math.floor(state.maxSpeed * 20)} km/h`, GAME_WIDTH / 2, GAME_HEIGHT / 2 + 44);

  // Restart hint
  ctx.font = '600 14px Orbitron';
  ctx.fillStyle = '#00e5ff';
  ctx.shadowColor = '#00e5ff';
  ctx.shadowBlur = 10;
  ctx.fillText('TAP OR PRESS ENTER TO RESTART', GAME_WIDTH / 2, GAME_HEIGHT / 2 + 100);

  ctx.restore();
}

import {
  GameState, Car, Coin, Particle, SpeedLine, Obstacle, PowerUp,
  AbilityState, BossState, AbilityType,
  GAME_WIDTH, GAME_HEIGHT, LANE_COUNT, ROAD_LEFT, ROAD_WIDTH, ROAD_RIGHT,
  CAR_WIDTH, CAR_HEIGHT, BOSS_SURVIVE_DISTANCE,
} from './types';
import { COLORS, ABILITY_COLORS, ABILITY_LABELS } from './constants';

export function getLaneX(lane: number): number {
  return ROAD_LEFT + (lane + 0.5) * (ROAD_WIDTH / LANE_COUNT);
}

export function drawRoad(ctx: CanvasRenderingContext2D, offset: number) {
  ctx.fillStyle = COLORS.grass;
  ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

  const grad = ctx.createLinearGradient(ROAD_LEFT, 0, ROAD_RIGHT, 0);
  grad.addColorStop(0, '#0d1220');
  grad.addColorStop(0.5, '#111827');
  grad.addColorStop(1, '#0d1220');
  ctx.fillStyle = grad;
  ctx.fillRect(ROAD_LEFT, 0, ROAD_WIDTH, GAME_HEIGHT);

  ctx.shadowColor = COLORS.roadEdge;
  ctx.shadowBlur = 15;
  ctx.strokeStyle = COLORS.roadEdge;
  ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(ROAD_LEFT, 0); ctx.lineTo(ROAD_LEFT, GAME_HEIGHT); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(ROAD_RIGHT, 0); ctx.lineTo(ROAD_RIGHT, GAME_HEIGHT); ctx.stroke();
  ctx.shadowBlur = 0;

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
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, GAME_HEIGHT); ctx.stroke();
  }
  ctx.setLineDash([]);
}

export function drawCar(ctx: CanvasRenderingContext2D, car: Car, isPlayer: boolean, shieldActive?: boolean) {
  const cx = car.x;
  const cy = car.y;
  const w = car.width;
  const h = car.height;
  ctx.save();

  if (car.type === 'boss') {
    drawBossTruck(ctx, car);
    ctx.restore();
    return;
  }

  if (isPlayer) {
    ctx.shadowColor = car.glowColor;
    ctx.shadowBlur = 25;
  } else {
    ctx.shadowColor = car.glowColor;
    ctx.shadowBlur = 10;
  }

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

  ctx.fillStyle = bodyGrad;
  ctx.beginPath();
  ctx.roundRect(cx - w / 2, cy - h / 2, w, h, 6);
  ctx.fill();
  ctx.shadowBlur = 0;

  const wsW = w * 0.6;
  const wsH = h * 0.18;
  const wsY = cy - h * 0.15;
  ctx.fillStyle = isPlayer ? '#003355aa' : '#22334488';
  ctx.beginPath(); ctx.roundRect(cx - wsW / 2, wsY, wsW, wsH, 3); ctx.fill();

  if (isPlayer) {
    const hlY = cy - h / 2 - 2;
    ctx.fillStyle = '#ffffff'; ctx.shadowColor = '#ffffff'; ctx.shadowBlur = 8;
    ctx.fillRect(cx - w / 2 + 4, hlY, 6, 4);
    ctx.fillRect(cx + w / 2 - 10, hlY, 6, 4);
    ctx.shadowBlur = 0;
  }

  if (!isPlayer) {
    const tlY = cy + h / 2 - 4;
    ctx.fillStyle = '#ff2222'; ctx.shadowColor = '#ff0000'; ctx.shadowBlur = 6;
    ctx.fillRect(cx - w / 2 + 3, tlY, 5, 3);
    ctx.fillRect(cx + w / 2 - 8, tlY, 5, 3);
    ctx.shadowBlur = 0;
  } else {
    const tlY = cy + h / 2 - 4;
    ctx.fillStyle = '#ff4444'; ctx.shadowColor = '#ff0000'; ctx.shadowBlur = 8;
    ctx.fillRect(cx - w / 2 + 3, tlY, 6, 4);
    ctx.fillRect(cx + w / 2 - 9, tlY, 6, 4);
    ctx.shadowBlur = 0;
  }

  if (car.type === 'truck') {
    ctx.fillStyle = '#995533';
    ctx.fillRect(cx - w / 2 + 2, cy + 2, w - 4, h * 0.35);
  }

  // Shield bubble
  if (isPlayer && shieldActive) {
    ctx.strokeStyle = '#00ff8888';
    ctx.shadowColor = '#00ff88';
    ctx.shadowBlur = 15;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, cy, Math.max(w, h) * 0.7, 0, Math.PI * 2);
    ctx.stroke();
    ctx.shadowBlur = 0;
  }

  ctx.restore();
}

function drawBossTruck(ctx: CanvasRenderingContext2D, boss: Car) {
  const cx = boss.x;
  const cy = boss.y;
  const w = boss.width;
  const h = boss.height;

  // Danger glow
  ctx.shadowColor = '#ff2200';
  ctx.shadowBlur = 30;

  // Main body
  const grad = ctx.createLinearGradient(cx - w / 2, cy - h / 2, cx + w / 2, cy + h / 2);
  grad.addColorStop(0, '#991100');
  grad.addColorStop(0.5, '#cc2200');
  grad.addColorStop(1, '#881100');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.roundRect(cx - w / 2, cy - h / 2, w, h, 10);
  ctx.fill();

  ctx.shadowBlur = 0;

  // Cab
  ctx.fillStyle = '#660000';
  ctx.beginPath();
  ctx.roundRect(cx - w * 0.35, cy - h / 2 + 8, w * 0.7, h * 0.2, 5);
  ctx.fill();

  // Windshield
  ctx.fillStyle = '#33000088';
  ctx.beginPath();
  ctx.roundRect(cx - w * 0.25, cy - h / 2 + 14, w * 0.5, h * 0.1, 3);
  ctx.fill();

  // Hazard stripes
  ctx.fillStyle = '#ffaa00';
  for (let i = 0; i < 4; i++) {
    const sx = cx - w / 2 + 10 + i * (w - 20) / 3.5;
    ctx.fillRect(sx, cy + h * 0.1, 8, 20);
  }

  // Tail lights
  ctx.fillStyle = '#ff0000';
  ctx.shadowColor = '#ff0000';
  ctx.shadowBlur = 12;
  ctx.fillRect(cx - w / 2 + 5, cy + h / 2 - 8, 12, 6);
  ctx.fillRect(cx + w / 2 - 17, cy + h / 2 - 8, 12, 6);
  ctx.shadowBlur = 0;

  // "BOSS" text
  ctx.font = '800 14px Orbitron';
  ctx.fillStyle = '#ffaa00';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('BOSS', cx, cy + h * 0.3);
}

export function drawObstacle(ctx: CanvasRenderingContext2D, obs: Obstacle) {
  ctx.save();
  ctx.shadowColor = COLORS.obstacle;
  ctx.shadowBlur = 8;

  if (obs.type === 'barrel') {
    ctx.fillStyle = '#ff6600';
    ctx.beginPath();
    ctx.arc(obs.x, obs.y, obs.width / 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#cc4400';
    ctx.fillRect(obs.x - 3, obs.y - obs.height / 2, 6, obs.height);
  } else if (obs.type === 'spike') {
    ctx.fillStyle = '#ff3333';
    ctx.beginPath();
    ctx.moveTo(obs.x, obs.y - obs.height / 2);
    ctx.lineTo(obs.x + obs.width / 2, obs.y + obs.height / 2);
    ctx.lineTo(obs.x - obs.width / 2, obs.y + obs.height / 2);
    ctx.closePath();
    ctx.fill();
  } else {
    ctx.fillStyle = '#996633';
    ctx.fillRect(obs.x - obs.width / 2, obs.y - obs.height / 2, obs.width, obs.height);
    ctx.strokeStyle = '#664422';
    ctx.lineWidth = 2;
    ctx.strokeRect(obs.x - obs.width / 2, obs.y - obs.height / 2, obs.width, obs.height);
  }
  ctx.shadowBlur = 0;
  ctx.restore();
}

export function drawPowerUp(ctx: CanvasRenderingContext2D, pu: PowerUp) {
  if (pu.collected) return;
  ctx.save();
  ctx.translate(pu.x, pu.y);
  ctx.rotate(pu.angle);

  const color = ABILITY_COLORS[pu.type];
  ctx.shadowColor = color;
  ctx.shadowBlur = 18;

  // Outer ring
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(0, 0, pu.radius + 3, 0, Math.PI * 2);
  ctx.stroke();

  // Inner fill
  ctx.fillStyle = color + '88';
  ctx.beginPath();
  ctx.arc(0, 0, pu.radius, 0, Math.PI * 2);
  ctx.fill();

  // Icon
  ctx.shadowBlur = 0;
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 12px Orbitron';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const icons: Record<string, string> = { slowmo: '⏱', shield: '🛡', doublecoins: '×2', autododge: '⚡' };
  ctx.fillText(icons[pu.type] || '?', 0, 1);

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
  ctx.beginPath(); ctx.arc(0, 0, coin.radius, 0, Math.PI * 2); ctx.fill();
  ctx.shadowBlur = 0;
  ctx.fillStyle = '#aa8800';
  ctx.font = 'bold 12px Orbitron';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText('$', 0, 1);
  ctx.restore();
}

export function drawParticles(ctx: CanvasRenderingContext2D, particles: Particle[]) {
  for (const p of particles) {
    ctx.globalAlpha = p.life / p.maxLife;
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
    ctx.beginPath(); ctx.moveTo(line.x, line.y); ctx.lineTo(line.x, line.y + line.length); ctx.stroke();
  }
  ctx.globalAlpha = 1;
}

export function drawHUD(
  ctx: CanvasRenderingContext2D,
  state: GameState,
  ability: AbilityState,
  boss: BossState,
) {
  ctx.save();

  // Score
  ctx.font = '600 16px Orbitron';
  ctx.fillStyle = COLORS.score; ctx.shadowColor = COLORS.score; ctx.shadowBlur = 10;
  ctx.textAlign = 'left';
  ctx.fillText('SCORE', 12, 28);
  ctx.font = '700 22px Orbitron';
  ctx.fillText(`${Math.floor(state.score)}`, 12, 54);
  ctx.font = '500 12px Rajdhani';
  ctx.fillStyle = '#aabbcc'; ctx.shadowBlur = 0;
  ctx.fillText(`${(state.distance / 100).toFixed(1)} km`, 12, 72);
  ctx.fillStyle = COLORS.coin; ctx.shadowColor = COLORS.coin; ctx.shadowBlur = 6;
  ctx.font = '600 14px Orbitron';
  ctx.fillText(`🪙 ${state.coins}`, 12, 94);

  // Speed
  ctx.textAlign = 'right';
  ctx.fillStyle = COLORS.speed; ctx.shadowColor = COLORS.speed; ctx.shadowBlur = 10;
  ctx.font = '600 14px Orbitron';
  ctx.fillText('SPEED', GAME_WIDTH - 12, 28);
  ctx.font = '700 24px Orbitron';
  ctx.fillText(`${Math.floor(state.speed * 20)}`, GAME_WIDTH - 50, 54);
  ctx.font = '500 12px Rajdhani';
  ctx.fillStyle = '#aabbcc'; ctx.shadowBlur = 0;
  ctx.fillText('km/h', GAME_WIDTH - 12, 54);

  // Combo
  if (state.combo > 1) {
    ctx.textAlign = 'center';
    ctx.fillStyle = COLORS.combo; ctx.shadowColor = COLORS.combo; ctx.shadowBlur = 15;
    ctx.font = '800 28px Orbitron';
    ctx.fillText(`x${state.combo}`, GAME_WIDTH / 2, 50);
    ctx.font = '500 12px Rajdhani';
    ctx.fillStyle = COLORS.nearMiss; ctx.shadowBlur = 0;
    ctx.fillText('COMBO', GAME_WIDTH / 2, 68);
  }

  // Energy bar
  const barX = 12;
  const barY = GAME_HEIGHT - 40;
  const barW = GAME_WIDTH - 24;
  const barH = 10;
  ctx.fillStyle = '#11182788';
  ctx.beginPath(); ctx.roundRect(barX, barY, barW, barH, 5); ctx.fill();

  const fillW = (ability.energy / ability.maxEnergy) * barW;
  if (fillW > 0) {
    const energyGrad = ctx.createLinearGradient(barX, barY, barX + fillW, barY);
    energyGrad.addColorStop(0, '#00ff88');
    energyGrad.addColorStop(1, '#00ccff');
    ctx.fillStyle = energyGrad;
    ctx.shadowColor = '#00ff88';
    ctx.shadowBlur = 8;
    ctx.beginPath(); ctx.roundRect(barX, barY, fillW, barH, 5); ctx.fill();
    ctx.shadowBlur = 0;
  }

  ctx.font = '500 10px Orbitron';
  ctx.fillStyle = '#aabbcc';
  ctx.textAlign = 'left';
  ctx.fillText('ENERGY', barX, barY - 4);

  if (ability.energy >= ability.maxEnergy && !ability.active) {
    ctx.fillStyle = '#00ff88';
    ctx.textAlign = 'right';
    ctx.font = '600 10px Orbitron';
    const pulse = Math.sin(Date.now() / 200) * 0.3 + 0.7;
    ctx.globalAlpha = pulse;
    ctx.fillText('PRESS SPACE', barX + barW, barY - 4);
    ctx.globalAlpha = 1;
  }

  // Active ability indicator
  if (ability.active) {
    const aColor = ABILITY_COLORS[ability.active];
    const aLabel = ABILITY_LABELS[ability.active];
    ctx.textAlign = 'center';
    ctx.font = '700 14px Orbitron';
    ctx.fillStyle = aColor;
    ctx.shadowColor = aColor;
    ctx.shadowBlur = 12;
    const timerRatio = ability.activeTimer / 60;
    ctx.fillText(`${aLabel} ${timerRatio.toFixed(1)}s`, GAME_WIDTH / 2, GAME_HEIGHT - 55);
    ctx.shadowBlur = 0;
  }

  // Boss warning / health
  if (boss.warningTimer > 0) {
    ctx.textAlign = 'center';
    ctx.font = '800 24px Orbitron';
    ctx.fillStyle = '#ff2200';
    ctx.shadowColor = '#ff2200';
    ctx.shadowBlur = 20;
    const blink = Math.sin(Date.now() / 100) > 0;
    if (blink) {
      ctx.fillText('⚠ BOSS INCOMING ⚠', GAME_WIDTH / 2, GAME_HEIGHT / 2 - 50);
    }
    ctx.shadowBlur = 0;
  }

  if (boss.active && boss.boss) {
    // Boss survival progress
    const progX = GAME_WIDTH / 2 - 60;
    const progY = 110;
    const progW = 120;
    const progH = 8;
    ctx.fillStyle = '#33000088';
    ctx.beginPath(); ctx.roundRect(progX, progY, progW, progH, 4); ctx.fill();
    const ratio = Math.min(1, boss.escapeDist / BOSS_SURVIVE_DISTANCE);
    ctx.fillStyle = ratio < 0.5 ? '#ff4400' : ratio < 0.8 ? '#ffaa00' : '#00ff88';
    ctx.shadowColor = ctx.fillStyle as string;
    ctx.shadowBlur = 6;
    ctx.beginPath(); ctx.roundRect(progX, progY, progW * ratio, progH, 4); ctx.fill();
    ctx.shadowBlur = 0;
    ctx.font = '500 10px Orbitron';
    ctx.fillStyle = '#ffaa00';
    ctx.textAlign = 'center';
    ctx.fillText('SURVIVE', GAME_WIDTH / 2, progY - 4);
  }

  ctx.restore();
}

export function drawGameOver(ctx: CanvasRenderingContext2D, state: GameState) {
  ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
  ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
  ctx.save();
  ctx.textAlign = 'center';
  ctx.font = '800 32px Orbitron';
  ctx.fillStyle = '#ff0066'; ctx.shadowColor = '#ff0066'; ctx.shadowBlur = 20;
  ctx.fillText('GAME OVER', GAME_WIDTH / 2, GAME_HEIGHT / 2 - 100);
  ctx.shadowBlur = 0;
  ctx.font = '600 16px Orbitron';
  ctx.fillStyle = '#00e5ff';
  ctx.fillText(`SCORE: ${Math.floor(state.score)}`, GAME_WIDTH / 2, GAME_HEIGHT / 2 - 40);
  ctx.fillStyle = '#ffd700';
  ctx.fillText(`COINS: ${state.coins}`, GAME_WIDTH / 2, GAME_HEIGHT / 2 - 10);
  ctx.fillStyle = '#aabbcc'; ctx.font = '500 14px Rajdhani';
  ctx.fillText(`Distance: ${(state.distance / 100).toFixed(1)} km`, GAME_WIDTH / 2, GAME_HEIGHT / 2 + 20);
  ctx.fillText(`Top Speed: ${Math.floor(state.maxSpeed * 20)} km/h`, GAME_WIDTH / 2, GAME_HEIGHT / 2 + 44);
  ctx.font = '600 14px Orbitron';
  ctx.fillStyle = '#00e5ff'; ctx.shadowColor = '#00e5ff'; ctx.shadowBlur = 10;
  ctx.fillText('TAP OR PRESS ENTER TO RESTART', GAME_WIDTH / 2, GAME_HEIGHT / 2 + 100);
  ctx.restore();
}

// Slow-motion tint overlay
export function drawSlowMotionOverlay(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = 'rgba(0, 100, 255, 0.08)';
  ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
}

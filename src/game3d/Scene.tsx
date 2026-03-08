import React, { useRef, useState, useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import Track from './Track';
import CarModel from './CarModel';
import { useControls } from './useControls';
import {
  CarState, AICarState, RaceState, GameSettings,
  PHYSICS, TRACK_WIDTH, TOTAL_LAPS,
  AI_COLORS, AI_NAMES, DIFFICULTY_SETTINGS,
} from './types';
import {
  getPointOnTrack, getTangentOnTrack, getClosestT, getTrackLength,
} from './trackUtils';
import { PlayerUpgrades, applyUpgradesToPhysics } from './progression';

interface SceneProps {
  settings: GameSettings;
  onRaceUpdate: (state: RaceState) => void;
  onRaceEnd: (state: RaceState) => void;
  playerUpgrades?: PlayerUpgrades;
}

function createPlayerCar(): CarState {
  const startPos = getPointOnTrack(0);
  const tangent = getTangentOnTrack(0);
  return {
    position: new THREE.Vector3(startPos.x - 2, 0, startPos.z - 3),
    rotation: Math.atan2(tangent.x, tangent.z),
    speed: 0,
    lateralSpeed: 0,
    nitro: 100,
    maxNitro: 100,
    drifting: false,
    driftAngle: 0,
    health: 100,
    maxHealth: 100,
  };
}

function createAICars(difficulty: GameSettings['difficulty']): AICarState[] {
  return AI_NAMES.map((name, i) => {
    const offset = (i + 1) * 0.005;
    const startPos = getPointOnTrack(1 - offset);
    const tangent = getTangentOnTrack(1 - offset);
    const laneOffset = (i - 1) * 3;
    const right = new THREE.Vector3().crossVectors(tangent, new THREE.Vector3(0, 1, 0)).normalize();

    return {
      position: startPos.clone().add(right.multiplyScalar(laneOffset)),
      rotation: Math.atan2(tangent.x, tangent.z),
      speed: 0,
      lateralSpeed: 0,
      nitro: 100,
      maxNitro: 100,
      drifting: false,
      driftAngle: 0,
      health: 100,
      maxHealth: 100,
      waypointIndex: 0,
      personality: i === 0 ? 'aggressive' : i === 1 ? 'normal' : 'cautious',
      color: AI_COLORS[i],
      name,
    };
  });
}

const Scene: React.FC<SceneProps> = ({ settings, onRaceUpdate, onRaceEnd, playerUpgrades }) => {
  const controls = useControls();
  const upgradeMods = useMemo(() => applyUpgradesToPhysics(playerUpgrades || { engine: 0, nitro: 0, tires: 0, handling: 0 }), [playerUpgrades]);
  const playerRef = useRef<THREE.Group>(null);
  const cameraOffset = useRef(new THREE.Vector3(0, 6, -12));

  const [playerCar] = useState<CarState>(() => createPlayerCar());
  const [aiCars] = useState<AICarState[]>(() => createAICars(settings.difficulty));
  const raceState = useRef<RaceState>({
    status: 'countdown',
    lap: 0,
    totalLaps: TOTAL_LAPS,
    position: 4,
    countdownTimer: 3.5,
    raceTime: 0,
    money: 0,
    checkpointIndex: 0,
  });
  const playerT = useRef(0);
  const prevPlayerT = useRef(0);
  const aiTs = useRef<number[]>(AI_NAMES.map((_, i) => 1 - (i + 1) * 0.005));
  const [cameraMode, setCameraMode] = useState<'third' | 'first'>(settings.cameraMode);
  const { camera } = useThree();

  const trackLen = useRef(getTrackLength());

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    const race = raceState.current;
    const ctrl = controls.current;

    if (ctrl.cameraToggle) {
      ctrl.cameraToggle = false;
      setCameraMode((m) => m === 'third' ? 'first' : 'third');
    }

    // Countdown
    if (race.status === 'countdown') {
      race.countdownTimer -= dt;
      if (race.countdownTimer <= 0) {
        race.status = 'racing';
        race.countdownTimer = 0;
      }
      updateCamera(camera, playerCar, cameraMode, cameraOffset.current, dt);
      onRaceUpdate({ ...race });
      return;
    }

    if (race.status === 'finished') return;

    race.raceTime += dt;

    // === Player physics (with upgrades) ===
    const P = PHYSICS;
    const U = upgradeMods;
    const maxSpd = P.maxSpeed * U.maxSpeedMult;

    if (ctrl.forward) {
      playerCar.speed = Math.min(maxSpd, playerCar.speed + P.acceleration * U.accelMult * dt * 60);
    }
    if (ctrl.backward) {
      playerCar.speed = Math.max(-maxSpd * 0.3, playerCar.speed - P.brakeForce * dt * 60);
    }
    if (ctrl.nitro && playerCar.nitro > 0 && playerCar.speed > 0) {
      playerCar.speed = Math.min(maxSpd * 1.4, playerCar.speed + P.nitroBoost * U.nitroBoostMult * dt * 60);
      playerCar.nitro = Math.max(0, playerCar.nitro - P.nitroDrain * U.nitroDrainMult * dt * 60);
    } else if (playerCar.nitro < playerCar.maxNitro && !ctrl.nitro) {
      playerCar.nitro = Math.min(playerCar.maxNitro, playerCar.nitro + P.nitroRegen * U.nitroRegenMult * dt * 60);
    }

    // Steering
    const steerAmount = P.steerSpeed * U.steerMult * (playerCar.drifting ? P.driftSteerMultiplier * U.driftSteerMult : 1) * dt * 60;
    if (ctrl.left) playerCar.rotation += steerAmount * Math.sign(playerCar.speed || 1);
    if (ctrl.right) playerCar.rotation -= steerAmount * Math.sign(playerCar.speed || 1);

    // Drift
    playerCar.drifting = ctrl.drift && Math.abs(playerCar.speed) > 0.3;
    const fric = playerCar.drifting ? P.driftFriction : P.friction;
    playerCar.speed *= Math.pow(fric, dt * 60);

    // Move
    const moveX = Math.sin(playerCar.rotation) * playerCar.speed * dt * 60;
    const moveZ = Math.cos(playerCar.rotation) * playerCar.speed * dt * 60;
    playerCar.position.x += moveX;
    playerCar.position.z += moveZ;
    playerCar.position.y = 0;

    // Track boundary
    const closestT = getClosestT(playerCar.position, 200);
    const closestPoint = getPointOnTrack(closestT);
    const distFromCenter = playerCar.position.distanceTo(closestPoint);
    if (distFromCenter > TRACK_WIDTH / 2 + 2) {
      const toTrack = closestPoint.clone().sub(playerCar.position).normalize();
      playerCar.position.add(toTrack.multiplyScalar(0.5));
      playerCar.speed *= 0.85; // harder penalty for going off-track
    }

    // Update player T
    prevPlayerT.current = playerT.current;
    playerT.current = closestT;

    // Lap detection
    if (prevPlayerT.current > 0.9 && playerT.current < 0.1) {
      race.lap++;
      if (race.lap >= race.totalLaps) {
        race.status = 'finished';
        const diffSettings = DIFFICULTY_SETTINGS[settings.difficulty];
        const posIdx = Math.max(0, Math.min(2, race.position - 1));
        race.money = diffSettings.reward[posIdx] || 100;
        onRaceEnd({ ...race });
      }
    }

    // === AI cars ===
    const diffSettings = DIFFICULTY_SETTINGS[settings.difficulty];
    aiCars.forEach((ai, i) => {
      const targetT = (aiTs.current[i] + 0.003 * diffSettings.aiSpeedMult * dt * 60) % 1;
      aiTs.current[i] = targetT;

      const targetPoint = getPointOnTrack(targetT);
      const tangent = getTangentOnTrack(targetT);
      const targetRot = Math.atan2(tangent.x, tangent.z);

      const laneOffset = (i - 1) * 2.5;
      const right = new THREE.Vector3().crossVectors(tangent, new THREE.Vector3(0, 1, 0)).normalize();
      const desiredPos = targetPoint.clone().add(right.multiplyScalar(laneOffset));

      ai.position.lerp(desiredPos, 0.08 * dt * 60);
      ai.position.y = 0;

      let rotDiff = targetRot - ai.rotation;
      while (rotDiff > Math.PI) rotDiff -= Math.PI * 2;
      while (rotDiff < -Math.PI) rotDiff += Math.PI * 2;
      ai.rotation += rotDiff * 0.1 * dt * 60;

      ai.speed = diffSettings.aiSpeedMult * P.maxSpeed * 0.8;
    });

    // Compute positions
    const allTs = [
      { t: playerT.current, lap: race.lap, isPlayer: true },
      ...aiCars.map((_, i) => ({ t: aiTs.current[i], lap: TOTAL_LAPS - 1, isPlayer: false })),
    ];
    allTs.sort((a, b) => b.lap - a.lap || b.t - a.t);
    race.position = allTs.findIndex((a) => a.isPlayer) + 1;

    if (playerRef.current) {
      playerRef.current.position.copy(playerCar.position);
      playerRef.current.rotation.y = playerCar.rotation;
    }

    updateCamera(camera, playerCar, cameraMode, cameraOffset.current, dt);
    onRaceUpdate({ ...race, nitro: playerCar.nitro, maxNitro: playerCar.maxNitro, speed: playerCar.speed } as any);
  });

  return (
    <>
      {/* Daylight sky lighting */}
      <ambientLight intensity={0.6} color="#fffbe6" />
      <hemisphereLight args={['#87ceeb', '#4a7c3f', 0.5]} />
      <directionalLight
        position={[80, 120, 60]}
        intensity={1.8}
        color="#fff5e0"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={400}
        shadow-camera-left={-150}
        shadow-camera-right={250}
        shadow-camera-top={100}
        shadow-camera-bottom={-300}
      />
      {/* Fill light from opposite side */}
      <directionalLight
        position={[-50, 40, -80]}
        intensity={0.4}
        color="#aaccff"
      />
      <fog attach="fog" args={['#b8d4e8', 80, 300]} />

      <Track />

      {/* Player car */}
      <group ref={playerRef}>
        <CarModel
          color="#1a6fff"
          isPlayer
          speed={playerCar.speed}
          drifting={playerCar.drifting}
          nitroActive={controls.current.nitro && playerCar.nitro > 0}
        />
      </group>

      {/* AI cars */}
      {aiCars.map((ai, i) => (
        <group key={i} position={[ai.position.x, ai.position.y, ai.position.z]} rotation={[0, ai.rotation, 0]}>
          <CarModel color={ai.color} speed={ai.speed} />
        </group>
      ))}
    </>
  );
};

function updateCamera(
  camera: THREE.Camera,
  car: CarState,
  mode: 'third' | 'first',
  offset: THREE.Vector3,
  dt: number
) {
  if (mode === 'first') {
    const fpPos = new THREE.Vector3(
      car.position.x + Math.sin(car.rotation) * 1,
      car.position.y + 1.2,
      car.position.z + Math.cos(car.rotation) * 1,
    );
    const lookAt = new THREE.Vector3(
      car.position.x + Math.sin(car.rotation) * 20,
      car.position.y + 1,
      car.position.z + Math.cos(car.rotation) * 20,
    );
    camera.position.lerp(fpPos, 0.15 * dt * 60);
    camera.lookAt(lookAt);
  } else {
    const behindDist = 12;
    const height = 6;
    const targetPos = new THREE.Vector3(
      car.position.x - Math.sin(car.rotation) * behindDist,
      car.position.y + height,
      car.position.z - Math.cos(car.rotation) * behindDist,
    );
    camera.position.lerp(targetPos, 0.06 * dt * 60);
    const lookTarget = new THREE.Vector3(
      car.position.x + Math.sin(car.rotation) * 8,
      car.position.y + 1,
      car.position.z + Math.cos(car.rotation) * 8,
    );
    camera.lookAt(lookTarget);
  }
}

export default Scene;

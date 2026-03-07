import React, { useMemo } from 'react';
import * as THREE from 'three';
import { buildTrackGeometry, buildBarrierGeometry, getTrackCurve } from './trackUtils';
import { TRACK_WIDTH } from './types';

const Track: React.FC = () => {
  const trackGeo = useMemo(() => buildTrackGeometry(), []);
  const leftBarrier = useMemo(() => buildBarrierGeometry('left'), []);
  const rightBarrier = useMemo(() => buildBarrierGeometry('right'), []);

  // Neon light posts along track
  const lightPositions = useMemo(() => {
    const curve = getTrackCurve();
    const positions: { pos: THREE.Vector3; side: number }[] = [];
    for (let i = 0; i < 40; i++) {
      const t = i / 40;
      const p = curve.getPointAt(t);
      const tangent = curve.getTangentAt(t).normalize();
      const right = new THREE.Vector3().crossVectors(tangent, new THREE.Vector3(0, 1, 0)).normalize();
      const side = i % 2 === 0 ? -1 : 1;
      const offset = (TRACK_WIDTH / 2 + 2) * side;
      positions.push({
        pos: p.clone().add(right.clone().multiplyScalar(offset)),
        side,
      });
    }
    return positions;
  }, []);

  return (
    <group>
      {/* Ground plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[50, -0.1, -100]} receiveShadow>
        <planeGeometry args={[500, 500]} />
        <meshStandardMaterial color="#0a0a12" roughness={1} />
      </mesh>

      {/* Track surface */}
      <mesh geometry={trackGeo} receiveShadow>
        <meshStandardMaterial color="#1a1a2e" roughness={0.7} metalness={0.1} />
      </mesh>

      {/* Center line - emissive strip on track */}
      <mesh geometry={trackGeo}>
        <meshStandardMaterial
          color="#00ccff"
          emissive="#00ccff"
          emissiveIntensity={0.15}
          transparent
          opacity={0.3}
          wireframe
        />
      </mesh>

      {/* Left barrier */}
      <mesh geometry={leftBarrier}>
        <meshStandardMaterial color="#1a0033" emissive="#cc00ff" emissiveIntensity={0.6} />
      </mesh>

      {/* Right barrier */}
      <mesh geometry={rightBarrier}>
        <meshStandardMaterial color="#003322" emissive="#00ffaa" emissiveIntensity={0.6} />
      </mesh>

      {/* Light posts */}
      {lightPositions.map((lp, i) => (
        <group key={i} position={[lp.pos.x, 0, lp.pos.z]}>
          {/* Post */}
          <mesh position={[0, 2, 0]} castShadow>
            <cylinderGeometry args={[0.08, 0.08, 4, 6]} />
            <meshStandardMaterial color="#222222" metalness={0.8} roughness={0.3} />
          </mesh>
          {/* Light */}
          <pointLight
            position={[0, 4.2, 0]}
            color={lp.side === -1 ? '#cc00ff' : '#00ffaa'}
            intensity={3}
            distance={15}
          />
          <mesh position={[0, 4.2, 0]}>
            <sphereGeometry args={[0.15, 8, 8]} />
            <meshStandardMaterial
              color={lp.side === -1 ? '#cc00ff' : '#00ffaa'}
              emissive={lp.side === -1 ? '#cc00ff' : '#00ffaa'}
              emissiveIntensity={3}
            />
          </mesh>
        </group>
      ))}

      {/* Some background buildings */}
      {Array.from({ length: 20 }).map((_, i) => {
        const angle = (i / 20) * Math.PI * 2;
        const r = 80 + Math.random() * 40;
        const x = 55 + Math.cos(angle) * r;
        const z = -110 + Math.sin(angle) * r;
        const h = 8 + Math.random() * 25;
        const w = 4 + Math.random() * 8;
        return (
          <mesh key={`bld-${i}`} position={[x, h / 2, z]} castShadow>
            <boxGeometry args={[w, h, w]} />
            <meshStandardMaterial
              color="#0a0a18"
              emissive={i % 3 === 0 ? '#001133' : i % 3 === 1 ? '#110022' : '#002211'}
              emissiveIntensity={0.3}
            />
          </mesh>
        );
      })}

      {/* Start/Finish line */}
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[TRACK_WIDTH, 1.5]} />
        <meshStandardMaterial
          color="#ffffff"
          emissive="#ffffff"
          emissiveIntensity={0.5}
          transparent
          opacity={0.6}
        />
      </mesh>
    </group>
  );
};

export default Track;

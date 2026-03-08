import React, { useMemo } from 'react';
import * as THREE from 'three';
import { buildTrackGeometry, buildBarrierGeometry, getTrackCurve } from './trackUtils';
import { TRACK_WIDTH } from './types';

const Track: React.FC = () => {
  const trackGeo = useMemo(() => buildTrackGeometry(), []);
  const leftBarrier = useMemo(() => buildBarrierGeometry('left'), []);
  const rightBarrier = useMemo(() => buildBarrierGeometry('right'), []);

  // Fence posts along track
  const fencePositions = useMemo(() => {
    const curve = getTrackCurve();
    const positions: { pos: THREE.Vector3; side: number }[] = [];
    for (let i = 0; i < 60; i++) {
      const t = i / 60;
      const p = curve.getPointAt(t);
      const tangent = curve.getTangentAt(t).normalize();
      const right = new THREE.Vector3().crossVectors(tangent, new THREE.Vector3(0, 1, 0)).normalize();
      const side = i % 2 === 0 ? -1 : 1;
      const offset = (TRACK_WIDTH / 2 + 1.5) * side;
      positions.push({
        pos: p.clone().add(right.clone().multiplyScalar(offset)),
        side,
      });
    }
    return positions;
  }, []);



  return (
    <group>
      {/* Large grass ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[50, -0.05, -100]} receiveShadow>
        <planeGeometry args={[600, 600]} />
        <meshStandardMaterial color="#4a7c3f" roughness={0.95} />
      </mesh>

      {/* Secondary grass variation patches */}
      {Array.from({ length: 12 }).map((_, i) => {
        const angle = (i / 12) * Math.PI * 2;
        const r = 40 + Math.random() * 60;
        return (
          <mesh key={`grass-${i}`} rotation={[-Math.PI / 2, 0, 0]} position={[50 + Math.cos(angle) * r, -0.03, -100 + Math.sin(angle) * r]} receiveShadow>
            <circleGeometry args={[15 + Math.random() * 10, 16]} />
            <meshStandardMaterial color="#5a8c4f" roughness={1} />
          </mesh>
        );
      })}

      {/* Track surface - asphalt */}
      <mesh geometry={trackGeo} receiveShadow>
        <meshStandardMaterial color="#3a3a3a" roughness={0.85} metalness={0.05} />
      </mesh>

      {/* Center dashed line on track */}
      <mesh geometry={trackGeo}>
        <meshStandardMaterial
          color="#e8e8e8"
          transparent
          opacity={0.15}
          wireframe
        />
      </mesh>

      {/* Left barrier - white/red racing barrier */}
      <mesh geometry={leftBarrier}>
        <meshStandardMaterial color="#cc2222" roughness={0.6} metalness={0.1} />
      </mesh>

      {/* Right barrier - white/blue racing barrier */}
      <mesh geometry={rightBarrier}>
        <meshStandardMaterial color="#2244aa" roughness={0.6} metalness={0.1} />
      </mesh>

      {/* Fence posts */}
      {fencePositions.map((lp, i) => (
        <group key={i} position={[lp.pos.x, 0, lp.pos.z]}>
          {/* Post */}
          <mesh position={[0, 1, 0]} castShadow>
            <cylinderGeometry args={[0.06, 0.06, 2, 6]} />
            <meshStandardMaterial color="#888888" metalness={0.5} roughness={0.4} />
          </mesh>
        </group>
      ))}

      {/* Trees */}
      {trees.map((tree, i) => (
        <group key={`tree-${i}`} position={[tree.x, 0, tree.z]} scale={tree.scale}>
          {/* Trunk */}
          <mesh position={[0, 1.5, 0]} castShadow>
            <cylinderGeometry args={[0.2, 0.3, 3, 8]} />
            <meshStandardMaterial color="#5c3a1e" roughness={0.9} />
          </mesh>
          {/* Foliage - layered spheres */}
          <mesh position={[0, 3.5, 0]} castShadow>
            <sphereGeometry args={[1.5, 8, 8]} />
            <meshStandardMaterial color={tree.type === 0 ? '#2d6b1e' : tree.type === 1 ? '#3a8525' : '#1e5c14'} roughness={0.85} />
          </mesh>
          <mesh position={[0, 4.3, 0]} castShadow>
            <sphereGeometry args={[1.0, 8, 8]} />
            <meshStandardMaterial color={tree.type === 0 ? '#3a8525' : tree.type === 1 ? '#2d6b1e' : '#3a8525'} roughness={0.85} />
          </mesh>
        </group>
      ))}

      {/* Distant hills */}
      {Array.from({ length: 8 }).map((_, i) => {
        const angle = (i / 8) * Math.PI * 2;
        const r = 160 + Math.random() * 40;
        const x = 55 + Math.cos(angle) * r;
        const z = -110 + Math.sin(angle) * r;
        const s = 30 + Math.random() * 20;
        return (
          <mesh key={`hill-${i}`} position={[x, s * 0.3, z]} castShadow>
            <sphereGeometry args={[s, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
            <meshStandardMaterial color="#3d6e30" roughness={0.95} />
          </mesh>
        );
      })}

      {/* Start/Finish line */}
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[TRACK_WIDTH, 2]} />
        <meshStandardMaterial color="#ffffff" transparent opacity={0.8} />
      </mesh>
      {/* Checkered pattern overlay */}
      <mesh position={[0, 0.03, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[TRACK_WIDTH, 0.3]} />
        <meshStandardMaterial color="#111111" transparent opacity={0.7} />
      </mesh>

      {/* Clouds - simple floating white spheres */}
      {Array.from({ length: 15 }).map((_, i) => {
        const x = -100 + Math.random() * 300;
        const z = -250 + Math.random() * 300;
        const y = 40 + Math.random() * 30;
        const s = 8 + Math.random() * 12;
        return (
          <mesh key={`cloud-${i}`} position={[x, y, z]}>
            <sphereGeometry args={[s, 8, 6]} />
            <meshStandardMaterial color="#ffffff" transparent opacity={0.7} roughness={1} />
          </mesh>
        );
      })}
    </group>
  );
};

export default Track;

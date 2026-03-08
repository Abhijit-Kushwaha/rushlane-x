import React, { useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

interface CarModelProps {
  color: string;
  isPlayer?: boolean;
  speed?: number;
  drifting?: boolean;
  nitroActive?: boolean;
}

const CarModel: React.FC<CarModelProps> = ({ color, isPlayer, speed = 0, drifting, nitroActive }) => {
  const wheelsRef = useRef<THREE.Group>(null);
  const nitroRef = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (wheelsRef.current) {
      wheelsRef.current.children.forEach((w) => {
        (w as THREE.Mesh).rotation.x += speed * delta * 30;
      });
    }
    if (nitroRef.current) {
      nitroRef.current.visible = !!nitroActive;
      if (nitroActive) {
        nitroRef.current.scale.x = 0.8 + Math.random() * 0.4;
        nitroRef.current.scale.y = 0.8 + Math.random() * 0.4;
        nitroRef.current.scale.z = 1 + Math.random() * 1.5;
      }
    }
  });

  return (
    <group>
      {/* Main body */}
      <mesh position={[0, 0.4, 0]} castShadow>
        <boxGeometry args={[1.8, 0.5, 4.2]} />
        <meshStandardMaterial color={color} metalness={0.6} roughness={0.3} />
      </mesh>

      {/* Cabin */}
      <mesh position={[0, 0.75, -0.2]} castShadow>
        <boxGeometry args={[1.5, 0.45, 2.0]} />
        <meshStandardMaterial color={color} metalness={0.5} roughness={0.35} />
      </mesh>

      {/* Windshield */}
      <mesh position={[0, 0.78, 0.7]} rotation={[0.3, 0, 0]}>
        <planeGeometry args={[1.3, 0.4]} />
        <meshStandardMaterial color="#6699bb" metalness={0.9} roughness={0.05} transparent opacity={0.6} />
      </mesh>

      {/* Rear window */}
      <mesh position={[0, 0.78, -1.1]} rotation={[-0.3, Math.PI, 0]}>
        <planeGeometry args={[1.3, 0.35]} />
        <meshStandardMaterial color="#6699bb" metalness={0.9} roughness={0.05} transparent opacity={0.6} />
      </mesh>

      {/* Headlights */}
      <mesh position={[-0.7, 0.35, 2.1]}>
        <sphereGeometry args={[0.12, 8, 8]} />
        <meshStandardMaterial color="#ffffee" metalness={0.3} roughness={0.2} />
      </mesh>
      <mesh position={[0.7, 0.35, 2.1]}>
        <sphereGeometry args={[0.12, 8, 8]} />
        <meshStandardMaterial color="#ffffee" metalness={0.3} roughness={0.2} />
      </mesh>

      {/* Headlight beams for player */}
      {isPlayer && (
        <>
          <spotLight position={[-0.7, 0.35, 2.2]} target-position={[-0.7, 0, 15]} angle={0.4} penumbra={0.5} intensity={2} color="#ffffcc" distance={20} castShadow={false} />
          <spotLight position={[0.7, 0.35, 2.2]} target-position={[0.7, 0, 15]} angle={0.4} penumbra={0.5} intensity={2} color="#ffffcc" distance={20} castShadow={false} />
        </>
      )}

      {/* Taillights */}
      <mesh position={[-0.7, 0.35, -2.1]}>
        <sphereGeometry args={[0.1, 8, 8]} />
        <meshStandardMaterial color="#cc2222" roughness={0.3} />
      </mesh>
      <mesh position={[0.7, 0.35, -2.1]}>
        <sphereGeometry args={[0.1, 8, 8]} />
        <meshStandardMaterial color="#cc2222" roughness={0.3} />
      </mesh>

      {/* Wheels */}
      <group ref={wheelsRef}>
        {[[-0.9, 0.18, 1.3], [0.9, 0.18, 1.3], [-0.9, 0.18, -1.3], [0.9, 0.18, -1.3]].map(([x, y, z], i) => (
          <mesh key={i} position={[x, y, z]} rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.2, 0.2, 0.15, 12]} />
            <meshStandardMaterial color="#222222" metalness={0.4} roughness={0.7} />
          </mesh>
        ))}
      </group>

      {/* Nitro flame */}
      <mesh ref={nitroRef} position={[0, 0.35, -2.5]} visible={false}>
        <coneGeometry args={[0.2, 1.2, 8]} />
        <meshStandardMaterial color="#ff6600" emissive="#ff4400" emissiveIntensity={3} transparent opacity={0.8} />
      </mesh>

      {/* Drift dust effect */}
      {drifting && (
        <>
          <mesh position={[-0.9, 0.05, -1.5]}>
            <sphereGeometry args={[0.4, 6, 6]} />
            <meshStandardMaterial color="#c4a86a" transparent opacity={0.4} roughness={1} />
          </mesh>
          <mesh position={[0.9, 0.05, -1.5]}>
            <sphereGeometry args={[0.4, 6, 6]} />
            <meshStandardMaterial color="#c4a86a" transparent opacity={0.4} roughness={1} />
          </mesh>
        </>
      )}

      {/* Car shadow underneath */}
      {isPlayer && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
          <planeGeometry args={[2.2, 4.6]} />
          <meshBasicMaterial color="#000000" transparent opacity={0.15} />
        </mesh>
      )}
    </group>
  );
};

export default CarModel;

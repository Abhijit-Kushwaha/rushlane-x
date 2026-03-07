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
        <meshStandardMaterial color={color} metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Cabin */}
      <mesh position={[0, 0.75, -0.2]} castShadow>
        <boxGeometry args={[1.5, 0.45, 2.0]} />
        <meshStandardMaterial color={color} metalness={0.7} roughness={0.25} />
      </mesh>

      {/* Windshield */}
      <mesh position={[0, 0.78, 0.7]} rotation={[0.3, 0, 0]}>
        <planeGeometry args={[1.3, 0.4]} />
        <meshStandardMaterial color="#112244" metalness={0.9} roughness={0.1} transparent opacity={0.7} />
      </mesh>

      {/* Rear window */}
      <mesh position={[0, 0.78, -1.1]} rotation={[-0.3, Math.PI, 0]}>
        <planeGeometry args={[1.3, 0.35]} />
        <meshStandardMaterial color="#112244" metalness={0.9} roughness={0.1} transparent opacity={0.7} />
      </mesh>

      {/* Headlights */}
      <mesh position={[-0.7, 0.35, 2.1]}>
        <sphereGeometry args={[0.12, 8, 8]} />
        <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={isPlayer ? 3 : 1} />
      </mesh>
      <mesh position={[0.7, 0.35, 2.1]}>
        <sphereGeometry args={[0.12, 8, 8]} />
        <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={isPlayer ? 3 : 1} />
      </mesh>

      {/* Headlight beams for player */}
      {isPlayer && (
        <>
          <spotLight position={[-0.7, 0.35, 2.2]} target-position={[-0.7, 0, 15]} angle={0.4} penumbra={0.5} intensity={5} color="#ffffcc" distance={30} castShadow={false} />
          <spotLight position={[0.7, 0.35, 2.2]} target-position={[0.7, 0, 15]} angle={0.4} penumbra={0.5} intensity={5} color="#ffffcc" distance={30} castShadow={false} />
        </>
      )}

      {/* Taillights */}
      <mesh position={[-0.7, 0.35, -2.1]}>
        <sphereGeometry args={[0.1, 8, 8]} />
        <meshStandardMaterial color="#ff0000" emissive="#ff0000" emissiveIntensity={2} />
      </mesh>
      <mesh position={[0.7, 0.35, -2.1]}>
        <sphereGeometry args={[0.1, 8, 8]} />
        <meshStandardMaterial color="#ff0000" emissive="#ff0000" emissiveIntensity={2} />
      </mesh>

      {/* Wheels */}
      <group ref={wheelsRef}>
        {[[-0.9, 0.18, 1.3], [0.9, 0.18, 1.3], [-0.9, 0.18, -1.3], [0.9, 0.18, -1.3]].map(([x, y, z], i) => (
          <mesh key={i} position={[x, y, z]} rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.2, 0.2, 0.15, 12]} />
            <meshStandardMaterial color="#111111" metalness={0.3} roughness={0.8} />
          </mesh>
        ))}
      </group>

      {/* Nitro flame */}
      <mesh ref={nitroRef} position={[0, 0.35, -2.5]} visible={false}>
        <coneGeometry args={[0.2, 1.2, 8]} />
        <meshStandardMaterial color="#0088ff" emissive="#00aaff" emissiveIntensity={5} transparent opacity={0.8} />
      </mesh>

      {/* Drift smoke placeholder - tiny particles when drifting */}
      {drifting && (
        <>
          <pointLight position={[-0.9, 0.1, -1.3]} color="#ffffff" intensity={0.5} distance={3} />
          <pointLight position={[0.9, 0.1, -1.3]} color="#ffffff" intensity={0.5} distance={3} />
        </>
      )}

      {/* Underglow for player */}
      {isPlayer && (
        <pointLight position={[0, 0.1, 0]} color={color} intensity={2} distance={5} />
      )}
    </group>
  );
};

export default CarModel;

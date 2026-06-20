import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { QualityStatus } from '@/types';

interface MaterialStackProps {
  position: [number, number, number];
  status: QualityStatus;
  size?: [number, number, number];
  isSelected?: boolean;
  onClick?: () => void;
  onPointerOver?: () => void;
}

const STATUS_COLORS: Record<QualityStatus, { color: string; emissive: string }> = {
  green: { color: '#22c55e', emissive: '#16a34a' },
  yellow: { color: '#eab308', emissive: '#ca8a04' },
  red: { color: '#ef4444', emissive: '#dc2626' },
};

const MaterialStack = ({
  position,
  status,
  size = [2, 1.5, 2],
  isSelected = false,
  onClick,
  onPointerOver,
}: MaterialStackProps) => {
  const groupRef = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const glowRef = useRef<THREE.Mesh>(null);

  const colors = STATUS_COLORS[status];

  useFrame((state) => {
    if (glowRef.current) {
      const scale = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.03;
      glowRef.current.scale.set(scale, scale, scale);
    }
    if (groupRef.current && (hovered || isSelected)) {
      groupRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 3) * 0.05;
    }
  });

  return (
    <group ref={groupRef} position={position}>
      <mesh
        ref={meshRef}
        castShadow
        receiveShadow
        onClick={(e) => {
          e.stopPropagation();
          onClick?.();
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          onPointerOver?.();
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          setHovered(false);
          document.body.style.cursor = 'auto';
        }}
      >
        <boxGeometry args={size} />
        <meshStandardMaterial
          color={colors.color}
          emissive={colors.emissive}
          emissiveIntensity={(hovered || isSelected) ? 0.6 : 0.2}
          roughness={0.5}
          metalness={0.3}
        />
      </mesh>

      <mesh
        ref={glowRef}
        position={[0, 0, 0]}
      >
        <boxGeometry args={[size[0] * 1.05, size[1] * 1.05, size[2] * 1.05]} />
        <meshBasicMaterial
          color={colors.color}
          transparent
          opacity={(hovered || isSelected) ? 0.15 : 0.05}
          side={THREE.BackSide}
        />
      </mesh>

      <mesh position={[0, size[1] / 2 + 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[size[0] * 0.6, size[2] * 0.6]} />
        <meshStandardMaterial
          color={colors.color}
          emissive={colors.emissive}
          emissiveIntensity={0.8}
        />
      </mesh>

      {(hovered || isSelected) && (
        <mesh position={[0, -size[1] / 2 - 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[size[0] * 0.6, size[0] * 0.8, 32]} />
          <meshBasicMaterial
            color={colors.color}
            transparent
            opacity={0.5}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}
    </group>
  );
};

export default MaterialStack;

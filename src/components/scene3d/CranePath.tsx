import { useMemo, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Line } from '@react-three/drei';
import * as THREE from 'three';

interface CranePathProps {
  points: [number, number, number][];
}

const CranePath = ({ points }: CranePathProps) => {
  const [dashOffset, setDashOffset] = useState(0);

  const threePoints = useMemo(
    () => points.map((p) => new THREE.Vector3(...p)),
    [points]
  );

  useFrame((state) => {
    setDashOffset(-(state.clock.elapsedTime * 0.5) % 2);
  });

  return (
    <group>
      <Line
        points={threePoints}
        color="#22c55e"
        lineWidth={6}
        transparent
        opacity={0.3}
      />

      <Line
        points={threePoints}
        color="#4ade80"
        lineWidth={3}
        dashed
        dashSize={0.5}
        gapSize={0.3}
        dashOffset={dashOffset}
      />

      {points.map((point, index) => (
        <mesh key={`point-${index}`} position={point}>
          <sphereGeometry args={[0.15, 16, 16]} />
          <meshStandardMaterial
            color="#22c55e"
            emissive="#22c55e"
            emissiveIntensity={1}
          />
        </mesh>
      ))}

      {points.length > 0 && (
        <mesh position={points[points.length - 1]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.3, 0.5, 32]} />
          <meshBasicMaterial
            color="#22c55e"
            transparent
            opacity={0.6}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}
    </group>
  );
};

export default CranePath;

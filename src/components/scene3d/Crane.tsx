import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface CraneProps {
  position?: [number, number, number];
  rotation?: number;
}

const Crane = ({ position = [0, 0, 0], rotation = 0 }: CraneProps) => {
  const jibRef = useRef<THREE.Group>(null);
  const hookRef = useRef<THREE.Mesh>(null);
  const cableRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (jibRef.current) {
      jibRef.current.rotation.y = rotation + Math.sin(state.clock.elapsedTime * 0.2) * 0.3;
    }
    if (hookRef.current) {
      hookRef.current.position.y = -8 + Math.sin(state.clock.elapsedTime * 0.5) * 1.5;
      if (cableRef.current) {
        cableRef.current.scale.y = Math.abs(hookRef.current.position.y) / 2;
        cableRef.current.position.y = hookRef.current.position.y / 2;
      }
    }
  });

  const TOWER_HEIGHT = 20;
  const JIB_LENGTH = 18;
  const COUNTER_JIB_LENGTH = 6;

  return (
    <group position={position}>
      <mesh position={[0, 0.5, 0]} castShadow receiveShadow>
        <boxGeometry args={[4, 1, 4]} />
        <meshStandardMaterial color="#2a2f3a" roughness={0.8} metalness={0.4} />
      </mesh>

      <mesh position={[0, TOWER_HEIGHT / 2 + 1, 0]} castShadow>
        <cylinderGeometry args={[0.4, 0.5, TOWER_HEIGHT, 8]} />
        <meshStandardMaterial color="#f59e0b" roughness={0.6} metalness={0.5} />
      </mesh>

      {Array.from({ length: 8 }).map((_, i) => (
        <mesh key={`brace-${i}`} position={[0, i * 2.5 + 2.5, 0]} rotation={[0, (i * Math.PI) / 4, 0]}>
          <boxGeometry args={[1.2, 0.1, 0.1]} />
          <meshStandardMaterial color="#d97706" metalness={0.6} roughness={0.4} />
        </mesh>
      ))}

      <group ref={jibRef} position={[0, TOWER_HEIGHT + 1, 0]}>
        <mesh position={[JIB_LENGTH / 2 - 1, 0, 0]} castShadow>
          <boxGeometry args={[JIB_LENGTH, 0.6, 0.8]} />
          <meshStandardMaterial color="#f59e0b" roughness={0.5} metalness={0.6} />
        </mesh>

        {Array.from({ length: 6 }).map((_, i) => (
          <mesh key={`jib-truss-top-${i}`} position={[i * 3 + 2, 0.6, 0]} rotation={[0, 0, -0.3]}>
            <boxGeometry args={[3, 0.08, 0.08]} />
            <meshStandardMaterial color="#d97706" />
          </mesh>
        ))}
        {Array.from({ length: 6 }).map((_, i) => (
          <mesh key={`jib-truss-bottom-${i}`} position={[i * 3 + 2, -0.6, 0]} rotation={[0, 0, 0.3]}>
            <boxGeometry args={[3, 0.08, 0.08]} />
            <meshStandardMaterial color="#d97706" />
          </mesh>
        ))}

        <mesh position={[-COUNTER_JIB_LENGTH / 2, 0, 0]} castShadow>
          <boxGeometry args={[COUNTER_JIB_LENGTH, 0.6, 0.8]} />
          <meshStandardMaterial color="#f59e0b" roughness={0.5} metalness={0.6} />
        </mesh>

        <mesh position={[-COUNTER_JIB_LENGTH - 0.5, 0, 0]} castShadow>
          <boxGeometry args={[2, 1.5, 1.5]} />
          <meshStandardMaterial color="#374151" roughness={0.7} metalness={0.5} />
        </mesh>

        <mesh position={[0, 1.5, 0]} castShadow>
          <boxGeometry args={[2, 2, 1.8]} />
          <meshStandardMaterial color="#1f2937" roughness={0.6} metalness={0.4} />
        </mesh>

        <mesh position={[JIB_LENGTH - 1, -0.5, 0]}>
          <cylinderGeometry args={[0.05, 0.05, 0.5, 8]} />
          <meshStandardMaterial color="#6b7280" metalness={0.8} />
        </mesh>

        <group position={[JIB_LENGTH - 1, -0.5, 0]}>
          <mesh ref={cableRef} position={[0, -4, 0]}>
            <cylinderGeometry args={[0.03, 0.03, 8, 6]} />
            <meshStandardMaterial color="#4b5563" metalness={0.9} roughness={0.3} />
          </mesh>

          <mesh ref={hookRef} position={[0, -8, 0]} castShadow>
            <torusGeometry args={[0.3, 0.08, 8, 16, Math.PI]} />
            <meshStandardMaterial color="#9ca3af" metalness={0.9} roughness={0.2} />
          </mesh>
        </group>
      </group>

      <mesh position={[0, TOWER_HEIGHT + 2.5, 0]}>
        <sphereGeometry args={[0.2, 8, 8]} />
        <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={1} />
      </mesh>
    </group>
  );
};

export default Crane;

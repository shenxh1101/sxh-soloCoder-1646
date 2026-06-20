const ProcessingShed = () => {
  const SHED_WIDTH = 10;
  const SHED_DEPTH = 8;
  const SHED_HEIGHT = 5;
  const WALL_THICKNESS = 0.3;
  const ROOF_HEIGHT = 1.5;

  return (
    <group position={[0, 0, -2]}>
      <mesh position={[0, -0.1, 0]} receiveShadow>
        <boxGeometry args={[SHED_WIDTH + 0.5, 0.2, SHED_DEPTH + 0.5]} />
        <meshStandardMaterial color="#1a1d24" roughness={0.9} />
      </mesh>

      <mesh position={[0, -0.05, 0]} receiveShadow>
        <boxGeometry args={[SHED_WIDTH, 0.1, SHED_DEPTH]} />
        <meshStandardMaterial color="#2d2d2d" roughness={0.8} metalness={0.2} />
      </mesh>

      <mesh position={[0, SHED_HEIGHT / 2, -SHED_DEPTH / 2 + WALL_THICKNESS / 2]} castShadow>
        <boxGeometry args={[SHED_WIDTH, SHED_HEIGHT, WALL_THICKNESS]} />
        <meshStandardMaterial color="#4a5568" roughness={0.7} metalness={0.3} />
      </mesh>

      <mesh position={[-SHED_WIDTH / 2 + WALL_THICKNESS / 2, SHED_HEIGHT / 2, 0]} castShadow>
        <boxGeometry args={[WALL_THICKNESS, SHED_HEIGHT, SHED_DEPTH]} />
        <meshStandardMaterial color="#4a5568" roughness={0.7} metalness={0.3} />
      </mesh>

      <mesh position={[SHED_WIDTH / 2 - WALL_THICKNESS / 2, SHED_HEIGHT / 2, 0]} castShadow>
        <boxGeometry args={[WALL_THICKNESS, SHED_HEIGHT, SHED_DEPTH]} />
        <meshStandardMaterial color="#4a5568" roughness={0.7} metalness={0.3} />
      </mesh>

      <mesh position={[0, SHED_HEIGHT + ROOF_HEIGHT / 2, 0]} rotation={[0, 0, 0]} castShadow>
        <boxGeometry args={[SHED_WIDTH + 0.5, WALL_THICKNESS, SHED_DEPTH + 0.5]} />
        <meshStandardMaterial color="#374151" roughness={0.6} metalness={0.4} />
      </mesh>

      <mesh position={[0, SHED_HEIGHT + ROOF_HEIGHT, 0]} rotation={[0, 0, 0]} castShadow>
        <coneGeometry args={[SHED_WIDTH * 0.7, 0.3, 4]} />
        <meshStandardMaterial color="#6b7280" roughness={0.5} metalness={0.5} />
      </mesh>

      {Array.from({ length: 3 }).map((_, i) => (
        <mesh key={`beam-${i}`} position={[-3 + i * 3, SHED_HEIGHT - 0.3, 0]}>
          <boxGeometry args={[0.2, SHED_HEIGHT - 0.5, 0.15]} />
          <meshStandardMaterial color="#9ca3af" metalness={0.8} roughness={0.3} />
        </mesh>
      ))}

      <mesh position={[0, SHED_HEIGHT / 2, -SHED_DEPTH / 2 + WALL_THICKNESS / 2 + 0.01]}
        >
        <planeGeometry args={[2.5, 3]} />
        <meshStandardMaterial
          color="#fbbf24"
          emissive="#fbbf24"
          emissiveIntensity={0.6}
          transparent
          opacity={0.8}
        />
      </mesh>

      <pointLight position={[0, SHED_HEIGHT - 1, -SHED_DEPTH / 4]} intensity={0.8} color="#fbbf24" distance={8} />
    </group>
  );
};

export default ProcessingShed;

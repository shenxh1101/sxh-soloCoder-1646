const ProjectOffice = () => {
  const OFFICE_WIDTH = 6;
  const OFFICE_DEPTH = 4;
  const FLOOR_HEIGHT = 3;
  const WALL_THICKNESS = 0.2;

  return (
    <group position={[-18, 0, 4]}>
      <mesh position={[0, -0.1, 0]} receiveShadow>
        <boxGeometry args={[OFFICE_WIDTH + 0.5, 0.2, OFFICE_DEPTH + 0.5]} />
        <meshStandardMaterial color="#1a1d24" roughness={0.9} />
      </mesh>

      {[0, 1].map((floorIndex) => {
        const yOffset = floorIndex * FLOOR_HEIGHT;
        return (
          <group key={`floor-${floorIndex}`}>
            <mesh position={[0, yOffset + FLOOR_HEIGHT / 2, 0]} castShadow receiveShadow>
              <boxGeometry args={[OFFICE_WIDTH, FLOOR_HEIGHT, OFFICE_DEPTH]} />
              <meshStandardMaterial color="#1e40af" roughness={0.6} metalness={0.4} />
            </mesh>

            <mesh position={[0, yOffset + FLOOR_HEIGHT - 0.05, 0]}>
              <boxGeometry args={[OFFICE_WIDTH + 0.1, 0.1, OFFICE_DEPTH + 0.1]} />
              <meshStandardMaterial color="#374151" roughness={0.7} />
            </mesh>

            {[-1.5, 0, 1.5].map((x, i) => (
              <mesh key={`win-front-${floorIndex}-${i}`} position={[x, yOffset + FLOOR_HEIGHT / 2, OFFICE_DEPTH / 2 + 0.01]}>
                <planeGeometry args={[1, 1.2]} />
                <meshStandardMaterial
                  color="#60a5fa"
                  emissive="#60a5fa"
                  emissiveIntensity={0.3}
                />
              </mesh>
            ))}

            {[-1, 1].map((z, i) => (
              <mesh key={`win-side-${floorIndex}-${i}`} position={[z > 0 ? -OFFICE_WIDTH / 2 - 0.01 : OFFICE_WIDTH / 2 + 0.01, yOffset + FLOOR_HEIGHT / 2, z > 0 ? 0.8 : -0.8]} rotation={[0, z > 0 ? 0 : Math.PI, 0]}>
                <planeGeometry args={[0.8, 1]} />
                <meshStandardMaterial
                  color="#60a5fa"
                  emissive="#60a5fa"
                  emissiveIntensity={0.3}
                />
              </mesh>
              ))}
            </group>
        );
      })}

      <mesh position={[0, FLOOR_HEIGHT + 0.1, 0]} castShadow>
        <boxGeometry args={[OFFICE_WIDTH + 0.3, 0.2, OFFICE_DEPTH + 0.3]} />
        <meshStandardMaterial color="#1e3a8a" roughness={0.5} metalness={0.5} />
      </mesh>

      <mesh position={[0, FLOOR_HEIGHT * 2 + 0.3, 0]} castShadow>
        <boxGeometry args={[OFFICE_WIDTH * 0.4, 0.4, OFFICE_DEPTH * 0.4]} />
        <meshStandardMaterial color="#374151" roughness={0.6} metalness={0.4} />
      </mesh>

      <mesh position={[0, FLOOR_HEIGHT + 0.8, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 1.2, 8]} />
        <meshStandardMaterial color="#6b7280" metalness={0.8} />
      </mesh>

      <mesh position={[0, FLOOR_HEIGHT + 1.5, 0.2]}>
        <planeGeometry args={[0.8, 0.5]} />
        <meshStandardMaterial color="#dc2626" emissive="#dc2626" emissiveIntensity={0.5} />
      </mesh>

      <mesh position={[-OFFICE_WIDTH / 2 + 0.5, FLOOR_HEIGHT / 2, -OFFICE_DEPTH / 2 + 0.01]}>
        <planeGeometry args={[1, 2]} />
        <meshStandardMaterial color="#1e3a5f" />
      </mesh>

      <mesh position={[-OFFICE_WIDTH / 2 + 0.5, FLOOR_HEIGHT / 2, -OFFICE_DEPTH / 2 + 0.02]}>
        <planeGeometry args={[0.8, 1.8]} />
        <meshStandardMaterial
          color="#fbbf24"
          emissive="#fbbf24"
          emissiveIntensity={0.2}
        />
      </mesh>

      <pointLight position={[0, FLOOR_HEIGHT / 2, OFFICE_DEPTH / 2 + 0.5]} intensity={0.5} color="#60a5fa" distance={6} />
    </group>
  );
};

export default ProjectOffice;

import { Grid } from '@react-three/drei';

const Ground = () => {
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow position={[0, 0, 0]}>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial
          color="#0d1525"
          roughness={0.9}
          metalness={0.1}
        />
      </mesh>

      <Grid
        position={[0, 0.01, 0]}
        args={[100, 100]}
        cellSize={2}
        cellThickness={0.5}
        cellColor="#1e3a5f"
        sectionSize={10}
        sectionThickness={1}
        sectionColor="#2a5080"
        fadeDistance={80}
        fadeStrength={1}
        followCamera={false}
        infiniteGrid
      />

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 0]}>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial
          color="#0d1525"
          transparent
          opacity={0.3}
          roughness={1}
        />
      </mesh>
    </group>
  );
};

export default Ground;

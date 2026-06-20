import { Text } from '@react-three/drei';

const FLOORS = 4;
const FLOOR_HEIGHT = 3;
const BUILDING_WIDTH = 8;
const BUILDING_DEPTH = 6;

const Building = () => {
  const renderWindows = (floorIndex: number) => {
    const windows = [];
    const windowWidth = 0.8;
    const windowHeight = 1.2;
    const yPos = floorIndex * FLOOR_HEIGHT + FLOOR_HEIGHT / 2;

    for (let i = -2; i <= 2; i++) {
      const isLit = Math.random() > 0.4;
      windows.push(
        <mesh key={`front-${floorIndex}-${i}`} position={[i * 1.5, yPos, BUILDING_DEPTH / 2 + 0.01]}>
          <planeGeometry args={[windowWidth, windowHeight]} />
          <meshStandardMaterial
            color={isLit ? '#ffd966' : '#1a1a2e'}
            emissive={isLit ? '#ffd966' : '#000000'}
            emissiveIntensity={isLit ? 0.5 : 0}
          />
        </mesh>
      );
    }

    for (let i = -1; i <= 1; i++) {
      const isLit = Math.random() > 0.5;
      windows.push(
        <mesh key={`back-${floorIndex}-${i}`} position={[i * 2, yPos, -BUILDING_DEPTH / 2 - 0.01]} rotation={[0, Math.PI, 0]}>
          <planeGeometry args={[windowWidth, windowHeight]} />
          <meshStandardMaterial
            color={isLit ? '#ffd966' : '#1a1a2e'}
            emissive={isLit ? '#ffd966' : '#000000'}
            emissiveIntensity={isLit ? 0.5 : 0}
          />
        </mesh>
      );
    }

    return windows;
  };

  const renderFloors = () => {
    const floors = [];
    for (let i = 0; i < FLOORS; i++) {
      floors.push(
        <group key={`floor-${i}`}>
          <mesh
            position={[0, i * FLOOR_HEIGHT + FLOOR_HEIGHT / 2, 0]}
            castShadow
            receiveShadow
          >
            <boxGeometry args={[BUILDING_WIDTH, FLOOR_HEIGHT - 0.1, BUILDING_DEPTH]} />
            <meshStandardMaterial color="#3a3f4b" roughness={0.7} metalness={0.3} />
          </mesh>

          <mesh position={[0, i * FLOOR_HEIGHT + FLOOR_HEIGHT - 0.05, 0]}>
            <boxGeometry args={[BUILDING_WIDTH + 0.1, 0.1, BUILDING_DEPTH + 0.1]} />
            <meshStandardMaterial color="#252a33" roughness={0.8} metalness={0.2} />
          </mesh>

          {renderWindows(i)}

          <Text
            position={[BUILDING_WIDTH / 2 + 0.6, i * FLOOR_HEIGHT + FLOOR_HEIGHT / 2, 0]}
            rotation={[0, -Math.PI / 2, 0]}
            fontSize={0.6}
            color="#8899aa"
            anchorX="center"
            anchorY="middle"
          >
            {`F${i + 1}`}
          </Text>
        </group>
      );
    }
    return floors;
  };

  return (
    <group position={[18, 0, 6]}>
      <mesh position={[0, -0.1, 0]} receiveShadow>
        <boxGeometry args={[BUILDING_WIDTH + 1, 0.2, BUILDING_DEPTH + 1]} />
        <meshStandardMaterial color="#1a1d24" roughness={0.9} />
      </mesh>

      {renderFloors()}

      <mesh position={[0, FLOORS * FLOOR_HEIGHT + 0.3, 0]} castShadow>
        <boxGeometry args={[BUILDING_WIDTH + 0.5, 0.6, BUILDING_DEPTH + 0.5]} />
        <meshStandardMaterial color="#2a2f3a" roughness={0.6} metalness={0.4} />
      </mesh>

      <mesh position={[0, FLOORS * FLOOR_HEIGHT + 0.7, 0]} castShadow>
        <boxGeometry args={[1.5, 0.2, 1.5]} />
        <meshStandardMaterial color="#8b0000" emissive="#8b0000" emissiveIntensity={0.3} />
      </mesh>
    </group>
  );
};

export default Building;

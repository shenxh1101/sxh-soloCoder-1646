import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars, Html } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import { ReactNode, Suspense } from 'react';
import * as THREE from 'three';
import { useAppStore } from '@/store/useAppStore';
import Ground from './Ground';
import Building from './Building';
import ProcessingShed from './ProcessingShed';
import ProjectOffice from './ProjectOffice';
import MaterialStack from './MaterialStack';
import Crane from './Crane';
import CranePath from './CranePath';

interface Scene3dProps {
  children?: ReactNode;
}

function ZoneLabel({ position, text, color = '#00B3FF' }: { position: [number, number, number]; text: string; color?: string }) {
  return (
    <Html position={position} center style={{ pointerEvents: 'none' }}>
      <div
        className="px-3 py-1 rounded text-xs font-mono whitespace-nowrap"
        style={{
          background: 'rgba(10, 22, 40, 0.85)',
          border: `1px solid ${color}50`,
          color: color,
          boxShadow: `0 0 10px ${color}30`,
          textShadow: `0 0 8px ${color}80`,
        }}
      >
        {text}
      </div>
    </Html>
  );
}

function SceneContent() {
  const materials = useAppStore(s => s.materials);
  const craneTasks = useAppStore(s => s.craneTasks);
  const selectedMaterialId = useAppStore(s => s.selectedMaterialId);
  const selectMaterial = useAppStore(s => s.selectMaterial);
  const setActivePanel = useAppStore(s => s.setActivePanel);

  const activePaths = craneTasks.filter(t => t.status === 'executing' || t.status === 'queued');

  return (
    <>
      <Ground />
      <Building />
      <ProcessingShed />
      <ProjectOffice />

      <Crane position={[0, 0, 4]} rotation={0} />
      <Crane position={[-8, 0, 4]} rotation={Math.PI / 4} />

      {materials.map((m) => (
        <group key={m.id}>
          <MaterialStack
            position={[m.position.x, m.position.y + 0.75, m.position.z]}
            status={m.qualityStatus}
            size={[2.5, 1.5, 2.5]}
            isSelected={selectedMaterialId === m.id}
            onClick={() => {
              selectMaterial(m.id);
              setActivePanel(null);
            }}
          />
          <Html
            position={[m.position.x, m.position.y + 2.8, m.position.z]}
            center
            style={{ pointerEvents: 'none' }}
          >
            <div
              className="px-2 py-0.5 rounded text-[10px] font-mono whitespace-nowrap"
              style={{
                background: 'rgba(10, 22, 40, 0.9)',
                border: `1px solid ${
                  m.qualityStatus === 'green' ? '#00C48C' :
                  m.qualityStatus === 'yellow' ? '#FFB020' : '#FF4757'
                }50`,
                color: m.qualityStatus === 'green' ? '#00C48C' :
                       m.qualityStatus === 'yellow' ? '#FFB020' : '#FF4757',
              }}
            >
              {m.name} · {m.stock}{m.unit}
              {m.isLocked && ' 🔒'}
            </div>
          </Html>
        </group>
      ))}

      {activePaths.map((task) => (
        <CranePath
          key={task.id}
          points={task.path.map(p => [p.x, p.y, p.z] as [number, number, number])}
        />
      ))}

      <ZoneLabel position={[-6, 0.2, -12]} text="材料堆放区 MATERIAL YARD" color="#00B3FF" />
      <ZoneLabel position={[0, 0.2, -6]} text="加工棚 PROCESSING SHED" color="#FFB020" />
      <ZoneLabel position={[18, 0.2, 12]} text="楼层作业面 BUILDING" color="#00C48C" />
      <ZoneLabel position={[-18, 0.2, 8]} text="项目部 PROJECT OFFICE" color="#FF6B35" />
    </>
  );
}

const Scene3d = ({ children }: Scene3dProps) => {
  return (
    <Canvas
      shadows
      camera={{ position: [35, 28, 35], fov: 50 }}
      gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping }}
      style={{ background: '#0a0e1a', width: '100%', height: '100%' }}
    >
      <fog attach="fog" args={['#0a0e1a', 45, 130]} />
      <color attach="background" args={['#0a0e1a']} />

      <ambientLight intensity={0.35} />
      <directionalLight
        position={[20, 35, 15]}
        intensity={0.7}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={120}
        shadow-camera-left={-60}
        shadow-camera-right={60}
        shadow-camera-top={60}
        shadow-camera-bottom={-60}
      />
      <pointLight position={[-15, 12, -10]} intensity={0.5} color="#4a7fff" distance={50} />
      <pointLight position={[15, 10, 10]} intensity={0.4} color="#ff884a" distance={40} />
      <pointLight position={[0, 22, 4]} intensity={0.3} color="#ffaa00" distance={35} />

      <Stars radius={150} depth={60} count={3000} factor={4} saturation={0} fade speed={0.5} />

      <Suspense fallback={null}>
        <SceneContent />
      </Suspense>

      {children}

      <OrbitControls
        enablePan
        enableZoom
        enableRotate
        minDistance={12}
        maxDistance={90}
        maxPolarAngle={Math.PI / 2.1}
        target={[0, 3, 0]}
        enableDamping
        dampingFactor={0.05}
      />

      <EffectComposer>
        <Bloom
          intensity={0.7}
          luminanceThreshold={0.15}
          luminanceSmoothing={0.9}
          mipmapBlur
        />
      </EffectComposer>
    </Canvas>
  );
};

export default Scene3d;

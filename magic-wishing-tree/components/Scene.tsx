
import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment, Float } from '@react-three/drei';
import { Bloom, EffectComposer, Noise, Vignette } from '@react-three/postprocessing';
import ChristmasTree from './ChristmasTree';
import { TreeState } from '../types';
import { THEME } from '../constants';

interface SceneProps {
  treeState: TreeState;
  rotationY: number;
}

const Scene: React.FC<SceneProps> = ({ treeState, rotationY }) => {
  return (
    <Canvas shadows dpr={[1, 2]}>
      <PerspectiveCamera makeDefault position={[0, 0, 15]} fov={45} />
      <OrbitControls 
        enablePan={false} 
        enableZoom={true} 
        maxDistance={25} 
        minDistance={5} 
        autoRotate={treeState === TreeState.EXPLODE}
        autoRotateSpeed={0.5}
      />

      <color attach="background" args={[THEME.bg]} />
      
      <ambientLight intensity={0.2} />
      <pointLight position={[10, 10, 10]} intensity={3} color="#10B981" />
      <pointLight position={[-10, -10, -10]} intensity={1.5} color="#A7F3D0" />
      <spotLight 
        position={[0, 10, 0]} 
        intensity={6} 
        angle={0.4} 
        penumbra={1} 
        color="#ffffff" 
        castShadow 
      />

      <Suspense fallback={null}>
        <Environment preset="forest" />
        <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
          <ChristmasTree state={treeState} rotationY={rotationY} />
        </Float>
      </Suspense>

      <EffectComposer disableNormalPass>
        <Bloom 
          luminanceThreshold={0.2} 
          mipmapBlur 
          intensity={2.0} 
          radius={0.5} 
        />
        <Noise opacity={0.06} />
        <Vignette eskil={false} offset={0.1} darkness={1.2} />
      </EffectComposer>
    </Canvas>
  );
};

export default Scene;

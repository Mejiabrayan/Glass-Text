import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Canvas } from '@react-three/fiber';
import {
  Text3D,
  Center,
  MeshTransmissionMaterial,
  Float,
  Environment,
  Preload,
  OrbitControls,
  PositionalAudio,
} from '@react-three/drei';
import { CenterProps } from '@react-three/drei/core/Center';
// Optimize transmission config
interface TransmissionConfig {
  backside: boolean;
  backsideThickness: number;
  transmission: number;
  thickness: number;
  chromaticAbberation: number;
  ior: number;
  color?: string;
  samples?: number;
  resolution?: number;
  distortion?: number;
  distortionScale?: number;
  temporalDistortion?: number;
}

interface TextProps extends Partial<CenterProps> {
  children: string;
  config: TransmissionConfig;
  font?: string;
  position?: [number, number, number];
  scale?: number | [number, number, number];
  audioReady: boolean;
}

export default function GlassText(): JSX.Element {
  const audioInitialized = useRef(false);
  const [audioReady, setAudioReady] = useState(false);

  useEffect(() => {
    const handleInteraction = () => {
      if (!audioInitialized.current) {
        audioInitialized.current = true;
        setAudioReady(true);
      }
    };

    window.addEventListener('click', handleInteraction, { once: true });
    window.addEventListener('touchstart', handleInteraction, { once: true });

    return () => {
      window.removeEventListener('click', handleInteraction);
      window.removeEventListener('touchstart', handleInteraction);
    };
  }, []);

  return (
    <div className='text-body'>
      <motion.div
        className='framer'
        initial={{ position: 'absolute', top: '0%' }}
        animate={{ position: 'absolute', top: '-110' }}
        exit={{ position: 'absolute', top: '0%' }}
        transition={{ duration: 0.5 }}
      >
        <div className='transition' />
      </motion.div>

      <div className='absolute inset-0 w-full h-full'>
        <CanvasScene audioReady={audioReady} />
      </div>
    </div>
  );
}

function CanvasScene({ audioReady }: { audioReady: boolean }): JSX.Element {
  const isMobile = window.innerWidth < 768;
  
  const config: TransmissionConfig = {
    backside: true,
    backsideThickness: 0.2,
    transmission: 1,
    thickness: 0.2,
    chromaticAbberation: isMobile ? 1 : 3,
    ior: 1.5,
    samples: isMobile ? 32 : 16,
    resolution: isMobile ? 1024 : 512,
    distortion: isMobile ? 0.2 : 0.4,
    distortionScale: isMobile ? 0.2 : 0.4,
    temporalDistortion: 0.1,
    color: '#137dff',
  };

  return (
    <Canvas
      camera={{ 
        position: [0, 0, isMobile ? 14 : 12],
        fov: isMobile ? 45 : 50
      }}
      dpr={[1, isMobile ? 3 : 2]}
      performance={{ 
        min: 0.5,
        max: 1 
      }}
      gl={{
        powerPreference: 'high-performance',
        antialias: true,
        stencil: false,
        depth: true,
        alpha: true,
      }}
    >
      <Float 
        speed={1}
        rotationIntensity={0.5}
        floatIntensity={0.5}
      >
        <Text 
          config={config} 
          position={[0, isMobile ? -1 : -1.5, 0]}
          scale={isMobile ? 0.8 : 1}
          audioReady={audioReady}
        >
          Intelligence
        </Text>
      </Float>

      <Environment preset='studio' />
      <ambientLight intensity={0.5} />
      <directionalLight 
        position={[10, 10, 5]} 
        intensity={1}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />

      <OrbitControls
        enablePan={!isMobile}
        enableZoom={!isMobile}
        minPolarAngle={Math.PI / 2.5}
        maxPolarAngle={Math.PI / 1.5}
        rotateSpeed={isMobile ? 0.3 : 0.5}
        dampingFactor={0.05}
        enableDamping
        makeDefault
      />
      <Preload all />
    </Canvas>
  );
}

function Text({
  children,
  config,
  font = 'https://threejs.org/examples/fonts/helvetiker_regular.typeface.json',
  scale,
  audioReady,
  ...props
}: TextProps): JSX.Element {
  const isMobile = window.innerWidth < 768;

  return (
    <group>
      <Center scale={scale ?? [0.8, 1, 1]} front top {...props}>
        <Text3D
          font={font}
          scale={3}
          letterSpacing={0.12}
          height={0.25}
          bevelEnabled
          bevelSize={0.02}
          bevelSegments={isMobile ? 16 : 10}
          curveSegments={isMobile ? 128 : 64}
          bevelThickness={0.01}
        >
          {children}
          <MeshTransmissionMaterial 
            {...config}
            transmissionSampler
            backside={true}
            samples={isMobile ? 32 : 16}
            resolution={isMobile ? 1024 : 512}
            transmission={1}
            clearcoat={0.1}
            clearcoatRoughness={0.1}
            thickness={0.2}
            chromaticAberration={isMobile ? 1 : 3}
            anisotropy={isMobile ? 1 : 0.3}
            roughness={0.1}
            metalness={0.1}
          />
        </Text3D>
        {audioReady && (
          <PositionalAudio 
            url="/constellation.mp3"
            distance={10}
            loop
            autoplay
            
          />
        )}
      </Center>
    </group>
  );
}

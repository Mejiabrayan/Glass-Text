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
}

function CanvasScene(): JSX.Element {
  const config: TransmissionConfig = {
    backside: true,
    backsideThickness: 0.2,
    transmission: 1,
    thickness: 0.2,
    chromaticAbberation: 3,
    ior: 1.5,
    samples: 16,
    resolution: 512,
    distortion: 0.4,
    distortionScale: 0.4,
    temporalDistortion: 0.1,
    color: '#137dff',
  };

  return (
    <Canvas
      camera={{ position: [0, 0, 12] }}
      dpr={Math.min(2, window.devicePixelRatio)}
      performance={{ min: 0.5 }}
      gl={{
        powerPreference: 'high-performance',
        antialias: true,
        stencil: false,
        depth: true,
      }}
    >
      <Float>
        <Text config={config} position={[0, -1.5, 0]}>
          Intelligence
        </Text>
        <PositionalAudio 
          url="/constellation.mp3"
          distance={10}
          loop
          autoplay
        />
      </Float>

      <Environment preset='studio' blur={1} />
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />

      <OrbitControls
        enablePan={true}
        enableZoom={true}
        minPolarAngle={Math.PI / 2.5}
        maxPolarAngle={Math.PI / 1.5}
        rotateSpeed={0.5}
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
  ...props
}: TextProps): JSX.Element {
  return (
    <group>
      <Center scale={[0.8, 1, 1]} front top {...props}>
        <Text3D
          font={font}
          scale={3}
          letterSpacing={0.12}
          height={0.25}
          bevelEnabled
          bevelSize={0.02}
          bevelSegments={10}
          curveSegments={64}
          bevelThickness={0.01}
        >
          {children}
          <MeshTransmissionMaterial {...config} />
        </Text3D>
        <PositionalAudio 
          url="/constellation.mp3"
          distance={1}
          loop
          autoplay
        />
      </Center>
    </group>
  );
}

export default function GlassText(): JSX.Element {
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
        <CanvasScene />
      </div>
    </div>
  );
}

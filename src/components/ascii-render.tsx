import { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { AsciiRenderer, OrbitControls, PositionalAudio } from '@react-three/drei';
import { Mesh } from 'three';

type TorusKnotProps = React.ComponentProps<'mesh'>;
export default function ASCIIRender() {
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
    <Canvas>
      <color attach='background' args={['black']} />
      <pointLight position={[-10, -10, -10]} intensity={0.5} />
      <spotLight 
        position={[10, 10, 20]} 
        angle={0.3} 
        penumbra={1} 
        intensity={2}
        castShadow
        shadow-mapSize={[512, 512]}
      />
      <Torusknot />
      {audioReady && (
        <PositionalAudio
        url="/constellation.mp3"
        distance={10}
        loop
        autoplay
        />
      )}
      <AsciiRenderer fgColor='white' bgColor='' characters=' .,:;=+*#@$%' />
      <OrbitControls enableZoom={true} />
    </Canvas>
  );
}

function Torusknot(props: TorusKnotProps) {
  const ref = useRef<Mesh>(null!);
  const viewport = useThree((state) => state.viewport);

  useFrame((_, delta) => {
    ref.current.rotation.x += delta * 0.5;
    ref.current.rotation.y += delta * 0.7;
  });

  return (
    <>
      <mesh
        scale={Math.min(viewport.width, viewport.height) / 5}
        {...props}
        ref={ref}
        castShadow
        receiveShadow
      >
        <torusKnotGeometry args={[1, 0.4, 256, 64]} />
        <meshPhysicalMaterial 
         
          color='white' 
          roughness={1} 
          metalness={115} 
          reflectivity={.08}
          clearcoat={1}
          clearcoatRoughness={0.1}
        />
      </mesh>
    </>
  );
}

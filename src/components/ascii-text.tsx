import { useRef } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { AsciiRenderer, Text3D, Center, OrbitControls, Float } from '@react-three/drei';
import { Mesh } from 'three';

type ASCIIProps = {
  text?: string;
};

export default function ASCIIText({ text = 'Xaciel' }: ASCIIProps) {
  return (
    <Canvas>
      <color attach='background' args={['black']} />
      <pointLight position={[-10, -10, -10]} intensity={0.5} />
      <spotLight position={[20, 10, 10]} angle={0.15} penumbra={1} />
      <Text text={text} />
      <AsciiRenderer
        fgColor='white'
        bgColor='transparent'
        characters=' .,:;=+*#@$%'
      />
      <OrbitControls enableZoom={true} />
    </Canvas>
  );
}

function Text({ text }: ASCIIProps) {
  const ref = useRef<Mesh>(null!);
  const viewport = useThree((state) => state.viewport);

  return (
    <Center>
      <Float
        speed={1.5} // Animation speed
        rotationIntensity={0.5} // XYZ rotation intensity
        floatIntensity={0.5} // Up/down float intensity
        floatingRange={[0, 0.5]} // Range of y-axis values the object will float within
      >
        <mesh ref={ref} scale={Math.min(viewport.width, viewport.height) / 5}>
          <Text3D
            font='https://threejs.org/examples/fonts/helvetiker_regular.typeface.json'
            size={1}
            height={0.2}
            curveSegments={12}
            bevelEnabled
            bevelThickness={0.02}
            bevelSize={0.02}
            bevelOffset={0}
            bevelSegments={5}
          >
            {text}
            <meshStandardMaterial color='white' roughness={1} metalness={200} />
          </Text3D>
        </mesh>
      </Float>
    </Center>
  );
}

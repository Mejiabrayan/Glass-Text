import { Canvas, extend, useFrame } from '@react-three/fiber';
import {
  OrbitControls,
  Center,
  shaderMaterial,
  Text3D,
} from '@react-three/drei';
import { useRef, Suspense } from 'react';
import * as THREE from 'three';
import { Mesh, ShaderMaterial } from 'three';
import { MaterialNode } from '@react-three/fiber';

type ColorShiftMaterialImpl = ShaderMaterial & {
  time: number;
  color: THREE.Color;
};

type GridMaterialImpl = ShaderMaterial & {
  time: number;
  resolution: THREE.Vector2;
};

const ColorShiftMaterial = shaderMaterial(
  {
    time: 0,
    color: new THREE.Color(0.05, 0.2, 0.1), // Darker base color
  },
  // vertex shader with better normal handling
  `
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vViewPosition;
  varying vec3 vWorldPosition;
  varying vec3 vReflect;
  
  void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);
    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
    vWorldPosition = worldPosition.xyz;
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    vViewPosition = -mvPosition.xyz;
    
    // Calculate reflection vector
    vec3 cameraToVertex = normalize(worldPosition.xyz - cameraPosition);
    vReflect = reflect(cameraToVertex, normalize((modelMatrix * vec4(normal, 0.0)).xyz));
    
    gl_Position = projectionMatrix * mvPosition;
  }
`,
  // Enhanced fragment shader with stronger reflections
  `
  uniform float time;
  uniform vec3 color;
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vViewPosition;
  varying vec3 vWorldPosition;
  varying vec3 vReflect;
  
  void main() {
    vec3 normal = normalize(vNormal);
    vec3 viewDir = normalize(vViewPosition);
    
    // Enhanced Fresnel effect
    float fresnel = pow(1.0 - max(dot(normal, viewDir), 0.0), 4.0);
    
    // Darker base color
    vec3 baseColor = vec3(0.05, 0.2, 0.1);
    
    // Multiple light reflections for enhanced glass effect
    vec3 lightPos1 = normalize(vec3(1.0, 2.0, 1.0));
    vec3 lightPos2 = normalize(vec3(-1.0, 1.0, -1.0));
    vec3 lightPos3 = normalize(vec3(0.0, -1.0, 1.0));
    
    // Sharper and brighter highlights
    float highlight1 = pow(max(dot(normal, lightPos1), 0.0), 64.0) * 1.5;
    float highlight2 = pow(max(dot(normal, lightPos2), 0.0), 64.0) * 1.2;
    float highlight3 = pow(max(dot(normal, lightPos3), 0.0), 64.0) * 1.0;
    
    // Enhanced environment reflection
    float envRefl = pow(max(dot(normal, vec3(0.0, 1.0, 0.0)), 0.0), 1.0) * 0.6;
    
    // Stronger reflection based on view angle
    vec3 reflection = normalize(vReflect);
    float reflectionIntensity = pow(max(dot(reflection, normal), 0.0), 3.0);
    
    // Combine all effects with stronger reflection
    vec3 finalColor = mix(baseColor, vec3(1.0), fresnel * 0.9);
    finalColor = mix(finalColor, vec3(1.0), highlight1 + highlight2 + highlight3);
    finalColor += vec3(1.0) * envRefl;
    
    // Add stronger reflection
    finalColor += vec3(0.9, 0.95, 1.0) * reflectionIntensity * 0.6;
    
    // Enhanced depth-based darkening
    float depth = vViewPosition.z * 0.15;
    finalColor *= (1.0 - depth);
    
    // More pronounced time-based variation
    float timeVar = sin(time * 0.5 + vWorldPosition.x + reflection.y) * 0.15 + 0.85;
    finalColor *= timeVar;
    
    // Higher opacity for better visibility
    gl_FragColor = vec4(finalColor, 0.9);
  }
`
);

const GridMaterial = shaderMaterial(
  {
    time: 0,
    resolution: new THREE.Vector2(),
  },
  // vertex shader
  `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`,
  // Updated fragment shader for more defined grid cells
  `
  uniform vec2 resolution;
  varying vec2 vUv;
  
  float grid(vec2 st, float res) {
    vec2 grid = abs(fract(st * res - 0.5) - 0.5) / fwidth(st * res);
    float line = min(grid.x, grid.y);
    return 1.0 - min(line, 1.0);
  }
  
  void main() {
    // Main grid - larger squares
    float mainGrid = grid(vUv, 8.0) * 0.12; // Increased opacity
    // Smaller grid - subdivisions
    float subGrid = grid(vUv, 80.0) * 0.06; // Increased opacity for subgrid
    
    vec3 color = vec3(1.0);
    vec3 gridColor = vec3(0.05, 0.2, 0.1); // Darker grid color
    
    color = mix(color, gridColor, mainGrid + subGrid);
    
    gl_FragColor = vec4(color, 1.0);
  }
`
);

extend({ ColorShiftMaterial, GridMaterial });

// Declare custom elements for TypeScript
declare module '@react-three/fiber' {
  interface ThreeElements {
    colorShiftMaterial: MaterialNode<
      ColorShiftMaterialImpl,
      typeof ColorShiftMaterial
    >;
    gridMaterial: MaterialNode<GridMaterialImpl, typeof GridMaterial>;
  }
}

function ShaderText() {
  const meshRef = useRef<Mesh>(null);
  const materialRef = useRef<ColorShiftMaterialImpl>(null);

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.time = state.clock.getElapsedTime();
    }
    if (meshRef.current) {
      meshRef.current.rotation.y =
        Math.sin(state.clock.getElapsedTime() * 0.5) * 0.2;
    }
  });

  return (
    <Center>
      <mesh ref={meshRef} castShadow receiveShadow position={[0, 3.5, 0]}>
        <Text3D
          font='https://threejs.org/examples/fonts/helvetiker_regular.typeface.json'
          size={1.5}
          height={0.4}
          curveSegments={64}
          bevelEnabled
          bevelThickness={0.06}
          bevelSize={0.04}
          bevelOffset={0}
          bevelSegments={160}
        >
          Xaciel
          <colorShiftMaterial
            ref={materialRef}
            attach='material'
            color='#fff'
            transparent
          />
        </Text3D>
      </mesh>
    </Center>
  );
}

function Background() {
  const materialRef = useRef<GridMaterialImpl>(null);

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.resolution.set(state.size.width, state.size.height);
    }
  });

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.8, 0]} receiveShadow>
      <planeGeometry args={[50, 50]} />
      <gridMaterial ref={materialRef} />
    </mesh>
  );
}

export default function Scene() {
  return (
    <div className='w-full h-screen'>
      <Canvas shadows camera={{ position: [0, 0, 9], fov: 50 }}>
        <Background />
        <ambientLight intensity={0.5} />
        <directionalLight
          position={[5, 5, 5]}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-bias={-0.001}
        />
        <Suspense fallback={null}>
          <ShaderText />
        </Suspense>
        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, -0.75, 0]}
          receiveShadow
        >
          <planeGeometry args={[50, 50]} />
          <shadowMaterial opacity={0.8} transparent />
        </mesh>
        <OrbitControls enableZoom={false} />
      </Canvas>
    </div>
  );
}

import { Canvas, useFrame } from "@react-three/fiber"
import { Text3D, OrbitControls, Grid, Environment } from "@react-three/drei"
import * as THREE from 'three'
import { useMemo, useRef } from "react"

const GradientGlossyMaterial = () => {
  const materialRef = useRef<THREE.ShaderMaterial>(null)
  const uniforms = useMemo(
    () => ({
      uColor1: { value: new THREE.Color("#0070F3") },
      uColor2: { value: new THREE.Color("#00A6ED") },
      uTime: { value: 0 },
    }),
    []
  )

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime
    }
  })

  return (
    <shaderMaterial
      ref={materialRef}
      uniforms={uniforms}
      vertexShader={`
        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vViewPosition;
        void main() {
          vUv = uv;
          vNormal = normalize(normalMatrix * normal);
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          vViewPosition = -mvPosition.xyz;
          gl_Position = projectionMatrix * mvPosition;
        }
      `}
      fragmentShader={`
        uniform vec3 uColor1;
        uniform vec3 uColor2;
        uniform float uTime;
        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vViewPosition;

        void main() {
          vec3 color = mix(uColor1, uColor2, vUv.y);
          
          // Add some movement to the gradient
          float movement = sin(vUv.y * 10.0 + uTime) * 0.1;
          color = mix(color, uColor2, movement);

          // Basic lighting
          vec3 normal = normalize(vNormal);
          vec3 viewDir = normalize(vViewPosition);
          float diffuse = max(dot(normal, vec3(1.0)), 0.1);
          
          // Specular highlight
          vec3 reflectDir = reflect(-vec3(1.0), normal);
          float specular = pow(max(dot(viewDir, reflectDir), 0.0), 32.0);

          // Fresnel effect for extra shine on edges
          float fresnel = pow(1.0 - max(dot(normal, viewDir), 0.0), 3.0);

          // Combine all lighting effects
          vec3 finalColor = color * (diffuse + 0.3) + vec3(1.0) * specular * 0.5 + vec3(1.0) * fresnel * 0.3;

          gl_FragColor = vec4(finalColor, 1.0);
        }
      `}
    />
  )
}

export default function GlossyText() {
  return (
    <div className="w-full h-screen bg-gray-100">
      <Canvas camera={{ position: [5, 2, 10], fov: 45 }}>
        <color attach="background" args={["#f8f8f8"]} />
        
        {/* Lighting */}
        <Environment preset="sunset" />
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        
        {/* 3D Text */}
        <Text3D
          font="https://threejs.org/examples/fonts/helvetiker_regular.typeface.json"
          size={1.5}
          height={0.2}
          curveSegments={32}
          bevelEnabled
          bevelThickness={0.02}
          bevelSize={0.02}
          bevelOffset={0}
          bevelSegments={5}
          position={[-2.5, 0, 0]}
        >
          Xaciel
          <GradientGlossyMaterial />
        </Text3D>

        {/* Grid */}
        <Grid
          args={[100, 100]}
          position={[0, -2, 0]}
          cellSize={1}
          cellThickness={0.5}
          cellColor="#a0a0a0"
          sectionSize={3}
          sectionThickness={1}
          sectionColor="#808080"
          fadeDistance={50}
          fadeStrength={1}
          followCamera={false}
          infiniteGrid={true}
        />

        {/* Controls */}
        <OrbitControls
          enableZoom={true}
          enablePan={true}
          enableRotate={true}
          minPolarAngle={Math.PI / 4}
          maxPolarAngle={Math.PI / 2}
        />
      </Canvas>
    </div>
  )
}

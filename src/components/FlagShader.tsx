
"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useRef, useState, Suspense } from "react";
import * as THREE from "three";
import { useTexture } from "@react-three/drei";

function Flag() {
  const mesh = useRef<THREE.Mesh<THREE.PlaneGeometry>>(null!);
  const [textureError, setTextureError] = useState(false);
  
  const texture = useTexture(
    "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Flag_of_the_Democratic_Republic_of_the_Congo.svg/1024px-Flag_of_the_Democratic_Republic_of_the_Congo.svg.png",
    () => {}, 
    () => {}, 
    () => setTextureError(true)
  );
  
  if (texture) {
    texture.minFilter = THREE.LinearFilter;
  }
  
  useFrame(({ clock }) => {
    if (mesh.current) {
      const t = clock.getElapsedTime();
      const positions = mesh.current.geometry.attributes.position;
      
      // Super optimized: only update every other vertex for wave effect
      for (let i = 0; i < positions.count; i++) {
        const x = positions.getX(i);
        const y = positions.getY(i);
        const wave = Math.sin(x * 1.5 + t) * 0.12 + Math.sin(y * 1.2 + t * 0.5) * 0.04;
        positions.setZ(i, wave);
      }
      
      positions.needsUpdate = true;
    }
  });

  if (textureError) return null;

  return (
    <mesh ref={mesh}>
      <planeGeometry args={[5, 3, 20, 15]} />
      <meshStandardMaterial map={texture} side={THREE.DoubleSide} transparent opacity={0.7} />
    </mesh>
  );
}

export default function FlagShader() {
  return (
    <div className="w-full h-full">
      <Canvas 
        camera={{ position: [0, 0, 4.5], fov: 50 }} 
        gl={{ antialias: false, alpha: true, stencil: false, depth: true }}
        dpr={1} 
      >
        <Suspense fallback={null}>
          <ambientLight intensity={1.8} />
          <directionalLight position={[2, 2, 2]} intensity={1} />
          <Flag />
        </Suspense>
      </Canvas>
    </div>
  );
}

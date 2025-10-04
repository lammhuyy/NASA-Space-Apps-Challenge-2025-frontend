"use client";

import React, { useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Sphere } from "@react-three/drei";
import { useRouter } from "next/navigation";
import * as THREE from "three";

// -------------------
// Earth (center object)
// -------------------
function Earth({ onClick }: { onClick?: () => void }) {
  const textureLoader = new THREE.TextureLoader();
  const earthTexture = textureLoader.load(
    "https://threejs.org/examples/textures/land_ocean_ice_cloud_2048.jpg"
  );

  return (
    <Sphere args={[0.2, 64, 64]} onClick={onClick}>
      <meshStandardMaterial map={earthTexture} />
    </Sphere>
  );
}

// -------------------
// Host Stars (Kepler systems)
// -------------------
function HostStars({ count = 2000 }) {
  const router = useRouter();
  
  const stars = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      const r = THREE.MathUtils.randFloat(10, 150); // distance from center
      const theta = Math.random() * 2 * Math.PI;
      const phi = Math.acos(2 * Math.random() - 1);

      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.sin(phi) * Math.sin(theta);
      const z = r * Math.cos(phi);

      const radius = Math.random() * 0.15 + 0.05; // vary size
      temp.push({ position: [x, y, z], radius });
    }
    return temp;
  }, [count]);

  return (
    <>
      {stars.map((s, i) => (
        <Sphere
          key={i}
          args={[s.radius, 12, 12]}
          position={s.position as [number, number, number]}
          onClick={() => {
            const randomId = Math.floor(Math.random() * 10000); // pick range you want
            router.push(`/utilities/visualization/${randomId}`);
          }}
        >
          <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.5} />
        </Sphere>
      ))}
    </>
  );
}

// -------------------
// Main Scene
// -------------------
export default function App() {
  return (
    <Canvas
      camera={{ position: [0, 3, 8], fov: 75 }}
      style={{ width: "100vw", height: "100vh", background: "black" }}
    >
      {/* Lights */}
      <ambientLight intensity={0.3} />
      <pointLight position={[10, 10, 10]} intensity={2.5} />

      {/* Earth */}
      <Earth onClick={() => alert("🌍 Earth clicked!")} />

      {/* Kepler Host Stars */}
      <HostStars count={5000} />

      {/* Camera Controls */}
      <OrbitControls target={[0, 0, 0]} enablePan={false} />
    </Canvas>
  );
}
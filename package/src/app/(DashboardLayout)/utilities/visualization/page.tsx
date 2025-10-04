"use client";

import React, { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Sphere } from "@react-three/drei";
import * as THREE from "three";

function Star() {
  const texture = new THREE.TextureLoader().load(
    "https://threejs.org/examples/textures/sprites/glow.png"
  );

  return (
    <group>
      {/* Host Star */}
      <Sphere args={[1, 64, 64]}>
        <meshBasicMaterial color={0xffff00} />
      </Sphere>

      {/* Glow sprite halo */}
      <sprite>
        <spriteMaterial
          map={texture}
          color={0xffff88}
          transparent
          blending={THREE.AdditiveBlending}
        />
      </sprite>
    </group>
  );
}

function Planet() {
  const planetRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    const time = Date.now() * 0.001;
    const orbitRadius = 3;
    if (planetRef.current) {
      planetRef.current.position.x = Math.cos(time) * orbitRadius;
      planetRef.current.position.z = Math.sin(time) * orbitRadius;
    }
  });

  return (
    <Sphere ref={planetRef} args={[0.2, 32, 32]}>
      <meshStandardMaterial color={0x00aaff} roughness={0.5} metalness={0.1} />
    </Sphere>
  );
}

export default function App() {
  return (
    <Canvas
      camera={{ position: [0, 2, 5], fov: 75 }}
      style={{ width: "100vw", height: "100vh", background: "black" }}
    >
      {/* Lights */}
      <pointLight position={[0, 0, 0]} intensity={2} />
      <ambientLight intensity={0.2} />

      {/* Objects */}
      <Star />
      <Planet />

      {/* Controls */}
      <OrbitControls />
    </Canvas>
  );
}
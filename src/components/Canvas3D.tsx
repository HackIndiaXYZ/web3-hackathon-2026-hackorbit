'use client';

import React, { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import { useSharpStore } from '@/hooks/useSharpStore';

// 1. Concentric Floor target base matching the glowing circle on the floor
function ConcentricFloor() {
  const ringRef1 = useRef<THREE.Mesh>(null);
  const ringRef2 = useRef<THREE.Mesh>(null);
  const ringRef3 = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (ringRef1.current) ringRef1.current.rotation.z = time * 0.06;
    if (ringRef2.current) ringRef2.current.rotation.z = -time * 0.04;
    if (ringRef3.current) ringRef3.current.rotation.z = time * 0.02;
  });

  return (
    <group position={[0, -1.6, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      {/* Circle 1 */}
      <mesh ref={ringRef1}>
        <ringGeometry args={[0.3, 0.32, 64]} />
        <meshBasicMaterial color="#a855f7" transparent opacity={0.16} side={THREE.DoubleSide} blending={THREE.AdditiveBlending} />
      </mesh>
      {/* Circle 2 */}
      <mesh ref={ringRef2}>
        <ringGeometry args={[0.7, 0.72, 64]} />
        <meshBasicMaterial color="#3b82f6" transparent opacity={0.14} side={THREE.DoubleSide} blending={THREE.AdditiveBlending} />
      </mesh>
      {/* Circle 3 */}
      <mesh ref={ringRef3}>
        <ringGeometry args={[1.2, 1.22, 64]} />
        <meshBasicMaterial color="#a855f7" transparent opacity={0.09} side={THREE.DoubleSide} blending={THREE.AdditiveBlending} />
      </mesh>
    </group>
  );
}

// 2. Holographic Cylinder Cone - rising funnel of scrolling light
function HolographicCone({ glowBoost }: { glowBoost: number }) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uGlow: { value: 0 },
    uColor: { value: new THREE.Color('#8b5cf6') } // purple laser funnel
  }), []);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (meshRef.current) {
      const material = meshRef.current.material as THREE.ShaderMaterial;
      material.uniforms.uTime.value = time;
      material.uniforms.uGlow.value = THREE.MathUtils.lerp(material.uniforms.uGlow.value, glowBoost, 0.05);
    }
  });

  const vertexShader = `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `;

  const fragmentShader = `
    varying vec2 vUv;
    uniform float uTime;
    uniform float uGlow;
    uniform vec3 uColor;

    void main() {
      // Fade out from floor (vUv.y = 0) up to coin (vUv.y = 1)
      float verticalFade = (1.0 - vUv.y);
      
      // Vertical scrolling wave segments
      float wave = sin(vUv.y * 24.0 - uTime * 7.0) * 0.5 + 0.5;
      
      float opacity = verticalFade * 0.16 * (0.35 + wave * 0.65 + uGlow * 1.6);
      
      gl_FragColor = vec4(uColor, opacity);
    }
  `;

  return (
    <mesh ref={meshRef} position={[0, -0.8, 0]}>
      {/* Tapers from bottom radius 0.65 to top 0.05 */}
      <cylinderGeometry args={[0.05, 0.65, 1.6, 32, 1, true]} />
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

// 3. Upward Flowing Particles inside the light funnel
function UpwardFlowParticles() {
  const pointsRef = useRef<THREE.Points>(null);
  const count = 35;

  const [particles] = useMemo(() => {
    const arr = [];
    for (let i = 0; i < count; i++) {
      const y = -1.6 + Math.random() * 1.6;
      const angle = Math.random() * Math.PI * 2;
      const speed = 0.35 + Math.random() * 0.45;
      arr.push({ y, angle, speed, randId: Math.random() });
    }
    return [arr];
  }, []);

  useFrame((state, delta) => {
    if (!pointsRef.current) return;
    const pos = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const colorPurple = new THREE.Color('#c084fc');
    const colorBlue = new THREE.Color('#60a5fa');

    particles.forEach((p, i) => {
      p.y += delta * p.speed;
      if (p.y > 0.05) {
        p.y = -1.6; // recycle back to floor base
        p.angle = Math.random() * Math.PI * 2;
      }

      // Linear taper matching the cylinder geometry
      const t = (p.y + 1.6) / 1.6; // 0 at bottom, 1 at top
      const radius = 0.65 * (1.0 - t) + 0.05 * t;

      pos[i * 3] = Math.cos(p.angle) * radius;
      pos[i * 3 + 1] = p.y;
      pos[i * 3 + 2] = Math.sin(p.angle) * radius;

      const col = p.randId > 0.5 ? colorPurple : colorBlue;
      colors[i * 3] = col.r;
      colors[i * 3 + 1] = col.g;
      colors[i * 3 + 2] = col.b;
    });

    const geometry = pointsRef.current.geometry;
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    geometry.attributes.position.needsUpdate = true;
    if (geometry.attributes.color) geometry.attributes.color.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry />
      <pointsMaterial
        size={0.035}
        vertexColors
        transparent
        opacity={0.45}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

// 4. Sharp Token Coin centerpiece with extruded S logo
function SharpTokenCoin({
  glowBoost,
  rotationSpeed
}: {
  glowBoost: number;
  rotationSpeed: number;
}) {
  const coinRef = useRef<THREE.Group>(null);
  const coreRef = useRef<THREE.Group>(null);
  const ringMaterialRef = useRef<THREE.MeshPhysicalMaterial>(null);
  const coreMaterialRef = useRef<THREE.MeshPhysicalMaterial>(null);
  const frontLogoMaterialRef = useRef<THREE.MeshPhysicalMaterial>(null);
  const backLogoMaterialRef = useRef<THREE.MeshPhysicalMaterial>(null);

  // Stylized S logo outline shape
  const logoShape = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(-0.25, 0.4);
    shape.lineTo(0.25, 0.4);
    shape.lineTo(0.25, 0.12);
    shape.lineTo(-0.18, 0.12);
    shape.lineTo(-0.18, -0.06);
    shape.lineTo(0.25, -0.06);
    shape.lineTo(0.25, -0.4);
    shape.lineTo(-0.25, -0.4);
    shape.lineTo(-0.25, -0.12);
    shape.lineTo(0.18, -0.12);
    shape.lineTo(0.18, 0.06);
    shape.lineTo(-0.25, 0.06);
    shape.closePath();
    return shape;
  }, []);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    const speed = rotationSpeed;

    // Core self-rotation
    if (coreRef.current) {
      coreRef.current.rotation.y = time * 0.4 * speed;
    }

    // Parallax mouse tilt
    if (coinRef.current) {
      const targetX = -state.pointer.y * 0.45;
      const targetY = state.pointer.x * 0.45;
      coinRef.current.rotation.x = THREE.MathUtils.lerp(coinRef.current.rotation.x, targetX, 0.08);
      coinRef.current.rotation.y = THREE.MathUtils.lerp(coinRef.current.rotation.y, targetY, 0.08);
    }

    // Apply interactive glow boosts
    if (ringMaterialRef.current) {
      ringMaterialRef.current.emissiveIntensity = 0.25 + glowBoost * 0.9;
    }
    if (coreMaterialRef.current) {
      coreMaterialRef.current.emissiveIntensity = 0.15 + glowBoost * 0.7;
    }
    if (frontLogoMaterialRef.current) {
      frontLogoMaterialRef.current.emissiveIntensity = 1.25 + glowBoost * 1.5;
    }
    if (backLogoMaterialRef.current) {
      backLogoMaterialRef.current.emissiveIntensity = 1.25 + glowBoost * 1.5;
    }
  });

  return (
    <group ref={coinRef}>
      {/* Outer Torus Ring - Purple (Tilted Orbital Halo) */}
      <mesh rotation={[Math.PI / 3.5, Math.PI / 8, 0]}>
        <torusGeometry args={[1.35, 0.026, 16, 100]} />
        <meshPhysicalMaterial
          ref={ringMaterialRef}
          color="#c084fc"
          roughness={0.05}
          metalness={0.9}
          clearcoat={1.0}
          clearcoatRoughness={0.02}
          emissive="#a855f7"
          emissiveIntensity={0.4}
        />
      </mesh>

      {/* Coin Core Group (Face-on to camera, self-rotating) */}
      <group ref={coreRef}>
        {/* Coin Main Cylinder Body - oriented to face the camera */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.95, 0.95, 0.18, 64]} />
          <meshPhysicalMaterial
            ref={coreMaterialRef}
            color="#a1a1aa"
            roughness={0.12}
            metalness={0.99}
            clearcoat={1.0}
            clearcoatRoughness={0.08}
            reflectivity={1.0}
            emissive="#1d4ed8"
            emissiveIntensity={0.15}
          />
        </mesh>

        {/* Shiny Outer Beveled Rim Rings on Front and Back caps */}
        <mesh position={[0, 0, 0.09]}>
          <torusGeometry args={[0.91, 0.025, 16, 64]} />
          <meshPhysicalMaterial
            color="#cbd5e1"
            roughness={0.06}
            metalness={0.99}
            clearcoat={1.0}
            clearcoatRoughness={0.02}
          />
        </mesh>
        <mesh position={[0, 0, -0.09]}>
          <torusGeometry args={[0.91, 0.025, 16, 64]} />
          <meshPhysicalMaterial
            color="#cbd5e1"
            roughness={0.06}
            metalness={0.99}
            clearcoat={1.0}
            clearcoatRoughness={0.02}
          />
        </mesh>
        
        {/* Extruded S Logo Front (glowing cyan/blue) */}
        <mesh position={[0, 0, 0.09]} scale={[1.05, 1.05, 0.6]}>
          <extrudeGeometry args={[logoShape, { depth: 0.04, bevelEnabled: true, bevelThickness: 0.008, bevelSize: 0.004, bevelSegments: 3 }]} />
          <meshPhysicalMaterial
            ref={frontLogoMaterialRef}
            color="#ffffff"
            metalness={0.98}
            roughness={0.03}
            emissive="#3b82f6"
            emissiveIntensity={1.25}
          />
        </mesh>

        {/* Extruded S Logo Back (glowing purple) */}
        <mesh position={[0, 0, -0.09]} rotation={[0, Math.PI, 0]} scale={[1.05, 1.05, 0.6]}>
          <extrudeGeometry args={[logoShape, { depth: 0.04, bevelEnabled: true, bevelThickness: 0.008, bevelSize: 0.004, bevelSegments: 3 }]} />
          <meshPhysicalMaterial
            ref={backLogoMaterialRef}
            color="#ffffff"
            metalness={0.98}
            roughness={0.03}
            emissive="#a855f7"
            emissiveIntensity={1.25}
          />
        </mesh>
      </group>
    </group>
  );
}

// 5. Holographic Rings - Rotating Dashed Lines and Arcs
function HolographicRings({ rotationSpeed }: { rotationSpeed: number }) {
  const ringRef1 = useRef<THREE.Mesh>(null);
  const ringRef2 = useRef<THREE.Mesh>(null);
  const dashRef = useRef<THREE.Points>(null);

  // Dashed circle vertices
  const dashPositions = useMemo(() => {
    const pos = [];
    const count = 48;
    const radius = 1.75;
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      pos.push(Math.cos(angle) * radius, Math.sin(angle) * radius, 0);
    }
    return new Float32Array(pos);
  }, []);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (ringRef1.current) {
      ringRef1.current.rotation.z = time * 0.1 * rotationSpeed;
    }
    if (ringRef2.current) {
      ringRef2.current.rotation.z = -time * 0.16 * rotationSpeed;
    }
    if (dashRef.current) {
      dashRef.current.rotation.z = time * 0.07 * rotationSpeed;
    }
  });

  return (
    <group rotation={[Math.PI / 2.6, Math.PI / 10, 0]} position={[0, 0, -0.4]}>
      {/* Dashed Points Circle */}
      <points ref={dashRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[dashPositions, 3]} />
        </bufferGeometry>
        <pointsMaterial color="#a855f7" size={0.022} transparent opacity={0.12} blending={THREE.AdditiveBlending} />
      </points>

      {/* Arc segment 1 */}
      <mesh ref={ringRef1}>
        <ringGeometry args={[1.9, 1.92, 32, 1, 0, Math.PI * 1.45]} />
        <meshBasicMaterial color="#3b82f6" transparent opacity={0.08} side={THREE.DoubleSide} blending={THREE.AdditiveBlending} />
      </mesh>

      {/* Arc segment 2 */}
      <mesh ref={ringRef2} position={[0, 0, -0.04]}>
        <ringGeometry args={[2.08, 2.1, 32, 1, Math.PI * 0.6, Math.PI * 1.1]} />
        <meshBasicMaterial color="#c084fc" transparent opacity={0.06} side={THREE.DoubleSide} blending={THREE.AdditiveBlending} />
      </mesh>
    </group>
  );
}

// 6. Scanning Waves - sonar sweeps expanding outward
function ScanningWaves() {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (meshRef.current) {
      const progress = (time * 0.38) % 1.0;
      const scale = 1.0 + progress * 1.5;
      meshRef.current.scale.set(scale, scale, 1);
      const material = meshRef.current.material as THREE.MeshBasicMaterial;
      material.opacity = 0.05 * (1.0 - progress);
    }
  });

  return (
    <group rotation={[Math.PI / 2.6, Math.PI / 10, 0]} position={[0, 0, -0.3]}>
      <mesh ref={meshRef}>
        <ringGeometry args={[1.5, 1.52, 64]} />
        <meshBasicMaterial color="#3b82f6" transparent opacity={0} side={THREE.DoubleSide} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
    </group>
  );
}

// 7. Golden Buy Halo
function GoldenHalo({ trigger }: { trigger: number }) {
  const haloRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!haloRef.current || trigger === 0) return;
    const elapsed = state.clock.getElapsedTime() - trigger;
    if (elapsed > 2.2) {
      haloRef.current.visible = false;
      return;
    }
    haloRef.current.visible = true;
    const progress = elapsed / 2.2;
    const scale = 1.0 + progress * 0.32;
    haloRef.current.scale.set(scale, scale, 1);
    const material = haloRef.current.material as THREE.MeshBasicMaterial;
    material.opacity = 0.45 * (1.0 - progress);
  });

  return (
    <mesh ref={haloRef} position={[0, 0, -0.2]} rotation={[Math.PI / 2.6, Math.PI / 10, 0]}>
      <ringGeometry args={[1.52, 1.57, 64]} />
      <meshBasicMaterial color="#fbbf24" transparent opacity={0} side={THREE.DoubleSide} blending={THREE.AdditiveBlending} depthWrite={false} />
    </mesh>
  );
}

// 8. Orbiting Satellites - glowing particles
interface SatData {
  radius: number;
  speed: number;
  phase: number;
  size: number;
  color: string;
  tilt: number;
}

function OrbitingSatellites({ rotationSpeed }: { rotationSpeed: number }) {
  const satellites: SatData[] = useMemo(() => [
    { radius: 2.1, speed: 0.55, phase: 0.0, size: 0.04, color: '#3b82f6', tilt: 0.45 },
    { radius: 2.6, speed: -0.38, phase: 1.8, size: 0.048, color: '#a855f7', tilt: -0.5 },
    { radius: 3.1, speed: 0.32, phase: 3.5, size: 0.03, color: '#06b6d4', tilt: 0.25 },
    { radius: 2.3, speed: -0.65, phase: 4.8, size: 0.022, color: '#f43f5e', tilt: 0.6 },
  ], []);

  const satelliteRefs = useRef<THREE.Mesh[]>([]);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();

    satellites.forEach((sat, idx) => {
      const mesh = satelliteRefs.current[idx];
      if (mesh) {
        const angle = time * sat.speed * rotationSpeed + sat.phase;
        const rx = Math.cos(angle) * sat.radius;
        const rz = Math.sin(angle) * sat.radius;

        mesh.position.set(rx, rz * Math.sin(sat.tilt), rz * Math.cos(sat.tilt));
        mesh.rotation.x = time * 0.7;
        mesh.rotation.y = time * 0.4;
      }
    });
  });

  return (
    <group>
      {satellites.map((sat, idx) => (
        <mesh
          key={idx}
          ref={(el) => { if (el) satelliteRefs.current[idx] = el; }}
          scale={[sat.size, sat.size, sat.size]}
        >
          <sphereGeometry args={[1.0, 16, 16]} />
          <meshBasicMaterial color={sat.color} transparent opacity={0.6} />
        </mesh>
      ))}
    </group>
  );
}

// 9. Particle Trails
function ParticleTrails({ rotationSpeed }: { rotationSpeed: number }) {
  const pointsRef = useRef<THREE.Points>(null);
  const count = 40;

  const [radii, speeds, phases, tilts] = useMemo(() => {
    const rad = new Float32Array(count);
    const spd = new Float32Array(count);
    const phs = new Float32Array(count);
    const tlt = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      rad[i] = 1.7 + Math.random() * 0.7;
      spd[i] = 0.4 + Math.random() * 0.6 * (Math.random() > 0.5 ? 1 : -1);
      phs[i] = Math.random() * Math.PI * 2;
      tlt[i] = (Math.random() - 0.5) * 0.7;
    }
    return [rad, spd, phs, tlt];
  }, []);

  useFrame((state) => {
    if (!pointsRef.current) return;
    const time = state.clock.getElapsedTime();
    const pos = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      const angle = time * speeds[i] * rotationSpeed + phases[i];
      const rx = Math.cos(angle) * radii[i];
      const rz = Math.sin(angle) * radii[i];

      pos[i * 3] = rx;
      pos[i * 3 + 1] = rz * Math.sin(tilts[i]);
      pos[i * 3 + 2] = rz * Math.cos(tilts[i]);
    }

    pointsRef.current.geometry.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    pointsRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry />
      <pointsMaterial
        color="#a855f7"
        size={0.03}
        sizeAttenuation
        transparent
        opacity={0.4}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

// 10. Success Particles Component - Shoots particles outward on Reward/Buy
interface SuccessParticle {
  pos: THREE.Vector3;
  vel: THREE.Vector3;
  age: number;
  maxAge: number;
  color: THREE.Color;
}

function SuccessParticles({ particlesRef }: { particlesRef: React.MutableRefObject<SuccessParticle[]> }) {
  const pointsRef = useRef<THREE.Points>(null);

  useFrame((state, delta) => {
    if (!pointsRef.current) return;
    const active: SuccessParticle[] = [];
    const posArray: number[] = [];
    const colorArray: number[] = [];

    particlesRef.current.forEach((p) => {
      p.age += delta;
      if (p.age >= p.maxAge) return;

      // Update position
      p.pos.addScaledVector(p.vel, delta);
      active.push(p);

      posArray.push(p.pos.x, p.pos.y, p.pos.z);
      colorArray.push(p.color.r, p.color.g, p.color.b);
    });

    particlesRef.current = active;

    const geometry = pointsRef.current.geometry;
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(posArray, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colorArray, 3));
    geometry.attributes.position.needsUpdate = true;
    if (geometry.attributes.color) geometry.attributes.color.needsUpdate = true;

    const material = pointsRef.current.material as THREE.PointsMaterial;
    material.opacity = active.length > 0 ? 0.95 : 0;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry />
      <pointsMaterial
        size={0.055}
        vertexColors
        transparent
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

// 11. Container Component - Coordinates store transaction reactions
function SceneCenter() {
  const transactions = useSharpStore((state) => state.transactions);
  const prevTxCount = useRef(transactions.length);

  // Animation boosters
  const targetRotationSpeed = useRef(1.0);
  const targetGlowBoost = useRef(0.0);

  const [currentGlow, setCurrentGlow] = useState(0);
  const [currentSpeed, setCurrentSpeed] = useState(1);
  const [buyHaloTrigger, setBuyHaloTrigger] = useState(0);

  // Success particles ref
  const successParticlesRef = useRef<SuccessParticle[]>([]);

  const spawnSuccessParticles = (colorHex: string) => {
    const arr = successParticlesRef.current;
    const col = new THREE.Color(colorHex);
    for (let i = 0; i < 28; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      const vel = new THREE.Vector3(
        Math.sin(phi) * Math.cos(theta),
        Math.sin(phi) * Math.sin(theta),
        Math.cos(phi)
      ).multiplyScalar(1.2 + Math.random() * 1.8);

      arr.push({
        pos: new THREE.Vector3(0, 0, 0),
        vel,
        age: 0,
        maxAge: 0.8 + Math.random() * 0.7,
        color: col
      });
    }
  };

  useEffect(() => {
    if (transactions.length > prevTxCount.current) {
      const latestTx = transactions[0];
      const txType = latestTx?.type || (latestTx?.amount < 0 ? 'spend' : 'reward');

      if (txType === 'reward') {
        targetGlowBoost.current = 1.0;
        targetRotationSpeed.current = 1.25;
        spawnSuccessParticles('#3b82f6');
      } else if (txType === 'spend') {
        targetRotationSpeed.current = 2.85;
        targetGlowBoost.current = 0.45;
      } else if (txType === 'buy') {
        targetGlowBoost.current = 0.9;
        targetRotationSpeed.current = 1.25;
        setBuyHaloTrigger(new THREE.Clock().getElapsedTime());
        spawnSuccessParticles('#fbbf24');
      }

      prevTxCount.current = transactions.length;
    }
  }, [transactions.length]);

  useFrame((state) => {
    targetGlowBoost.current = THREE.MathUtils.lerp(targetGlowBoost.current, 0.0, 0.05);
    targetRotationSpeed.current = THREE.MathUtils.lerp(targetRotationSpeed.current, 1.0, 0.04);

    setCurrentGlow(targetGlowBoost.current);
    setCurrentSpeed(targetRotationSpeed.current);
  });

  return (
    <group>
      {/* 3D Coin Piece */}
      <SharpTokenCoin glowBoost={currentGlow} rotationSpeed={currentSpeed} />

      {/* Orbiting HUD details */}
      <HolographicRings rotationSpeed={currentSpeed} />
      <ScanningWaves />
      <GoldenHalo trigger={buyHaloTrigger} />
      
      {/* Concentric targets base */}
      <ConcentricFloor />

      {/* Holographic light funnel scrolling lines */}
      <HolographicCone glowBoost={currentGlow} />

      {/* Volumetric flowing particles */}
      <UpwardFlowParticles />
      
      {/* Satellites and paths */}
      <OrbitingSatellites rotationSpeed={currentSpeed} />
      <ParticleTrails rotationSpeed={currentSpeed} />

      {/* Reactive Success Particles */}
      <SuccessParticles particlesRef={successParticlesRef} />
    </group>
  );
}

export default function Canvas3D() {
  return (
    <div className="w-full h-full min-h-[480px] relative">
      <Canvas camera={{ position: [0, 0, 4.2], fov: 42 }} className="w-full h-full bg-transparent">
        <ambientLight intensity={0.7} />
        <directionalLight position={[6, 9, 6]} intensity={2.0} castShadow />
        <pointLight position={[-6, -6, -4]} intensity={0.8} />
        <spotLight position={[0, 6, 2.5]} angle={0.5} penumbra={1} intensity={2.5} color="#ffffff" castShadow />
        
        {/* Float centerpiece coin and orbiting HUD elements */}
        <Float speed={1.3} rotationIntensity={0.12} floatIntensity={0.35} floatingRange={[-0.12, 0.12]}>
          <SceneCenter />
        </Float>

        {/* Dynamic drop contact shadows */}
        <ContactShadows
          position={[0, -1.6, 0]}
          opacity={0.32}
          scale={5.0}
          blur={2.5}
          far={3.2}
        />
      </Canvas>
    </div>
  );
}

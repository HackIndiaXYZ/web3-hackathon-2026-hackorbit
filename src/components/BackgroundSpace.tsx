'use client';

import React, { useRef, useMemo, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useSharpStore } from '@/hooks/useSharpStore';

// 1. Starfield Layer - Twinkling deep space stars
function Starfield() {
  const pointsRef = useRef<THREE.Points>(null);
  const count = 650;

  const [positions, twinkleRates, twinkleOffsets] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const rates = new Float32Array(count);
    const offsets = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 36;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 24;
      pos[i * 3 + 2] = -12 - Math.random() * 8;
      rates[i] = 0.4 + Math.random() * 1.5;
      offsets[i] = Math.random() * Math.PI * 2;
    }
    return [pos, rates, offsets];
  }, []);

  const uniforms = useMemo(() => ({
    uTime: { value: 0 }
  }), []);

  useFrame((state) => {
    if (pointsRef.current) {
      const material = pointsRef.current.material as THREE.ShaderMaterial;
      material.uniforms.uTime.value = state.clock.getElapsedTime();
    }
  });

  const vertexShader = `
    uniform float uTime;
    attribute float rate;
    attribute float offset;
    varying float vBrightness;

    void main() {
      vec3 pos = position;
      vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
      gl_Position = projectionMatrix * mvPosition;

      vBrightness = 0.25 + 0.75 * sin(uTime * rate + offset);
      gl_PointSize = (9.0 / -mvPosition.z) * vBrightness;
    }
  `;

  const fragmentShader = `
    varying float vBrightness;
    void main() {
      float dist = length(gl_PointCoord - vec2(0.5));
      if (dist > 0.5) discard;
      float alpha = 1.0 - smoothstep(0.0, 0.5, dist);
      gl_FragColor = vec4(1.0, 1.0, 1.0, alpha * vBrightness * 0.65);
    }
  `;

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-rate" args={[twinkleRates, 1]} />
        <bufferAttribute attach="attributes-offset" args={[twinkleOffsets, 1]} />
      </bufferGeometry>
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

// 2. Nebula Clouds Layer - Procedural FBM noise shader plane (Extremely Slow Motion)
function NebulaClouds() {
  const meshRef = useRef<THREE.Mesh>(null);
  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uColor1: { value: new THREE.Color('#2563eb') }, // deep blue
    uColor2: { value: new THREE.Color('#7c3aed') }, // purple
    uColor3: { value: new THREE.Color('#0891b2') }, // cyan
  }), []);

  useFrame((state) => {
    if (meshRef.current) {
      const material = meshRef.current.material as THREE.ShaderMaterial;
      material.uniforms.uTime.value = state.clock.getElapsedTime() * 0.015; // extremely slow motion
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
    uniform vec3 uColor1;
    uniform vec3 uColor2;
    uniform vec3 uColor3;

    float hash(vec2 p) {
      return fract(1e4 * sin(17.0 * p.x + p.y * 0.1) * (0.1 + abs(sin(p.y * 13.0 + p.x))));
    }

    float noise(vec2 x) {
      vec2 i = floor(x);
      vec2 f = fract(x);
      float a = hash(i);
      float b = hash(i + vec2(1.0, 0.0));
      float c = hash(i + vec2(0.0, 1.0));
      float d = hash(i + vec2(1.0, 1.0));
      vec2 u = f * f * (3.0 - 2.0 * f);
      return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
    }

    float fbm(vec2 x) {
      float v = 0.0;
      float a = 0.5;
      vec2 shift = vec2(100.0);
      mat2 rot = mat2(cos(0.5), sin(0.5), -sin(0.5), cos(0.5));
      for (int i = 0; i < 4; ++i) {
        v += a * noise(x);
        x = rot * x * 2.0 + shift;
        a *= 0.5;
      }
      return v;
    }

    void main() {
      vec2 uv = vUv * 2.0 - vec2(1.0);
      
      vec2 q = vec2(0.0);
      q.x = fbm(uv + 0.12 * uTime);
      q.y = fbm(uv + vec2(1.0));

      vec2 r = vec2(0.0);
      r.x = fbm(uv + 1.0 * q + vec2(1.7, 9.2) + 0.14 * uTime);
      r.y = fbm(uv + 1.0 * q + vec2(8.3, 2.8) + 0.11 * uTime);

      float f = fbm(uv + r);

      vec3 color = mix(uColor1, uColor2, clamp(f * f * 3.6, 0.0, 1.0));
      color = mix(color, uColor3, clamp(length(q), 0.0, 1.0));

      float dist = length(vUv - vec2(0.5));
      float alpha = smoothstep(0.68, 0.15, dist) * 0.065 * f; // extremely low opacity

      gl_FragColor = vec4(color, alpha);
    }
  `;

  return (
    <mesh ref={meshRef} position={[0, 0, -10.5]} scale={[26, 18, 1]}>
      <planeGeometry args={[1, 1]} />
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}

// 3. Cosmic Dust Layer - GPU particles repelled by cursor (Thousands of tiny particles)
function CosmicDust() {
  const pointsRef = useRef<THREE.Points>(null);
  const particleCount = 2000;

  const [positions, uniqueIds] = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    const ids = new Float32Array(particleCount);
    for (let i = 0; i < particleCount; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 18;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 11;
      pos[i * 3 + 2] = -2.5 - Math.random() * 7.5;
      ids[i] = Math.random();
    }
    return [pos, ids];
  }, []);

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uMouse: { value: new THREE.Vector2(0, 0) },
    uParallaxStrength: { value: 0.12 },
  }), []);

  useFrame((state) => {
    if (pointsRef.current) {
      const material = pointsRef.current.material as THREE.ShaderMaterial;
      material.uniforms.uTime.value = state.clock.getElapsedTime();
      material.uniforms.uMouse.value.set(state.pointer.x, state.pointer.y);
    }
  });

  const vertexShader = `
    uniform float uTime;
    uniform vec2 uMouse;
    uniform float uParallaxStrength;
    attribute float uniqueId;
    varying float vAlpha;
    varying vec3 vColor;

    void main() {
      vec3 pos = position;

      pos.x += sin(uTime * 0.08 + uniqueId * 6.28) * 0.08;
      pos.y += cos(uTime * 0.1 + uniqueId * 6.28) * 0.08;

      // Cursor repulsion
      vec3 mouseWorld = vec3(uMouse.x * 6.5, uMouse.y * 4.2, pos.z);
      float dist = distance(pos, mouseWorld);
      if (dist < 2.0) {
        float force = (1.0 - smoothstep(0.0, 2.0, dist)) * 0.38;
        vec3 dir = pos - mouseWorld;
        dir.z = 0.0;
        if (length(dir) > 0.001) {
          pos += normalize(dir) * force;
        }
      }

      // Parallax offset
      pos.xy += uMouse * (pos.z * -1.0) * uParallaxStrength * 0.12;

      vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
      gl_Position = projectionMatrix * mvPosition;

      float sizeTwinkle = 0.8 + 0.35 * sin(uTime * 1.5 + uniqueId * 10.0);
      gl_PointSize = (8.5 / -mvPosition.z) * sizeTwinkle;

      vAlpha = 0.1 + 0.5 * uniqueId;
      vColor = mix(vec3(0.4, 0.72, 1.0), vec3(0.72, 0.52, 1.0), uniqueId);
    }
  `;

  const fragmentShader = `
    varying float vAlpha;
    varying vec3 vColor;
    void main() {
      float dist = length(gl_PointCoord - vec2(0.5));
      if (dist > 0.5) discard;
      float intensity = 1.0 - smoothstep(0.0, 0.5, dist);
      gl_FragColor = vec4(vColor, intensity * vAlpha * 0.5);
    }
  `;

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-uniqueId" args={[uniqueIds, 1]} />
      </bufferGeometry>
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

// 4. Energy Orbs Layer - Floating glowing spheres
function SpaceOrbs() {
  const orbRef1 = useRef<THREE.Mesh>(null);
  const orbRef2 = useRef<THREE.Mesh>(null);
  const orbRef3 = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    
    if (orbRef1.current) {
      orbRef1.current.position.x = Math.sin(time * 0.08) * 5.5;
      orbRef1.current.position.y = Math.cos(time * 0.04) * 2.8;
      const s = 1.0 + Math.sin(time * 0.3) * 0.1;
      orbRef1.current.scale.set(s, s, s);
    }
    if (orbRef2.current) {
      orbRef2.current.position.x = -Math.sin(time * 0.06) * 6.5;
      orbRef2.current.position.y = -Math.cos(time * 0.08) * 2.0;
      const s = 0.8 + Math.cos(time * 0.22) * 0.07;
      orbRef2.current.scale.set(s, s, s);
    }
    if (orbRef3.current) {
      orbRef3.current.position.x = Math.cos(time * 0.07) * 4.2;
      orbRef3.current.position.y = -Math.sin(time * 0.05) * 1.8;
      const s = 0.7 + Math.sin(time * 0.18) * 0.06;
      orbRef3.current.scale.set(s, s, s);
    }
  });

  return (
    <group>
      <mesh ref={orbRef1} position={[4, 2, -5.5]}>
        <sphereGeometry args={[0.3, 24, 24]} />
        <meshBasicMaterial color="#06b6d4" transparent opacity={0.04} blending={THREE.AdditiveBlending} />
      </mesh>
      
      <mesh ref={orbRef2} position={[-4, -2, -6.5]}>
        <sphereGeometry args={[0.26, 24, 24]} />
        <meshBasicMaterial color="#a855f7" transparent opacity={0.035} blending={THREE.AdditiveBlending} />
      </mesh>

      <mesh ref={orbRef3} position={[1, -1.5, -6.0]}>
        <sphereGeometry args={[0.22, 24, 24]} />
        <meshBasicMaterial color="#2563eb" transparent opacity={0.04} blending={THREE.AdditiveBlending} />
      </mesh>
    </group>
  );
}

// 5. Diagonal Shooting Stars Component - Rare (every 16-22 seconds)
function ShootingStars() {
  const lineRef = useRef<THREE.LineSegments>(null);
  const [stars, setStars] = useState<Array<{ x: number; y: number; z: number; len: number; speed: number; opacity: number }>>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (stars.length > 1) return;
      setStars((prev) => [
        ...prev,
        {
          x: 4.0 + Math.random() * 4.5,
          y: 3.0 + Math.random() * 2.0,
          z: -4 - Math.random() * 4,
          len: 0.5 + Math.random() * 0.5,
          speed: 0.04 + Math.random() * 0.035,
          opacity: 1,
        },
      ]);
    }, 18000); // Rare: spawns every 18 seconds

    return () => clearInterval(interval);
  }, [stars]);

  useFrame(() => {
    if (!lineRef.current) return;

    const activeStars = stars
      .map((s) => {
        const nextX = s.x - s.speed;
        const nextY = s.y - s.speed * 0.65;
        const nextOpacity = s.opacity - 0.018;
        return { ...s, x: nextX, y: nextY, opacity: nextOpacity };
      })
      .filter((s) => s.opacity > 0 && s.x > -8.5 && s.y > -5.5);

    if (activeStars.length !== stars.length) {
      setStars(activeStars);
    }

    const positions: number[] = [];
    const colors: number[] = [];

    activeStars.forEach((s) => {
      positions.push(s.x, s.y, s.z);
      positions.push(s.x - s.len, s.y - s.len * 0.65, s.z);
      colors.push(0.35, 0.65, 1.0, s.opacity * 0.4);
      colors.push(0.65, 0.45, 0.95, 0);
    });

    const geometry = lineRef.current.geometry;
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 4));
    geometry.attributes.position.needsUpdate = true;
    if (geometry.attributes.color) geometry.attributes.color.needsUpdate = true;
  });

  return (
    <lineSegments ref={lineRef}>
      <bufferGeometry />
      <lineBasicMaterial
        vertexColors
        transparent
        blending={THREE.AdditiveBlending}
      />
    </lineSegments>
  );
}

// 6. Blockchain Network & Faint Constellation Lines (3-5% Opacity)
const NODES = [
  new THREE.Vector3(-5.5, 3.2, -6.5),
  new THREE.Vector3(-2.2, 1.0, -5.2),
  new THREE.Vector3(3.2, 2.2, -6.2),
  new THREE.Vector3(5.2, -1.0, -5.2),
  new THREE.Vector3(2.2, -3.2, -6.2),
  new THREE.Vector3(-3.2, -2.2, -5.2),
  new THREE.Vector3(0.0, -1.2, -6.2),
  new THREE.Vector3(-6.2, -2.2, -6.2)
];

const EDGES = [
  [0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 7], [7, 0],
  [1, 6], [6, 4], [5, 6], [6, 2], [0, 5], [7, 1]
];

interface Packet {
  id: number;
  edgeIndex: number;
  progress: number;
  speed: number;
  color: THREE.Color;
  size: number;
  reverse: boolean;
}

function BlockchainNetwork({ pulseTriggerTime }: { pulseTriggerTime: number }) {
  const pointsRef = useRef<THREE.Points>(null);
  const lineMaterialRef = useRef<THREE.LineBasicMaterial>(null);
  
  const transactions = useSharpStore((state) => state.transactions);
  const prevTxCount = useRef(transactions.length);
  
  const packets = useRef<Packet[]>([]);
  const opacityRef = useRef(0.035); // strictly 3.5% baseline

  const initializePackets = () => {
    const arr: Packet[] = [];
    for (let i = 0; i < 12; i++) {
      const edgeIndex = Math.floor(Math.random() * EDGES.length);
      arr.push({
        id: Math.random(),
        edgeIndex,
        progress: Math.random(),
        speed: 0.045 + Math.random() * 0.07,
        color: new THREE.Color(i % 2 === 0 ? '#60a5fa' : '#c084fc'),
        size: 0.035 + Math.random() * 0.03,
        reverse: Math.random() > 0.5
      });
    }
    packets.current = arr;
  };

  if (packets.current.length === 0) {
    initializePackets();
  }

  // Node flash brightness on Cosmic Pulse / Actions
  useEffect(() => {
    if (pulseTriggerTime > 0) {
      opacityRef.current = 0.2; // node brightness flash
    }
  }, [pulseTriggerTime]);

  // Monitor transactions to trigger packet bursts
  useEffect(() => {
    if (transactions.length > prevTxCount.current) {
      const latestTx = transactions[0];
      const txType = latestTx?.type || (latestTx?.amount < 0 ? 'spend' : 'reward');
      
      const burstCount = 18;
      let burstColor = '#60a5fa'; // Blue packet burst on reward
      if (txType === 'buy') {
        burstColor = '#fbbf24'; // Golden packet flow on buy
      } else if (txType === 'spend') {
        burstColor = '#c084fc'; // Purple packet burst on spend
      }

      for (let i = 0; i < burstCount; i++) {
        const edgeIndex = Math.floor(Math.random() * EDGES.length);
        packets.current.push({
          id: Math.random(),
          edgeIndex,
          progress: 0,
          speed: 0.16 + Math.random() * 0.24,
          color: new THREE.Color(burstColor),
          size: 0.065 + Math.random() * 0.045,
          reverse: Math.random() > 0.5
        });
      }

      opacityRef.current = 0.22; // Briefly illuminate nodes

      prevTxCount.current = transactions.length;

      if (packets.current.length > 70) {
        packets.current = packets.current.slice(-70);
      }
    }
  }, [transactions.length]);

  useFrame((state, delta) => {
    // Lerp constellation line opacity back to baseline (3.5% opacity)
    if (lineMaterialRef.current) {
      opacityRef.current = THREE.MathUtils.lerp(opacityRef.current, 0.035, 0.04);
      lineMaterialRef.current.opacity = opacityRef.current;
    }

    if (!pointsRef.current) return;
    const geometry = pointsRef.current.geometry;
    
    const posArray: number[] = [];
    const colorArray: number[] = [];
    const sizeArray: number[] = [];
    const activePackets: Packet[] = [];

    packets.current.forEach((p) => {
      p.progress += p.speed * delta;
      
      let isDone = p.progress >= 1.0;

      if (isDone) {
        if (packets.current.length > 12) {
          return; // remove burst packets
        } else {
          p.edgeIndex = Math.floor(Math.random() * EDGES.length);
          p.progress = 0;
          p.speed = 0.045 + Math.random() * 0.07;
          p.reverse = Math.random() > 0.5;
        }
      }

      activePackets.push(p);

      const edge = EDGES[p.edgeIndex];
      const start = NODES[p.reverse ? edge[1] : edge[0]];
      const end = NODES[p.reverse ? edge[0] : edge[1]];
      
      const currentPos = new THREE.Vector3().lerpVectors(start, end, p.progress);
      posArray.push(currentPos.x, currentPos.y, currentPos.z);
      colorArray.push(p.color.r, p.color.g, p.color.b);
      sizeArray.push(p.size * 22);
    });

    packets.current = activePackets;

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(posArray, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colorArray, 3));
    geometry.setAttribute('pSize', new THREE.Float32BufferAttribute(sizeArray, 1));
    
    geometry.attributes.position.needsUpdate = true;
    if (geometry.attributes.color) geometry.attributes.color.needsUpdate = true;
    if (geometry.attributes.pSize) geometry.attributes.pSize.needsUpdate = true;
  });

  const connectionPositions = useMemo(() => {
    const pos: number[] = [];
    EDGES.forEach(([i, j]) => {
      pos.push(NODES[i].x, NODES[i].y, NODES[i].z);
      pos.push(NODES[j].x, NODES[j].y, NODES[j].z);
    });
    return new Float32Array(pos);
  }, []);

  return (
    <group>
      {/* 1. Constellation Faint Network Lines (3.5% Opacity) */}
      <lineSegments>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[connectionPositions, 3]} />
        </bufferGeometry>
        <lineBasicMaterial ref={lineMaterialRef} color="#a855f7" opacity={0.035} transparent blending={THREE.AdditiveBlending} />
      </lineSegments>

      {/* 2. Network Node dots */}
      {NODES.map((node, i) => (
        <mesh key={i} position={[node.x, node.y, node.z]}>
          <sphereGeometry args={[0.04, 8, 8]} />
          <meshBasicMaterial color="#a855f7" transparent opacity={0.25} />
        </mesh>
      ))}

      {/* 3. Flows packets points */}
      <points ref={pointsRef}>
        <bufferGeometry />
        <pointsMaterial
          size={1.0}
          vertexColors
          transparent
          opacity={0.8}
          sizeAttenuation
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  );
}

// 7. Silent Comet Flyby
function RareComet({ active, onComplete }: { active: boolean; onComplete: () => void }) {
  const cometRef = useRef<THREE.Group>(null);
  const progress = useRef(0);

  useFrame((state, delta) => {
    if (!active || !cometRef.current) return;
    progress.current += delta * 0.15; // crosses viewport in 6.6s
    if (progress.current >= 1.0) {
      progress.current = 0;
      onComplete();
      return;
    }

    const x = 7.5 - progress.current * 15;
    const y = 4.2 - progress.current * 8.4;
    const z = -4.5;
    cometRef.current.position.set(x, y, z);
  });

  if (!active) return null;

  return (
    <group ref={cometRef}>
      <mesh>
        <sphereGeometry args={[0.05, 12, 12]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.95} />
      </mesh>
      
      {Array.from({ length: 12 }).map((_, idx) => {
        const offsetFactor = (idx + 1) * 0.12;
        const scale = 1.0 - idx * 0.08;
        const opacity = 0.45 * (1.0 - idx * 0.08);
        return (
          <mesh 
            key={idx} 
            position={[offsetFactor * 0.9, offsetFactor * 0.6, 0]}
            scale={[scale, scale, scale]}
          >
            <sphereGeometry args={[0.04, 8, 8]} />
            <meshBasicMaterial color="#60a5fa" transparent opacity={opacity} blending={THREE.AdditiveBlending} />
          </mesh>
        );
      })}
    </group>
  );
}

// 8. Cosmic Pulse expanding ring mesh
function CosmicPulseWave({ triggerTime }: { triggerTime: number }) {
  const pulseRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!pulseRef.current || triggerTime === 0) return;
    const elapsed = state.clock.getElapsedTime() - triggerTime;
    
    if (elapsed > 3.2) {
      pulseRef.current.visible = false;
      return;
    }
    
    pulseRef.current.visible = true;
    const progress = elapsed / 3.2;
    const scale = progress * 32.0;
    pulseRef.current.scale.set(scale, scale, 1);
    
    const material = pulseRef.current.material as THREE.MeshBasicMaterial;
    material.opacity = 0.08 * (1.0 - progress); // very elegant, low opacity
  });

  return (
    <mesh ref={pulseRef} position={[0, 0, -6.5]}>
      <ringGeometry args={[0.98, 1.0, 64]} />
      <meshBasicMaterial color="#3b82f6" transparent opacity={0} side={THREE.DoubleSide} blending={THREE.AdditiveBlending} depthWrite={false} />
    </mesh>
  );
}

// 9. Camera and Parallax Manager (No shake)
function SceneManager() {
  const { camera } = useThree();
  const mouse = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouse.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useFrame(() => {
    const targetX = mouse.current.x * 0.45;
    const targetY = mouse.current.y * 0.32;
    camera.position.x = THREE.MathUtils.lerp(camera.position.x, targetX, 0.05);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, targetY, 0.05);
    camera.lookAt(0, 0, -6.0);
  });

  return null;
}

export default function BackgroundSpace() {
  const [pulseTime, setPulseTime] = useState(0);
  const [cometActive, setCometActive] = useState(false);
  
  const transactions = useSharpStore((state) => state.transactions);
  const prevTxCount = useRef(transactions.length);

  const lensRef = useRef<HTMLDivElement>(null);

  const triggerCosmicPulse = () => {
    const time = new THREE.Clock().getElapsedTime();
    setPulseTime(time);
    triggerLensFlare();
  };

  const triggerComet = () => {
    setCometActive(true); // Silent comets
  };

  const triggerLensFlare = () => {
    let start: number | null = null;
    const duration = 2400;

    const animate = (timestamp: number) => {
      if (!start) start = timestamp;
      const progress = timestamp - start;
      let opacity = 0;

      if (progress < 400) {
        opacity = (progress / 400) * 0.07; // Faint 7% opacity
      } else {
        opacity = 0.07 * (1.0 - (progress - 400) / (duration - 400));
      }

      if (lensRef.current) {
        lensRef.current.style.opacity = opacity.toString();
      }

      if (progress < duration) {
        requestAnimationFrame(animate);
      } else {
        if (lensRef.current) lensRef.current.style.opacity = '0';
      }
    };
    requestAnimationFrame(animate);
  };

  // Listen to transaction updates to sync background pulse waves
  useEffect(() => {
    if (transactions.length > prevTxCount.current) {
      triggerCosmicPulse();
      prevTxCount.current = transactions.length;
    }
  }, [transactions.length]);

  // Periodically trigger a random cosmic pulse or comet every 42 seconds
  useEffect(() => {
    const handleEvents = () => {
      const choices = ['pulse', 'comet'];
      const pick = choices[Math.floor(Math.random() * choices.length)];
      if (pick === 'pulse') triggerCosmicPulse();
      else triggerComet();
    };

    const interval = setInterval(handleEvents, 42000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full h-full absolute inset-0 z-0 select-none pointer-events-none">
      
      {/* R3F Space Back Canvas */}
      <Canvas
        camera={{ position: [0, 0, 4.5], fov: 48 }}
        className="w-full h-full bg-transparent"
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.4} />
        <directionalLight position={[0, 8, -5]} intensity={0.6} />

        {/* Cinematic Layers (No Asteroids or Hexagons) */}
        <Starfield />
        <NebulaClouds />
        <CosmicDust />
        <SpaceOrbs />
        <ShootingStars />
        <BlockchainNetwork pulseTriggerTime={pulseTime} />
        
        {/* Periodic Cosmic Events */}
        <RareComet active={cometActive} onComplete={() => setCometActive(false)} />
        <CosmicPulseWave triggerTime={pulseTime} />

        {/* Parallax Tilting */}
        <SceneManager />
      </Canvas>

      {/* Layer 7: Hardware-accelerated CSS auroras (behind canvas) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20 select-none z-[-1] bg-[#0A0A0B]">
        <div 
          className="absolute top-[-20%] left-[-20%] w-[60%] h-[65%] rounded-full opacity-25 animate-aurora-1"
          style={{
            filter: 'blur(140px)',
            WebkitFilter: 'blur(140px)',
            background: 'radial-gradient(circle, rgba(59, 130, 246, 0.16) 0%, rgba(99, 102, 241, 0.03) 70%, transparent 100%)',
          }}
        />
        <div 
          className="absolute bottom-[-20%] right-[-20%] w-[55%] h-[60%] rounded-full opacity-18 animate-aurora-2"
          style={{
            filter: 'blur(150px)',
            WebkitFilter: 'blur(150px)',
            background: 'radial-gradient(circle, rgba(168, 85, 247, 0.14) 0%, rgba(236, 72, 153, 0.03) 75%, transparent 100%)',
          }}
        />
      </div>

      {/* Subtle Blue-Purple-Cyan Lens Flare CSS Overlay (<8% Opacity) */}
      <div
        ref={lensRef}
        className="absolute top-1/3 left-1/4 w-[350px] h-[350px] rounded-full pointer-events-none z-10 transition-opacity duration-300 mix-blend-screen"
        style={{
          opacity: 0,
          filter: 'blur(100px)',
          WebkitFilter: 'blur(100px)',
          background: 'radial-gradient(circle, rgba(96, 165, 250, 0.12) 0%, rgba(168, 85, 247, 0.04) 50%, transparent 80%)'
        }}
      />
    </div>
  );
}

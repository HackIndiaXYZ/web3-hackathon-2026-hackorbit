'use client';

import React, { useEffect, useRef } from 'react';
import { useSharpStore } from '@/hooks/useSharpStore';

interface CanvasNode {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
}

interface TravelPacket {
  fromIndex: number;
  toIndex: number;
  progress: number; // 0 to 1
  speed: number;
  color: string;
}

interface VisualPulse {
  x: number;
  y: number;
  radius: number;
  life: number;
  maxLife: number;
  color: string;
}

export default function VisualUniverse() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { shockwaveCount } = useSharpStore();
  
  const lastShockwave = useRef(0);
  const pulsesRef = useRef<VisualPulse[]>([]);
  const packetsRef = useRef<TravelPacket[]>([]);
  const nodesRef = useRef<CanvasNode[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = window.innerWidth;
    let height = window.innerHeight;

    const setSize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };
    setSize();
    window.addEventListener('resize', setSize);

    // Create persistent nodes
    const nodes: CanvasNode[] = Array.from({ length: 60 }).map(() => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
      radius: Math.random() * 1.5 + 0.5,
    }));
    nodesRef.current = nodes;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // 1. Draw connections first
      nodes.forEach((node, i) => {
        // Update nodes pos
        node.x += node.vx;
        node.y += node.vy;

        // Bounce off edges smoothly
        if (node.x < 0 || node.x > width) node.vx *= -1;
        if (node.y < 0 || node.y > height) node.vy *= -1;

        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(148, 163, 184, 0.25)';
        ctx.fill();

        // Draw node connections
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[j].x - node.x;
          const dy = nodes[j].y - node.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 180) {
            ctx.beginPath();
            ctx.moveTo(node.x, node.y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.strokeStyle = `rgba(148, 163, 184, ${0.07 * (1 - dist / 180)})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      });

      // 2. Draw active transaction pulses (expanding shockwaves)
      const pulses = pulsesRef.current;
      for (let i = pulses.length - 1; i >= 0; i--) {
        const p = pulses[i];
        p.life -= 1;
        p.radius += 5.5; // Expands outward rapidly

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        
        const opacity = Math.max(0, p.life / p.maxLife);
        ctx.strokeStyle = `${p.color}${opacity * 0.4})`;
        ctx.lineWidth = 3;
        ctx.stroke();

        // Internal soft filled glow ring
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius * 0.9, 0, Math.PI * 2);
        ctx.strokeStyle = `${p.color}${opacity * 0.15})`;
        ctx.lineWidth = 1;
        ctx.stroke();

        if (p.life <= 0) {
          pulses.splice(i, 1);
        }
      }

      // 3. Draw travelling data packets along connection lines
      const packets = packetsRef.current;
      for (let i = packets.length - 1; i >= 0; i--) {
        const pkt = packets[i];
        pkt.progress += pkt.speed;

        const fromNode = nodes[pkt.fromIndex];
        const toNode = nodes[pkt.toIndex];

        if (!fromNode || !toNode || pkt.progress >= 1.0) {
          packets.splice(i, 1);
          continue;
        }

        // Interpolate position
        const px = fromNode.x + (toNode.x - fromNode.x) * pkt.progress;
        const py = fromNode.y + (toNode.y - fromNode.y) * pkt.progress;

        // Draw packet point with glowing drop shadow
        ctx.save();
        ctx.beginPath();
        ctx.arc(px, py, 3.5, 0, Math.PI * 2);
        ctx.shadowColor = pkt.color.includes('59') ? '#3b82f6' : '#a855f7';
        ctx.shadowBlur = 10;
        ctx.fillStyle = pkt.color + '1)';
        ctx.fill();
        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', setSize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  // Trigger pulse & packets on shockwaveCount updates
  useEffect(() => {
    if (shockwaveCount > lastShockwave.current) {
      if (typeof window !== 'undefined' && canvasRef.current && nodesRef.current.length > 0) {
        const width = window.innerWidth;
        const height = window.innerHeight;
        const nodes = nodesRef.current;

        // 1. Spawn main screen shockwave pulse in center of viewport
        pulsesRef.current.push({
          x: width / 2,
          y: height / 2,
          radius: 10,
          life: 80,
          maxLife: 80,
          color: 'rgba(168, 85, 247, ', // purple shockwave
        });

        // 2. Also spawn localized pulse at some random node
        const randNode = nodes[Math.floor(Math.random() * nodes.length)];
        pulsesRef.current.push({
          x: randNode.x,
          y: randNode.y,
          radius: 5,
          life: 45,
          maxLife: 45,
          color: 'rgba(59, 130, 246, ', // blue pulse
        });

        // 3. Spawn a cluster of 8-12 traveling packets moving between adjacent nodes
        const numPackets = Math.floor(Math.random() * 5) + 8;
        for (let k = 0; k < numPackets; k++) {
          const fromIndex = Math.floor(Math.random() * nodes.length);
          
          // Find closest adjacent node within threshold limit to create connected line path
          let toIndex = -1;
          let minDistance = 999999;
          const fromNode = nodes[fromIndex];

          for (let idx = 0; idx < nodes.length; idx++) {
            if (idx === fromIndex) continue;
            const dx = nodes[idx].x - fromNode.x;
            const dy = nodes[idx].y - fromNode.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 200 && dist < minDistance) {
              minDistance = dist;
              toIndex = idx;
            }
          }

          if (toIndex !== -1) {
            packetsRef.current.push({
              fromIndex,
              toIndex,
              progress: 0,
              speed: 0.015 + Math.random() * 0.02,
              color: Math.random() > 0.5 ? 'rgba(59, 130, 246, ' : 'rgba(168, 85, 247, ',
            });
          }
        }
      }
    }
    lastShockwave.current = shockwaveCount;
  }, [shockwaveCount]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[10]"
      style={{ opacity: 0.85 }}
    />
  );
}

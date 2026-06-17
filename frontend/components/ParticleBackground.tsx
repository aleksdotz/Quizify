'use client';
import { useEffect, useRef } from 'react';

interface Particle { x: number; y: number; size: number; duration: number; delay: number; }

export default function ParticleBackground() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const particles: Particle[] = Array.from({ length: 22 }, () => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1.5,
      duration: Math.random() * 8 + 5,
      delay: Math.random() * 6,
    }));

    particles.forEach(p => {
      const el = document.createElement('div');
      el.className = 'particle';
      el.style.cssText = `
        left: ${p.x}%;
        top: ${p.y}%;
        width: ${p.size}px;
        height: ${p.size}px;
        animation-duration: ${p.duration}s;
        animation-delay: -${p.delay}s;
      `;
      container.appendChild(el);
    });

    return () => { container.innerHTML = ''; };
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 overflow-hidden pointer-events-none z-0"
      style={{
        background: 'radial-gradient(ellipse 70% 60% at 50% 0%, #2a1060 0%, transparent 70%), radial-gradient(ellipse 50% 40% at 80% 100%, #1a0840 0%, transparent 60%), #08061a',
      }}
    />
  );
}

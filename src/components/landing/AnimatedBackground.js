"use client";

import { useEffect, useRef } from "react";

/**
 * Animated background with elegant floating orbs, perspective grid,
 * and mouse parallax that flows smoothly behind all content and the liquid-glass navbar.
 */
export default function AnimatedBackground() {
  const containerRef = useRef(null);
  const orb1Ref = useRef(null);
  const orb2Ref = useRef(null);
  const orb3Ref = useRef(null);

  useEffect(() => {
    // Check reduced motion preference
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mediaQuery.matches) return;

    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;
    let animationFrameId;

    const handleMouseMove = (e) => {
      const { innerWidth, innerHeight } = window;
      // Normalized between -1 and 1
      targetX = (e.clientX / innerWidth - 0.5) * 2;
      targetY = (e.clientY / innerHeight - 0.5) * 2;
    };

    const animate = () => {
      // Smooth lerp
      currentX += (targetX - currentX) * 0.05;
      currentY += (targetY - currentY) * 0.05;

      if (orb1Ref.current) {
        orb1Ref.current.style.transform = `translate3d(${currentX * 30}px, ${currentY * 25}px, 0)`;
      }
      if (orb2Ref.current) {
        orb2Ref.current.style.transform = `translate3d(${-currentX * 30}px, ${-currentY * 25}px, 0)`;
      }
      if (orb3Ref.current) {
        orb3Ref.current.style.transform = `translate3d(${currentX * 18}px, ${-currentY * 18}px, 0)`;
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    animationFrameId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none"
      aria-hidden="true"
    >
      {/* Moving Perspective Grid */}
      <div className="absolute inset-0 perspective-grid opacity-60" />

      {/* Orb 1: Large soft rose/burgundy on upper-left */}
      <div
        ref={orb1Ref}
        className="absolute -top-24 -left-28 w-[540px] h-[540px] sm:w-[680px] sm:h-[680px] transition-transform duration-300 ease-out"
      >
        <div className="w-full h-full rounded-full bg-[radial-gradient(circle,rgba(185,77,107,0.22)_0%,rgba(248,228,234,0.35)_45%,transparent_70%)] blur-[70px] animate-orb-1" />
      </div>

      {/* Orb 2: Deep burgundy/rose on upper-right */}
      <div
        ref={orb2Ref}
        className="absolute -top-32 -right-32 w-[520px] h-[520px] sm:w-[640px] sm:h-[640px] transition-transform duration-300 ease-out"
      >
        <div className="w-full h-full rounded-full bg-[radial-gradient(circle,rgba(122,31,61,0.18)_0%,rgba(185,77,107,0.25)_40%,transparent_70%)] blur-[80px] animate-orb-2" />
      </div>

      {/* Orb 3: Large soft rose orb lower-center */}
      <div
        ref={orb3Ref}
        className="absolute top-[45%] left-[20%] w-[580px] h-[580px] sm:w-[720px] sm:h-[720px] transition-transform duration-300 ease-out"
      >
        <div className="w-full h-full rounded-full bg-[radial-gradient(circle,rgba(248,228,234,0.45)_0%,rgba(185,77,107,0.12)_45%,transparent_70%)] blur-[90px] animate-orb-3" />
      </div>

      {/* Orb 4: Subtle light orb near upper-center */}
      <div className="absolute top-[10%] left-[45%] w-[360px] h-[360px]">
        <div className="w-full h-full rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.7)_0%,rgba(248,228,234,0.3)_50%,transparent_75%)] blur-[60px] animate-orb-4" />
      </div>
    </div>
  );
}

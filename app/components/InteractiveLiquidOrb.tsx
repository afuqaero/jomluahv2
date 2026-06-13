"use client";

import { useEffect, useRef, useState } from "react";

export default function InteractiveLiquidOrb({ size = 256 }: { size?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const mouseRef = useRef({ x: 0, y: 0, vx: 0, vy: 0, lastX: 0, lastY: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Retina support
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = rect.height;
    const cx = width / 2;
    const cy = height / 2;

    // Scale factor relative to baseline size 256
    const scale = size / 256;
    const baseRadius = 56 * scale;
    const numPoints = 16;  // Smooth fluid contour

    interface Point {
      x: number;
      y: number;
      ox: number; // original angle
      vx: number;
      vy: number;
      tx: number; // target x
      ty: number; // target y
    }

    const points: Point[] = [];
    for (let i = 0; i < numPoints; i++) {
      const angle = (i / numPoints) * Math.PI * 2;
      const x = cx + Math.cos(angle) * baseRadius;
      const y = cy + Math.sin(angle) * baseRadius;
      points.push({
        x,
        y,
        ox: angle,
        vx: 0,
        vy: 0,
        tx: x,
        ty: y,
      });
    }

    let animationId: number;
    let time = 0;

    const animate = () => {
      time += 0.008; // Swirl speed
      ctx.clearRect(0, 0, width, height);

      // Track mouse velocity
      const mouse = mouseRef.current;
      mouse.vx = mouse.x - mouse.lastX;
      mouse.vy = mouse.y - mouse.lastY;
      mouse.lastX = mouse.x;
      mouse.lastY = mouse.y;

      const isHovering = isHovered;

      // 1. Calculate mouse compression and prepare volume expansion
      let totalCompression = 0;
      const compressions = new Array(numPoints).fill(0);
      const maxDist = 80 * scale;

      if (isHovering) {
        points.forEach((pt, idx) => {
          const dx = pt.x - mouse.x;
          const dy = pt.y - mouse.y;
          const dist = Math.hypot(dx, dy);

          if (dist < maxDist) {
            // How much the mouse is pushing this point inward
            const force = (maxDist - dist) / maxDist;
            compressions[idx] = force * 24 * scale;
            totalCompression += compressions[idx];
          }
        });
      }

      // Distribute compression to create organic fluid volume conservation bulge
      const bulgeFactor = totalCompression / numPoints;

      // 2. Update points physics with fluid properties
      points.forEach((pt, idx) => {
        // Base target with gentle organic wave
        const idleWave = Math.sin(time * 3 + idx * 0.8) * (isHovering ? 1.5 * scale : 0.8 * scale);

        // Liquid properties
        const dynamicRadius = baseRadius + idleWave - compressions[idx] + (bulgeFactor * 1.5);

        pt.tx = cx + Math.cos(pt.ox) * dynamicRadius;
        pt.ty = cy + Math.sin(pt.ox) * dynamicRadius;

        // Spring system
        const stiffness = isHovering ? 0.045 : 0.12;
        const damping = isHovering ? 0.86 : 0.88;

        const ax = (pt.tx - pt.x) * stiffness;
        const ay = (pt.ty - pt.y) * stiffness;

        pt.vx += ax;
        pt.vy += ay;

        // Apply mouse drag force to vertices
        if (isHovering) {
          const dx = pt.x - mouse.x;
          const dy = pt.y - mouse.y;
          const dist = Math.hypot(dx, dy);
          if (dist < maxDist) {
            const dragForce = (maxDist - dist) / maxDist;
            pt.vx += mouse.vx * dragForce * 0.18;
            pt.vy += mouse.vy * dragForce * 0.18;
          }
        }

        pt.vx *= damping;
        pt.vy *= damping;

        pt.x += pt.vx;
        pt.y += pt.vy;
      });

      // Helper to generate the path of the outer blob
      const traceBlobPath = () => {
        ctx.beginPath();
        const firstX = (points[0].x + points[numPoints - 1].x) / 2;
        const firstY = (points[0].y + points[numPoints - 1].y) / 2;
        ctx.moveTo(firstX, firstY);

        for (let i = 0; i < numPoints; i++) {
          const next = points[(i + 1) % numPoints];
          const xc = (points[i].x + next.x) / 2;
          const yc = (points[i].y + next.y) / 2;
          ctx.quadraticCurveTo(points[i].x, points[i].y, xc, yc);
        }
        ctx.closePath();
      };

      // Draw main body backing
      traceBlobPath();
      const baseGrad = ctx.createRadialGradient(cx, cy, 10 * scale, cx, cy, baseRadius * 1.2);
      baseGrad.addColorStop(0, "#080c21");
      baseGrad.addColorStop(0.6, "#0f172a");
      baseGrad.addColorStop(1, "#030712");
      ctx.fillStyle = baseGrad;
      ctx.fill();

      // Clip content inside the deforming fluid body
      ctx.save();
      traceBlobPath();
      ctx.clip();

      // --- Internal Floating Waves (Swirling Liquid) ---
      ctx.globalCompositeOperation = "lighter";

      // Wave 1: Neon Blue / Cyan flowing wave
      ctx.beginPath();
      ctx.moveTo(cx - baseRadius * 1.5, cy + baseRadius * 1.5);
      for (let x = cx - baseRadius * 1.5; x <= cx + baseRadius * 1.5; x += 5 * scale) {
        const waveOffset = (Math.sin(x * (0.02 / scale) + time * 1.6) * 12 + Math.cos(x * (0.01 / scale) - time * 0.8) * 8) * scale;
        const mouseDisplace = isHovering ? (mouse.y - cy) * 0.15 : 0;
        ctx.lineTo(x, cy - 8 * scale + waveOffset + mouseDisplace);
      }
      ctx.lineTo(cx + baseRadius * 1.5, cy + baseRadius * 1.5);
      ctx.lineTo(cx - baseRadius * 1.5, cy + baseRadius * 1.5);
      ctx.closePath();
      const waveGrad1 = ctx.createLinearGradient(cx, cy - baseRadius, cx, cy + baseRadius);
      waveGrad1.addColorStop(0, "rgba(59, 130, 246, 0.05)");
      waveGrad1.addColorStop(0.5, "rgba(6, 182, 212, 0.45)");
      waveGrad1.addColorStop(1, "rgba(56, 189, 248, 0.75)");
      ctx.fillStyle = waveGrad1;
      ctx.fill();

      // Wave 2: Deep Purple / Indigo flowing wave
      ctx.beginPath();
      ctx.moveTo(cx - baseRadius * 1.5, cy + baseRadius * 1.5);
      for (let x = cx - baseRadius * 1.5; x <= cx + baseRadius * 1.5; x += 5 * scale) {
        const waveOffset = (Math.sin(x * (0.035 / scale) - time * 1.2) * 10 + Math.cos(x * (0.015 / scale) + time * 0.9) * 6) * scale;
        const mouseDisplace = isHovering ? (mouse.x - cx) * 0.12 : 0;
        ctx.lineTo(x, cy + 3 * scale + waveOffset + mouseDisplace);
      }
      ctx.lineTo(cx + baseRadius * 1.5, cy + baseRadius * 1.5);
      ctx.lineTo(cx - baseRadius * 1.5, cy + baseRadius * 1.5);
      ctx.closePath();
      const waveGrad2 = ctx.createLinearGradient(cx, cy - baseRadius, cx, cy + baseRadius);
      waveGrad2.addColorStop(0, "rgba(168, 85, 247, 0)");
      waveGrad2.addColorStop(0.5, "rgba(139, 92, 246, 0.4)");
      waveGrad2.addColorStop(1, "rgba(79, 70, 229, 0.7)");
      ctx.fillStyle = waveGrad2;
      ctx.fill();

      // Wave 3: Bright Magenta / Pink Highlight Splash
      ctx.beginPath();
      ctx.moveTo(cx - baseRadius * 1.5, cy + baseRadius * 1.5);
      for (let x = cx - baseRadius * 1.5; x <= cx + baseRadius * 1.5; x += 5 * scale) {
        const waveOffset = Math.sin(x * (0.045 / scale) + time * 1.8) * 13 * scale;
        const mouseDisplace = isHovering ? (mouse.y - cy) * 0.18 : 0;
        ctx.lineTo(x, cy + 15 * scale + waveOffset + mouseDisplace);
      }
      ctx.lineTo(cx + baseRadius * 1.5, cy + baseRadius * 1.5);
      ctx.lineTo(cx - baseRadius * 1.5, cy + baseRadius * 1.5);
      ctx.closePath();
      const waveGrad3 = ctx.createLinearGradient(cx, cy - baseRadius, cx, cy + baseRadius);
      waveGrad3.addColorStop(0, "rgba(236, 72, 153, 0)");
      waveGrad3.addColorStop(0.7, "rgba(236, 72, 153, 0.35)");
      waveGrad3.addColorStop(1, "rgba(219, 39, 119, 0.65)");
      ctx.fillStyle = waveGrad3;
      ctx.fill();

      // Reset to normal
      ctx.globalCompositeOperation = "source-over";

      // 3D Glass Sphere Inner Specular Reflection
      const innerGrad = ctx.createRadialGradient(
        cx - baseRadius * 0.35,
        cy - baseRadius * 0.35,
        baseRadius * 0.1,
        cx,
        cy,
        baseRadius
      );
      innerGrad.addColorStop(0, "rgba(255, 255, 255, 0.45)");
      innerGrad.addColorStop(0.4, "rgba(255, 255, 255, 0.02)");
      innerGrad.addColorStop(0.8, "rgba(0, 0, 0, 0)");
      innerGrad.addColorStop(1, "rgba(255, 255, 255, 0.12)");
      ctx.fillStyle = innerGrad;
      ctx.fill();

      // Specular Highlight Spot
      const mxDisplaceX = isHovering ? (mouse.x - cx) * 0.1 : 0;
      const mxDisplaceY = isHovering ? (mouse.y - cy) * 0.1 : 0;

      ctx.beginPath();
      ctx.ellipse(
        cx - 16 * scale + mxDisplaceX,
        cy - 20 * scale + mxDisplaceY,
        18 * scale,
        8 * scale,
        -Math.PI / 6,
        0,
        Math.PI * 2
      );
      ctx.fillStyle = "rgba(255, 255, 255, 0.55)";
      ctx.fill();

      ctx.restore(); // Exit clip

      // Outer Neon Glowing Rim Light (Aura Ring)
      traceBlobPath();
      ctx.save();
      const strokeGrad = ctx.createLinearGradient(cx - baseRadius, cy - baseRadius, cx + baseRadius, cy + baseRadius);
      strokeGrad.addColorStop(0, "#ffffff"); // Bright white hot edge
      strokeGrad.addColorStop(0.3, "#38bdf8"); // Electric cyan
      strokeGrad.addColorStop(0.7, "#a855f7"); // Neon purple
      strokeGrad.addColorStop(1, "#3b82f6"); // Bright blue

      ctx.strokeStyle = strokeGrad;
      ctx.lineWidth = 2.5 * scale;
      ctx.shadowColor = "#38bdf8";
      ctx.shadowBlur = 15 * scale;
      ctx.stroke();
      ctx.restore();

      animationId = requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", handleResize);
    };
  }, [isHovered, size]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    mouseRef.current.x = e.clientX - rect.left;
    mouseRef.current.y = e.clientY - rect.top;
  };

  const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsHovered(true);
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    mouseRef.current.x = e.clientX - rect.left;
    mouseRef.current.y = e.clientY - rect.top;
    mouseRef.current.lastX = mouseRef.current.x;
    mouseRef.current.lastY = mouseRef.current.y;
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="relative flex items-center justify-center cursor-pointer select-none"
      style={{ width: `${size}px`, height: `${size}px` }}
    >
      {/* Outer soft ambient glow backdrop */}
      <div
        className="absolute bg-[#3b82f6]/15 rounded-full blur-3xl pointer-events-none animate-pulse"
        style={{ width: `${size * 0.56}px`, height: `${size * 0.56}px` }}
      />
      <canvas
        ref={canvasRef}
        className="w-full h-full relative z-10 pointer-events-none"
        style={{ width: `${size}px`, height: `${size}px` }}
      />
    </div>
  );
}

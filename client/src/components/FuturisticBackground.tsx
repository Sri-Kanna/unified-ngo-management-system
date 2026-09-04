import React, { useEffect, useRef } from 'react';
import { useTheme } from '../contexts/ThemeContext.js';

interface Node3D {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  baseX: number;
  baseY: number;
  baseZ: number;
}

export const FuturisticBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { theme } = useTheme();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Track mouse position
    const mouse = { x: -1000, y: -1000, radius: 150 };

    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };

    const handleMouseLeave = () => {
      mouse.x = -1000;
      mouse.y = -1000;
    };

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('resize', handleResize);

    // Particles/Nodes config
    const nodeCount = Math.min(60, Math.floor((width * height) / 25000));
    const nodes: Node3D[] = [];
    const fov = 350; // Field of view / Perspective depth

    for (let i = 0; i < nodeCount; i++) {
      // Coordinates in a 3D box of size [-width/2, width/2]
      const x = (Math.random() - 0.5) * width;
      const y = (Math.random() - 0.5) * height;
      const z = (Math.random() - 0.5) * 500;
      nodes.push({
        x,
        y,
        z,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        vz: (Math.random() - 0.5) * 0.4,
        baseX: x,
        baseY: y,
        baseZ: z,
      });
    }

    // 3D Wireframe Cube config
    interface Cube3D {
      vertices: { x: number; y: number; z: number }[];
      cx: number; // center x
      cy: number; // center y
      cz: number; // center z
      size: number;
      rx: number; // rotation angles
      ry: number;
      rz: number;
      speedX: number;
      speedY: number;
    }

    const cubes: Cube3D[] = [
      // Top left cube
      {
        vertices: [
          { x: -1, y: -1, z: -1 }, { x: 1, y: -1, z: -1 }, { x: 1, y: 1, z: -1 }, { x: -1, y: 1, z: -1 },
          { x: -1, y: -1, z: 1 }, { x: 1, y: -1, z: 1 }, { x: 1, y: 1, z: 1 }, { x: -1, y: 1, z: 1 }
        ],
        cx: -width * 0.35,
        cy: -height * 0.3,
        cz: 100,
        size: Math.min(80, width * 0.08),
        rx: 0.2, ry: 0.3, rz: 0.1,
        speedX: 0.003, speedY: 0.005
      },
      // Bottom right cube
      {
        vertices: [
          { x: -1, y: -1, z: -1 }, { x: 1, y: -1, z: -1 }, { x: 1, y: 1, z: -1 }, { x: -1, y: 1, z: -1 },
          { x: -1, y: -1, z: 1 }, { x: 1, y: -1, z: 1 }, { x: 1, y: 1, z: 1 }, { x: -1, y: 1, z: 1 }
        ],
        cx: width * 0.38,
        cy: height * 0.28,
        cz: -100,
        size: Math.min(100, width * 0.1),
        rx: 0.5, ry: 0.2, rz: 0.4,
        speedX: -0.004, speedY: 0.002
      }
    ];

    // Helper to rotate in 3D
    const rotateX = (x: number, y: number, z: number, angle: number) => {
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);
      return { x, y: y * cos - z * sin, z: y * sin + z * cos };
    };

    const rotateY = (x: number, y: number, z: number, angle: number) => {
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);
      return { x: x * cos - z * sin, y, z: x * sin + z * cos };
    };

    const rotateZ = (x: number, y: number, z: number, angle: number) => {
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);
      return { x: x * cos - y * sin, y: x * sin + y * cos, z };
    };

    // Animation Loop
    const draw = () => {
      if (!ctx || !canvas) return;

      // Clear canvas based on theme
      const isDark = theme === 'dark';
      ctx.fillStyle = isDark ? '#020617' : '#f8fafc'; // Tailwind slate-950 vs slate-50
      ctx.fillRect(0, 0, width, height);

      // Color scheme config
      const particleColor = isDark ? 'rgba(59, 102, 255, ' : 'rgba(15, 23, 42, '; // Blue vs Slate
      const lineStroke = isDark ? 'rgba(59, 102, 255, 0.06)' : 'rgba(15, 23, 42, 0.04)';
      const cubeStroke = isDark ? 'rgba(168, 85, 247, 0.18)' : 'rgba(124, 58, 237, 0.12)'; // Purple highlights
      const gridColor = isDark ? 'rgba(59, 102, 255, 0.015)' : 'rgba(59, 102, 255, 0.01)';

      // Draw subtle futuristic cyber grids (lines extending to horizon)
      ctx.strokeStyle = gridColor;
      ctx.lineWidth = 1;
      const gridSpacing = 40;
      for (let x = 0; x < width; x += gridSpacing) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSpacing) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      const centerX = width / 2;
      const centerY = height / 2;

      // 1. Draw 3D Cubes
      cubes.forEach((cube) => {
        // Adjust cube center if window resized
        if (cube.cx < 0) cube.cx = -width * 0.35;
        else cube.cx = width * 0.35;
        if (cube.cy < 0) cube.cy = -height * 0.3;
        else cube.cy = height * 0.3;

        cube.rx += cube.speedX;
        cube.ry += cube.speedY;

        // Project vertices
        const projected = cube.vertices.map((v) => {
          // Scale
          let px = v.x * cube.size;
          let py = v.y * cube.size;
          let pz = v.z * cube.size;

          // Rotate
          const r1 = rotateX(px, py, pz, cube.rx);
          const r2 = rotateY(r1.x, r1.y, r1.z, cube.ry);
          const r3 = rotateZ(r2.x, r2.y, r2.z, cube.rz);

          // Translate to center
          const tx = r3.x + cube.cx;
          const ty = r3.y + cube.cy;
          const tz = r3.z + cube.cz;

          // Perspective Projection
          const scale = fov / (fov + tz);
          const sx = centerX + tx * scale;
          const sy = centerY + ty * scale;

          return { x: sx, y: sy };
        });

        // Draw edges
        ctx.strokeStyle = cubeStroke;
        ctx.lineWidth = 1.5;

        // Edges definition for standard cube
        const edges = [
          [0, 1], [1, 2], [2, 3], [3, 0], // front face
          [4, 5], [5, 6], [6, 7], [7, 4], // back face
          [0, 4], [1, 5], [2, 6], [3, 7]  // connection lines
        ];

        edges.forEach(([p1, p2]) => {
          ctx.beginPath();
          ctx.moveTo(projected[p1].x, projected[p1].y);
          ctx.lineTo(projected[p2].x, projected[p2].y);
          ctx.stroke();
        });

        // Draw small glowing nodes at vertex points
        projected.forEach((p) => {
          ctx.fillStyle = isDark ? '#c084fc' : '#a855f7'; // purple
          ctx.beginPath();
          ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
          ctx.fill();
        });
      });

      // 2. Draw 3D Floating Particle Network
      // Slow global rotation for the whole node system
      const angleY = 0.0003;
      const angleX = 0.0001;

      nodes.forEach((node) => {
        // Rotate nodes in 3D
        const r1 = rotateY(node.x, node.y, node.z, angleY);
        const r2 = rotateX(r1.x, r1.y, r1.z, angleX);
        node.x = r2.x + node.vx;
        node.y = r2.y + node.vy;
        node.z = r2.z + node.vz;

        // Boundary bounce (relative to center coordinates)
        const limitX = width / 2 + 100;
        const limitY = height / 2 + 100;
        const limitZ = 250;

        if (Math.abs(node.x) > limitX) node.vx *= -1;
        if (Math.abs(node.y) > limitY) node.vy *= -1;
        if (Math.abs(node.z) > limitZ) node.vz *= -1;

        // Projected coordinates
        const scale = fov / (fov + node.z);
        const sx = centerX + node.x * scale;
        const sy = centerY + node.y * scale;

        // Mouse interaction (2D screen distance)
        const dx = sx - mouse.x;
        const dy = sy - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        let finalSx = sx;
        let finalSy = sy;

        if (dist < mouse.radius) {
          const force = (mouse.radius - dist) / mouse.radius;
          // Push particles slightly away
          finalSx += (dx / dist) * force * 15;
          finalSy += (dy / dist) * force * 15;
        }

        // Project size
        const radius = Math.max(0.5, scale * 1.5);
        const alpha = Math.max(0.05, Math.min(0.7, (limitZ - node.z) / (limitZ * 2)));

        ctx.fillStyle = particleColor + alpha + ')';
        ctx.beginPath();
        ctx.arc(finalSx, finalSy, radius, 0, Math.PI * 2);
        ctx.fill();

        // Connect lines
        nodes.forEach((other) => {
          if (node === other) return;

          const dx3d = node.x - other.x;
          const dy3d = node.y - other.y;
          const dz3d = node.z - other.z;
          const dist3d = Math.sqrt(dx3d * dx3d + dy3d * dy3d + dz3d * dz3d);

          if (dist3d < 180) {
            // Project other node coordinates
            const oScale = fov / (fov + other.z);
            let osx = centerX + other.x * oScale;
            let osy = centerY + other.y * oScale;

            const odx = osx - mouse.x;
            const ody = osy - mouse.y;
            const odist = Math.sqrt(odx * odx + ody * ody);

            if (odist < mouse.radius) {
              const oforce = (mouse.radius - odist) / mouse.radius;
              osx += (odx / odist) * oforce * 15;
              osy += (ody / odist) * oforce * 15;
            }

            ctx.strokeStyle = lineStroke;
            ctx.lineWidth = Math.max(0.1, 0.6 * (1 - dist3d / 180));
            ctx.beginPath();
            ctx.moveTo(finalSx, finalSy);
            ctx.lineTo(osx, osy);
            ctx.stroke();
          }
        });
      });

      // Mouse ripple indicator
      if (mouse.x !== -1000) {
        ctx.strokeStyle = isDark ? 'rgba(59, 102, 255, 0.02)' : 'rgba(59, 102, 255, 0.015)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, mouse.radius, 0, Math.PI * 2);
        ctx.stroke();
      }

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('resize', handleResize);
    };
  }, [theme]);

  return <canvas ref={canvasRef} className="fixed inset-0 w-full h-full -z-10 pointer-events-none transition-all duration-300" />;
};

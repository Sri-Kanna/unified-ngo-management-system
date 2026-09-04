import React, { useRef, useState } from 'react';
import { soundEngine } from '../utils/audio.js';

interface TiltCardProps {
  children: React.ReactNode;
  className?: string;
  maxTilt?: number;
  perspective?: number;
  scale?: number;
  enableSound?: boolean;
}

export const TiltCard: React.FC<TiltCardProps> = ({
  children,
  className = '',
  maxTilt = 8,
  perspective = 1000,
  scale = 1.015,
  enableSound = true,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [style, setStyle] = useState<React.CSSProperties>({
    transform: `perspective(${perspective}px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`,
    transition: 'transform 0.5s cubic-bezier(0.25, 1, 0.5, 1), border-color 0.3s ease',
  });
  const [glarePos, setGlarePos] = useState({ x: 50, y: 50, opacity: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    // Mouse coordinates relative to card
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Normalised coordinate mapping (-0.5 to 0.5)
    const px = x / width - 0.5;
    const py = y / height - 0.5;

    // Tilt degree calculations (Y mouse coordinates control X-axis rotation and vice versa)
    const tiltX = -py * maxTilt;
    const tiltY = px * maxTilt;

    setStyle({
      transform: `perspective(${perspective}px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale3d(${scale}, ${scale}, ${scale})`,
      transition: 'transform 0.1s ease', // Snap quickly to mouse during move
    });

    // Glare coordinates
    const glareX = (x / width) * 100;
    const glareY = (y / height) * 100;
    setGlarePos({ x: glareX, y: glareY, opacity: 0.15 });
  };

  const handleMouseEnter = () => {
    if (enableSound) {
      soundEngine.playHover();
    }
  };

  const handleMouseLeave = () => {
    setStyle({
      transform: `perspective(${perspective}px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`,
      transition: 'transform 0.5s cubic-bezier(0.25, 1, 0.5, 1)', // Return slowly to rest
    });
    setGlarePos((prev) => ({ ...prev, opacity: 0 }));
  };

  const handleClick = () => {
    if (enableSound) {
      soundEngine.playClick();
    }
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      style={style}
      className={`relative overflow-hidden cursor-pointer ${className}`}
    >
      {/* Dynamic reflections sheen/glare layer */}
      <div
        className="absolute inset-0 pointer-events-none transition-opacity duration-300"
        style={{
          background: `radial-gradient(circle 120px at ${glarePos.x}% ${glarePos.y}%, rgba(255, 255, 255, 0.4), transparent)`,
          opacity: glarePos.opacity,
          zIndex: 5,
        }}
      />
      {children}
    </div>
  );
};

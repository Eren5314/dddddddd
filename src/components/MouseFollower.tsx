import React, { useEffect, useRef } from 'react';

export const MouseFollower: React.FC = () => {
  const followerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      if (followerRef.current) {
        requestAnimationFrame(() => {
          followerRef.current!.style.background = `radial-gradient(600px circle at ${event.clientX}px ${event.clientY}px, rgba(30, 64, 175, 0.08), transparent 80%)`;
        });
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <div
      ref={followerRef}
      className="pointer-events-none fixed inset-0 z-0 transition-opacity duration-300"
      style={{
        background: 'radial-gradient(600px circle at -1000px -1000px, rgba(30, 64, 175, 0.08), transparent 80%)',
      }}
    />
  );
};

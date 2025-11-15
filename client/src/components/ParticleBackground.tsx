import { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  pulse: number;
  pulseSpeed: number;
}

export default function ParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const setCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    setCanvasSize();

    const particles: Particle[] = [];
    const particleCount = 80;

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        size: Math.random() * 2.5 + 1,
        pulse: Math.random() * Math.PI * 2,
        pulseSpeed: 0.02 + Math.random() * 0.02,
      });
    }

    let animationFrameId: number;
    let time = 0;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      time += 0.01;

      particles.forEach((particle, i) => {
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.pulse += particle.pulseSpeed;

        if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1;
        if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1;

        const pulseSize = particle.size * (1 + Math.sin(particle.pulse) * 0.3);
        const pulseOpacity = 0.5 + Math.sin(particle.pulse) * 0.3;

        const gradient = ctx.createRadialGradient(
          particle.x, particle.y, 0,
          particle.x, particle.y, pulseSize * 2
        );
        gradient.addColorStop(0, `rgba(96, 165, 250, ${pulseOpacity})`);
        gradient.addColorStop(1, 'rgba(96, 165, 250, 0)');

        ctx.beginPath();
        ctx.arc(particle.x, particle.y, pulseSize * 2, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(particle.x, particle.y, pulseSize, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(147, 51, 234, ${pulseOpacity * 0.8})`;
        ctx.fill();

        particles.forEach((otherParticle, j) => {
          if (i === j) return;
          const dx = particle.x - otherParticle.x;
          const dy = particle.y - otherParticle.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 150) {
            const opacity = 0.15 * (1 - distance / 150);
            const flowOffset = Math.sin(time + i * 0.1) * 0.5 + 0.5;
            
            ctx.beginPath();
            ctx.moveTo(particle.x, particle.y);
            ctx.lineTo(otherParticle.x, otherParticle.y);
            
            const gradient = ctx.createLinearGradient(
              particle.x, particle.y,
              otherParticle.x, otherParticle.y
            );
            gradient.addColorStop(0, `rgba(96, 165, 250, ${opacity * flowOffset})`);
            gradient.addColorStop(0.5, `rgba(147, 51, 234, ${opacity})`);
            gradient.addColorStop(1, `rgba(96, 165, 250, ${opacity * (1 - flowOffset)})`);
            
            ctx.strokeStyle = gradient;
            ctx.lineWidth = 1.5;
            ctx.stroke();

            if (distance < 100) {
              const dotProgress = (Math.sin(time * 2 + distance) + 1) / 2;
              const dotX = particle.x + (otherParticle.x - particle.x) * dotProgress;
              const dotY = particle.y + (otherParticle.y - particle.y) * dotProgress;
              
              ctx.beginPath();
              ctx.arc(dotX, dotY, 2, 0, Math.PI * 2);
              ctx.fillStyle = `rgba(147, 51, 234, ${opacity * 2})`;
              ctx.fill();
            }
          }
        });
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      setCanvasSize();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none"
      style={{ opacity: 0.5 }}
    />
  );
}

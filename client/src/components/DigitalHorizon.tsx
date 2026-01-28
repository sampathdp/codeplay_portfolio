import { useEffect, useRef } from 'react';
import { useTheme } from 'next-themes';

interface Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    radius: number;
    opacity: number;
}

export default function DigitalHorizon() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const { resolvedTheme } = useTheme();

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId: number;
        const isDark = resolvedTheme === 'dark';
        const particles: Particle[] = [];
        const particleCount = 80;
        const connectionDistance = 150;
        let mouseX = -1000;
        let mouseY = -1000;

        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        const createParticles = () => {
            particles.length = 0;
            for (let i = 0; i < particleCount; i++) {
                particles.push({
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height,
                    vx: (Math.random() - 0.5) * 0.5,
                    vy: (Math.random() - 0.5) * 0.5,
                    radius: Math.random() * 2 + 1,
                    opacity: Math.random() * 0.5 + 0.2,
                });
            }
        };

        const updateParticles = () => {
            particles.forEach(p => {
                p.x += p.vx;
                p.y += p.vy;

                // Bounce off edges
                if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
                if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

                // Slight attraction to mouse
                const dx = mouseX - p.x;
                const dy = mouseY - p.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 200 && dist > 10) {
                    p.vx += dx * 0.00005;
                    p.vy += dy * 0.00005;
                }

                // Limit velocity
                const maxSpeed = 1;
                const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
                if (speed > maxSpeed) {
                    p.vx = (p.vx / speed) * maxSpeed;
                    p.vy = (p.vy / speed) * maxSpeed;
                }
            });
        };

        const drawParticles = () => {
            if (!ctx || !canvas) return;

            const width = canvas.width;
            const height = canvas.height;

            // Clear canvas with theme-aware background
            const gradient = ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, width * 0.7);
            if (isDark) {
                gradient.addColorStop(0, '#0f172a');
                gradient.addColorStop(1, '#020617');
            } else {
                gradient.addColorStop(0, '#f1f5f9');
                gradient.addColorStop(1, '#e2e8f0');
            }
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, width, height);

            // Colors
            const particleColor = isDark ? '0, 200, 255' : '59, 130, 246';
            const lineColor = isDark ? '0, 200, 255' : '59, 130, 246';

            // Draw connections
            ctx.lineWidth = 1;
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < connectionDistance) {
                        const opacity = (1 - distance / connectionDistance) * 0.3;
                        ctx.strokeStyle = `rgba(${lineColor}, ${opacity})`;
                        ctx.beginPath();
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.stroke();
                    }
                }
            }

            // Draw particles
            particles.forEach(p => {
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(${particleColor}, ${p.opacity})`;
                ctx.fill();

                // Subtle glow
                const glowGradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius * 4);
                glowGradient.addColorStop(0, `rgba(${particleColor}, ${p.opacity * 0.3})`);
                glowGradient.addColorStop(1, 'transparent');
                ctx.fillStyle = glowGradient;
                ctx.fillRect(p.x - p.radius * 4, p.y - p.radius * 4, p.radius * 8, p.radius * 8);
            });

            // Vignette
            const vignette = ctx.createRadialGradient(width / 2, height / 2, height * 0.3, width / 2, height / 2, height);
            vignette.addColorStop(0, 'transparent');
            vignette.addColorStop(1, isDark ? 'rgba(0, 0, 0, 0.5)' : 'rgba(255, 255, 255, 0.3)');
            ctx.fillStyle = vignette;
            ctx.fillRect(0, 0, width, height);
        };

        const animate = () => {
            updateParticles();
            drawParticles();
            animationFrameId = requestAnimationFrame(animate);
        };

        const handleMouseMove = (e: MouseEvent) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
        };

        const handleMouseLeave = () => {
            mouseX = -1000;
            mouseY = -1000;
        };

        window.addEventListener('resize', resizeCanvas);
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseleave', handleMouseLeave);

        resizeCanvas();
        createParticles();
        animate();

        return () => {
            window.removeEventListener('resize', resizeCanvas);
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseleave', handleMouseLeave);
            cancelAnimationFrame(animationFrameId);
        };
    }, [resolvedTheme]);

    return (
        <canvas
            ref={canvasRef}
            className="fixed top-0 left-0 w-full h-full pointer-events-none z-0"
        />
    );
}

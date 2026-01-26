import { useEffect, useRef } from 'react';

export default function DigitalHorizon() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId: number;
        let time = 0;

        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();

        const drawGrid = () => {
            if (!ctx || !canvas) return;

            const width = canvas.width;
            const height = canvas.height;

            // Clear with valid gradient
            const gradient = ctx.createLinearGradient(0, 0, 0, height);
            gradient.addColorStop(0, '#050505');
            gradient.addColorStop(1, '#0a0f1e');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, width, height);

            const cx = width / 2;
            const cy = height / 2;
            const horizonY = height * 0.4;
            const fov = 300;

            // Grid settings
            const speed = 2; // Movement speed
            time += speed;
            const gridSize = 40; // Gap between lines

            ctx.strokeStyle = 'rgba(0, 255, 255, 0.15)'; // Cyan
            ctx.lineWidth = 1;
            ctx.beginPath();

            // Vertical lines (perspective)
            for (let x = -width; x < width * 2; x += gridSize) {
                // Simple perspective projection logic
                // We draw lines radiating from vanish point (approx)
                // Actually, let's do a floor plane projection

                // Simpler approach: Radiating lines from center horizon
                // x-coord relative to center
                const dx = x - cx;

                // We only draw the bottom half (floor)
                ctx.moveTo(x, height);
                ctx.lineTo(cx + dx * 0.1, horizonY); // Converge towards horizon
            }

            // Horizontal lines (moving towards camera)
            // Z-depth simulation
            const offset = time % gridSize;

            // Draw horizontal lines with exponential spacing to simulate depth
            for (let z = 0; z < height; z += 5) { // Step in screen space for simplicity or Z space?
                // Let's use Z-space iteration
                // z goes from near (large y) to far (horizonY)
            }

            // Alternative: Just draw parallel lines that get closer together towards horizon
            // Linear interpolation for Y

            for (let i = 0; i < 40; i++) {
                // Perspective math: Y = H / (Z)
                // Z moves with time

                let z = i * 20 - (time % 20); // Moving Z
                if (z < 1) z = 1;

                // Map Z to Screen Y
                // Near = Height, Far = HorizonY
                // Inverse relationship

                const depthFactor = 500 / (z + 50); // fake depth scaling
                const screenY = horizonY + depthFactor * (height - horizonY) * 0.5;

                if (screenY > height) continue;

                ctx.moveTo(0, screenY);
                ctx.lineTo(width, screenY);

                // Add glow effect near camera
                const alpha = Math.min(1, Math.pow(screenY / height, 3));
                ctx.strokeStyle = `rgba(0, 255, 255, ${alpha * 0.3})`;
                ctx.stroke();
                ctx.beginPath(); // reset for next line style
            }

            // Re-draw Vertical lines with correct perspective based on the horizontal logic? 
            // Keep simple radiating lines for now, but fade them out at horizon
            ctx.strokeStyle = 'rgba(0, 255, 255, 0.1)';
            ctx.beginPath();
            for (let i = -20; i <= 20; i++) {
                const x = cx + i * 100; // world x
                // simple projection: x_screen =  (x_world - cx) / z + cx ??

                ctx.moveTo(cx + i * fov * 20, height * 2);
                ctx.lineTo(cx, horizonY);
            }
            ctx.stroke();

            // Vignette
            const radialGrad = ctx.createRadialGradient(cx, cy, height * 0.4, cx, cy, height);
            radialGrad.addColorStop(0, 'transparent');
            radialGrad.addColorStop(1, '#000000');
            ctx.fillStyle = radialGrad;
            ctx.fillRect(0, 0, width, height);
        };

        const animate = () => {
            drawGrid();
            animationFrameId = requestAnimationFrame(animate);
        };

        animate();

        return () => {
            window.removeEventListener('resize', resizeCanvas);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="fixed top-0 left-0 w-full h-full pointer-events-none z-0"
        />
    );
}

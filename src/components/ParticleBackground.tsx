"use client";

import { useEffect, useRef } from "react";
import { useTheme } from "next-themes";

export function ParticleBackground() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const { resolvedTheme } = useTheme();

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        let animationFrameId: number;
        let particles: Array<{ x: number, y: number, vx: number, vy: number, size: number }> = [];

        // Mouse tracking
        const mouse = { x: -1000, y: -1000 };

        const handleMouseMove = (e: MouseEvent) => {
            mouse.x = e.clientX;
            mouse.y = e.clientY;
        };

        // Smooth reset when leaving screen
        const handleMouseLeave = () => {
            mouse.x = -1000;
            mouse.y = -1000;
        };

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            initParticles();
        };

        const initParticles = () => {
            particles = [];
            // Adjust particle count roughly based on screen area to maintain density
            const numParticles = Math.floor((canvas.width * canvas.height) / 14000);

            for (let i = 0; i < numParticles; i++) {
                particles.push({
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height,
                    vx: (Math.random() - 0.5) * 0.4,
                    vy: (Math.random() - 0.5) * 0.4,
                    size: Math.random() * 2 + 0.5,
                });
            }
        };

        const drawParticles = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            const isDark = resolvedTheme === "dark";

            const particleColor = isDark ? "rgba(255, 255, 255, 0.5)" : "rgba(37, 99, 235, 0.5)"; // White vs Blue-600
            ctx.fillStyle = particleColor;

            particles.forEach((p, index) => {
                // Base velocity
                p.x += p.vx;
                p.y += p.vy;

                // Mouse interaction (repel)
                const dxMouse = p.x - mouse.x;
                const dyMouse = p.y - mouse.y;
                const distanceMouse = Math.sqrt(dxMouse * dxMouse + dyMouse * dyMouse);
                const maxRepelDistance = 150;

                if (distanceMouse < maxRepelDistance) {
                    const force = (maxRepelDistance - distanceMouse) / maxRepelDistance;
                    // Apply a gentle push away from the mouse
                    p.x += (dxMouse / distanceMouse) * force * 2;
                    p.y += (dyMouse / distanceMouse) * force * 2;
                }

                // Bounce off edges
                if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
                if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

                // Draw particle
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fill();

                // Draw connecting lines to nearby particles
                for (let j = index + 1; j < particles.length; j++) {
                    const p2 = particles[j];
                    const dx = p.x - p2.x;
                    const dy = p.y - p2.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    // Connect if close enough
                    if (distance < 120) {
                        const opacity = isDark ? 0.15 * (1 - distance / 120) : 0.2 * (1 - distance / 120);

                        // If particles are connected, AND close to mouse, highlight the connection
                        let strokeOpacity = opacity;
                        if (distanceMouse < maxRepelDistance) {
                            strokeOpacity = opacity * 2.5; // Make connections near mouse brighter
                        }

                        ctx.beginPath();
                        ctx.strokeStyle = isDark ? `rgba(255, 255, 255, ${strokeOpacity})` : `rgba(37, 99, 235, ${strokeOpacity})`;
                        ctx.lineWidth = 1;
                        ctx.moveTo(p.x, p.y);
                        ctx.lineTo(p2.x, p2.y);
                        ctx.stroke();
                    }
                }
            });

            animationFrameId = requestAnimationFrame(drawParticles);
        };

        window.addEventListener("resize", resize);
        window.addEventListener("mousemove", handleMouseMove);
        window.addEventListener("mouseleave", handleMouseLeave);

        resize();
        drawParticles();

        return () => {
            window.removeEventListener("resize", resize);
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("mouseleave", handleMouseLeave);
            cancelAnimationFrame(animationFrameId);
        };
    }, [resolvedTheme]);

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 pointer-events-none -z-10"
            aria-hidden="true"
        />
    );
}

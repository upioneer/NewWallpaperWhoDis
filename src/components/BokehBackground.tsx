"use client";

import { useEffect, useRef } from "react";
import { useTheme } from "next-themes";

export function BokehBackground() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const { resolvedTheme } = useTheme();

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        let animationFrameId: number;
        let orbs: Array<{ x: number, y: number, vx: number, vy: number, radius: number }> = [];

        let primaryRgb = '139, 92, 246';
        const updateThemeColor = () => {
            if (typeof window !== 'undefined') {
                const hex = getComputedStyle(document.documentElement).getPropertyValue('--primary').trim();
                if (hex && hex.startsWith('#') && hex.length === 7) {
                    const r = parseInt(hex.slice(1, 3), 16);
                    const g = parseInt(hex.slice(3, 5), 16);
                    const b = parseInt(hex.slice(5, 7), 16);
                    primaryRgb = `${r}, ${g}, ${b}`;
                }
            }
        };
        updateThemeColor();
        window.addEventListener('theme-changed', updateThemeColor);

        const mouse = { x: -1000, y: -1000 };

        const handleMouseMove = (e: MouseEvent) => {
            mouse.x = e.clientX;
            mouse.y = e.clientY;
        };

        const handleMouseLeave = () => {
            mouse.x = -1000;
            mouse.y = -1000;
        };

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            initOrbs();
        };

        const initOrbs = () => {
            orbs = [];
            const numOrbs = Math.floor((canvas.width * canvas.height) / 30000); // Sparse dense

            for (let i = 0; i < numOrbs; i++) {
                orbs.push({
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height,
                    vx: (Math.random() - 0.5) * 0.2, // Very slow drift
                    vy: (Math.random() - 0.5) * 0.2,
                    radius: Math.random() * 80 + 20, // Large, soft orbs (20px to 100px)
                });
            }
        };

        const drawOrbs = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            const isDark = resolvedTheme === "dark";

            // Use global composite operation for glow effect
            ctx.globalCompositeOperation = isDark ? "screen" : "multiply";

            orbs.forEach((orb) => {
                orb.x += orb.vx;
                orb.y += orb.vy;

                // Mouse repel logic
                const dxMouse = orb.x - mouse.x;
                const dyMouse = orb.y - mouse.y;
                const distanceMouse = Math.sqrt(dxMouse * dxMouse + dyMouse * dyMouse);
                const maxRepelDistance = 250;

                if (distanceMouse < maxRepelDistance) {
                    const force = (maxRepelDistance - distanceMouse) / maxRepelDistance;
                    orb.x += (dxMouse / distanceMouse) * force * 1.5;
                    orb.y += (dyMouse / distanceMouse) * force * 1.5;
                }

                if (orb.x < -orb.radius) orb.x = canvas.width + orb.radius;
                if (orb.x > canvas.width + orb.radius) orb.x = -orb.radius;
                if (orb.y < -orb.radius) orb.y = canvas.height + orb.radius;
                if (orb.y > canvas.height + orb.radius) orb.y = -orb.radius;

                // Draw Bokeh Orb with radial gradient
                const gradient = ctx.createRadialGradient(orb.x, orb.y, 0, orb.x, orb.y, orb.radius);

                if (isDark) {
                    gradient.addColorStop(0, `rgba(${primaryRgb}, 0.25)`);
                    gradient.addColorStop(1, `rgba(${primaryRgb}, 0)`);
                } else {
                    gradient.addColorStop(0, `rgba(${primaryRgb}, 0.15)`);
                    gradient.addColorStop(1, `rgba(${primaryRgb}, 0)`);
                }

                ctx.fillStyle = gradient;
                ctx.beginPath();
                ctx.arc(orb.x, orb.y, orb.radius, 0, Math.PI * 2);
                ctx.fill();
            });

            // Reset composite operation
            ctx.globalCompositeOperation = "source-over";

            animationFrameId = requestAnimationFrame(drawOrbs);
        };

        window.addEventListener("resize", resize);
        window.addEventListener("mousemove", handleMouseMove);
        window.addEventListener("mouseleave", handleMouseLeave);

        resize();
        drawOrbs();

        return () => {
            window.removeEventListener("resize", resize);
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("mouseleave", handleMouseLeave);
            window.removeEventListener("theme-changed", updateThemeColor);
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

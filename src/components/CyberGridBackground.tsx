"use client";

import { useEffect, useRef } from "react";
import { useTheme } from "next-themes";

export function CyberGridBackground() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const { resolvedTheme } = useTheme();

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        let animationFrameId: number;

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
        const gridSize = 40;

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
            drawGrid();
        };

        const drawGrid = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            const isDark = resolvedTheme === "dark";

            const baseColor = isDark ? "rgba(255, 255, 255, 0.03)" : "rgba(0, 0, 0, 0.03)";

            ctx.lineWidth = 1;
            // For subtle pulse if desired

            // Draw vertical lines
            for (let x = 0; x <= canvas.width; x += gridSize) {
                for (let y = 0; y <= canvas.height; y += gridSize) {

                    const dx = x - mouse.x;
                    const dy = y - mouse.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    const highlightRadius = 200;

                    // Draw Line Segments individually to apply gradient/glow near mouse
                    ctx.beginPath();
                    ctx.moveTo(x, y);
                    ctx.lineTo(x, y + gridSize);

                    if (distance < highlightRadius) {
                        const intensity = 1 - (distance / highlightRadius);
                        ctx.strokeStyle = `rgba(${primaryRgb}, ${intensity * 0.4})`;
                        ctx.lineWidth = 1.5;
                    } else {
                        ctx.strokeStyle = baseColor;
                        ctx.lineWidth = 1;
                    }
                    ctx.stroke();

                    // Draw Horizontal Segments
                    ctx.beginPath();
                    ctx.moveTo(x, y);
                    ctx.lineTo(x + gridSize, y);
                    if (distance < highlightRadius) {
                        const intensity = 1 - (distance / highlightRadius);
                        ctx.strokeStyle = `rgba(${primaryRgb}, ${intensity * 0.4})`;
                        ctx.lineWidth = 1.5;
                    } else {
                        ctx.strokeStyle = baseColor;
                        ctx.lineWidth = 1;
                    }
                    ctx.stroke();

                    // Optional: Draw intersection nodes
                    if (distance < highlightRadius) {
                        const intensity = 1 - (distance / highlightRadius);
                        ctx.beginPath();
                        ctx.fillStyle = `rgba(${primaryRgb}, ${intensity * 0.8})`;
                        ctx.arc(x, y, 1.5, 0, Math.PI * 2);
                        ctx.fill();
                    }
                }
            }

            animationFrameId = requestAnimationFrame(drawGrid);
        };

        window.addEventListener("resize", resize);
        window.addEventListener("mousemove", handleMouseMove);
        window.addEventListener("mouseleave", handleMouseLeave);

        resize();
        drawGrid();

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

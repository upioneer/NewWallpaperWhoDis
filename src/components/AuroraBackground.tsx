"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function AuroraBackground() {
    const { resolvedTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    const isDark = resolvedTheme === "dark";

    return (
        <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
            <div className={`absolute inset-0 transition-opacity duration-1000 ${isDark ? 'opacity-30' : 'opacity-40'}`}>
                {/* 
                    Aurora CSS Animation Effect
                    Utilizes nested blurred radial gradients with slow, looping transform animations
                */}
                <div className="absolute top-[-50%] left-[-10%] w-[70vw] h-[70vw] rounded-full mix-blend-screen filter blur-[100px] opacity-60 animate-blob bg-purple-500/40"></div>
                <div className="absolute top-[-20%] right-[-10%] w-[60vw] h-[60vw] rounded-full mix-blend-screen filter blur-[100px] opacity-60 animate-blob animation-delay-2000 bg-cyan-400/40"></div>
                <div className="absolute bottom-[-40%] left-[20%] w-[80vw] h-[80vw] rounded-full mix-blend-screen filter blur-[100px] opacity-60 animate-blob animation-delay-4000 bg-blue-500/40"></div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes blob {
                    0% { transform: translate(0px, 0px) scale(1); }
                    33% { transform: translate(30px, -50px) scale(1.1); }
                    66% { transform: translate(-20px, 20px) scale(0.9); }
                    100% { transform: translate(0px, 0px) scale(1); }
                }
                .animate-blob {
                    animation: blob 15s infinite alternate ease-in-out;
                }
                .animation-delay-2000 {
                    animation-delay: 2s;
                }
                .animation-delay-4000 {
                    animation-delay: 4s;
                }
            `}} />
        </div>
    );
}

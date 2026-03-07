"use client";
import { useState, useEffect } from "react";

export function ClockWidget() {
    const [time, setTime] = useState<Date | null>(null);

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        setTimeout(() => setTime(new Date()), 0);
        return () => clearInterval(timer);
    }, []);

    if (!time) return null;

    return (
        <div className="text-white text-6xl md:text-8xl font-bold tracking-tight drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)] flex flex-col items-center">
            {time.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
            <span className="text-2xl md:text-3xl font-medium tracking-normal opacity-90 mt-2 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                {time.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })}
            </span>
        </div>
    );
}

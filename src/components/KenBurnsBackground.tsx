"use client";

import { useEffect, useState } from "react";
import { ImageMetadata } from "@/lib/db";

export function KenBurnsBackground({ images }: { images: ImageMetadata[] }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        // eslint-disable-next-line
        setMounted(true);
        // Slowly crossfade Ken Burns images every 12 seconds
        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % Math.max(images.length, 1));
        }, 12000);
        return () => clearInterval(interval);
    }, [images]);

    if (!mounted || images.length === 0) return null;

    return (
        <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden bg-black">
            {images.map((img, index) => {
                const isActive = index === currentIndex;

                return (
                    <div
                        key={img.id}
                        className={`absolute inset-0 transition-opacity duration-[3000ms] ease-in-out ${isActive ? "opacity-20 z-0" : "opacity-0 -z-10"
                            }`}
                    >
                        {/* 
                            Ken Burns Effect CSS
                            Image starts slightly zoomed in and slowly scales/pans 
                         */}
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={`/api/raw/${img.id}`}
                            alt=""
                            className={`w-full h-full object-cover origin-center transition-transform duration-[15000ms] ease-linear overflow-hidden ${isActive ? "scale-110 translate-x-1" : "scale-100 translate-x-0"
                                }`}
                        />
                    </div>
                );
            })}
        </div>
    );
}

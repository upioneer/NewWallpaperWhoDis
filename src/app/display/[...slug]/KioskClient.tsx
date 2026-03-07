"use client";
import { useState, useEffect } from "react";

interface KioskClientProps {
    slug: string;
    intervalSeconds?: number;
    triggerType: string;
    transitionType: string;
    initialImageId?: string;
}

export function KioskClient({ slug, intervalSeconds, transitionType, initialImageId }: KioskClientProps) {
    // Avoid impure function call on initial render
    const [layerA, setLayerA] = useState(`/${slug}`);
    const [layerB, setLayerB] = useState<string | null>(null);
    const [activeLayer, setActiveLayer] = useState<'A' | 'B'>('A');
    const [lastImageId, setLastImageId] = useState(initialImageId);

    const swapImage = () => {
        const url = `/${slug}?t=${Date.now()}`;
        setActiveLayer(prev => {
            if (prev === 'A') {
                setLayerB(url);
                return 'B';
            } else {
                setLayerA(url);
                return 'A';
            }
        });
    }

    useEffect(() => {
        // Organic Reload JS override. Take over from native browser behavior.
        const metaRefresh = document.querySelector('meta[http-equiv="refresh"]');
        if (metaRefresh) metaRefresh.remove();

        // 1. Time-based local rotation
        let localTimer: NodeJS.Timeout;
        if (intervalSeconds && intervalSeconds > 0) {
            localTimer = setInterval(() => {
                // If it's a random or time profile, we swap it on this local native interval.
                swapImage();
            }, intervalSeconds * 1000);
        }

        // 2. State Polling (for external manual override "Request" triggers)
        const pollApi = async () => {
            try {
                const res = await fetch(`/api/display/${slug}`);
                if (res.ok) {
                    const data = await res.json();

                    if (data.profile?.currentImageId && data.profile.currentImageId !== lastImageId) {
                        setLastImageId(data.profile.currentImageId);
                        swapImage();

                        // Reset the automatic rotation clock since we just forced a change
                        if (localTimer && intervalSeconds && intervalSeconds > 0) {
                            clearInterval(localTimer);
                            localTimer = setInterval(swapImage, intervalSeconds * 1000);
                        }
                    }
                }
            } catch {
                // Silently swallow network drops
            }
        };

        const pollTimer = setInterval(pollApi, 8000); // 8 second rapid polling

        return () => {
            clearInterval(localTimer);
            clearInterval(pollTimer);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [slug, intervalSeconds, lastImageId]);

    const getTransitionClass = (isActive: boolean) => {
        if (transitionType === "none") return `absolute inset-0 w-full h-full object-cover ` + (isActive ? "opacity-100" : "opacity-0 hidden");

        // Ensure layer is always positioned absolute and fills
        const base = "absolute inset-0 w-full h-full object-cover overflow-hidden transition-all ease-in-out ";

        if (transitionType === "fade") {
            return base + `duration-1000 ${isActive ? "opacity-100" : "opacity-0"}`;
        }
        if (transitionType === "slide") {
            return base + `duration-1000 ${isActive ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-full"}`;
        }
        if (transitionType === "kenburns") {
            return base + `duration-1000 origin-center ${isActive ? "opacity-100" : "opacity-0"} ` +
                (isActive ? "scale-110 transition-transform duration-[40000ms] ease-linear" : "scale-100 transition-none");
        }
        return base;
    }

    return (
        <div className="absolute inset-0 bg-black overflow-hidden z-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={layerA} className={getTransitionClass(activeLayer === 'A')} alt="" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {layerB && <img src={layerB} className={getTransitionClass(activeLayer === 'B')} alt="" />}
        </div>
    );
}

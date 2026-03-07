"use client";
import { MapPin } from "lucide-react";

export function LocationWidget({ targetLocation }: { targetLocation?: string }) {
    if (!targetLocation) return null;

    return (
        <div className="flex items-center gap-3 text-white text-xl md:text-3xl font-medium tracking-wide drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)] bg-black/20 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/10">
            <MapPin size={28} className="opacity-80 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]" />
            <span>{targetLocation}</span>
        </div>
    );
}

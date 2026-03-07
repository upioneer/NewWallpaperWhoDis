"use client";

export function TextWidget({ text }: { text?: string }) {
    if (!text) return null;

    return (
        <div className="text-white text-2xl md:text-4xl font-semibold tracking-wide max-w-2xl text-center leading-snug drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)] px-6 py-4 bg-black/20 backdrop-blur-md rounded-3xl border border-white/10">
            {text}
        </div>
    );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Images, User, Settings } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";

interface NavProps {
    title: string;
}

export function GlobalNav({ title }: NavProps) {
    const pathname = usePathname();

    const pillItems = [
        { href: "/", icon: <Home size={18} />, label: "Dashboard" },
        { href: "/gallery", icon: <Images size={18} />, label: "Gallery" },
        { href: "/profiles", icon: <User size={18} />, label: "Profiles" },
        { href: "/settings", icon: <Settings size={18} />, label: "Settings" },
    ];

    return (
        <header className="sticky top-0 z-[150] w-full border-b border-[var(--border)] bg-[var(--background)]/80 backdrop-blur-md">
            <div className="container mx-auto px-4 h-16 grid grid-cols-3 items-center">

                {/* Left: Navigation Pill */}
                <div className="flex justify-start">
                    <div className="flex items-center p-1 bg-[var(--card)]/60 backdrop-blur-md border border-[var(--border)] rounded-xl shadow-sm">
                        {pillItems.map((item) => {
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    title={item.label}
                                    className={`relative px-4 py-2 rounded-lg flex items-center justify-center transition-all ${isActive
                                        ? "text-[var(--primary-foreground)] font-medium shadow-md group"
                                        : "text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--accent)]"
                                        }`}
                                >
                                    {isActive && (
                                        <div className="absolute inset-0 bg-[var(--primary)] rounded-lg -z-10 animate-in fade-in zoom-in-95" />
                                    )}
                                    {item.icon}
                                </Link>
                            );
                        })}
                    </div>
                </div>

                {/* Center: Branding / Current Page Title */}
                <div className="flex justify-center items-center gap-2 font-bold text-lg tracking-tight whitespace-nowrap">
                    <span>{title}</span>
                </div>

                {/* Right: Settings & Utilities */}
                <div className="flex justify-end items-center gap-3">
                    <ThemeToggle />
                </div>
            </div>
        </header>
    );
}

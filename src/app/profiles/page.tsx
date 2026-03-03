import { ParticleBackground } from "@/components/ParticleBackground";
import { AuroraBackground } from "@/components/AuroraBackground";
import { BokehBackground } from "@/components/BokehBackground";
import { KenBurnsBackground } from "@/components/KenBurnsBackground";
import { CyberGridBackground } from "@/components/CyberGridBackground";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ProfileListClient } from "@/components/ProfileListClient";
import { Monitor, ArrowLeft, Settings } from "lucide-react";
import Link from "next/link";
import { readDb } from "@/lib/db";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ProfilesPage() {
    const db = await readDb();
    const settings = db.settings || { dashboardBackground: "particles", galleryWidgetBackground: "random", galleryWidgetBlur: "none" };
    const profiles = Object.values(db.profiles || {});
    // Extract unique orientations to use as Profile scopes
    const images = Object.values(db.images || {});
    const uniqueCategories = ["All", ...Array.from(new Set(images.map((img: any) => img.orientation || "Unknown")))];
    const uniqueLuminosities = ["All", "Light", "Dark"];
    return (
        <div className="relative min-h-screen">
            {settings.dashboardBackground === "aurora" ? <AuroraBackground /> :
                settings.dashboardBackground === "bokeh" ? <BokehBackground /> :
                    settings.dashboardBackground === "kenburns" ? <KenBurnsBackground images={[...images].sort(() => 0.5 - Math.random()).slice(0, 15)} /> :
                        settings.dashboardBackground === "cybergrid" ? <CyberGridBackground /> :
                            <ParticleBackground />}

            {/* Navbar Shell */}
            <header className="sticky top-0 z-50 w-full border-b border-[var(--border)] bg-[var(--background)]/80 backdrop-blur-md">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/" className="p-2 hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)] rounded-full transition-colors mr-2">
                            <ArrowLeft size={20} />
                        </Link>
                        <div className="flex items-center gap-2 font-bold text-lg tracking-tight">
                            <Monitor className="text-[var(--primary)]" size={24} />
                            <span>New Wallpaper Who Dis</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <Link href="/settings" className="p-2 hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)] rounded-full transition-colors" title="System Settings">
                            <Settings size={20} />
                        </Link>
                        <ThemeToggle />
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-4 pt-12 pb-24 max-w-5xl">
                <ProfileListClient initialProfiles={profiles} categories={uniqueCategories} luminosities={uniqueLuminosities} />
            </main>
        </div>
    );
}

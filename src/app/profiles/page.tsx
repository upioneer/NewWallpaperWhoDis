import { ParticleBackground } from "@/components/ParticleBackground";
import { AuroraBackground } from "@/components/AuroraBackground";
import { BokehBackground } from "@/components/BokehBackground";
import { KenBurnsBackground } from "@/components/KenBurnsBackground";
import { CyberGridBackground } from "@/components/CyberGridBackground";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ProfileListClient } from "@/components/ProfileListClient";
import { User } from "lucide-react";
import { GlobalNav } from "@/components/GlobalNav";
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
    const collections = Object.keys(db.collections || {}).sort((a, b) => a.localeCompare(b));

    return (
        <div className="relative min-h-screen">
            {settings.dashboardBackground === "aurora" ? <AuroraBackground /> :
                settings.dashboardBackground === "bokeh" ? <BokehBackground /> :
                    settings.dashboardBackground === "kenburns" ? <KenBurnsBackground images={[...images].sort(() => 0.5 - Math.random()).slice(0, 15)} /> :
                        settings.dashboardBackground === "cybergrid" ? <CyberGridBackground /> :
                            <ParticleBackground />}

            <GlobalNav title="Profiles & Slugs" />

            <main className="container mx-auto px-4 pt-12 pb-24 max-w-5xl">
                <ProfileListClient initialProfiles={profiles} categories={uniqueCategories} luminosities={uniqueLuminosities} collections={collections} />
            </main>
        </div>
    );
}

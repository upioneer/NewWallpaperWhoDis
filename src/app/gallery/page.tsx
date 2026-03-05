import { ParticleBackground } from "@/components/ParticleBackground";
import { AuroraBackground } from "@/components/AuroraBackground";
import { BokehBackground } from "@/components/BokehBackground";
import { KenBurnsBackground } from "@/components/KenBurnsBackground";
import { CyberGridBackground } from "@/components/CyberGridBackground";
import { GlobalNav } from "@/components/GlobalNav";
import { readDb, ImageMetadata } from "@/lib/db";
import { GalleryClient } from "@/components/GalleryClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function GalleryPage() {
    const db = await readDb();
    const settings = db.settings || { dashboardBackground: "particles", galleryWidgetBackground: "random", galleryWidgetBlur: "none" };
    const images = Object.values(db.images || {}).sort((a: ImageMetadata, b: ImageMetadata) =>
        new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime()
    );
    const collections = Object.entries(db.collections || {}).map(([name, imgs]) => ({
        name,
        images: imgs as string[]
    }));

    // eslint-disable-next-line
    const randomImages = [...images].sort(() => 0.5 - Math.random()).slice(0, 15);

    return (
        <div className="relative min-h-screen">
            {settings.dashboardBackground === "aurora" ? <AuroraBackground /> :
                settings.dashboardBackground === "bokeh" ? <BokehBackground /> :
                    settings.dashboardBackground === "kenburns" ? <KenBurnsBackground images={randomImages} /> :
                        settings.dashboardBackground === "cybergrid" ? <CyberGridBackground /> :
                            <ParticleBackground />}

            <GlobalNav title="Wallpaper Library" />

            <main className="container mx-auto px-4 pt-12 pb-24 max-w-7xl">
                <GalleryClient initialImages={images} initialCollections={collections} />
            </main>
        </div>
    );
}

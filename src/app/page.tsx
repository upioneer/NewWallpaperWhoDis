import { ParticleBackground } from "@/components/ParticleBackground";
import { AuroraBackground } from "@/components/AuroraBackground";
import { BokehBackground } from "@/components/BokehBackground";
import { KenBurnsBackground } from "@/components/KenBurnsBackground";
import { CyberGridBackground } from "@/components/CyberGridBackground";
import { ThemeToggle } from "@/components/ThemeToggle";
import { UploadDropzone } from "@/components/UploadDropzone";
import { StorageWidget } from "@/components/StorageWidget";
import { Monitor, Images, Settings, User } from "lucide-react";
import { readDb } from "@/lib/db";
import Link from 'next/link';
import { GlobalNav } from "@/components/GlobalNav";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function Home() {
  let imageCount = 0;
  let previewImages: any[] = [];
  let blurClass = "blur-xl"; // Default "lots"
  let settings: any = { dashboardBackground: "particles", galleryWidgetBackground: "random", galleryWidgetBlur: "none" };
  let images: any[] = [];

  try {
    const db = await readDb();
    if (db.settings) settings = db.settings;
    if (db.images) images = Object.values(db.images);
    imageCount = images.length;

    // Set dynamic blur class based on settings
    if (settings.galleryWidgetBlur === "none") blurClass = "blur-none";
    if (settings.galleryWidgetBlur === "some") blurClass = "blur-sm";

    if (settings.galleryWidgetBackground !== "disabled") {
      let tempImages = [...images];
      if (settings.galleryWidgetBackground === "random") {
        tempImages = tempImages.sort(() => 0.5 - Math.random());
      } else {
        // "recent"
        tempImages = tempImages.sort((a: any, b: any) => new Date(b.uploadDate || 0).getTime() - new Date(a.uploadDate || 0).getTime());
      }
      previewImages = tempImages.slice(0, 6);
    }

  } catch (e) {
    console.error("Home Page: Failed to read DB", e);
  }
  return (
    <div className="relative min-h-screen">
      {settings.dashboardBackground === "aurora" ? <AuroraBackground /> :
        settings.dashboardBackground === "bokeh" ? <BokehBackground /> :
          settings.dashboardBackground === "kenburns" ? <KenBurnsBackground images={[...images].sort(() => 0.5 - Math.random()).slice(0, 15)} /> :
            settings.dashboardBackground === "cybergrid" ? <CyberGridBackground /> :
              <ParticleBackground />}

      <GlobalNav title="New Wallpaper Who Dis" />

      {/* Main Content Dashboard */}
      <main className="container mx-auto px-4 pt-12 pb-24">

        <section className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
            Manage your <span className="text-[var(--primary)] text-transparent bg-clip-text bg-gradient-to-r from-[var(--primary)] to-violet-500">screens</span> effortlessly
          </h1>
          <p className="text-lg text-[var(--muted-foreground)] max-w-2xl mx-auto">
            Upload, tag, and assign wallpapers to rotating static URLs
          </p>
        </section>

        {/* Dashboard Grid 2x2 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Top Row: Upload & Gallery */}
          <div className="h-[450px]">
            <UploadDropzone />
          </div>

          <div className="relative p-6 rounded-xl border border-[var(--border)] bg-[var(--card)]/60 backdrop-blur-md shadow-sm transition hover:shadow-md flex flex-col justify-between h-[450px] overflow-hidden group">

            {/* Blurred Abstract Wallpaper Preview */}
            {previewImages.length > 0 && (
              <div className={`absolute inset-0 z-0 grid grid-cols-2 gap-1 p-2 opacity-60 mix-blend-luminosity group-hover:scale-105 group-hover:opacity-80 transition-all duration-700 pointer-events-none ${blurClass}`}>
                {previewImages.map((img: any) => (
                  <img
                    key={img.id}
                    src={`/api/raw/${img.id}`}
                    alt=""
                    className="w-full h-full object-cover rounded"
                  />
                ))}
              </div>
            )}

            {/* Contrast Gradient Overlay */}
            {previewImages.length > 0 && (
              <div className="absolute inset-0 z-0 bg-gradient-to-t from-[var(--background)] via-[var(--background)]/80 to-[var(--background)]/30 pointer-events-none transition-opacity group-hover:opacity-90" />
            )}

            {/* Widget Content */}
            <div className="relative z-10 flex flex-col h-full justify-between">
              <div>
                <div className="h-10 w-10 bg-[var(--primary)]/20 rounded-lg flex items-center justify-center mb-4 shadow-sm backdrop-blur-md">
                  <Images className="text-[var(--primary)]" />
                </div>
                <h3 className="text-xl font-bold mb-2">Gallery</h3>
                <p className="text-[var(--muted-foreground)] mb-4 font-medium drop-shadow-sm">View your available library, delete unused images, and manage categorization tags</p>
              </div>
              <Link href="/gallery" className="mt-auto">
                <button className="w-full py-2 px-4 rounded-lg bg-[var(--primary)]/90 hover:bg-[var(--primary)] text-[var(--primary-foreground)] font-medium hover:scale-[1.02] active:scale-[0.98] transition-all shadow-md backdrop-blur-md border border-[var(--primary)]/20">
                  Browse Gallery
                </button>
              </Link>
            </div>
          </div>

          {/* Bottom Row: Profiles & Storage */}
          <div className="p-6 rounded-xl border border-[var(--border)] bg-[var(--card)]/60 backdrop-blur-md shadow-sm transition hover:shadow-md flex flex-col justify-between min-h-[200px]">
            <div>
              <div className="h-10 w-10 bg-[var(--primary)]/10 rounded-lg flex items-center justify-center mb-4">
                <User className="text-[var(--primary)]" />
              </div>
              <h3 className="text-xl font-bold mb-2">Profiles & Slugs</h3>
              <p className="text-[var(--muted-foreground)] mb-4">Create mapping parameters and configure dynamic rotation schedules</p>
            </div>
            <Link href="/profiles" className="mt-auto">
              <button className="w-full py-2 px-4 rounded-lg bg-[var(--primary)] text-[var(--primary-foreground)] font-medium hover:scale-105 active:scale-95 transition-transform">
                Configure
              </button>
            </Link>
          </div>

          <StorageWidget initialCount={imageCount} />

        </div>

      </main>
    </div>
  );
}

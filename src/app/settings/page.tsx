
import { ThemeToggle } from "@/components/ThemeToggle";
import { Monitor, ArrowLeft, Settings } from "lucide-react";
import Link from "next/link";
import { readDb } from "@/lib/db";
import { SettingsClient } from "@/components/SettingsClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function SettingsPage() {
    const db = await readDb();
    const settings = db.settings || { dashboardBackground: "particles", galleryWidgetBackground: "random", galleryWidgetBlur: "none" };
    const images = Object.values(db.images || {});

    return (
        <div className="relative min-h-screen">
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
                        <ThemeToggle />
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-4 pt-12 pb-24 max-w-3xl">
                <div className="flex items-center gap-3 mb-8">
                    <div className="p-3 bg-[var(--primary)]/10 text-[var(--primary)] rounded-xl">
                        <Settings size={28} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-extrabold tracking-tight">System Settings</h1>
                        <p className="text-[var(--muted-foreground)]">Manage application behaviors, aesthetics, and engine preferences</p>
                    </div>
                </div>

                {/* Inject interactive Client logic here securely padded with serverside prop data */}
                <SettingsClient initialSettings={db.settings} backgroundImages={[...images].sort(() => 0.5 - Math.random()).slice(0, 15)} />

            </main>
        </div>
    );
}

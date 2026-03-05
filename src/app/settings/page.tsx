
import { Settings } from "lucide-react";
import { GlobalNav } from "@/components/GlobalNav";
import { readDb } from "@/lib/db";
import { SettingsClient } from "@/components/SettingsClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function SettingsPage() {
    const db = await readDb();

    const images = Object.values(db.images || {});

    // eslint-disable-next-line
    const randomImages = [...images].sort(() => 0.5 - Math.random()).slice(0, 15);

    return (
        <div className="relative min-h-screen">
            <GlobalNav title="System Settings" />

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
                <SettingsClient initialSettings={db.settings} backgroundImages={randomImages} />

            </main>
        </div>
    );
}

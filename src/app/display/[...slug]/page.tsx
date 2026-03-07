import { getProfileBySlug } from "@/lib/profiles";
import { readDb } from "@/lib/db";
import { WidgetGrid } from "@/components/widgets/WidgetGrid";
import { KioskClient } from "./KioskClient";
import { notFound } from "next/navigation";

export const metadata = {
    title: 'Display Kiosk',
};

export default async function DisplayPage({ params }: { params: Promise<{ slug: string[] }> }) {
    const slugArray = (await params).slug;
    const slug = slugArray.join("/");

    const profile = await getProfileBySlug(slug);
    if (!profile) return notFound();

    const db = await readDb();
    const settings = db.settings;

    const intervalSeconds = profile.triggerType === "time" ? (profile.intervalMinutes || 60) * 60 : undefined;

    return (
        <main className="w-screen h-screen overflow-hidden bg-black fixed inset-0">
            {intervalSeconds && intervalSeconds > 0 && (
                <head>
                    {/* Organic Fallback: Natively reload HTML page based on Time interval if JS fails */}
                    <meta httpEquiv="refresh" content={`${intervalSeconds}`} />
                </head>
            )}

            <KioskClient
                slug={slug}
                intervalSeconds={intervalSeconds}
                triggerType={profile.triggerType}
                transitionType={settings.kioskTransition || "fade"}
                initialImageId={profile.currentImageId}
            />

            <WidgetGrid
                widgets={profile.kioskWidgets || []}
                weatherApiKey={settings.weatherApiKey}
                targetLocation={settings.targetLocation}
            />
        </main>
    );
}

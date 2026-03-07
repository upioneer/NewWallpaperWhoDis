import { NextRequest, NextResponse } from "next/server";
import { readDb } from "@/lib/db";
import { getProfileBySlug } from "@/lib/profiles";

export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string[] }> }) {
    try {
        const slugArray = (await params).slug;
        const slug = slugArray.join("/"); // Handle nested slugs

        const profile = await getProfileBySlug(slug);

        if (!profile) {
            return NextResponse.json({ error: "Profile Not Found" }, { status: 404 });
        }

        const db = await readDb();

        return NextResponse.json({
            profile: {
                id: profile.id,
                name: profile.name,
                triggerType: profile.triggerType,
                intervalMinutes: profile.intervalMinutes,
                currentImageId: profile.currentImageId
            },
            settings: {
                kioskTransition: db.settings.kioskTransition || "fade",
                kioskWidgets: profile.kioskWidgets || [],
                weatherApiKey: db.settings.weatherApiKey,
                targetLocation: db.settings.targetLocation
            }
        });

    } catch (error) {
        console.error("Display API Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

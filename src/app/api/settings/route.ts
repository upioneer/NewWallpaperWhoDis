import { NextRequest, NextResponse } from "next/server";
import { readDb, writeDb, SystemSettings } from "@/lib/db";

export async function GET() {
    try {
        const db = await readDb();
        return NextResponse.json({ settings: db.settings });
    } catch (error) {
        console.error("Failed to fetch settings:", error);
        return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { galleryWidgetBackground, galleryWidgetBlur, dashboardBackground, theme, hasCompletedOnboarding } = body;

        const db = await readDb();

        // Extend existing settings or create fresh
        const currentSettings = db.settings || { galleryWidgetBackground: "random", galleryWidgetBlur: "lots" };

        const newSettings: SystemSettings = {
            ...currentSettings,
            galleryWidgetBackground: galleryWidgetBackground || currentSettings.galleryWidgetBackground,
            galleryWidgetBlur: galleryWidgetBlur || currentSettings.galleryWidgetBlur,
            dashboardBackground: dashboardBackground || currentSettings.dashboardBackground,
            theme: theme || currentSettings.theme || "theme-origin",
            hasCompletedOnboarding: hasCompletedOnboarding !== undefined ? hasCompletedOnboarding : currentSettings.hasCompletedOnboarding
        };

        db.settings = newSettings;
        await writeDb(db);

        return NextResponse.json({ success: true, settings: newSettings });

    } catch (error) {
        console.error("Failed to update settings:", error);
        return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
    }
}

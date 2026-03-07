import { NextRequest, NextResponse } from "next/server";
import { readDb, writeDb, SystemSettings } from "@/lib/db";
import os from "os";

export async function GET() {
    try {
        const db = await readDb();

        let localIp = "localhost";
        const interfaces = os.networkInterfaces();
        for (const name of Object.keys(interfaces)) {
            for (const iface of interfaces[name]!) {
                if (iface.family === 'IPv4' && !iface.internal) {
                    localIp = iface.address;
                    break;
                }
            }
        }

        return NextResponse.json({ settings: db.settings, localIp });
    } catch (error) {
        console.error("Failed to fetch settings:", error);
        return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const {
            galleryWidgetBackground,
            galleryWidgetBlur,
            dashboardBackground,
            theme,
            hasCompletedOnboarding,
            kioskTransition,
            weatherApiKey,
            targetLocation,
            publicDomain,
            urlDisplayPreference
        } = body;

        const db = await readDb();

        // Extend existing settings or create fresh
        const currentSettings = db.settings || { galleryWidgetBackground: "random", galleryWidgetBlur: "lots" };

        const newSettings: SystemSettings = {
            ...currentSettings,
            galleryWidgetBackground: galleryWidgetBackground || currentSettings.galleryWidgetBackground,
            galleryWidgetBlur: galleryWidgetBlur || currentSettings.galleryWidgetBlur,
            dashboardBackground: dashboardBackground || currentSettings.dashboardBackground,
            theme: theme || currentSettings.theme || "theme-origin",
            hasCompletedOnboarding: hasCompletedOnboarding !== undefined ? hasCompletedOnboarding : currentSettings.hasCompletedOnboarding,
            kioskTransition: kioskTransition !== undefined ? kioskTransition : currentSettings.kioskTransition,
            weatherApiKey: weatherApiKey !== undefined ? weatherApiKey : currentSettings.weatherApiKey,
            targetLocation: targetLocation !== undefined ? targetLocation : currentSettings.targetLocation,
            publicDomain: publicDomain !== undefined ? publicDomain : currentSettings.publicDomain,
            urlDisplayPreference: urlDisplayPreference !== undefined ? urlDisplayPreference : currentSettings.urlDisplayPreference
        };

        db.settings = newSettings;
        await writeDb(db);

        return NextResponse.json({ success: true, settings: newSettings });

    } catch (error) {
        console.error("Failed to update settings:", error);
        return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
    }
}

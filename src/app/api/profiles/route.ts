import { NextRequest, NextResponse } from "next/server";
import { addProfile } from "@/lib/profiles";

// POST /api/profiles - Create a new profile
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { name, slug, triggerType, intervalMinutes, filters } = body;

        // Basic validation
        if (!name || !slug || !triggerType) {
            return NextResponse.json({ error: "Missing required fields (name, slug, triggerType)" }, { status: 400 });
        }

        if (!/^[a-z0-9-]+$/.test(slug)) {
            return NextResponse.json({ error: "Slug must contain only lowercase letters, numbers, and hyphens" }, { status: 400 });
        }

        // Pass correctly mapped parameters. db.json handles uuid and createdAt
        const newProfile = await addProfile({
            name,
            slug,
            triggerType,
            intervalMinutes,
            filters: filters || {}
        });

        return NextResponse.json({ success: true, profile: newProfile });

    } catch (error: any) {
        console.error("Profile Creation Error:", error);

        // Handle specific duplicate slug error nicely
        if (error.message.includes("already exists")) {
            return NextResponse.json({ error: error.message }, { status: 409 });
        }

        return NextResponse.json({ error: "Failed to create profile" }, { status: 500 });
    }
}

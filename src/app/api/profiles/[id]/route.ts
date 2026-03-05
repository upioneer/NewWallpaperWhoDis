import { NextRequest, NextResponse } from "next/server";
import { deleteProfile, updateProfile } from "@/lib/profiles";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const id = (await params).id;
        const body = await req.json();

        if (!id) {
            return NextResponse.json({ error: "Profile ID is required" }, { status: 400 });
        }

        const updatedProfile = await updateProfile(id, body);

        return NextResponse.json({ success: true, profile: updatedProfile });
    } catch (error: any) {
        console.error("Profile Update Error:", error);
        return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const id = (await params).id;

        if (!id) {
            return NextResponse.json({ error: "Profile ID is required" }, { status: 400 });
        }

        await deleteProfile(id);

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("Profile Deletion Error:", error);
        return NextResponse.json({ error: "Failed to delete profile" }, { status: 500 });
    }
}

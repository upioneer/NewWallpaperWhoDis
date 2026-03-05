import { NextRequest, NextResponse } from "next/server";
import { readDb, writeDb } from "@/lib/db";
import { unlink } from "fs/promises";
import path from "path";

const UPLOAD_DIR = path.join(process.cwd(), "wallpapers");

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const db = await readDb();

        const imageToDetele = db.images[id];
        if (!imageToDetele) {
            return NextResponse.json({ error: "Image not found" }, { status: 404 });
        }

        // 1. Physically delete the file from the ./wallpapers directory
        try {
            await unlink(path.join(UPLOAD_DIR, imageToDetele.filename));
        } catch (fsError: unknown) {
            console.warn(`Could not physically delete ${imageToDetele.filename} (might already be missing):`, (fsError as Error).message);
        }

        // 2. Remove it from our JSON DB
        delete db.images[id];

        // 3. Clean up any Profiles that might be tracking this exact image as their "current" rotation
        for (const profileId in db.profiles) {
            if (db.profiles[profileId].currentImageId === id) {
                db.profiles[profileId].currentImageId = undefined; // Wipe it so it naturally rotates to the next one
            }
        }

        await writeDb(db);

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error("Failed to delete image:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

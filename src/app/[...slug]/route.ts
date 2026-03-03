import { NextRequest, NextResponse } from "next/server";
import { readDb } from "@/lib/db";
import { getProfileBySlug, updateProfile } from "@/lib/profiles";
import { readFile } from "fs/promises";
import path from "path";
import mime from "mime-types";

const UPLOAD_DIR = path.join(process.cwd(), "wallpapers");

export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string[] }> }) {
    try {
        const slugArray = (await params).slug;
        const slug = slugArray.join("/"); // Handle nested slugs just in case 

        // Find if the slug matches a profile
        const profile = await getProfileBySlug(slug);

        if (!profile) {
            // Return a nice 404 image or standard response instead of breaking
            return new NextResponse("Wallpaper Profile Not Found", { status: 404 });
        }

        const db = await readDb();
        let images = Object.values(db.images);

        // --- ENFORCE CATEGORY SCOPING ---
        if (profile.filters?.orientation && profile.filters.orientation.length > 0) {
            images = images.filter((img: any) => profile.filters!.orientation!.includes(img.orientation || "Unknown"));
        }


        if (profile.filters?.luminosity && profile.filters.luminosity.length > 0) {
            images = images.filter((img: any) => profile.filters!.luminosity!.includes(img.luminosity || "Dark"));
        }

        if (images.length === 0) {
            return new NextResponse("No images match this profile's specific category constraints.", { status: 404 });
        }

        let selectedImage = null;

        // --- ROTATION LOGIC ---
        if (profile.triggerType === "random") {
            // Pick a random image every time
            selectedImage = images[Math.floor(Math.random() * images.length)];
        }
        else if (profile.triggerType === "request") {
            // Cycle to the next image sequentially based on last served
            let nextIndex = 0;
            if (profile.currentImageId) {
                const currentIndex = images.findIndex(img => img.id === profile.currentImageId);
                if (currentIndex !== -1) {
                    nextIndex = (currentIndex + 1) % images.length;
                }
            }
            selectedImage = images[nextIndex];

            // Fire and forget updating the profile tracking state
            updateProfile(profile.id, {
                currentImageId: selectedImage.id,
                lastRotatedAt: new Date().toISOString()
            }).catch(e => console.error("Failed async profile update", e));
        }
        if (profile.triggerType === "time") {
            const now = new Date();
            const lastRotated = profile.lastRotatedAt ? new Date(profile.lastRotatedAt) : new Date(0);
            const intervalMs = (profile.intervalMinutes || 60) * 60 * 1000;

            if (now.getTime() - lastRotated.getTime() >= intervalMs || !profile.currentImageId) {
                // Time to rotate (or first time)
                let nextIndex = 0;
                if (profile.currentImageId) {
                    const currentIndex = images.findIndex(img => img.id === profile.currentImageId);
                    if (currentIndex !== -1) {
                        nextIndex = (currentIndex + 1) % images.length;
                    }
                }
                selectedImage = images[nextIndex];

                updateProfile(profile.id, {
                    currentImageId: selectedImage.id,
                    lastRotatedAt: now.toISOString()
                }).catch(e => console.error("Failed async profile update", e));

            } else {
                // Keep serving the current image
                selectedImage = images.find(img => img.id === profile.currentImageId);
                if (!selectedImage) {
                    // Fallback if currentImageId is invalid somehow
                    selectedImage = images[0];
                    updateProfile(profile.id, {
                        currentImageId: selectedImage.id,
                        lastRotatedAt: now.toISOString()
                    }).catch(e => console.error("Failed async profile update", e));
                }
            }
        }

        if (!selectedImage) {
            return new NextResponse("Error selecting image", { status: 500 });
        }

        // --- SERVE THE PHYSICAL FILE ---
        const filePath = path.join(UPLOAD_DIR, selectedImage.filename);

        try {
            const fileBuffer = await readFile(filePath);
            const mimeType = mime.lookup(filePath) || 'application/octet-stream';

            // Control Headers to prevent aggressive browser caching so "Request/Random" actually show new images
            const response = new NextResponse(fileBuffer, { status: 200 });
            response.headers.set("Content-Type", mimeType);

            if (profile.triggerType === "time") {
                // We can cache it for roughly the duration of the remaining interval
                response.headers.set("Cache-Control", `public, max-age=${Math.floor((profile.intervalMinutes || 1) * 60)}`);
            } else {
                // Do not cache Request or Random triggers at all
                response.headers.set("Cache-Control", "no-cache, no-store, must-revalidate");
            }

            return response;

        } catch (fsError) {
            console.error(`File physically missing from disk: ${selectedImage.filename}`);
            return new NextResponse("Image broken or missing from disk", { status: 404 });
        }

    } catch (error) {
        console.error("Dynamic Endpoint Error:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}

import { NextResponse } from "next/server";
import { readdir, stat, unlink } from "fs/promises";
import path from "path";
import { readDb, writeDb } from "@/lib/db";
// We use sharp on the backend to figure out dimensions and color metrics
import sharp from "sharp";
import { categorizeDimensions, categorizeColor, determineLuminosity } from "@/lib/categorization";

const UPLOAD_DIR = path.join(process.cwd(), "wallpapers");

export async function POST() {
    try {
        const db = await readDb();

        let files: string[] = [];
        try {
            files = await readdir(UPLOAD_DIR);
        } catch {
            // Directory might not exist yet
            return NextResponse.json({ success: true, syncedCount: 0 });
        }

        let syncedCount = 0;

        for (const file of files) {
            const filePath = path.join(UPLOAD_DIR, file);

            // Security: Actively delete any file that doesn't match our strict image whitelist
            if (!file.match(/\.(jpg|jpeg|png|gif|webp|avif)$/i)) {
                try {
                    await stat(filePath); // verify it is real
                    await unlink(filePath);
                    console.log(`[Security] Purged unsupported file from wallpapers directory: ${file}`);
                } catch (e) {
                    console.error("Failed to purge unsupported file:", e);
                }
                continue;
            }

            const existingImage = db.images[file];

            // Skip if it's already perfectly tracked in the DB with all the latest tags
            if (existingImage && existingImage.color && existingImage.luminosity) continue;

            // Wait, we found a rogue file (or one requiring an upgrade to new tags)! Let's ingest it.
            try {
                const fileStats = await stat(filePath);

                let width = 0;
                let height = 0;

                try {
                    // Extract real dimensions using sharp
                    const metadata = await sharp(filePath).metadata();
                    if (metadata && metadata.width && metadata.height) {
                        width = metadata.width;
                        height = metadata.height;
                    }
                } catch {
                    // Failing to parse dimensions isn't fatal, we just mark it Unknown.
                }

                let categoryData = {
                    width: width,
                    height: height,
                    orientation: "Unknown" as any,
                    aspectRatioBucket: "Custom" as any
                };

                if (width > 0 && height > 0) {
                    categoryData = categorizeDimensions(width, height);
                }

                // --- DOMINANT COLOR & LUMINOSITY EXTRACTION ---
                let dominantColor = "#000000"; // Fallback
                let dominantBucket = "Black"; // Fallback
                let luminosity: "Light" | "Dark" = "Dark"; // Fallback
                try {
                    const stats = await sharp(filePath).stats();
                    const dom = stats.dominant;
                    const r = dom.r.toString(16).padStart(2, '0');
                    const g = dom.g.toString(16).padStart(2, '0');
                    const b = dom.b.toString(16).padStart(2, '0');
                    dominantColor = `#${r}${g}${b}`;
                    dominantBucket = categorizeColor(dominantColor);

                    const rMean = stats.channels[0].mean;
                    const gMean = stats.channels[1].mean;
                    const bMean = stats.channels[2].mean;
                    luminosity = determineLuminosity(rMean, gMean, bMean);
                } catch (colorErr) {
                    console.error("Sync Crawler: Failed to extract color metrics for:", file, colorErr);
                }

                db.images[file] = {
                    ...(existingImage || {}),
                    id: file,
                    filename: file,
                    width: existingImage?.width || categoryData.width,
                    height: existingImage?.height || categoryData.height,
                    orientation: existingImage?.orientation || categoryData.orientation,
                    aspectRatioBucket: existingImage?.aspectRatioBucket || categoryData.aspectRatioBucket,
                    color: dominantColor,
                    colorBucket: dominantBucket,
                    luminosity: luminosity,
                    uploadDate: existingImage?.uploadDate || fileStats.mtime.toISOString() // Preserve the original uploadDate if it exists
                };

                syncedCount++;

            } catch (err) {
                console.error(`Failed to sync rogue file: ${file}`, err);
            }
        }

        // --- TWO-WAY RECONCILIATION: DELETE GHOST IMAGES ---
        // If a user manually deletes a wallpaper from their hard drive via Windows Explorer,
        // it leaves a "ghost" tag in the `db.json`. We need to actively purge these.
        const dbKeys = Object.keys(db.images);
        for (const imageId of dbKeys) {
            if (!files.includes(imageId)) {
                delete db.images[imageId];
                syncedCount++; // Count as a sync action so db is rewritten
                console.log(`[Sync] Purged ghost image from database: ${imageId}`);
            }
        }

        if (syncedCount > 0) {
            await writeDb(db);
        }

        return NextResponse.json({ success: true, syncedCount });

    } catch (error) {
        console.error("System Sync Error:", error);
        return NextResponse.json({ error: "Failed to run system sync" }, { status: 500 });
    }
}

import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir, stat } from "fs/promises";
import { join } from "path";
import { categorizeDimensions, categorizeColor, determineLuminosity } from "@/lib/categorization";
import { addImageMetadata } from "@/lib/db";
import imageSize from "image-size";
import sharp from "sharp";

// Function to handle the POST request
export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get("file") as unknown as File | null;
        let widthStr = formData.get("width") as string | null;
        let heightStr = formData.get("height") as string | null;
        const overwrite = formData.get("overwrite") === "true";

        if (!file) {
            return NextResponse.json({ error: "No file provided" }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());

        // Always store wallpapers in the project root's /wallpapers folder
        // When using docker, this maps to the host's directory
        const wallpapersDir = join(process.cwd(), "wallpapers");

        // Ensure directory exists
        try {
            await mkdir(wallpapersDir, { recursive: true });
        } catch {
            // Ignore if it already exists
        }

        const filePath = join(wallpapersDir, file.name);

        if (!overwrite) {
            try {
                await stat(filePath);
                // If stat succeeds, the file already exists
                return NextResponse.json({
                    error: "A file with this name already exists",
                    code: "DUPLICATE_NAME"
                }, { status: 409 });
            } catch {
                // File doesn't exist, which is what we want
            }
        }

        // Process Categories if Dimensions are valid
        let categoryData = null;
        let width = widthStr ? parseInt(widthStr, 10) : 0;
        let height = heightStr ? parseInt(heightStr, 10) : 0;
        let isNew = false;

        // Determine if this is a fresh file by checking if it already existed
        if (overwrite) {
            try {
                await stat(filePath);
                isNew = false; // it existed, so we are just overwriting
            } catch {
                isNew = true; // it didn't exist, even though overwrite flag was sent
            }
        } else {
            isNew = true; // normal upload, didn't trigger duplicate check
        }

        await writeFile(filePath, buffer);

        // Server-Side Fallback: Check the memory buffer directly to avoid disk write race conditions.
        if (width === 0 || height === 0) {
            try {
                const physicalDimensions = imageSize(buffer);
                if (physicalDimensions && physicalDimensions.width && physicalDimensions.height) {
                    width = physicalDimensions.width;
                    height = physicalDimensions.height;
                }
            } catch (err) {
                console.error("Server-side fallback image parsing failed:", err);
            }
        }

        if (width > 0 && height > 0) {
            categoryData = categorizeDimensions(width, height);
        } else {
            categoryData = {
                width: 0,
                height: 0,
                orientation: "Unknown" as any,
                aspectRatioBucket: "Custom" as any
            };
        }

        // --- DOMINANT COLOR EXTRACTION ---
        let dominantColor = "#000000"; // Fallback
        let dominantBucket = "Black"; // Fallback
        let luminosity: "Light" | "Dark" = "Dark"; // Fallback
        try {
            const stats = await sharp(buffer).stats();
            const dom = stats.dominant;
            // Pad hex strings to ensure they are 2 characters long
            const r = dom.r.toString(16).padStart(2, '0');
            const g = dom.g.toString(16).padStart(2, '0');
            const b = dom.b.toString(16).padStart(2, '0');
            dominantColor = `#${r}${g}${b}`;
            dominantBucket = categorizeColor(dominantColor);

            // Calculate Average Luminosity across the entire image
            const rMean = stats.channels[0].mean;
            const gMean = stats.channels[1].mean;
            const bMean = stats.channels[2].mean;
            luminosity = determineLuminosity(rMean, gMean, bMean);
        } catch (colorErr) {
            console.error("Failed to extract color metrics for:", file.name, colorErr);
            // Non-fatal, just continue with fallback
        }

        await addImageMetadata({
            id: file.name,
            filename: file.name,
            width: categoryData.width,
            height: categoryData.height,
            orientation: categoryData.orientation,
            aspectRatioBucket: categoryData.aspectRatioBucket,
            color: dominantColor,
            colorBucket: dominantBucket,
            luminosity: luminosity,
            uploadDate: new Date().toISOString()
        });

        return NextResponse.json({
            success: true,
            message: "File uploaded successfully",
            name: file.name,
            width,
            height,
            category: {
                ...categoryData,
                color: dominantColor,
                colorBucket: dominantBucket,
                luminosity: luminosity
            },
            isNew
        });
    } catch (error) {
        console.error("Upload Error:", error);
        return NextResponse.json({ error: "Failed to upload file" }, { status: 500 });
    }
}

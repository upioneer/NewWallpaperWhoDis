import { NextRequest, NextResponse } from "next/server";
import { join } from "path";
import { readFile, stat } from "fs/promises";
import mime from "mime-types";

// This endpoint serves raw images directly from the wallpapers directory
// specifically for the Gallery UI, bypassing any profile rotation logic.
export async function GET(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params;
        const decodedId = decodeURIComponent(id);

        if (!decodedId) {
            return new NextResponse("Not Found", { status: 404 });
        }

        const wallpapersDir = join(process.cwd(), "wallpapers");
        const filePath = join(wallpapersDir, decodedId);

        // Security check: ensure the requested file is actually inside the wallpapers directory
        // and prevent directory traversal attacks (e.g. ../../etc/passwd)
        const normalizedParent = join(wallpapersDir, "/");
        const normalizedChild = join(filePath, "/");
        if (!normalizedChild.startsWith(normalizedParent)) {
            return new NextResponse("Forbidden", { status: 403 });
        }

        try {
            await stat(filePath);
        } catch {
            return new NextResponse("Image Not Found", { status: 404 });
        }

        const buffer = await readFile(filePath);
        const mimeType = mime.lookup(filePath) || "application/octet-stream";

        return new NextResponse(buffer, {
            headers: {
                "Content-Type": mimeType,
                // Cache thumbnails in the browser heavily to keep the Gallery snappy
                "Cache-Control": "public, max-age=86400, immutable"
            },
        });
    } catch (error) {
        console.error("Error serving raw image:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}

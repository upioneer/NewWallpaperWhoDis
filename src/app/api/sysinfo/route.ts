import { NextResponse } from 'next/server';
import diskusage from 'diskusage';
import { promises as fs } from 'fs';
import path from 'path';

const UPLOAD_DIR = path.join(process.cwd(), 'wallpapers');

async function getFolderSize(dirPath: string): Promise<number> {
    try {
        let totalSize = 0;
        const files = await fs.readdir(dirPath, { withFileTypes: true });

        for (const file of files) {
            const filePath = path.join(dirPath, file.name);
            if (file.isDirectory()) {
                totalSize += await getFolderSize(filePath);
            } else {
                const stats = await fs.stat(filePath);
                totalSize += stats.size;
            }
        }
        return totalSize;
    } catch {
        return 0; // Folder might not exist yet
    }
}

export async function GET() {
    try {
        const platform = process.platform;
        // On Windows, use 'c:' as default volume if cwd isn't enough, otherwise use process.cwd()
        const rootPath = platform === 'win32' ? process.cwd().split(path.sep)[0] : '/';

        const usage = await diskusage.check(rootPath);
        const folderSize = await getFolderSize(UPLOAD_DIR);

        return NextResponse.json({
            total: usage.total,
            free: usage.free,
            used: usage.total - usage.free,
            wallpapersSize: folderSize,
        });
    } catch (error) {
        console.error("Failed to fetch system info:", error);
        return NextResponse.json({ error: "Failed to fetch storage stats" }, { status: 500 });
    }
}

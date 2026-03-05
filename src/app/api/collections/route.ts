import { NextResponse } from 'next/server';
import { readDb, writeDb } from '@/lib/db';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { name, images } = body;

        if (!name || typeof name !== 'string') {
            return NextResponse.json({ error: "Invalid collection name" }, { status: 400 });
        }
        if (!Array.isArray(images)) {
            return NextResponse.json({ error: "images must be an array of image IDs" }, { status: 400 });
        }

        const db = await readDb();

        // Save the collection
        db.collections[name] = images;

        await writeDb(db);

        return NextResponse.json({ success: true, collection: name, count: images.length });
    } catch (e: any) {
        console.error("Collections POST Error:", e);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const url = new URL(req.url);
        const name = url.searchParams.get("name");

        if (!name) {
            return NextResponse.json({ error: "Collection name required" }, { status: 400 });
        }

        const db = await readDb();

        if (db.collections[name]) {
            delete db.collections[name];

            // Note: we might need to purge this collection from any profiles that actively use it.
            // A profile might have filters.collection = name. If so we fall back to all images next rotation, or we explicitly clear it here.
            Object.values(db.profiles).forEach(profile => {
                if (profile.filters.collection === name) {
                    delete profile.filters.collection;
                }
            });

            await writeDb(db);
        }

        return NextResponse.json({ success: true });
    } catch (e: any) {
        console.error("Collections DELETE Error:", e);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

import { NextResponse } from "next/server";
import { readDb } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
    try {
        const db = await readDb();
        return NextResponse.json({ count: Object.keys(db.images || {}).length });
    } catch {
        return NextResponse.json({ count: 0 });
    }
}

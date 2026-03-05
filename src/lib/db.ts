import { promises as fs } from 'fs';
import path from 'path';
import { unstable_noStore as noStore } from 'next/cache';

export interface ImageMetadata {
    id: string; // Typically just the filename for MVP
    filename: string;
    width: number;
    height: number;
    orientation: string;
    aspectRatioBucket: string;
    color?: string; // Dominant Raw Hex (e.g. #FF5733)
    colorBucket?: string; // Human Readable (e.g. "Red")
    luminosity?: "Light" | "Dark";
    uploadDate: string;
}

export interface SystemSettings {
    dashboardBackground: "particles" | "aurora" | "bokeh" | "kenburns" | "cybergrid";
    galleryWidgetBackground: "random" | "recent" | "disabled";
    galleryWidgetBlur: "none" | "some" | "lots";
    theme?: string;
    hasCompletedOnboarding?: boolean;
}

export type TriggerType = "time" | "request" | "random";

export interface ProfileMetadata {
    id: string;
    name: string;
    slug: string;
    createdAt: string;
    filters: {
        orientation?: string[];
        aspectRatioBuckets?: string[];
        colorBucket?: string[];
        luminosity?: string[];
        tags?: string[];
        collection?: string;
    };
    triggerType: TriggerType;
    intervalMinutes?: number;
    lastRotatedAt?: string;
    currentImageId?: string;
}

export interface DatabaseSchema {
    images: Record<string, ImageMetadata>;
    profiles: Record<string, ProfileMetadata>;
    settings: SystemSettings;
    collections: Record<string, string[]>;
}

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

const DEFAULT_DB: DatabaseSchema = {
    images: {},
    profiles: {},
    settings: {
        dashboardBackground: "particles",
        galleryWidgetBackground: "random",
        galleryWidgetBlur: "none",
        hasCompletedOnboarding: false
    },
    collections: {}
};

async function ensureDbExists() {
    try {
        await fs.mkdir(DATA_DIR, { recursive: true });
        try {
            await fs.access(DB_FILE);
        } catch {
            await fs.writeFile(DB_FILE, JSON.stringify(DEFAULT_DB, null, 2), 'utf8');
        }
    } catch (error) {
        console.error("Database initialization failed:", error);
    }
}

export async function readDb(): Promise<DatabaseSchema> {
    noStore(); // Force Next.js to skip caching the response so we see hot-reloads of db.json
    await ensureDbExists();
    try {
        const data = await fs.readFile(DB_FILE, 'utf8');
        const parsed = JSON.parse(data) as Partial<DatabaseSchema>;

        // Safety Fallback for schema upgrades
        if (!parsed.settings) parsed.settings = DEFAULT_DB.settings;
        if (!parsed.settings.dashboardBackground) parsed.settings.dashboardBackground = "particles";
        if (typeof parsed.settings.hasCompletedOnboarding === 'undefined') parsed.settings.hasCompletedOnboarding = false;
        if (!parsed.profiles) parsed.profiles = DEFAULT_DB.profiles;
        if (!parsed.images) parsed.images = DEFAULT_DB.images;
        if (!parsed.collections) parsed.collections = {};

        return parsed as DatabaseSchema;
    } catch (error) {
        console.error("Failed to read database, returning default:", error);
        return DEFAULT_DB;
    }
}

export async function writeDb(data: DatabaseSchema): Promise<void> {
    await ensureDbExists();
    try {
        await fs.writeFile(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
    } catch (error) {
        console.error("Failed to write to database:", error);
    }
}

export async function addImageMetadata(metadata: ImageMetadata): Promise<void> {
    const db = await readDb();
    db.images[metadata.id] = metadata;
    await writeDb(db);
}

export async function getImageMetadata(id: string): Promise<ImageMetadata | null> {
    const db = await readDb();
    return db.images[id] || null;
}

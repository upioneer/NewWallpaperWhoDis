import { readDb, writeDb, ProfileMetadata } from './db';
import { v4 as uuidv4 } from 'uuid';

export async function addProfile(profileData: Omit<ProfileMetadata, "id" | "createdAt">): Promise<ProfileMetadata> {
    const db = await readDb();

    // Validate unique slug
    const isDuplicateSlug = Object.values(db.profiles).some(p => p.slug === profileData.slug);
    if (isDuplicateSlug) {
        throw new Error(`Profile with slug "${profileData.slug}" already exists.`);
    }

    const newProfile: ProfileMetadata = {
        ...profileData,
        id: uuidv4(),
        createdAt: new Date().toISOString()
    };

    db.profiles[newProfile.id] = newProfile;
    await writeDb(db);

    return newProfile;
}

export async function getProfile(id: string): Promise<ProfileMetadata | null> {
    const db = await readDb();
    return db.profiles[id] || null;
}

export async function getProfileBySlug(slug: string): Promise<ProfileMetadata | null> {
    const db = await readDb();
    return Object.values(db.profiles).find(p => p.slug === slug) || null;
}

export async function updateProfile(id: string, updates: Partial<ProfileMetadata>): Promise<ProfileMetadata> {
    const db = await readDb();

    if (!db.profiles[id]) {
        throw new Error(`Profile with id "${id}" not found.`);
    }

    db.profiles[id] = { ...db.profiles[id], ...updates };
    await writeDb(db);

    return db.profiles[id];
}
export async function deleteProfile(id: string): Promise<void> {
    const db = await readDb();
    delete db.profiles[id];
    await writeDb(db);
}

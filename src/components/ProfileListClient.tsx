"use client";

import { useState } from "react";
import { Monitor, Plus, ExternalLink, Trash2 } from "lucide-react";
import { CreateProfileModal } from "./CreateProfileModal";
import { useRouter } from "next/navigation";
import { ProfileMetadata, SystemSettings } from "@/lib/db";

export function ProfileListClient({ initialProfiles, categories, luminosities, collections, settings, localIp }: { initialProfiles: ProfileMetadata[], categories: string[], luminosities: string[], collections: string[], settings?: SystemSettings, localIp?: string }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProfile, setEditingProfile] = useState<ProfileMetadata | null>(null);
    const router = useRouter();

    const getBaseUrl = () => {
        if (settings?.urlDisplayPreference === 'domain' && settings?.publicDomain) {
            let domain = settings.publicDomain.trim();
            if (!domain.startsWith('http')) domain = 'https://' + domain;
            // Ensure no trailing slash
            domain = domain.replace(/\/$/, "");
            return domain;
        } else if (settings?.urlDisplayPreference === 'local' && localIp) {
            return `http://${localIp}:6767`;
        }
        return '';
    };

    const baseUrl = getBaseUrl();

    const openCreateModal = () => {
        setEditingProfile(null);
        setIsModalOpen(true);
    };

    const openEditModal = (profile: ProfileMetadata) => {
        setEditingProfile(profile);
        setIsModalOpen(true);
    };

    const handleSuccess = () => {
        setIsModalOpen(false);
        // Force Next.js to re-fetch the server component so the new profile appears instantly
        router.refresh();
    };

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`Are you sure you want to delete the profile "${name}"?`)) return;

        try {
            const res = await fetch(`/api/profiles/${id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error("Failed to delete profile");
            router.refresh();
        } catch (err) {
            console.error("Error deleting profile:", err);
            alert("Error deleting profile.");
        }
    };

    return (
        <>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight mb-2">Profiles & Slugs</h1>
                    <p className="text-[var(--muted-foreground)]">Manage your static wallpaper endpoints and their rotation rules</p>
                </div>
                <button
                    onClick={openCreateModal}
                    className="flex items-center gap-2 py-2 px-4 rounded-lg bg-[var(--primary)] text-[var(--primary-foreground)] font-medium hover:scale-105 active:scale-95 transition-transform"
                >
                    <Plus size={18} />
                    Create Profile
                </button>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {initialProfiles.length === 0 ? (
                    <div className="p-12 text-center rounded-xl border border-dashed border-[var(--border)] bg-[var(--card)]/40 backdrop-blur-sm">
                        <div className="inline-flex h-12 w-12 bg-[var(--primary)]/10 text-[var(--primary)] rounded-full items-center justify-center mb-4">
                            <Monitor size={24} />
                        </div>
                        <h3 className="text-lg font-bold mb-2">No profiles created yet</h3>
                        <p className="text-[var(--muted-foreground)] mb-6 max-w-md mx-auto">
                            Profiles define what image shows up when someone visits a specific URL slug on your server
                        </p>
                        <button
                            onClick={openCreateModal}
                            className="py-2 px-6 rounded-lg bg-[var(--primary)] text-[var(--primary-foreground)] font-medium hover:brightness-110 transition-all cursor-pointer"
                        >
                            Create your first Profile
                        </button>
                    </div>
                ) : (
                    initialProfiles.map((profile: ProfileMetadata) => (
                        <div key={profile.id} className="p-6 rounded-xl border border-[var(--border)] bg-[var(--card)]/60 backdrop-blur-sm flex justify-between items-center group hover:border-[var(--primary)]/50 transition-colors">
                            <div>
                                <h3 className="font-bold text-lg">{profile.name}</h3>
                                <p className="text-sm text-[var(--muted-foreground)] flex items-center gap-2 mt-1">
                                    <span className="bg-[var(--accent)] text-[var(--accent-foreground)] px-2 py-0.5 rounded text-xs font-mono">
                                        {baseUrl}/{profile.slug}
                                    </span>
                                    &bull; {profile.triggerType === 'time' ? `Rotates every ${profile.intervalMinutes} mins` : profile.triggerType === 'request' ? 'Rotates on every request' : 'Random rotation'}
                                    {profile.filters?.collection && (
                                        <span className="ml-1 font-medium text-[var(--primary)]">
                                            &bull; Collection: {profile.filters.collection}
                                        </span>
                                    )}
                                </p>
                            </div>
                            <div className="flex flex-col gap-2 items-end">
                                <div className="flex gap-2">
                                    <a
                                        href={`${baseUrl}/${profile.slug}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="px-3 py-1.5 rounded-lg border border-[var(--border)] bg-[var(--background)] hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)] transition-colors text-xs font-medium flex items-center gap-1.5"
                                        title="Raw Image API"
                                    >
                                        <ExternalLink size={12} />
                                        Raw Image
                                    </a>
                                    <a
                                        href={`${baseUrl}/display/${profile.slug}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="px-3 py-1.5 rounded-lg border border-[var(--primary)]/50 bg-[var(--primary)]/10 text-[var(--primary)] hover:bg-[var(--primary)] hover:text-[var(--primary-foreground)] transition-colors text-xs font-bold flex items-center gap-1.5 shadow-[0_0_10px_var(--primary)]/20"
                                        title="Interactive Kiosk Player"
                                    >
                                        <Monitor size={12} />
                                        Display Kiosk
                                    </a>
                                </div>
                                <div className="flex gap-2 w-full mt-2">
                                    <button
                                        onClick={() => openEditModal(profile)}
                                        className="flex-1 px-4 py-2 rounded-lg border border-[var(--border)] bg-[var(--background)] hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)] transition-colors text-sm font-medium"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(profile.id, profile.name)}
                                        className="p-2 rounded-lg border border-[var(--border)] bg-[var(--background)] hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/30 transition-colors flex-shrink-0"
                                        title="Delete Profile"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div >

            <CreateProfileModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={handleSuccess}
                orientations={categories}
                luminosities={luminosities}
                collections={collections}
                initialData={editingProfile || undefined}
            />
        </>
    );
}

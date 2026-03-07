"use client";

import { useState } from "react";
import { Monitor, Plus, ExternalLink, Trash2, QrCode, X } from "lucide-react";
import { CreateProfileModal } from "./CreateProfileModal";
import { QRCodeSVG } from 'qrcode.react';
import { useRouter } from "next/navigation";
import { ProfileMetadata, SystemSettings } from "@/lib/db";

export function ProfileListClient({ initialProfiles, categories, luminosities, collections, settings, localIp }: { initialProfiles: ProfileMetadata[], categories: string[], luminosities: string[], collections: string[], settings?: SystemSettings, localIp?: string }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProfile, setEditingProfile] = useState<ProfileMetadata | null>(null);
    const [qrProfile, setQrProfile] = useState<{ name: string, url: string } | null>(null);
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
                                    <button
                                        onClick={() => setQrProfile({ name: profile.name, url: `${baseUrl}/display/${profile.slug}` })}
                                        className="px-3 py-1.5 rounded-lg border border-[var(--primary)] text-[var(--primary)] hover:bg-[var(--primary)] hover:text-[var(--primary-foreground)] transition-colors text-xs font-bold flex items-center gap-1.5"
                                        title="Scan QR Code to Pair Device"
                                    >
                                        <QrCode size={12} />
                                        Pair Device
                                    </button>
                                    <a
                                        href={`${baseUrl}/display/${profile.slug}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="px-3 py-1.5 rounded-lg border border-[var(--primary)]/50 bg-[var(--primary)]/10 text-[var(--primary)] hover:bg-[var(--primary)] hover:text-[var(--primary-foreground)] transition-colors text-xs font-bold flex items-center gap-1.5 shadow-[0_0_10px_var(--primary)]/20"
                                        title="Launch Interactive Kiosk Player"
                                    >
                                        <Monitor size={12} />
                                        Launch Display Kiosk
                                    </a>
                                    <a
                                        href={`${baseUrl}/${profile.slug}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="px-3 py-1.5 rounded-lg border border-[var(--border)] bg-[var(--background)] hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)] transition-colors text-xs font-medium flex items-center gap-1.5"
                                        title="Raw API Image Stream"
                                    >
                                        <ExternalLink size={12} />
                                        Raw API Stream
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

            {/* QR Code Modal */}
            {qrProfile && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
                    onClick={() => setQrProfile(null)}
                >
                    <div
                        className="bg-[var(--card)] w-full max-w-sm rounded-[1.5rem] p-6 shadow-2xl relative border border-[var(--border)]"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            onClick={() => setQrProfile(null)}
                            className="absolute right-4 top-4 p-2 rounded-full hover:bg-[var(--accent)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
                        >
                            <X size={20} />
                        </button>

                        <div className="flex flex-col items-center text-center mt-2">
                            <div className="w-12 h-12 bg-[var(--primary)]/15 text-[var(--primary)] rounded-full flex items-center justify-center mb-4">
                                <QrCode size={24} />
                            </div>
                            <h2 className="text-xl font-bold mb-1">Pair Device</h2>
                            <p className="text-[var(--muted-foreground)] text-sm mb-6">
                                Scan this code with a mobile phone, tablet, or Smart TV to instantly launch the <strong className="text-[var(--foreground)]">{qrProfile.name}</strong> kiosk player.
                            </p>

                            <div className="bg-white p-4 rounded-xl shadow-inner border border-zinc-200">
                                <QRCodeSVG
                                    value={qrProfile.url}
                                    size={200}
                                    level="H"
                                    includeMargin={false}
                                />
                            </div>

                            <p className="text-xs text-[var(--muted-foreground)] mt-6 bg-[var(--primary)]/10 py-2 px-3 rounded-lg flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-[var(--primary)] border border-[var(--primary)]/50"></span>
                                Ensure both devices are on the same WiFi network.
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

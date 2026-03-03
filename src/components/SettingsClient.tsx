"use client";

import { useState } from "react";
import { ShieldCheck, Loader2 } from "lucide-react";
import { ParticleBackground } from "@/components/ParticleBackground";
import { AuroraBackground } from "@/components/AuroraBackground";
import { BokehBackground } from "@/components/BokehBackground";
import { KenBurnsBackground } from "@/components/KenBurnsBackground";
import { CyberGridBackground } from "@/components/CyberGridBackground";

export function SettingsClient({ initialSettings, backgroundImages = [] }: { initialSettings: any, backgroundImages?: any[] }) {
    const [settings, setSettings] = useState(initialSettings);
    const [loading, setLoading] = useState(false);

    const updateGalleryWidgetBackground = async (val: string) => {
        setLoading(true);
        // Optimistic UI update
        setSettings({ ...settings, galleryWidgetBackground: val });

        try {
            await fetch("/api/settings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ galleryWidgetBackground: val }),
            });
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="grid grid-cols-1 gap-6">
            {settings?.dashboardBackground === "aurora" ? <AuroraBackground /> :
                settings?.dashboardBackground === "bokeh" ? <BokehBackground /> :
                    settings?.dashboardBackground === "kenburns" ? <KenBurnsBackground images={backgroundImages} /> :
                        settings?.dashboardBackground === "cybergrid" ? <CyberGridBackground /> :
                            <ParticleBackground />}

            <div className="p-6 rounded-xl border border-[var(--border)] bg-[var(--card)]/60 backdrop-blur-sm">
                <div className="flex items-center gap-3 mb-4 text-[#8b5cf6]">
                    <ShieldCheck size={24} />
                    <h3 className="font-bold text-lg">System Preferences</h3>
                </div>
                <p className="text-[var(--muted-foreground)] mb-6">
                    Manage global UI behaviors and default application heuristics
                </p>

                <div className="space-y-4">
                    {/* Database Configured Settings */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 gap-4 border border-[var(--border)]/50 rounded-lg bg-[var(--background)]/50">
                        <div>
                            <h4 className="font-semibold text-sm mb-1">Background</h4>
                            <p className="text-xs text-[var(--muted-foreground)] max-w-sm">Choose the interactive background effect for the main application interface</p>
                        </div>
                        <div className="flex items-center gap-2">
                            {loading && <Loader2 className="animate-spin text-[var(--muted-foreground)]" size={16} />}
                            <select
                                value={settings?.dashboardBackground || "particles"}
                                onChange={(e) => {
                                    setLoading(true);
                                    setSettings({ ...settings, dashboardBackground: e.target.value });
                                    fetch("/api/settings", {
                                        method: "POST",
                                        headers: { "Content-Type": "application/json" },
                                        body: JSON.stringify({ dashboardBackground: e.target.value }),
                                    }).finally(() => setLoading(false));
                                }}
                                disabled={loading}
                                className="px-3 py-1.5 rounded-lg border border-[var(--border)] bg-[var(--background)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/50 transition-all text-sm font-medium disabled:opacity-50"
                            >
                                <option value="particles">Floating Particles (Default)</option>
                                <option value="aurora">Aurora Fluid Gradient</option>
                                <option value="bokeh">Floating Bokeh Orbs</option>
                                <option value="kenburns">Cinematic Library Sweep</option>
                                <option value="cybergrid">Cybernetic Light Grid</option>
                            </select>
                        </div>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 gap-4 border border-[var(--border)]/50 rounded-lg bg-[var(--background)]/50">
                        <div>
                            <h4 className="font-semibold text-sm mb-1">Gallery Widget Background (Home)</h4>
                            <p className="text-xs text-[var(--muted-foreground)] max-w-sm">Toggle the background image grid behind the Gallery tile on the Dashboard</p>
                        </div>
                        <div className="flex items-center gap-2">
                            {loading && <Loader2 className="animate-spin text-[var(--muted-foreground)]" size={16} />}
                            <select
                                value={settings?.galleryWidgetBackground || "random"}
                                onChange={(e) => updateGalleryWidgetBackground(e.target.value)}
                                disabled={loading}
                                className="px-3 py-1.5 rounded-lg border border-[var(--border)] bg-[var(--background)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/50 transition-all text-sm font-medium disabled:opacity-50"
                            >
                                <option value="random">Randomized Array</option>
                                <option value="recent">Recent Uploads</option>
                                <option value="disabled">Disabled (Solid Color)</option>
                            </select>
                        </div>
                    </div>

                    {settings?.galleryWidgetBackground !== "disabled" && (
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 gap-4 border border-[var(--border)]/50 rounded-lg bg-[var(--background)]/50 animate-in fade-in slide-in-from-top-2">
                            <div>
                                <h4 className="font-semibold text-sm mb-1">Ambient Grid Blur Intensity</h4>
                                <p className="text-xs text-[var(--muted-foreground)] max-w-sm">Control the privacy masking and abstract effect applied to the dashboard grid</p>
                            </div>
                            <div className="flex items-center gap-2">
                                {loading && <Loader2 className="animate-spin text-[var(--muted-foreground)]" size={16} />}
                                <select
                                    value={settings?.galleryWidgetBlur || "none"}
                                    onChange={(e) => {
                                        setLoading(true);
                                        setSettings({ ...settings, galleryWidgetBlur: e.target.value });
                                        fetch("/api/settings", {
                                            method: "POST",
                                            headers: { "Content-Type": "application/json" },
                                            body: JSON.stringify({ galleryWidgetBlur: e.target.value }),
                                        }).finally(() => setLoading(false));
                                    }}
                                    disabled={loading}
                                    className="px-3 py-1.5 rounded-lg border border-[var(--border)] bg-[var(--background)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/50 transition-all text-sm font-medium disabled:opacity-50"
                                >
                                    <option value="none">None (Sharp)</option>
                                    <option value="some">Some (Softened)</option>
                                    <option value="lots">Lots (Abstract Privacy)</option>
                                </select>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

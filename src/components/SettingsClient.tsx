"use client";

import { useState } from "react";
import { ShieldCheck, Loader2 } from "lucide-react";
import { ParticleBackground } from "@/components/ParticleBackground";
import { AuroraBackground } from "@/components/AuroraBackground";
import { BokehBackground } from "@/components/BokehBackground";
import { KenBurnsBackground } from "@/components/KenBurnsBackground";
import { CyberGridBackground } from "@/components/CyberGridBackground";
import { SystemSettings, ImageMetadata } from "@/lib/db";

export function SettingsClient({ initialSettings, backgroundImages = [] }: { initialSettings: SystemSettings, backgroundImages?: ImageMetadata[] }) {
    const [settings, setSettings] = useState<SystemSettings>(initialSettings);
    const [loading, setLoading] = useState(false);

    const updateSetting = async (key: keyof SystemSettings, val: string | boolean) => {
        setLoading(true);
        // Optimistic UI update
        const updatedSettings = { ...settings, [key]: val };
        setSettings(updatedSettings);

        if (key === 'theme') {
            const html = document.documentElement;
            // Remove old theme prefixed classes
            html.className = html.className.replace(/\btheme-[a-z0-9-]+\b/g, '');
            if (val !== 'theme-origin' && typeof val === 'string') {
                html.classList.add(val);
            }
            window.dispatchEvent(new Event('theme-changed'));
        }

        try {
            await fetch("/api/settings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ [key]: val }),
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
                                onChange={(e) => updateSetting('dashboardBackground', e.target.value)}
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
                                onChange={(e) => updateSetting('galleryWidgetBackground', e.target.value)}
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
                                    onChange={(e) => updateSetting('galleryWidgetBlur', e.target.value)}
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

            <div className="p-6 rounded-xl border border-[var(--border)] bg-[var(--card)]/60 backdrop-blur-sm">
                <div className="flex items-center gap-3 mb-4 text-[var(--primary)]">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m19 11-8-8-8.6 8.6a2 2 0 0 0 0 2.8l5.2 5.2c.8.8 2 .8 2.8 0L19 11Z" /><path d="m5 2 5 5" /><path d="M2 13h15" /><path d="M22 20a2 2 0 1 1-4 0c0-1.6 1.7-2.4 2-4 .3 1.6 2 2.4 2 4Z" /></svg>
                    <h3 className="font-bold text-lg">Appearance & Themes</h3>
                </div>
                <p className="text-[var(--muted-foreground)] mb-6">
                    Personalize your application&apos;s accent colors and vibes.
                </p>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 gap-4 border border-[var(--border)]/50 rounded-lg bg-[var(--background)]/50">
                    <div>
                        <h4 className="font-semibold text-sm mb-1">Color Palette</h4>
                        <p className="text-xs text-[var(--muted-foreground)] max-w-sm">Select the core identity colors of the application.</p>
                    </div>
                    <div className="flex items-center gap-2">
                        {loading && <Loader2 className="animate-spin text-[var(--muted-foreground)]" size={16} />}
                        <select
                            value={settings?.theme || "theme-origin"}
                            onChange={(e) => updateSetting('theme', e.target.value)}
                            disabled={loading}
                            className="px-3 py-1.5 rounded-lg border border-[var(--border)] bg-[var(--background)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/50 transition-all text-sm font-medium disabled:opacity-50"
                        >
                            <option value="theme-origin">Origin (Violet & Monochrome)</option>
                            <option value="theme-dragon">Dragon (Red & Deep Charcoal)</option>
                            <option value="theme-northern-lights">Northern Lights (Green & Abyssal)</option>
                            <option value="theme-miami">Miami (Orange & Deep Teal)</option>
                            <option value="theme-citrus">Citrus (Warm Yellow & Soft Black)</option>
                            <option value="theme-watermelon">Watermelon (Pink & Neon Green)</option>
                            <option value="theme-terminal">Terminal (Phosphor Green & Pure Black)</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="p-6 rounded-xl border border-[var(--border)] bg-[var(--card)]/60 backdrop-blur-sm">
                <div className="flex items-center gap-3 mb-4 text-emerald-500">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" /></svg>
                    <h3 className="font-bold text-lg">Help & Tutorials</h3>
                </div>
                <p className="text-[var(--muted-foreground)] mb-6">
                    Need a refresher on how the system works?
                </p>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 gap-4 border border-[var(--border)]/50 rounded-lg bg-[var(--background)]/50">
                    <div>
                        <h4 className="font-semibold text-sm mb-1">Onboarding Wizard</h4>
                        <p className="text-xs text-[var(--muted-foreground)] max-w-sm">Re-launch the initial setup guide to review core concepts and themes.</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => {
                                updateSetting('hasCompletedOnboarding', false).then(() => {
                                    window.location.href = '/';
                                });
                            }}
                            disabled={loading}
                            className="px-4 py-2 rounded-lg bg-[var(--primary)] text-white font-medium hover:opacity-90 transition-opacity disabled:opacity-50 text-sm"
                        >
                            {loading ? <Loader2 className="animate-spin" size={16} /> : "Start Wizard"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

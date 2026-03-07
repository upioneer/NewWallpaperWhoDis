"use client";

import { useState } from "react";
import { ShieldCheck, Loader2 } from "lucide-react";
import { ParticleBackground } from "@/components/ParticleBackground";
import { AuroraBackground } from "@/components/AuroraBackground";
import { BokehBackground } from "@/components/BokehBackground";
import { KenBurnsBackground } from "@/components/KenBurnsBackground";
import { CyberGridBackground } from "@/components/CyberGridBackground";
import { SystemSettings, ImageMetadata } from "@/lib/db";

export function SettingsClient({ initialSettings, backgroundImages = [], localIp, appVersion = "0.0.0" }: { initialSettings: SystemSettings, backgroundImages?: ImageMetadata[], localIp?: string, appVersion?: string }) {
    const [settings, setSettings] = useState<SystemSettings>(initialSettings);
    const [loading, setLoading] = useState(false);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateSetting = async (key: keyof SystemSettings, val: any) => {
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
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-2">
                    <p className="text-[var(--muted-foreground)]">
                        Manage global UI behaviors and default application heuristics
                    </p>
                    <a href="https://newwallpaperwhodis.web.app" target="_blank" rel="noreferrer" className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] text-xs font-bold uppercase tracking-wider hover:bg-[var(--primary)] hover:text-[var(--primary-foreground)] transition-colors border border-[var(--primary)]/20 shadow-[0_0_10px_var(--primary)]/10 text-nowrap w-fit">
                        Version {appVersion}
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" x2="21" y1="14" y2="3"></line></svg>
                    </a>
                </div>

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

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 gap-4 border border-[var(--border)]/50 rounded-lg bg-[var(--background)]/50 animate-in fade-in slide-in-from-top-2">
                        <div>
                            <h4 className="font-semibold text-sm mb-1">Color Palette (Theme)</h4>
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
                <div className="flex items-center gap-3 mb-4 text-[#ec4899]">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="3" rx="2" ry="2" /><line x1="8" x2="16" y1="21" y2="21" /><line x1="12" x2="12" y1="17" y2="21" /></svg>
                    <h3 className="font-bold text-lg">Kiosk Displays & Integrations</h3>
                </div>
                <p className="text-[var(--muted-foreground)] mb-6">
                    Configure display transitions and global API capabilities utilized by endpoint profiles. (Widget selection is managed individually per profile).
                </p>

                <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 gap-4 border border-[var(--border)]/50 rounded-lg bg-[var(--background)]/50">
                        <div>
                            <h4 className="font-semibold text-sm mb-1">Image Transition</h4>
                            <p className="text-xs text-[var(--muted-foreground)] max-w-sm">How images crossfade or animate when rotating on a Kiosk endpoint.</p>
                        </div>
                        <div className="flex items-center gap-2">
                            {loading && <Loader2 className="animate-spin text-[var(--muted-foreground)]" size={16} />}
                            <select
                                value={settings?.kioskTransition || "fade"}
                                onChange={(e) => updateSetting('kioskTransition', e.target.value)}
                                disabled={loading}
                                className="px-3 py-1.5 rounded-lg border border-[var(--border)] bg-[var(--background)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/50 transition-all text-sm font-medium disabled:opacity-50"
                            >
                                <option value="none">None (Instant Cut)</option>
                                <option value="fade">Smooth Fade</option>
                                <option value="slide">Slide In</option>
                                <option value="kenburns">Ken Burns Pan</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex flex-col gap-6 p-4 border border-[var(--border)]/50 rounded-lg bg-[var(--background)]/50">
                        <div>
                            <h4 className="font-semibold text-sm mb-1">Weather Service Integration</h4>
                            <p className="text-xs text-[var(--muted-foreground)] mb-4 leading-relaxed">Establish raw datasets utilized across Weather Widgets locally. Weather refreshes strictly every 30 minutes to reduce API latency constraints.</p>

                            <div className="space-y-4 max-w-xl">
                                <div>
                                    <label className="text-xs font-semibold text-[var(--muted-foreground)] mb-1 block">Target Location (City or Zip)</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. 90210 or London, UK"
                                        value={settings?.targetLocation || ''}
                                        onChange={(e) => updateSetting('targetLocation', e.target.value)}
                                        className="w-full px-3 py-1.5 rounded-lg border border-[var(--border)] bg-[var(--background)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/50 transition-all text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-[var(--muted-foreground)] mb-1 block">OpenWeatherMap API Key (Updates every 30m)</label>
                                    <input
                                        type="password"
                                        placeholder="Enter key to enable live weather..."
                                        value={settings?.weatherApiKey || ''}
                                        onChange={(e) => updateSetting('weatherApiKey', e.target.value)}
                                        className="w-full px-3 py-1.5 rounded-lg border border-[var(--border)] bg-[var(--background)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/50 transition-all text-sm"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="p-6 rounded-xl border border-[var(--border)] bg-[var(--card)]/60 backdrop-blur-sm">
                <div className="flex items-center gap-3 mb-4 text-cyan-400">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="2" x2="22" y1="12" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></svg>
                    <h3 className="font-bold text-lg">Network & Endpoints</h3>
                </div>
                <p className="text-[var(--muted-foreground)] mb-6">
                    Configure how rotation links are presented to you in the Profiles tab.
                </p>

                <div className="flex flex-col sm:flex-row sm:items-start justify-between p-4 gap-4 border border-[var(--border)]/50 rounded-lg bg-[var(--background)]/50 mb-4">
                    <div className="max-w-md">
                        <h4 className="font-semibold text-sm mb-1">Public Domain Base</h4>
                        <p className="text-xs text-[var(--muted-foreground)] mb-2">If you are exposing this application through a reverse proxy like NGINX or Cloudflare Tunnels, explicitly list the public domain address here.</p>
                    </div>
                    <div className="flex flex-col gap-2 w-full sm:w-auto min-w-[280px]">
                        <input
                            type="text"
                            placeholder="e.g. wall.geauxgemini.com"
                            value={settings?.publicDomain || ''}
                            onChange={(e) => updateSetting('publicDomain', e.target.value)}
                            disabled={loading}
                            className="w-full px-3 py-1.5 rounded-lg border border-[var(--border)] bg-[var(--background)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/50 transition-all text-sm disabled:opacity-50"
                        />
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 gap-4 border border-[var(--border)]/50 rounded-lg bg-[var(--background)]/50">
                    <div>
                        <h4 className="font-semibold text-sm mb-1">URL Display Preference</h4>
                        <p className="text-xs text-[var(--muted-foreground)] max-w-sm">Choose the exact network string used when showing copy/paste endpoint links.</p>
                    </div>
                    <div className="flex items-center gap-2">
                        {loading && <Loader2 className="animate-spin text-[var(--muted-foreground)]" size={16} />}
                        <select
                            value={settings?.urlDisplayPreference || "slug"}
                            onChange={(e) => updateSetting('urlDisplayPreference', e.target.value)}
                            disabled={loading}
                            className="px-3 py-1.5 rounded-lg border border-[var(--border)] bg-[var(--background)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/50 transition-all text-sm font-medium disabled:opacity-50"
                        >
                            <option value="slug">Relative Path (/[slug])</option>
                            <option value="local">Local IP ({localIp || "192.168.x.x"})</option>
                            <option value="domain">Public Domain (https://...)</option>
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

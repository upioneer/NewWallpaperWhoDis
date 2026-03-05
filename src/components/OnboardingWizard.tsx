"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ArrowRight, Palette, Play } from "lucide-react";

export function OnboardingWizard({ hasCompletedOnboarding }: { hasCompletedOnboarding: boolean }) {
    const [isVisible, setIsVisible] = useState(!hasCompletedOnboarding);
    const [step, setStep] = useState(1);
    const [theme, setTheme] = useState("theme-origin");
    const [profileName, setProfileName] = useState("Main Display");
    const [loading, setLoading] = useState(false);
    const [profileCreated, setProfileCreated] = useState(false);
    const [generatedSlug, setGeneratedSlug] = useState("");
    const router = useRouter();

    if (!isVisible) return null;

    const applyTheme = (val: string) => {
        setTheme(val);
        const html = document.documentElement;
        html.className = html.className.replace(/\btheme-[a-z0-9-]+\b/g, '');
        if (val !== 'theme-origin') {
            html.classList.add(val);
        }
        window.dispatchEvent(new Event('theme-changed'));
    };

    const handleGenerate = async () => {
        setLoading(true);
        try {
            // Create Profile
            const slug = profileName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') || "main-display";
            setGeneratedSlug(slug);
            await fetch("/api/profiles", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: profileName || "Main Display",
                    slug: slug,
                    triggerType: "random", // Random rotation inclusive of all wallpapers
                    filters: {}
                })
            });
            setProfileCreated(true);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleFinish = async () => {
        setLoading(true);
        try {

            // Save Settings
            await fetch("/api/settings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    hasCompletedOnboarding: true,
                    theme: theme
                })
            });

            setIsVisible(false);
            router.refresh();
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-500">
            <div className="bg-[var(--card)]/90 backdrop-blur-xl border border-[var(--border)] shadow-2xl rounded-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-500">

                {/* Header */}
                <div className="p-6 border-b border-[var(--border)] bg-gradient-to-br from-[var(--primary)]/10 to-transparent">
                    <h2 className="text-2xl font-bold text-[var(--foreground)]">
                        {step === 1 && "Welcome to New Wallpaper Who Dis"}
                        {step === 2 && "Vibe Check"}
                        {step === 3 && "Your First Rotation"}
                    </h2>
                    <div className="flex gap-2 mt-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className={`h-1.5 flex-1 rounded-full transition-colors ${i <= step ? 'bg-[var(--primary)]' : 'bg-[var(--border)]'}`} />
                        ))}
                    </div>
                </div>

                {/* Content */}
                <div className="p-8">
                    {step === 1 && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                            <div className="flex justify-center mb-6">
                                <div className="w-20 h-20 rounded-full bg-[var(--primary)]/20 flex items-center justify-center text-[var(--primary)]">
                                    <Play size={40} className="ml-2" />
                                </div>
                            </div>
                            <p className="text-[var(--foreground)] text-lg text-center font-medium">Zero Maintenance. Flat-File Engine.</p>
                            <p className="text-[var(--muted-foreground)] text-center">
                                No databases to manage. No manual upload buttons. Just drop your images directly into the <code className="bg-black/30 px-1.5 rounded text-[var(--primary)]">/wallpapers</code> folder on your hard drive, and the Auto-Sync engine handles the rest.
                            </p>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                            <div className="flex justify-center mb-6">
                                <div className="w-20 h-20 rounded-full bg-[var(--primary)]/20 flex items-center justify-center text-[var(--primary)]">
                                    <Palette size={40} />
                                </div>
                            </div>
                            <p className="text-[var(--foreground)] text-center mb-4">Select the core identity colors of the application. The interactive background will react instantly.</p>
                            <div className="grid grid-cols-2 gap-3">
                                {[
                                    { id: "theme-origin", name: "Origin", colors: "from-violet-500 to-fuchsia-500" },
                                    { id: "theme-dragon", name: "Dragon", colors: "from-red-600 to-rose-900" },
                                    { id: "theme-northern-lights", name: "Northern Lights", colors: "from-emerald-400 to-teal-800" },
                                    { id: "theme-miami", name: "Miami", colors: "from-orange-500 to-teal-400" },
                                    { id: "theme-citrus", name: "Citrus", colors: "from-yellow-400 to-orange-500" },
                                    { id: "theme-watermelon", name: "Watermelon", colors: "from-pink-500 to-green-400" },
                                    { id: "theme-terminal", name: "Terminal", colors: "from-green-500 to-emerald-900" }
                                ].map((t) => (
                                    <button
                                        key={t.id}
                                        onClick={() => applyTheme(t.id)}
                                        className={`p-3 rounded-lg border text-sm font-medium transition-all flex items-center gap-3 ${theme === t.id ? 'border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--primary)]' : 'border-[var(--border)] hover:border-[var(--primary)]/50 text-[var(--muted-foreground)] hover:text-[var(--foreground)]'}`}
                                    >
                                        <div className={`w-4 h-4 rounded-full bg-gradient-to-br ${t.colors}`} />
                                        {t.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                            {!profileCreated ? (
                                <>
                                    <p className="text-[var(--foreground)] text-center mb-2">Let&apos;s create your first rotation link. You&apos;ll paste this URL into Wallpaper Engine or Plash.</p>

                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-[var(--muted-foreground)]">Display Name</label>
                                        <input
                                            type="text"
                                            value={profileName}
                                            onChange={(e) => setProfileName(e.target.value)}
                                            placeholder="e.g. Living Room TV"
                                            className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--background)]/50 focus:outline-none focus:border-[var(--primary)] transition-colors text-lg"
                                        />
                                    </div>
                                </>
                            ) : (
                                <div className="space-y-4 text-center">
                                    <div className="w-16 h-16 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center mx-auto mb-4">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                    </div>
                                    <h3 className="text-xl font-bold text-[var(--foreground)]">Profile Created!</h3>
                                    <p className="text-[var(--muted-foreground)]">Your rotation profile is ready to serve up fresh wallpapers on every page hit.</p>

                                    <div className="p-4 rounded-xl bg-black/30 border border-[var(--border)]">
                                        <p className="text-xs text-[var(--muted-foreground)] mb-2">Click below to preview your rotation:</p>
                                        <a
                                            href={`/${generatedSlug}`}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="inline-block text-[var(--primary)] hover:text-[var(--primary)]/80 font-mono text-sm break-all underline decoration-[var(--primary)]/30 underline-offset-4 transition-colors"
                                        >
                                            http://localhost:6767/{generatedSlug}
                                        </a>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-[var(--border)] bg-black/20 flex justify-between items-center">
                    {step > 1 && !profileCreated ? (
                        <button
                            onClick={() => setStep(step - 1)}
                            className="px-4 py-2 text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors text-sm font-medium"
                        >
                            Back
                        </button>
                    ) : <div></div>}

                    {step < 3 ? (
                        <button
                            onClick={() => setStep(step + 1)}
                            className="px-6 py-2.5 bg-[var(--primary)] text-white rounded-lg font-medium hover:opacity-90 transition-opacity flex items-center gap-2"
                        >
                            Next <ArrowRight size={18} />
                        </button>
                    ) : !profileCreated ? (
                        <button
                            onClick={handleGenerate}
                            disabled={loading}
                            className="px-6 py-2.5 bg-[var(--primary)] text-white rounded-lg font-medium hover:opacity-90 transition-opacity flex items-center gap-2 disabled:opacity-50"
                        >
                            {loading ? <Loader2 className="animate-spin" size={18} /> : "Generate URL"}
                        </button>
                    ) : (
                        <button
                            onClick={handleFinish}
                            disabled={loading}
                            className="px-6 py-2.5 bg-[var(--primary)] text-white rounded-lg font-medium hover:opacity-90 transition-opacity flex items-center gap-2 disabled:opacity-50"
                        >
                            {loading ? <Loader2 className="animate-spin" size={18} /> : "Finish Setup"}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

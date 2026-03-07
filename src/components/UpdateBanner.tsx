"use client";

import { useEffect, useState } from "react";
import { DownloadCloud, X } from "lucide-react";

export function UpdateBanner({ currentVersion }: { currentVersion: string }) {
    const [latestVersion, setLatestVersion] = useState<string | null>(null);
    const [dismissed, setDismissed] = useState(false);

    useEffect(() => {
        // Only run check once per session
        if (sessionStorage.getItem("update-banner-dismissed")) {
            setDismissed(true);
            return;
        }

        const fetchLatestRelease = async () => {
            try {
                const res = await fetch("https://api.github.com/repos/upioneer/NewWallpaperWhoDis/tags");
                if (!res.ok) return;
                const data = await res.json();

                if (data && data.length > 0) {
                    const latestTag = data[0].name.replace(/^v/, ''); // Remove 'v' prefix if present

                    // Simple semver comparison (assuming strictly x.y.z format)
                    const isNewer = (latest: string, current: string) => {
                        const lParts = latest.split('.').map(Number);
                        const cParts = current.split('.').map(Number);

                        for (let i = 0; i < 3; i++) {
                            if ((lParts[i] || 0) > (cParts[i] || 0)) return true;
                            if ((lParts[i] || 0) < (cParts[i] || 0)) return false;
                        }
                        return false;
                    };

                    if (isNewer(latestTag, currentVersion)) {
                        setLatestVersion(latestTag);
                    }
                }
            } catch (err) {
                console.error("Failed to check for updates", err);
            }
        };

        fetchLatestRelease();
    }, [currentVersion]);

    if (!latestVersion || dismissed) return null;

    const handleDismiss = () => {
        setDismissed(true);
        sessionStorage.setItem("update-banner-dismissed", "true");
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 fade-in duration-500">
            <div className="relative p-4 rounded-xl border border-[var(--primary)]/30 bg-[var(--card)]/80 backdrop-blur-xl shadow-2xl flex items-center gap-4 max-w-sm group">
                <div className="h-10 w-10 flex-shrink-0 bg-[var(--primary)]/10 text-[var(--primary)] rounded-full flex items-center justify-center border border-[var(--primary)]/20 shadow-[0_0_15px_var(--primary)]/20">
                    <DownloadCloud size={20} />
                </div>

                <div className="flex-1 pr-4">
                    <h4 className="font-bold text-sm text-[var(--foreground)]">Update Available</h4>
                    <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
                        Version <span className="font-mono text-[var(--primary)] font-medium">v{latestVersion}</span> is ready to pull via Docker compose.
                    </p>
                </div>

                <button
                    onClick={handleDismiss}
                    className="absolute top-2 right-2 p-1.5 rounded-full text-[var(--muted-foreground)] hover:bg-[var(--accent)] hover:text-[var(--foreground)] transition-colors"
                    aria-label="Dismiss Update Banner"
                >
                    <X size={14} />
                </button>
            </div>
        </div>
    );
}

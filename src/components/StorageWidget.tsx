"use client";

import { useEffect, useState } from "react";
import { HardDrive } from "lucide-react";

export function StorageWidget({ initialCount }: { initialCount: number }) {
    const [imageCount, setImageCount] = useState(initialCount);
    const [isSyncing, setIsSyncing] = useState(true);
    const [diskInfo, setDiskInfo] = useState({ total: 1, free: 0, used: 0, wallpapersSize: 0 });

    const formatBytes = (bytes: number, decimals = 1) => {
        if (!+bytes) return '0 B';
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
    };

    useEffect(() => {
        // Listen for custom "upload-success" events emitted by the UploadDropzone
        const handleUploadEvent = (e: Event) => {
            const customEvent = e as CustomEvent;
            if (customEvent.detail?.isNew) {
                setImageCount((prev) => prev + 1);
            }
        };

        window.addEventListener("upload-success", handleUploadEvent);

        const runBackgroundSync = async () => {
            try {
                // Fetch storage size constraints
                const sysRes = await fetch('/api/sysinfo');
                if (sysRes.ok) {
                    const sysData = await sysRes.json();
                    setDiskInfo(sysData);
                }

                const res = await fetch('/api/sync', { method: 'POST' });
                if (res.ok) {
                    const data = await res.json();
                    if (data.syncedCount > 0) {
                        // If we actually synced new rogue files, fetch the absolute latest count
                        const statsRes = await fetch('/api/stats', { cache: 'no-store' });
                        if (statsRes.ok) {
                            const statsData = await statsRes.json();
                            setImageCount(statsData.count);
                        }
                    }
                }
            } catch (err) {
                console.error("Failed to run background sync:", err);
            } finally {
                setIsSyncing(false);
            }
        };

        runBackgroundSync();

        return () => window.removeEventListener("upload-success", handleUploadEvent);
    }, []);

    return (
        <div className="p-6 rounded-xl border border-[var(--border)] bg-[var(--card)]/60 backdrop-blur-md shadow-sm flex flex-col justify-between min-h-[200px]">
            <div>
                <div className="h-10 w-10 bg-[var(--primary)]/10 rounded-lg flex items-center justify-center mb-4">
                    <HardDrive className="text-[var(--primary)]" />
                </div>
                <h3 className="text-xl font-bold mb-4">System Storage</h3>

                <div className="text-xs text-[var(--muted-foreground)] mb-1 flex justify-between">
                    <span>Host Drive Payload</span>
                    <span>{((diskInfo.used / diskInfo.total) * 100 || 0).toFixed(1)}%</span>
                </div>
                <div className="w-full bg-[var(--muted)] rounded-full h-4 mb-2 overflow-hidden border border-[var(--border)] relative">
                    <div className="absolute top-0 left-0 bg-[var(--foreground)]/20 h-full transition-all duration-1000" style={{ width: `${(diskInfo.used / diskInfo.total) * 100}%` }}></div>
                    <div className="absolute top-0 left-0 bg-[var(--primary)] h-full transition-all duration-1000 delay-300" style={{ width: `${(diskInfo.wallpapersSize / diskInfo.total) * 100}%` }}></div>
                </div>

                <div className="flex justify-between text-xs text-[var(--muted-foreground)] mb-4 font-medium">
                    <span>Used: {formatBytes(diskInfo.used)}</span>
                    <span>Free: {formatBytes(diskInfo.free)}</span>
                </div>

                <div className="flex items-center justify-between text-xs font-semibold p-2 bg-[var(--primary)]/10 text-[var(--primary)] rounded-lg">
                    <span>Wallpapers Space:</span>
                    <span>{formatBytes(diskInfo.wallpapersSize, 2)}</span>
                </div>
            </div>
            <div className="mt-auto pt-4 border-t border-[var(--border)] flex justify-between items-center text-sm font-medium">
                <span className="text-[var(--muted-foreground)] flex items-center gap-2">
                    Indexed Image Count:
                    {isSyncing && (
                        <span className="flex items-center gap-1.5 text-xs text-[var(--primary)] bg-[var(--primary)]/10 px-2 py-0.5 rounded-full animate-pulse">
                            <div className="h-3 w-3 border-2 border-[var(--primary)]/30 border-t-[var(--primary)] rounded-full animate-spin"></div>
                            Auto-Syncing
                        </span>
                    )}
                </span>
                <span className="text-2xl font-bold text-[var(--primary)] transition-all duration-300">
                    {imageCount}
                </span>
            </div>
        </div>
    );
}

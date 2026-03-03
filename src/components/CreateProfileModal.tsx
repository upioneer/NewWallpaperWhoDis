"use client";

import { useState } from "react";
import { X, CheckCircle2, AlertCircle, Monitor } from "lucide-react";

export function CreateProfileModal({ isOpen, onClose, onSuccess, orientations, luminosities }: { isOpen: boolean, onClose: () => void, onSuccess: () => void, orientations: string[], luminosities: string[] }) {
    const [name, setName] = useState("");
    const [slug, setSlug] = useState("");
    const [triggerType, setTriggerType] = useState<"time" | "request" | "random">("time");

    // Advanced Interval tracking
    const [intervalValue, setIntervalValue] = useState(60);
    const [intervalUnit, setIntervalUnit] = useState("Minutes");

    // Tag Scope tracking
    const [selectedOrientation, setSelectedOrientation] = useState("All");
    const [selectedLuminosity, setSelectedLuminosity] = useState("All");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            // Compute true interval in minutes for the DB based on the new granular UI
            let computedMinutes = intervalValue;
            if (intervalUnit === "Seconds") computedMinutes = intervalValue / 60;
            if (intervalUnit === "Hours") computedMinutes = intervalValue * 60;
            if (intervalUnit === "Days") computedMinutes = intervalValue * 1440;

            const res = await fetch("/api/profiles", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name,
                    slug,
                    triggerType,
                    intervalMinutes: triggerType === "time" ? computedMinutes : undefined,
                    filters: {
                        orientation: selectedOrientation === "All" ? [] : [selectedOrientation],
                        luminosity: selectedLuminosity === "All" ? [] : [selectedLuminosity]
                    }
                }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Failed to create profile");
            }

            // Success
            setName("");
            setSlug("");
            setTriggerType("time");
            setIntervalValue(60);
            setIntervalUnit("Minutes");
            setSelectedOrientation("All");
            setSelectedLuminosity("All");
            onSuccess();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // UX helper to auto-slugify the name if slug runs empty
    const handleNameChange = (val: string) => {
        setName(val);
        if (!slug || slug === name.toLowerCase().replace(/\s+/g, '-')) {
            setSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''));
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">

                <div className="flex items-center justify-between p-6 border-b border-[var(--border)]">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-[var(--primary)]/10 rounded-lg flex items-center justify-center">
                            <Monitor className="text-[var(--primary)]" size={20} />
                        </div>
                        <h2 className="text-xl font-bold">Create New Profile</h2>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)] rounded-full transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6">
                    {error && (
                        <div className="mb-6 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-sm flex items-center gap-2">
                            <AlertCircle size={16} />
                            {error}
                        </div>
                    )}

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1.5 text-[var(--foreground)]">Profile Name</label>
                            <input
                                type="text"
                                required
                                value={name}
                                onChange={(e) => handleNameChange(e.target.value)}
                                placeholder="e.g. Living Room TV"
                                className="w-full px-4 py-2.5 rounded-lg border border-[var(--border)] bg-[var(--background)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/50 transition-all placeholder:text-[var(--muted-foreground)]"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1.5 text-[var(--foreground)]">URL Slug</label>
                            <div className="flex items-center">
                                <span className="px-4 py-2.5 bg-[var(--muted)] border border-r-0 border-[var(--border)] rounded-l-lg text-[var(--muted-foreground)]">
                                    /
                                </span>
                                <input
                                    type="text"
                                    required
                                    value={slug}
                                    onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                                    placeholder="living-room-tv"
                                    className="w-full px-4 py-2.5 rounded-r-lg border border-[var(--border)] bg-[var(--background)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/50 transition-all placeholder:text-[var(--muted-foreground)] font-mono text-sm"
                                />
                            </div>
                            <p className="text-xs text-[var(--muted-foreground)] mt-1 ml-1">
                                The exact URL your screen will visit (e.g. {`your-domain.com/${slug || 'living-room-tv'}`})
                            </p>
                        </div>

                        <div className="space-y-3">
                            <label className="block text-sm font-medium text-[var(--foreground)]">Filter Scope & Tags</label>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <select
                                    value={selectedOrientation}
                                    onChange={(e) => setSelectedOrientation(e.target.value)}
                                    className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--background)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/50 transition-all text-sm text-[var(--foreground)]"
                                >
                                    <option value="All">All Orientations</option>
                                    {orientations.map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>

                                <select
                                    value={selectedLuminosity}
                                    onChange={(e) => setSelectedLuminosity(e.target.value)}
                                    className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--background)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/50 transition-all text-sm text-[var(--foreground)]"
                                >
                                    <option value="All">All Brightness</option>
                                    {luminosities.map(lum => (
                                        <option key={lum} value={lum}>{lum}</option>
                                    ))}
                                </select>
                            </div>
                            <p className="text-xs text-[var(--muted-foreground)] ml-1">
                                Only images matching ALL selected tags will be served to this profile.
                            </p>
                        </div>

                        <div className="pt-2">
                            <label className="block text-sm font-medium mb-1.5 text-[var(--foreground)]">Rotation Trigger</label>
                            <div className="grid grid-cols-3 gap-3">
                                <button type="button" onClick={() => setTriggerType("time")} className={`py-2 px-3 border rounded-lg text-sm font-medium transition-all ${triggerType === "time" ? "border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--primary)]" : "border-[var(--border)] bg-[var(--background)] hover:border-[var(--muted-foreground)] text-[var(--muted-foreground)]"}`}>
                                    Time-based
                                </button>
                                <button type="button" onClick={() => setTriggerType("request")} className={`py-2 px-3 border rounded-lg text-sm font-medium transition-all ${triggerType === "request" ? "border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--primary)]" : "border-[var(--border)] bg-[var(--background)] hover:border-[var(--muted-foreground)] text-[var(--muted-foreground)]"}`}>
                                    Per Request
                                </button>
                                <button type="button" onClick={() => setTriggerType("random")} className={`py-2 px-3 border rounded-lg text-sm font-medium transition-all ${triggerType === "random" ? "border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--primary)]" : "border-[var(--border)] bg-[var(--background)] hover:border-[var(--muted-foreground)] text-[var(--muted-foreground)]"}`}>
                                    Random
                                </button>
                            </div>
                        </div>

                        {triggerType === "time" && (
                            <div className="pt-2 animate-in fade-in slide-in-from-top-2">
                                <label className="block text-sm font-medium mb-1.5 text-[var(--foreground)]">
                                    Rotation Interval
                                </label>
                                <div className="flex gap-3">
                                    <input
                                        type="number"
                                        min="1"
                                        max="999"
                                        value={intervalValue}
                                        onChange={(e) => {
                                            const val = parseInt(e.target.value);
                                            if (!isNaN(val) && val <= 999) setIntervalValue(val);
                                            else if (e.target.value === '') setIntervalValue(0);
                                        }}
                                        className="w-1/3 px-4 py-2.5 rounded-lg border border-[var(--border)] bg-[var(--background)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/50 transition-all"
                                    />
                                    <select
                                        value={intervalUnit}
                                        onChange={(e) => setIntervalUnit(e.target.value)}
                                        className="w-2/3 px-4 py-2.5 rounded-lg border border-[var(--border)] bg-[var(--background)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/50 transition-all text-[#ccc]"
                                    >
                                        <option value="Seconds">Seconds</option>
                                        <option value="Minutes">Minutes</option>
                                        <option value="Hours">Hours</option>
                                        <option value="Days">Days</option>
                                    </select>
                                </div>
                            </div>
                        )}

                        {triggerType === "request" && (
                            <p className="text-sm text-[var(--muted-foreground)] pt-2 animate-in fade-in">
                                The wallpaper will change <strong className="text-[var(--foreground)]">every time</strong> the device visits or refreshes the URL
                            </p>
                        )}

                        {triggerType === "random" && (
                            <p className="text-sm text-[var(--muted-foreground)] pt-2 animate-in fade-in">
                                The server manages rotation schedules arbitrarily and randomly
                            </p>
                        )}

                    </div>

                    <div className="mt-8 flex gap-3 justify-end border-t border-[var(--border)] pt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-5 py-2.5 rounded-lg border border-[var(--border)] bg-transparent hover:bg-[var(--accent)] transition-colors font-medium text-[var(--foreground)]"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading || !name || !slug}
                            className="px-5 py-2.5 rounded-lg bg-[var(--primary)] text-[var(--primary-foreground)] hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium min-w-[120px] flex items-center justify-center"
                        >
                            {loading ? (
                                <div className="h-5 w-5 border-2 border-[var(--primary-foreground)] border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                                "Save Profile"
                            )}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
}

"use client";

import { useState } from "react";
import { X, AlertCircle, Monitor, XCircle, Clock, MapPin, CloudSun, Type, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { ProfileMetadata, KioskWidget } from "@/lib/db";

export function CreateProfileModal({ isOpen, onClose, onSuccess, orientations, luminosities, collections, initialData }: { isOpen: boolean, onClose: () => void, onSuccess: () => void, orientations: string[], luminosities: string[], collections: string[], initialData?: Partial<ProfileMetadata> }) {
    const [name, setName] = useState("");
    const [slug, setSlug] = useState("");
    const [triggerType, setTriggerType] = useState<"time" | "request" | "random">("time");

    // Advanced Interval tracking
    const [intervalValue, setIntervalValue] = useState(60);
    const [intervalUnit, setIntervalUnit] = useState("Minutes");

    // Tag Scope tracking
    const [selectedOrientation, setSelectedOrientation] = useState("All");
    const [selectedLuminosity, setSelectedLuminosity] = useState("All");
    const [selectedCollection, setSelectedCollection] = useState("Any Collection");

    // Local Kiosk Widget mapping
    const [kioskWidgets, setKioskWidgets] = useState<KioskWidget[]>([]);
    const [activeGridZone, setActiveGridZone] = useState<number | null>(null);
    const [modalTextValue, setModalTextValue] = useState("");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const router = useRouter();

    useEffect(() => {
        if (isOpen && initialData) {
            setName(initialData.name || "");
            setSlug(initialData.slug || "");
            setTriggerType(initialData.triggerType || "time");

            if (initialData.triggerType === "time" && initialData.intervalMinutes) {
                if (initialData.intervalMinutes < 1) {
                    setIntervalValue(initialData.intervalMinutes * 60);
                    setIntervalUnit("Seconds");
                } else if (initialData.intervalMinutes >= 1440 && initialData.intervalMinutes % 1440 === 0) {
                    setIntervalValue(initialData.intervalMinutes / 1440);
                    setIntervalUnit("Days");
                } else if (initialData.intervalMinutes >= 60 && initialData.intervalMinutes % 60 === 0) {
                    setIntervalValue(initialData.intervalMinutes / 60);
                    setIntervalUnit("Hours");
                } else {
                    setIntervalValue(initialData.intervalMinutes);
                    setIntervalUnit("Minutes");
                }
            } else {
                setIntervalValue(60);
                setIntervalUnit("Minutes");
            }

            setSelectedOrientation(initialData.filters?.orientation?.[0] || "All");
            setSelectedLuminosity(initialData.filters?.luminosity?.[0] || "All");
            setSelectedCollection(initialData.filters?.collection || "Any Collection");
            setKioskWidgets(initialData.kioskWidgets || []);
        } else if (isOpen) {
            setName("");
            setSlug("");
            setTriggerType("time");
            setIntervalValue(60);
            setIntervalUnit("Minutes");
            setSelectedOrientation("All");
            setSelectedLuminosity("All");
            setSelectedCollection("Any Collection");
            setKioskWidgets([]);
        }
        setError("");
    }, [isOpen, initialData]);

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

            const url = initialData ? `/api/profiles/${initialData.id}` : "/api/profiles";
            const method = initialData ? "PUT" : "POST";

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name,
                    slug,
                    triggerType,
                    intervalMinutes: triggerType === "time" ? computedMinutes : undefined,
                    kioskWidgets,
                    filters: {
                        orientation: selectedOrientation === "All" ? [] : [selectedOrientation],
                        luminosity: selectedLuminosity === "All" ? [] : [selectedLuminosity],
                        collection: selectedCollection === "Any Collection" ? undefined : selectedCollection
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
            setSelectedCollection("Any Collection");
            setKioskWidgets([]);
            onSuccess();
        } catch (err: unknown) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError("An unknown error occurred.");
            }
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
                        <h2 className="text-xl font-bold">{initialData ? "Edit Profile" : "Create New Profile"}</h2>
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

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
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

                                <select
                                    value={selectedCollection}
                                    onChange={(e) => {
                                        if (e.target.value === "CREATE_NEW") {
                                            router.push('/gallery?action=create_collection');
                                            return;
                                        }
                                        setSelectedCollection(e.target.value);
                                    }}
                                    className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--background)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/50 transition-all text-sm text-[var(--foreground)]"
                                >
                                    <option value="CREATE_NEW" className="font-bold text-[var(--primary)] font-medium">+ Create new...</option>
                                    <option value="Any Collection">Any Collection</option>
                                    {collections.map(col => (
                                        <option key={col} value={col}>{col}</option>
                                    ))}
                                </select>
                            </div>
                            <p className="text-xs text-[var(--muted-foreground)] ml-1">
                                Only images matching ALL selected tags will be served to this profile.
                            </p>
                        </div>

                        <div className="pt-2">
                            <label className="block text-sm font-medium mb-1.5 text-[var(--foreground)] flex justify-between">
                                <span>Kiosk UI Overlays</span>
                                <span className="font-normal text-[var(--muted-foreground)] text-xs hidden sm:block">Applies only to `/display/...`</span>
                            </label>
                            <div className="flex items-center justify-center p-4 border border-[var(--border)] rounded-lg bg-[var(--background)]/30">
                                <div className="grid grid-cols-3 gap-2 w-full max-w-[280px] aspect-[16/10] bg-black/40 rounded-lg border border-[var(--border)] p-2 relative overflow-hidden shadow-inner">
                                    <div className="absolute inset-0 bg-gradient-to-br from-[#ec4899]/10 to-transparent pointer-events-none mix-blend-screen" />
                                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(pos => {
                                        const widget = kioskWidgets.find(w => w.position === pos);
                                        return (
                                            <div
                                                key={pos}
                                                onClick={() => {
                                                    setActiveGridZone(pos);
                                                    if (widget?.type === 'text') {
                                                        setModalTextValue(widget.textValue || "");
                                                    } else {
                                                        setModalTextValue("");
                                                    }
                                                }}
                                                className={`border ${widget ? 'border-[var(--primary)] bg-[var(--primary)]/20 shadow-[0_0_10px_var(--primary)] text-[var(--foreground)]' : 'border-[var(--border)] border-dashed hover:bg-[var(--foreground)]/5 text-[var(--muted-foreground)]'} rounded flex flex-col items-center justify-center text-[10px] cursor-pointer transition-all p-1 text-center relative z-10`}
                                            >
                                                {widget ? (
                                                    <>
                                                        <span className="font-bold text-[var(--primary)] uppercase tracking-wider text-[9px] drop-shadow-md">{widget.type}</span>
                                                        {widget.type === "text" && <span className="text-[7px] opacity-70 truncate w-full mt-0.5" title={widget.textValue}>{widget.textValue}</span>}
                                                    </>
                                                ) : (
                                                    <span className="opacity-30 text-lg">+</span>
                                                )}
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
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
                                initialData ? "Save Changes" : "Save Profile"
                            )}
                        </button>
                    </div>

                </form>
            </div>

            {activeGridZone !== null && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[200] flex items-center justify-center p-4" onClick={(e) => {
                    if (e.target === e.currentTarget) setActiveGridZone(null);
                }}>
                    <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6 w-full max-w-sm shadow-2xl animate-in fade-in zoom-in duration-200">
                        <h3 className="font-bold text-lg mb-1 text-center text-[var(--foreground)]">Assign Widget to Profile</h3>
                        <p className="text-xs text-[var(--muted-foreground)] text-center mb-6">Select a module to overlay on grid zone {activeGridZone}.</p>

                        <div className="grid grid-cols-2 gap-3 mb-6">
                            {[
                                { type: "none", icon: XCircle, label: "Empty Zone" },
                                { type: "clock", icon: Clock, label: "Local Time" },
                                { type: "location", icon: MapPin, label: "Target Location" },
                                { type: "weather", icon: CloudSun, label: "Live Weather" },
                            ].map(option => (
                                <button
                                    key={option.type}
                                    onClick={() => {
                                        let current = [...kioskWidgets];
                                        if (option.type === "none") {
                                            current = current.filter(w => w.position !== activeGridZone);
                                        } else {
                                            const existingIndex = current.findIndex(w => w.position === activeGridZone);
                                            if (existingIndex >= 0) {
                                                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                                current[existingIndex] = { ...current[existingIndex], type: option.type as any, textValue: undefined };
                                            } else {
                                                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                                current.push({ id: crypto.randomUUID(), type: option.type as any, position: activeGridZone as any, enabled: true });
                                            }
                                        }
                                        setKioskWidgets(current);
                                        setActiveGridZone(null);
                                    }}
                                    className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl border border-[var(--border)] bg-[var(--background)] hover:bg-[var(--primary)]/10 hover:border-[var(--primary)] transition-all group"
                                >
                                    <option.icon className="w-8 h-8 text-[var(--muted-foreground)] group-hover:text-[var(--primary)] transition-colors" strokeWidth={1.5} />
                                    <span className="text-xs font-semibold text-[var(--foreground)]">{option.label}</span>
                                </button>
                            ))}
                        </div>

                        <div className="border-t border-[var(--border)] pt-5">
                            <label className="text-xs font-bold text-[var(--foreground)] mb-3 flex items-center gap-2 uppercase tracking-wider"><Type size={14} className="text-[var(--primary)]" /> Custom Text Overlays</label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    placeholder="Enter a static message..."
                                    className="flex-1 px-3 py-2.5 rounded-lg border border-[var(--border)] bg-[var(--background)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/50 placeholder:text-[var(--muted-foreground)]"
                                    value={modalTextValue}
                                    onChange={(e) => setModalTextValue(e.target.value)}
                                    maxLength={150}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            const current = [...kioskWidgets];
                                            const existingIndex = current.findIndex(w => w.position === activeGridZone);
                                            if (existingIndex >= 0) {
                                                current[existingIndex] = { ...current[existingIndex], type: "text", textValue: modalTextValue };
                                            } else {
                                                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                                current.push({ id: crypto.randomUUID(), type: "text", position: activeGridZone as any, enabled: true, textValue: modalTextValue });
                                            }
                                            setKioskWidgets(current);
                                            setActiveGridZone(null);
                                            setModalTextValue("");
                                        }
                                    }}
                                />
                                <button
                                    onClick={() => {
                                        const current = [...kioskWidgets];
                                        const existingIndex = current.findIndex(w => w.position === activeGridZone);
                                        if (existingIndex >= 0) {
                                            current[existingIndex] = { ...current[existingIndex], type: "text", textValue: modalTextValue };
                                        } else {
                                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                            current.push({ id: crypto.randomUUID(), type: "text", position: activeGridZone as any, enabled: true, textValue: modalTextValue });
                                        }
                                        setKioskWidgets(current);
                                        setActiveGridZone(null);
                                        setModalTextValue("");
                                    }}
                                    className="px-4 py-2 bg-[var(--primary)] text-[var(--foreground)] rounded-lg text-sm font-bold flex items-center shadow-lg shadow-[var(--primary)]/20 hover:scale-[1.03] active:scale-95 transition-all"
                                >
                                    <Save size={18} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

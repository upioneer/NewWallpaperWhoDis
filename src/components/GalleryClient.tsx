"use client";

import { useState, useCallback, useEffect } from "react";
import { Trash2, Image as ImageIcon, Search, UploadCloud, Eye, X, RefreshCw, FolderPlus, Check, Folders, Edit3 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useDropzone } from "react-dropzone";

export function GalleryClient({ initialImages, initialCollections }: { initialImages: any[], initialCollections: { name: string, images: string[] }[] }) {
    const [images, setImages] = useState(initialImages);
    const [collections, setCollections] = useState(initialCollections);
    const [isDeleting, setIsDeleting] = useState<string | null>(null);
    const [isSyncing, setIsSyncing] = useState<boolean>(false);
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [uploadProgress, setUploadProgress] = useState({ total: 0, completed: 0 });
    const [filter, setFilter] = useState<string>("All"); // Orientation
    const [luminosityFilter, setLuminosityFilter] = useState<string>("All"); // Luminosity
    const [sortOrder, setSortOrder] = useState<string>("A > Z"); // Default sorting

    // Collection Selection State
    const [isSelectingCollection, setIsSelectingCollection] = useState(false);
    const [selectedImages, setSelectedImages] = useState<string[]>([]);
    const [editingCollectionName, setEditingCollectionName] = useState<string | null>(null);

    // Collection Management Modal State
    const [isManageModalOpen, setIsManageModalOpen] = useState(false);
    const [isDeletingCollection, setIsDeletingCollection] = useState<string | null>(null);

    const router = useRouter();

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this wallpaper from your server?")) return;

        setIsDeleting(id);
        try {
            const res = await fetch(`/api/images/${id}`, { method: "DELETE" });
            if (!res.ok) throw new Error("Failed to delete image");

            setImages(prev => prev.filter(img => img.id !== id));
            router.refresh(); // Tell the server to refresh its Next.js cache
        } catch (err) {
            console.error(err);
            alert("Error deleting image.");
        } finally {
            setIsDeleting(null);
        }
    };

    const handleSync = async () => {
        if (isSyncing) return;
        setIsSyncing(true);
        try {
            await fetch('/api/sync?force=true', { method: 'POST' });
            router.refresh();
        } catch (e) {
            console.error("Manual sync failed", e);
        } finally {
            setIsSyncing(false);
        }
    };

    const handleDeleteCollection = async (name: string) => {
        if (!confirm(`Are you sure you want to delete the collection "${name}"?`)) return;

        setIsDeletingCollection(name);
        try {
            const res = await fetch(`/api/collections?name=${encodeURIComponent(name)}`, { method: "DELETE" });
            if (!res.ok) throw new Error("Failed to delete collection");

            setCollections(prev => prev.filter(c => c.name !== name));
            router.refresh();
        } catch (err) {
            console.error(err);
            alert("Error deleting collection.");
        } finally {
            setIsDeletingCollection(null);
        }
    };

    const handleEditCollection = (name: string, collectionImages: string[]) => {
        setIsManageModalOpen(false);
        setIsSelectingCollection(true);
        setSelectedImages(collectionImages);
        setEditingCollectionName(name);
    };

    const onDrop = useCallback((acceptedFiles: File[]) => {
        setUploadProgress(prev => {
            const newTotal = prev.completed === prev.total ? acceptedFiles.length : prev.total + acceptedFiles.length;
            const newCompleted = prev.completed === prev.total ? 0 : prev.completed;
            return { total: newTotal, completed: newCompleted };
        });

        acceptedFiles.forEach(async (file) => {
            try {
                let width = 0;
                let height = 0;
                try {
                    const bitmap = await window.createImageBitmap(file);
                    width = bitmap.width;
                    height = bitmap.height;
                    bitmap.close(); // Free memory
                } catch (imgErr) {
                    console.error("Failed to read dimensions locally", imgErr);
                }

                const formData = new FormData();
                formData.append("file", file);
                if (width > 0) {
                    formData.append("width", width.toString());
                    formData.append("height", height.toString());
                }
                formData.append("overwrite", "true"); // Gallery dropzone assumes overwrite for simplicity

                const res = await fetch("/api/upload", { method: "POST", body: formData });
                if (res.ok) {
                    const data = await res.json();

                    setImages(prev => {
                        const filtered = prev.filter(i => i.id !== file.name);
                        return [{
                            id: file.name,
                            filename: file.name,
                            width: data.width,
                            height: data.height,
                            orientation: data.category?.orientation || "Unknown",
                            aspectRatioBucket: data.category?.aspectRatioBucket || "Custom",
                            color: data.category?.color || "#000000",
                            colorBucket: data.category?.colorBucket || "Black",
                            luminosity: data.category?.luminosity || "Dark",
                            uploadDate: new Date().toISOString()
                        }, ...filtered];
                    });
                }
            } catch (e) {
                console.error("Upload Error:", e);
            } finally {
                setUploadProgress(prev => ({ ...prev, completed: prev.completed + 1 }));
            }
        });
    }, []);

    // Reset progress bar slightly after it hits 100% to let it visually complete
    useEffect(() => {
        if (uploadProgress.total > 0 && uploadProgress.completed === uploadProgress.total) {
            const timeout = setTimeout(() => {
                setUploadProgress({ total: 0, completed: 0 });
                router.refresh();
            }, 1000);
            return () => clearTimeout(timeout);
        }
    }, [uploadProgress, router]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { "image/*": [".png", ".jpg", ".jpeg", ".gif", ".webp", ".avif"] },
        noClick: true, // Don't trigger file dialog on generic page clicks
        noKeyboard: true
    });

    const uniqueCategories = ["All", ...Array.from(new Set(images.map(img => img.orientation || "Unknown")))];
    const uniqueLuminosities = ["All", "Light", "Dark"];

    const filteredImages = images.filter(img => {
        const passOrientation = filter === "All" || img.orientation === filter;
        const passLuminosity = luminosityFilter === "All" || img.luminosity === luminosityFilter;
        return passOrientation && passLuminosity;
    }).sort((a, b) => {
        if (sortOrder === "Newest") {
            return new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime();
        } else if (sortOrder === "Oldest") {
            return new Date(a.uploadDate).getTime() - new Date(b.uploadDate).getTime();
        } else if (sortOrder === "A > Z") {
            return a.filename.localeCompare(b.filename);
        } else if (sortOrder === "Z > A") {
            return b.filename.localeCompare(a.filename);
        }
        return 0;
    });

    return (
        <div {...getRootProps()} className={`min-h-[60vh] rounded-xl transition-colors ${isDragActive ? 'bg-[var(--primary)]/5 outline-dashed outline-2 outline-[var(--primary)]/50' : ''}`}>
            <input {...getInputProps()} />

            {/* Top Progress Bar */}
            {uploadProgress.total > 0 && (
                <div className="fixed top-0 left-0 w-full h-1.5 bg-[var(--muted)] z-[100]">
                    <div
                        className="h-full bg-[var(--primary)] transition-all duration-300 ease-out"
                        style={{ width: `${(uploadProgress.completed / uploadProgress.total) * 100}%` }}
                    />
                </div>
            )}

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 p-4">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight mb-2">My Gallery</h1>
                    <p className="text-[var(--muted-foreground)]">Browse, manage, and delete images from your central repository</p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <button
                        onClick={(e) => { e.stopPropagation(); handleSync(); }}
                        disabled={isSyncing}
                        className="p-2.5 rounded-lg border border-[var(--border)] bg-[var(--background)] hover:bg-[var(--accent)] transition-colors disabled:opacity-50"
                        title="Force Hard Sync Database"
                    >
                        <RefreshCw size={18} className={isSyncing ? "animate-spin text-[var(--primary)]" : "text-[var(--muted-foreground)]"} />
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setIsSelectingCollection(!isSelectingCollection);
                            setSelectedImages([]);
                            setEditingCollectionName(null);
                        }}
                        className={`p-2.5 rounded-lg border transition-colors flex items-center gap-2 ${isSelectingCollection && !editingCollectionName ? 'border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--primary)]' : 'border-[var(--border)] bg-[var(--background)] hover:bg-[var(--accent)] text-[var(--muted-foreground)]'}`}
                        title="Create New Collection"
                    >
                        <FolderPlus size={18} />
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setIsManageModalOpen(true);
                        }}
                        className="p-2.5 rounded-lg border border-[var(--border)] bg-[var(--background)] hover:bg-[var(--accent)] text-[var(--muted-foreground)] transition-colors"
                        title="Manage Collections"
                    >
                        <Folders size={18} />
                    </button>
                    <select
                        value={sortOrder}
                        onChange={(e) => setSortOrder(e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                        className="text-sm font-medium px-3 py-2 bg-[var(--background)]/80 backdrop-blur-md border border-[var(--border)] rounded-lg outline-none focus:border-[var(--primary)] transition-colors text-[var(--foreground)]"
                    >
                        <option value="Newest">Newest first</option>
                        <option value="Oldest">Oldest first</option>
                        <option value="A > Z">A &gt; Z</option>
                        <option value="Z > A">Z &gt; A</option>
                    </select>
                    <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        onClick={(e) => e.stopPropagation()} // Prevent dropzone click
                        className="text-sm font-medium px-3 py-2 bg-[var(--background)]/80 backdrop-blur-md border border-[var(--border)] rounded-lg outline-none focus:border-[var(--primary)] transition-colors text-[var(--foreground)]"
                    >
                        {uniqueCategories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                    <select
                        value={luminosityFilter}
                        onChange={(e) => setLuminosityFilter(e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                        className="text-sm font-medium px-3 py-2 bg-[var(--background)]/80 backdrop-blur-md border border-[var(--border)] rounded-lg outline-none focus:border-[var(--primary)] transition-colors text-[var(--foreground)]"
                    >
                        {uniqueLuminosities.map(lum => (
                            <option key={lum} value={lum}>{lum === "All" ? "All Brightness" : lum}</option>
                        ))}
                    </select>
                    <div className="text-sm font-medium px-4 py-2 bg-[var(--primary)]/10 text-[var(--primary)] rounded-lg whitespace-nowrap">
                        {filteredImages.length} {filteredImages.length === 1 ? 'Wallpaper' : 'Wallpapers'}
                    </div>
                </div>
            </div>

            {images.length === 0 ? (
                <div className="p-16 text-center rounded-xl border border-dashed border-[var(--border)] bg-[var(--card)]/40 backdrop-blur-sm m-4">
                    <div className="inline-flex h-16 w-16 bg-[var(--primary)]/10 text-[var(--primary)] rounded-full items-center justify-center mb-4">
                        <ImageIcon size={32} />
                    </div>
                    <h3 className="text-xl font-bold mb-2">Your library is completely empty</h3>
                    <p className="text-[var(--muted-foreground)] max-w-md mx-auto">
                        Upload some images on the dashboard to populate your wallpaper gallery.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 p-4">
                    {filteredImages.map((img) => (
                        <div
                            key={img.id}
                            onClick={(e) => {
                                if (isSelectingCollection) {
                                    e.stopPropagation();
                                    setSelectedImages(prev =>
                                        prev.includes(img.id) ? prev.filter(i => i !== img.id) : [...prev, img.id]
                                    );
                                }
                            }}
                            className={`group relative rounded-xl overflow-hidden border ${isSelectingCollection && selectedImages.includes(img.id) ? 'border-[var(--primary)] shadow-[0_0_0_2px_var(--primary)]' : 'border-[var(--border)]'} bg-[var(--card)]/60 backdrop-blur-sm shadow-sm hover:shadow-md transition-all ${isSelectingCollection ? 'cursor-pointer' : ''}`}
                        >

                            {/* Image Thumbnail Placeholder / Mock using raw path (since we don't have a static router pointing to the raw dir yet) */}
                            <div className="aspect-video bg-[var(--muted)]/50 flex flex-col items-center justify-center text-[var(--muted-foreground)] relative">
                                <img
                                    src={`/api/raw/${img.id}`}
                                    alt={img.filename}
                                    loading="lazy"
                                    className={`w-full h-full object-cover transition-all ${isSelectingCollection && selectedImages.includes(img.id) ? 'opacity-80 scale-105' : ''}`}
                                />

                                {/* Selection Checkmark Overlay */}
                                {isSelectingCollection && (
                                    <div className="absolute top-3 right-3 z-20">
                                        {selectedImages.includes(img.id) ? (
                                            <div className="h-6 w-6 bg-[var(--primary)] rounded-full flex items-center justify-center text-[var(--primary-foreground)] shadow-lg">
                                                <Check size={14} strokeWidth={3} />
                                            </div>
                                        ) : (
                                            <div className="h-6 w-6 bg-black/40 border-2 border-white/60 rounded-full shadow-lg backdrop-blur-sm group-hover:bg-black/60 transition-colors" />
                                        )}
                                    </div>
                                )}

                                {/* Hover Overlay */}
                                {!isSelectingCollection && (
                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-3 backdrop-blur-sm p-4">
                                        <div className="flex items-center gap-3">
                                            <button
                                                onClick={(e) => { e.stopPropagation(); setPreviewImage(img.id); }}
                                                className="p-3 bg-white/20 hover:bg-white/40 text-white rounded-full transition-colors backdrop-blur-md"
                                                title="Preview Image"
                                            >
                                                <Eye size={18} />
                                            </button>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleDelete(img.id); }}
                                                disabled={isDeleting === img.id}
                                                className="p-3 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors disabled:opacity-50"
                                                title="Delete Image"
                                            >
                                                {isDeleting === img.id ? (
                                                    <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                                ) : (
                                                    <Trash2 size={18} />
                                                )}
                                            </button>
                                        </div>
                                        <p className="text-white/90 text-sm break-all text-center font-medium mt-1 max-w-full truncate px-2" title={img.filename}>
                                            {img.filename}
                                        </p>
                                    </div>
                                )}
                            </div>

                            <div className="p-4">
                                <p className="text-xs font-mono text-[var(--muted-foreground)] mb-2 flex items-center justify-between gap-2">
                                    <span>{img.orientation || 'Unknown'} &bull; {img.luminosity || 'Dark'}</span>
                                </p>
                                <div className="text-xs text-[var(--foreground)] font-medium flex justify-between">
                                    <span>{img.width}x{img.height}</span>
                                    <span className="opacity-50">{new Date(img.uploadDate).toLocaleDateString()}</span>
                                </div>
                            </div>

                        </div>
                    ))}
                </div>
            )}

            {/* Full-Screen Preview Modal */}
            {previewImage && (
                <div
                    className="fixed inset-0 z-[200] bg-black/95 flex flex-col items-center justify-center p-4 sm:p-8 animate-in fade-in duration-200"
                    onClick={() => setPreviewImage(null)}
                >
                    <button
                        onClick={(e) => { e.stopPropagation(); setPreviewImage(null); }}
                        className="absolute top-4 sm:top-8 right-4 sm:right-8 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors backdrop-blur-md z-10"
                    >
                        <X size={24} />
                    </button>
                    <img
                        src={`/api/raw/${previewImage}`}
                        alt="Preview"
                        className="max-w-[66vw] max-h-[66vh] object-contain rounded-md shadow-2xl"
                    />
                </div>
            )}

            {/* Floating Selection Bar */}
            {isSelectingCollection && (
                <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] bg-[var(--card)]/90 backdrop-blur-md border border-[var(--border)] shadow-2xl rounded-full px-6 py-3 flex items-center gap-6 animate-in slide-in-from-bottom-5 fade-in duration-200">
                    <span className="font-bold whitespace-nowrap">{selectedImages.length} selected</span>
                    <div className="flex gap-2">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsSelectingCollection(false);
                                setSelectedImages([]);
                                setEditingCollectionName(null);
                            }}
                            className="px-4 py-2 rounded-full border border-[var(--border)] hover:bg-[var(--accent)] transition-colors text-sm font-medium whitespace-nowrap"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={async (e) => {
                                e.stopPropagation();
                                if (selectedImages.length === 0) {
                                    alert("Select at least one image to save this collection.");
                                    return;
                                }
                                const name = prompt("Enter a name for this collection:", editingCollectionName || "");
                                if (!name) return;

                                try {
                                    const res = await fetch('/api/collections', {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({ name, images: selectedImages })
                                    });
                                    if (!res.ok) throw new Error("Failed to save collection");

                                    // Refresh local state if editing name changed or just updating images
                                    setCollections(prev => {
                                        const filtered = prev.filter(c => c.name !== name && c.name !== editingCollectionName);
                                        return [...filtered, { name, images: selectedImages }].sort((a, b) => a.name.localeCompare(b.name));
                                    });

                                    // If we renamed it, delete the old one
                                    if (editingCollectionName && editingCollectionName !== name) {
                                        await fetch(`/api/collections?name=${encodeURIComponent(editingCollectionName)}`, { method: "DELETE" });
                                    }

                                    setIsSelectingCollection(false);
                                    setSelectedImages([]);
                                    setEditingCollectionName(null);
                                    router.refresh(); // Refresh to pull updated collections in top-level app state if needed
                                } catch (err) {
                                    alert("Error saving collection.");
                                }
                            }}
                            className="px-5 py-2 rounded-full bg-[var(--primary)] text-[var(--primary-foreground)] hover:brightness-110 transition-colors text-sm font-bold whitespace-nowrap shadow-[0_0_15px_rgba(var(--primary-rgb),0.3)]"
                        >
                            {editingCollectionName ? "Update Collection" : "Save Collection"}
                        </button>
                    </div>
                </div>
            )}

            {/* Manage Collections Modal */}
            {isManageModalOpen && (
                <div
                    onClick={() => setIsManageModalOpen(false)}
                    className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        className="bg-[var(--background)] border border-[var(--border)] rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[85vh]"
                    >
                        <div className="flex justify-between items-center p-6 border-b border-[var(--border)]/50">
                            <div>
                                <h2 className="text-xl font-bold">Manage Collections</h2>
                                <p className="text-sm text-[var(--muted-foreground)] mt-1">Edit or delete your curated lists</p>
                            </div>
                            <button onClick={() => setIsManageModalOpen(false)} className="p-2 hover:bg-[var(--accent)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] rounded-full transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="overflow-y-auto p-6 flex-1">
                            {collections.length === 0 ? (
                                <div className="text-center py-8 text-[var(--muted-foreground)] flex flex-col items-center gap-2">
                                    <Folders size={32} className="opacity-20" />
                                    <p>You have not created any collections yet.</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {collections.map((collection) => (
                                        <div key={collection.name} className="flex items-center justify-between p-4 rounded-xl border border-[var(--border)] bg-[var(--card)]/50 hover:border-[var(--primary)]/30 transition-colors">
                                            <div>
                                                <h3 className="font-bold">{collection.name}</h3>
                                                <p className="text-xs text-[var(--muted-foreground)] mt-0.5">{collection.images.length} item{collection.images.length !== 1 && 's'}</p>
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleEditCollection(collection.name, collection.images)}
                                                    className="p-2 rounded-lg bg-[var(--background)] border border-[var(--border)] hover:bg-[var(--primary)]/10 hover:border-[var(--primary)]/30 hover:text-[var(--primary)] transition-colors"
                                                    title="Edit Collection"
                                                >
                                                    <Edit3 size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteCollection(collection.name)}
                                                    disabled={isDeletingCollection === collection.name}
                                                    className="p-2 rounded-lg bg-[var(--background)] border border-[var(--border)] hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/30 transition-colors disabled:opacity-50"
                                                    title="Delete Collection"
                                                >
                                                    {isDeletingCollection === collection.name ? (
                                                        <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                                                    ) : (
                                                        <Trash2 size={16} />
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

"use client";

import React, { useState, useCallback } from "react";
import { useDropzone, FileRejection } from "react-dropzone";
import { UploadCloud, CheckCircle2, AlertCircle, X, Loader2 } from "lucide-react";

export function UploadDropzone() {
    const [uploading, setUploading] = useState(false);
    const [messages, setMessages] = useState<Array<{ id: string, type: "success" | "error" | "warning", text: string, file?: File }>>([]);

    const addMessage = (type: "success" | "error" | "warning", text: string, file?: File) => {
        const id = Math.random().toString(36).substring(7);
        setMessages(prev => [...prev, { id, type, text, file }]);

        // Auto-dismiss successes after 10 seconds
        if (type === "success") {
            setTimeout(() => removeMessage(id), 10000);
        }
    };

    const removeMessage = (id: string) => {
        setMessages(prev => prev.filter(m => m.id !== id));
    };

    const processUpload = async (file: File, overwrite: boolean = false, messageIdToRemove?: string) => {
        if (messageIdToRemove) {
            removeMessage(messageIdToRemove);
        }

        setUploading(true);

        try {
            // Pre-process dimensions locally before sending it across the wire
            let width = 0;
            let height = 0;
            try {
                const bitmap = await window.createImageBitmap(file);
                width = bitmap.width;
                height = bitmap.height;
                bitmap.close();
            } catch (imgErr) {
                console.error("Failed to extract dimensions locally:", imgErr);
            }

            const formData = new FormData();
            formData.append("file", file);
            if (width > 0) {
                formData.append("width", width.toString());
                formData.append("height", height.toString());
            }
            if (overwrite) {
                formData.append("overwrite", "true");
            }

            const res = await fetch("/api/upload", {
                method: "POST",
                body: formData,
            });

            if (res.status === 409) {
                // Pending Conflict
                addMessage("warning", `A file named "${file.name}" already exists.`, file);
            } else if (!res.ok) {
                throw new Error("Upload failed");
            } else {
                const data = await res.json();
                addMessage("success", `Uploaded ${file.name}! (${data.width}x${data.height})`);

                // Dispatch global event for the Storage widget to catch, passing whether it was genuinely new
                window.dispatchEvent(new CustomEvent("upload-success", { detail: { isNew: data.isNew } }));
            }
        } catch (err) {
            console.error(err);
            addMessage("error", `Error uploading ${file.name}. Please try again.`);
        } finally {
            setUploading(false);
        }
    };

    const onDrop = useCallback((acceptedFiles: File[]) => {
        // Process all dropped files concurrently
        acceptedFiles.forEach(file => {
            processUpload(file);
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const onDropRejected = useCallback((fileRejections: FileRejection[]) => {
        // Check if any files were rejected because of the too-many-files rule
        const tooManyFiles = fileRejections.some(rejection =>
            rejection.errors.some(error => error.code === "too-many-files")
        );

        if (tooManyFiles) {
            addMessage("error", "Maximum 20 files allowed per batch. Please upload in smaller chunks.");
        } else {
            fileRejections.forEach(rejection => {
                addMessage("error", `Failed to upload ${rejection.file.name}. Invalid file type or unknown error.`);
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        onDropRejected,
        accept: {
            "image/*": [".png", ".jpg", ".jpeg", ".gif", ".webp", ".avif"]
        },
        multiple: true,
        maxFiles: 20
    });

    return (
        <div className="p-6 rounded-xl border border-[var(--border)] bg-[var(--card)]/60 backdrop-blur-md shadow-sm transition h-full flex flex-col justify-between overflow-hidden">
            <div>
                <div className="h-10 w-10 bg-[var(--primary)]/10 rounded-lg flex items-center justify-center mb-4 flex-shrink-0">
                    <UploadCloud className="text-[var(--primary)]" />
                </div>
                <h3 className="text-xl font-bold mb-2">Upload Wallpapers</h3>
                <p className="text-[var(--muted-foreground)] mb-4 text-sm">
                    Drop your images here for batch processing. They will be automatically categorized by dimension and orientation
                </p>
            </div>

            <div className="flex-grow flex flex-col min-h-[150px]">
                {/* Dropzone Area */}
                <div
                    {...getRootProps()}
                    className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-colors flex-grow flex items-center justify-center min-h-[100px] ${isDragActive ? "border-[var(--primary)] bg-[var(--primary)]/10" : "border-[var(--border)] hover:border-[var(--primary)]/50"
                        }`}
                >
                    <input {...getInputProps()} />
                    <div className="flex flex-col items-center gap-2">
                        {uploading ? (
                            <>
                                <Loader2 className="animate-spin text-[var(--primary)]" size={24} />
                                <p className="text-sm font-medium">Processing images...</p>
                            </>
                        ) : (
                            <>
                                <UploadCloud className="text-[var(--muted-foreground)]" size={24} />
                                <p className="text-sm font-medium">Drag & drop, or click to browse</p>
                            </>
                        )}
                    </div>
                </div>

                {/* Notifications and Conflicts */}
                {messages.length > 0 && (
                    <div className="mt-4 flex flex-col gap-2 overflow-y-auto max-h-40 pr-2">
                        {[...messages].sort((a, b) => {
                            if (a.type === "warning" && b.type !== "warning") return -1;
                            if (b.type === "warning" && a.type !== "warning") return 1;
                            return 0;
                        }).map((msg) => (
                            <div
                                key={msg.id}
                                className={`p-3 rounded-lg text-sm border flex flex-col gap-2 ${msg.type === "success" ? "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20" :
                                    msg.type === "error" ? "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20" :
                                        "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20"
                                    }`}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        {msg.type === "success" ? <CheckCircle2 className="flex-shrink-0" size={16} /> : msg.type === "error" ? <X className="flex-shrink-0" size={16} /> : <AlertCircle className="flex-shrink-0" size={16} />}
                                        <span className="font-medium truncate max-w-[180px]" title={msg.text}>{msg.text}</span>
                                    </div>
                                    {msg.type !== "warning" && (
                                        <button onClick={() => removeMessage(msg.id)} className="hover:bg-black/10 dark:hover:bg-white/10 rounded-full p-1 transition">
                                            <X size={14} />
                                        </button>
                                    )}
                                </div>

                                {/* Overwrite Confirmation actions for warning type */}
                                {msg.type === "warning" && msg.file && (
                                    <div className="flex gap-2 justify-end mt-1">
                                        <button
                                            onClick={() => removeMessage(msg.id)}
                                            className="px-2 py-1 rounded border border-yellow-500/30 hover:bg-black/5 dark:hover:bg-white/10 transition text-xs font-semibold"
                                        >
                                            Skip
                                        </button>
                                        <button
                                            onClick={() => processUpload(msg.file!, true, msg.id)}
                                            className="px-2 py-1 rounded bg-[var(--primary)] text-[var(--primary-foreground)] hover:brightness-110 transition text-xs font-semibold shadow-sm"
                                        >
                                            Overwrite
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

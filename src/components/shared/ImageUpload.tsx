"use client"

import React, { useRef, useState, useCallback } from "react"
import { Upload, X, Link, ImageIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface ImageUploadProps {
    value: string
    onChange: (value: string) => void
    /** "avatar" = circle, "logo" = rounded square */
    variant?: "avatar" | "logo"
    className?: string
    placeholder?: string
}

export function ImageUpload({
    value,
    onChange,
    variant = "avatar",
    className,
    placeholder = "Drop an image or click to upload",
}: ImageUploadProps) {
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [isDragging, setIsDragging] = useState(false)
    const [showUrlInput, setShowUrlInput] = useState(false)
    const [urlValue, setUrlValue] = useState("")

    const handleFile = useCallback((file: File) => {
        if (!file.type.startsWith("image/")) return
        if (file.size > 5 * 1024 * 1024) {
            alert("Image must be under 5MB")
            return
        }
        const reader = new FileReader()
        reader.onload = (e) => {
            onChange(e.target?.result as string)
        }
        reader.readAsDataURL(file)
    }, [onChange])

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)
        const file = e.dataTransfer.files[0]
        if (file) handleFile(file)
    }, [handleFile])

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(true)
    }, [])

    const handleDragLeave = useCallback(() => {
        setIsDragging(false)
    }, [])

    const handleUrlSubmit = () => {
        if (urlValue.trim()) {
            onChange(urlValue.trim())
            setUrlValue("")
            setShowUrlInput(false)
        }
    }

    const sizeClass = variant === "avatar" ? "size-20 rounded-full" : "size-20 rounded-xl"

    return (
        <div className={cn("flex flex-col gap-3", className)}>
            {/* Preview + Dropzone */}
            <div className="flex items-center gap-4">
                {/* Image Preview */}
                <div
                    className={cn(
                        sizeClass,
                        "border-2 border-dashed bg-zinc-50 flex items-center justify-center overflow-hidden shrink-0 transition-colors duration-200",
                        isDragging
                            ? "border-zinc-900 bg-zinc-100"
                            : value
                                ? "border-transparent"
                                : "border-zinc-200 hover:border-zinc-300"
                    )}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onClick={() => !value && fileInputRef.current?.click()}
                    role={value ? undefined : "button"}
                    tabIndex={value ? undefined : 0}
                    onKeyDown={(e) => {
                        if (!value && (e.key === "Enter" || e.key === " ")) {
                            e.preventDefault()
                            fileInputRef.current?.click()
                        }
                    }}
                >
                    {value ? (
                        <div className="relative size-full group">
                            <img
                                src={value}
                                alt="Uploaded image"
                                className="size-full object-cover"
                                onError={(e) => {
                                    (e.target as HTMLImageElement).style.display = "none"
                                }}
                            />
                            {/* Remove button on hover */}
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation()
                                    onChange("")
                                }}
                                className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                            >
                                <X className="h-5 w-5 text-white" />
                            </button>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center gap-1.5 p-2">
                            <Upload className={cn(
                                "transition-colors",
                                isDragging ? "text-zinc-900" : "text-zinc-400"
                            )} />
                            <span className="text-[10px] text-zinc-400 text-center leading-tight">
                                {isDragging ? "Drop here" : "Upload"}
                            </span>
                        </div>
                    )}
                </div>

                {/* Hidden file input */}
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) handleFile(file)
                        e.target.value = ""
                    }}
                />

                {/* Actions */}
                <div className="flex flex-col gap-2 text-xs">
                    {!value && (
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="text-zinc-600 hover:text-zinc-900 font-medium transition-colors text-left"
                        >
                            Click to upload
                        </button>
                    )}
                    <button
                        type="button"
                        onClick={() => setShowUrlInput(!showUrlInput)}
                        className="text-zinc-400 hover:text-zinc-600 font-medium transition-colors flex items-center gap-1.5 text-left"
                    >
                        <Link className="h-3 w-3" />
                        {showUrlInput ? "Hide URL input" : value ? "Paste image URL instead" : "Or paste URL"}
                    </button>
                    {value && (
                        <button
                            type="button"
                            onClick={() => onChange("")}
                            className="text-red-500 hover:text-red-600 font-medium transition-colors text-left"
                        >
                            Remove image
                        </button>
                    )}
                </div>
            </div>

            {/* URL Input */}
            <div className={cn("flex gap-2 transition-all duration-200", !showUrlInput && "opacity-0 h-0 overflow-hidden pointer-events-none")}>
                {showUrlInput && <>
                    <input
                        type="url"
                        value={urlValue}
                        onChange={(e) => setUrlValue(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                e.preventDefault()
                                handleUrlSubmit()
                            }
                        }}
                        placeholder="https://example.com/image.png"
                        className="flex-1 h-9 rounded-lg border border-zinc-200 bg-white px-3 text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-900/10 focus:border-zinc-900 transition-colors duration-150"
                    />
                    <button
                        type="button"
                        onClick={handleUrlSubmit}
                        disabled={!urlValue.trim()}
                        className="h-9 px-3 rounded-lg bg-zinc-900 text-white text-xs font-medium hover:bg-zinc-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Apply
                    </button>
                </>}
            </div>
        </div>
    )
}

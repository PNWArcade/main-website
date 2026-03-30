'use client'

import { useState, useRef, useEffect } from 'react'
import { Upload, X, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ImageUploaderProps {
    value: string
    onChange: (url: string) => void
    onFileSelect?: (file: File | null) => void  // For preview mode
    folder?: string
    className?: string
    aspectRatio?: 'square' | 'video' | 'wide' | 'auto'
    maxHeight?: number
    previewMode?: boolean  // If true, don't upload immediately, just preview
}

// Helper function to upload a file to the bucket
export async function uploadImageToBucket(file: File, folder: string = 'general'): Promise<string> {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('folder', folder)

    const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
    })

    const data = await response.json()

    if (!response.ok) {
        throw new Error(data.error || 'Upload failed')
    }

    return data.url
}

export default function ImageUploader({
    value,
    onChange,
    onFileSelect,
    folder = 'general',
    className,
    aspectRatio = 'auto',
    maxHeight = 200,
    previewMode = false,
}: ImageUploaderProps) {
    const [isUploading, setIsUploading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [dragOver, setDragOver] = useState(false)
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)
    const inputRef = useRef<HTMLInputElement>(null)

    const aspectRatioClasses = {
        square: 'aspect-square',
        video: 'aspect-video',
        wide: 'aspect-[21/9]',
        auto: '',
    }

    // Clean up preview URL when component unmounts
    useEffect(() => {
        return () => {
            if (previewUrl) {
                URL.revokeObjectURL(previewUrl)
            }
        }
    }, [previewUrl])

    const handleFileSelect = (file: File) => {
        if (previewMode) {
            // Preview mode: create local preview URL and notify parent
            if (previewUrl) {
                URL.revokeObjectURL(previewUrl)
            }
            const url = URL.createObjectURL(file)
            setPreviewUrl(url)
            onFileSelect?.(file)
        } else {
            // Immediate upload mode
            handleUpload(file)
        }
    }

    const handleUpload = async (file: File) => {
        setIsUploading(true)
        setError(null)

        try {
            const url = await uploadImageToBucket(file, folder)
            onChange(url)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Upload failed')
        } finally {
            setIsUploading(false)
        }
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            handleFileSelect(file)
        }
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        setDragOver(false)
        const file = e.dataTransfer.files?.[0]
        if (file && file.type.startsWith('image/')) {
            handleFileSelect(file)
        }
    }

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault()
        setDragOver(true)
    }

    const handleDragLeave = () => {
        setDragOver(false)
    }

    const handleRemove = () => {
        if (previewUrl) {
            URL.revokeObjectURL(previewUrl)
            setPreviewUrl(null)
        }
        onChange('')
        onFileSelect?.(null)
        if (inputRef.current) {
            inputRef.current.value = ''
        }
    }

    // Display URL is either the preview URL or the saved value
    const displayUrl = previewUrl || value

    return (
        <div className={cn('relative', className)}>
            <input
                ref={inputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
            />

            {displayUrl ? (
                <div 
                    className={cn(
                        'relative rounded-lg overflow-hidden border border-gray-200',
                        aspectRatioClasses[aspectRatio]
                    )}
                    style={{ maxHeight: aspectRatio === 'auto' ? maxHeight : undefined }}
                >
                    <img
                        src={displayUrl}
                        alt="Uploaded image"
                        className={cn(
                            'object-cover',
                            aspectRatio === 'auto' ? 'w-full' : 'w-full h-full'
                        )}
                        style={{ maxHeight: aspectRatio === 'auto' ? maxHeight : undefined }}
                    />
                    <button
                        type="button"
                        onClick={handleRemove}
                        className="absolute top-2 right-2 p-1 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors"
                    >
                        <X className="h-4 w-4" />
                    </button>
                    {previewUrl && (
                        <div className="absolute bottom-2 left-2 px-2 py-1 bg-yellow-500 text-white text-xs rounded">
                            Unsaved
                        </div>
                    )}
                </div>
            ) : (
                <div
                    onClick={() => inputRef.current?.click()}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    className={cn(
                        'flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-6 cursor-pointer transition-colors',
                        dragOver ? 'border-black bg-gray-100' : 'border-gray-300 hover:border-gray-400',
                        isUploading && 'pointer-events-none opacity-50'
                    )}
                >
                    {isUploading ? (
                        <>
                            <Loader2 className="h-8 w-8 text-gray-400 animate-spin mb-2" />
                            <span className="text-sm text-gray-500">Uploading...</span>
                        </>
                    ) : (
                        <>
                            <Upload className="h-8 w-8 text-gray-400 mb-2" />
                            <span className="text-sm text-gray-500">
                                Click to upload or drag and drop
                            </span>
                            <span className="text-xs text-gray-400 mt-1">
                                PNG, JPG, GIF, WebP, SVG up to 5MB
                            </span>
                        </>
                    )}
                </div>
            )}

            {error && (
                <p className="text-sm text-red-500 mt-2">{error}</p>
            )}
        </div>
    )
}

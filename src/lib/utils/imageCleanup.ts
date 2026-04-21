import { createClient } from '@/lib/supabase/client'

/**
 * Extracts the file path from a Supabase Storage public URL
 * Example: https://example.com/storage/v1/object/public/images/sponsors/123-abc.png
 * Returns: sponsors/123-abc.png
 */
function extractFilePathFromUrl(url: string): string | null {
    try {
        const urlObj = new URL(url)
        const pathname = urlObj.pathname
        // Path pattern: /storage/v1/object/public/images/{filepath}
        const match = pathname.match(/\/storage\/v1\/object\/public\/images\/(.+)/)
        return match ? match[1] : null
    } catch {
        return null
    }
}

/**
 * Deletes an image from Supabase Storage
 * Safe to call even if the image doesn't exist
 * @param imageUrl - The public URL of the image to delete
 */
export async function deleteImageFromBucket(imageUrl: string): Promise<void> {
    try {
        const filePath = extractFilePathFromUrl(imageUrl)
        if (!filePath) {
            console.warn('Could not extract file path from URL:', imageUrl)
            return
        }

        const supabase = createClient()
        const { error } = await supabase.storage
            .from('images')
            .remove([filePath])

        if (error) {
            // Don't throw - log warning instead
            // This prevents image cleanup failures from breaking the app
            console.warn('Failed to delete image from storage:', error)
        }
    } catch (error) {
        console.warn('Error during image cleanup:', error)
    }
}

/**
 * Safely deletes multiple images from Supabase Storage
 * @param imageUrls - Array of public URLs to delete
 */
export async function deleteImagesFromBucket(imageUrls: string[]): Promise<void> {
    const filePaths = imageUrls
        .map(url => extractFilePathFromUrl(url))
        .filter((path): path is string => path !== null)

    if (filePaths.length === 0) return

    try {
        const supabase = createClient()
        const { error } = await supabase.storage
            .from('images')
            .remove(filePaths)

        if (error) {
            console.warn('Failed to delete images from storage:', error)
        }
    } catch (error) {
        console.warn('Error during batch image cleanup:', error)
    }
}

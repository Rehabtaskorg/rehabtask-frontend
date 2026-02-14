import { supabase } from "./supabase";

/**
 * Upload file directly to Supabase Storage
 * @param {File} file - The file to upload
 * @param {string} bucket - Bucket name ('profile-images' or 'license-documents')
 * @param {string} userId - User ID for path construction
 * @param {string} type - File type ('profile' or 'license')
 * @returns {Promise<{url: string, path: string, error: null} | {error: string}>}
 */
export const uploadFileToSupabase = async (file, bucket, userId, type = "license") => {
    if (!supabase) {
        return { error: "Supabase client not initialized" };
    }

    const maxSize = bucket === 'profile-images' ? 5 * 1024 * 1024 : 10 * 1024 * 1024; // 5MB for images, 10MB for docs

    if (file.size > maxSize) {
        return {
            error: `File too large. Maximum size is ${maxSize / 1024 / 1024}MB`
        };
    }

    // Validate MIME type
    const allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    const allowedDocTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];

    const allowedTypes = bucket === "profile-images" ? allowedImageTypes : allowedDocTypes;

    if (!allowedTypes.includes(file.type)) {
        return {
            error: `Invalid file type. Allowed: ${allowedTypes.join(', ')}`
        };
    }

    try {
        // Generate unique file path
        const timestamp = Date.now();
        const fileExt = file.name.split(".").pop();
        const fileName = type === 'profile'
            ? `${userId}.${fileExt}`
            : `${userId}_${timestamp}.${fileExt}`;

        const filePath = type === 'profile' ? fileName : `${userId}/${fileName}`;

        // Upload to Supabase Storage
        const { data, error } = await supabase.storage
            .from(bucket)
            .upload(filePath, file, {
                cacheControl: "3600",
                upsert: type === "profile",
            });

        if (error) {
            console.error("Supabase upload error:", error);
            return { error: error.message };
        }

        // Get public URL for profile images (public bucket)
        if (bucket === "profile-images") {
            const { data: { publicUrl } } = supabase.storage
                .from(bucket)
                .getPublicUrl(filePath);

            return {
                url: publicUrl,
                path: filePath,
                error: null
            }
        }

        // For license documents (private bucket), return path only
        return {
            url: null,
            path: filePath,
            error: null
        };
    } catch (error) {
        console.error("File upload failed:", error);
        return {
            error: "File upload failed. Please try again."
        };
    }



}

/**
 * Delete file from Supabase Storage
 * @param {string} bucket - Bucket name
 * @param {string} filePath - File path is bucket
 * @returns {Promise<{error:null} | {error:string}>}
 */
export const deleteFileFromSupabase = async (bucket, filePath) => {
    if (!supabase) {
        return { error: "Supabase client not initialized" };
    }

    try {
        const { error } = await supabase.storage
            .from(bucket)
            .remove([filePath]);

        if (error) {
            console.error("Supabase delete error:", error);
            return { error: error.message };
        }

        return { error: null };
    } catch (error) {
        console.error("File deletion failed:", error);
        return { error: "File deletion failed" };
    }
};

/**
 * Get signed URL for private document
 * @param {string} filePath - File path in license-documents bucket
 * @param {number} expiresIn - Expiry time in seconds (default: 60)
 * @returns {Promise<{signedUrl: string, error: null} | {error: string}>}
 */
export const getSignedDocumentUrl = async (filePath, expiresIn = 60) => {
    if (!supabase) {
        return { error: "Supabase client not initialized" };
    }

    try {
        const { data, error } = await supabase.storage
            .from("license-documents")
            .createSignedUrl(filePath, expiresIn);

        if (error) {
            console.error("Signed URL error:", error);
            return { error: error.message };
        }

        return {
            signedUrl: data.signedUrl,
            error: null
        };
    } catch (error) {
        console.error("Get signed URL failed:", error);
        return { error: "Failed to get signed URL" };
    }
}
"use client";

import Image from "next/image";
import { MdCameraAlt } from "react-icons/md";

const getInitials = (fullName) =>
    fullName
        ? fullName
              .split(" ")
              .map((part) => part[0])
              .join("")
              .toUpperCase()
              .slice(0, 2)
        : "?";

/**
 * Avatar with an overlaid camera button that opens the file picker. Falls back
 * to the therapist's initials when there is no photo or the image fails to load.
 *
 * @param {Object} props
 * @param {string|null} [props.photoUrl] - Current photo URL.
 * @param {string} [props.fullName] - Used for the initials fallback.
 * @param {boolean} props.isImgError - True once the image has failed to load.
 * @param {boolean} props.isUploading - Disables the button and swaps the helper text.
 * @param {() => void} props.onImgError - Called when the image fails to load.
 * @param {(event: Event) => void} props.onFileChange - File input change handler.
 * @param {import('react').RefObject<HTMLInputElement>} props.fileInputRef - Ref for the hidden file input.
 */
export function ProfilePhotoPicker({
    photoUrl,
    fullName,
    isImgError,
    isUploading,
    onImgError,
    onFileChange,
    fileInputRef,
}) {
    return (
        <div className="flex items-center gap-4">
            <div className="relative">
                {photoUrl && !isImgError ? (
                    <Image
                        src={photoUrl}
                        alt="Profile photo"
                        width={80}
                        height={80}
                        onError={onImgError}
                        className="h-20 w-20 rounded-full border-2 border-border-light object-cover"
                    />
                ) : (
                    <div className="flex h-20 w-20 items-center justify-center rounded-full border-2 border-border-light bg-primary/10">
                        <span className="text-xl font-bold text-primary">
                            {getInitials(fullName)}
                        </span>
                    </div>
                )}
                <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    aria-label="Change profile photo"
                    className="absolute -bottom-1 -right-1 rounded-full bg-primary p-1.5 text-white shadow-lg transition-opacity hover:opacity-90 disabled:opacity-50"
                >
                    <MdCameraAlt className="text-sm" aria-hidden="true" />
                </button>
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={onFileChange}
                    className="hidden"
                    tabIndex={-1}
                    aria-hidden="true"
                />
            </div>
            <div>
                <p className="text-sm font-medium text-text-main">Profile Photo</p>
                <p className="text-xs text-text-muted">
                    {isUploading ? "Uploading..." : "JPG, PNG. Max 5MB."}
                </p>
            </div>
        </div>
    );
}

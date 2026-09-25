'use client';

import { useState } from 'react';
import { MdDescription, MdOpenInNew } from 'react-icons/md';
import { adminTherapistsApi } from '@/services/admin.api';
import { DocumentReviewFlags } from '@/components/features/admin/DocumentReviewFlags';
import { fmtDateLong } from './therapistStatusStyles';

const formatFileSize = (bytes) => {
    if (!bytes) return null;
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1048576).toFixed(1)} MB`;
};

/**
 * A single license document with a "View" action that opens a signed URL.
 * @param {{ doc: object, therapistUserId: string, reviewStartedAt?: string|null }} props
 */
export function TherapistDocumentRow({ doc, therapistUserId, reviewStartedAt }) {
    const [loading, setLoading] = useState(false);

    const handleView = async () => {
        setLoading(true);
        try {
            const { data } = await adminTherapistsApi.getDocumentUrl(therapistUserId, doc.id);
            window.open(data.data.signedUrl, '_blank');
        } catch {
            alert('Failed to load document. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const fileSize = formatFileSize(doc.fileSize);
    const meta = [
        doc.documentType?.replace(/_/g, ' '),
        fileSize,
    ].filter(Boolean).join(' · ');

    return (
        <div className="flex items-center justify-between gap-3 p-3 rounded-xl border border-border-light ">
            <div className="flex items-center gap-3 min-w-0">
                <div className="p-1.5 rounded-lg bg-blue-100  shrink-0">
                    <MdDescription className="text-blue-600  text-base" />
                </div>
                <div className="min-w-0">
                    <p className="text-sm font-medium text-text-main  truncate">
                        {doc.fileName || 'License Document'}
                    </p>
                    <p className="text-xs text-text-muted ">
                        {meta && <span className="capitalize">{meta}</span>}
                        {meta && ' · '}Uploaded {fmtDateLong(doc.uploadedAt || doc.createdAt)}
                    </p>
                    <div className="mt-1">
                        <DocumentReviewFlags
                            uploadedAt={doc.uploadedAt || doc.createdAt}
                            reviewStartedAt={reviewStartedAt}
                            supersedesId={doc.supersedesId}
                        />
                    </div>
                </div>
            </div>
            <div className="shrink-0">
                <button
                    onClick={handleView}
                    disabled={loading}
                    className="inline-flex items-center gap-1 text-primary text-xs font-medium hover:underline disabled:opacity-50"
                >
                    {loading ? 'Loading...' : 'View'} <MdOpenInNew className="text-sm" />
                </button>
            </div>
        </div>
    );
}

import { MdDescription } from 'react-icons/md';
import { PendingReviewBadge } from '@/components/features/admin/PendingReviewBadge';
import { THERAPIST_STATUS_STYLES, THERAPIST_STATUS_FALLBACK, fmtDate } from './therapistStatusStyles';

/**
 * A single row in the admin therapist table. Clicking it toggles the side panel.
 * @param {{
 *   therapist: object,
 *   isSelected: boolean,
 *   onSelect: (therapist: object) => void,
 * }} props
 */
export function TherapistTableRow({ therapist, isSelected, onSelect }) {
    const profile = therapist.therapistProfile;

    return (
        <tr
            onClick={() => onSelect(therapist)}
            className={`cursor-pointer transition-colors
                ${isSelected ? 'bg-primary/5 ' : 'hover:bg-slate-50 '}`}
        >
            <td className="px-5 py-4">
                <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-primary/10  flex items-center justify-center text-xs font-bold text-primary shrink-0">
                        {profile?.fullName?.charAt(0)?.toUpperCase() || 'T'}
                    </div>
                    <div className="min-w-0">
                        <p className="font-medium text-text-main  truncate">{profile?.fullName}</p>
                        <p className="text-xs text-text-muted  truncate hidden sm:block">{therapist.email}</p>
                    </div>
                </div>
            </td>
            <td className="px-5 py-4 text-text-muted  hidden md:table-cell">
                {profile?.primaryLicenseType || '—'}
            </td>
            <td className="px-5 py-4">
                <div className="flex flex-col items-start gap-1">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium capitalize ${THERAPIST_STATUS_STYLES[profile?.approvalStatus] ?? THERAPIST_STATUS_FALLBACK}`}>
                        {profile?.approvalStatus}
                    </span>
                    <PendingReviewBadge pendingReviewAt={profile?.pendingReviewAt} />
                </div>
            </td>
            <td className="px-5 py-4 text-text-muted  hidden lg:table-cell">
                {fmtDate(therapist.createdAt)}
            </td>
            <td className="px-5 py-4 hidden lg:table-cell">
                <span className="inline-flex items-center gap-1 text-text-muted  text-xs">
                    <MdDescription className="text-base" />
                    {profile?.licenseDocuments?.length ?? 0}
                </span>
            </td>
        </tr>
    );
}

import { MdVerifiedUser } from 'react-icons/md';
import { TherapistSkeleton } from './TherapistSkeleton';
import { TherapistTableRow } from './TherapistTableRow';
import { TherapistPagination } from './TherapistPagination';

/**
 * The admin therapist table with its loading / error / empty states,
 * rows, and pagination footer.
 * @param {{
 *   therapists: object[],
 *   isLoading: boolean,
 *   error: unknown,
 *   selectedId: string|null,
 *   onSelect: (therapist: object) => void,
 *   emptyFilterLabel: string,
 *   page: number,
 *   pagination: object|undefined,
 *   onPageChange: (p: number) => void,
 * }} props
 */
export function TherapistTable({
    therapists,
    isLoading,
    error,
    selectedId,
    onSelect,
    emptyFilterLabel,
    page,
    pagination,
    onPageChange,
}) {
    return (
        <div className="bg-card-light  border border-border-light  rounded-xl overflow-hidden">
            {isLoading ? (
                <div className="p-5 space-y-3">
                    {[...Array(6)].map((_, i) => <TherapistSkeleton key={i} className="h-16" />)}
                </div>
            ) : error ? (
                <div className="p-12 text-center text-sm text-red-500">
                    Failed to load therapists. Please refresh.
                </div>
            ) : !therapists.length ? (
                <div className="p-12 text-center">
                    <MdVerifiedUser className="text-4xl text-slate-300  mx-auto mb-2" />
                    <p className="text-sm text-text-muted ">
                        No {emptyFilterLabel} therapists found
                    </p>
                </div>
            ) : (
                <>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-border-light  bg-slate-50 ">
                                    <th className="px-5 py-3 text-left text-xs font-semibold text-text-muted  uppercase tracking-wide">Therapist</th>
                                    <th className="px-5 py-3 text-left text-xs font-semibold text-text-muted  uppercase tracking-wide hidden md:table-cell">Discipline type</th>
                                    <th className="px-5 py-3 text-left text-xs font-semibold text-text-muted  uppercase tracking-wide">Status</th>
                                    <th className="px-5 py-3 text-left text-xs font-semibold text-text-muted  uppercase tracking-wide hidden lg:table-cell">Applied</th>
                                    <th className="px-5 py-3 text-left text-xs font-semibold text-text-muted  uppercase tracking-wide hidden lg:table-cell">Docs</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border-light ">
                                {therapists.map(t => (
                                    <TherapistTableRow
                                        key={t.id}
                                        therapist={t}
                                        isSelected={selectedId === t.id}
                                        onSelect={onSelect}
                                    />
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <TherapistPagination page={page} pagination={pagination} onPageChange={onPageChange} />
                </>
            )}
        </div>
    );
}

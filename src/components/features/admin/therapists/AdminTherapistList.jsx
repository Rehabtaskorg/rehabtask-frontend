/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { usePageTitle } from '@/hooks/usePageTitle';
import { useAdminTherapists } from '@/hooks/useAdmin';
import { useTherapistQueueActions } from '@/hooks/useTherapistQueueActions';
import { APPROVAL_STATUS } from '@/lib/constants';
import { PendingReviewFilter } from '@/components/features/admin/PendingReviewFilter';
import { TherapistStatusTabs } from './TherapistStatusTabs';
import { TherapistSearchInput } from './TherapistSearchInput';
import { TherapistTable } from './TherapistTable';
import { TherapistReviewDrawer } from './TherapistReviewDrawer';

const PAGE_SIZE = 20;

/**
 * Admin therapist review queue — filterable, searchable, paginated list with a
 * slide-in side panel that drives the approve / reject flow.
 */
export function AdminTherapistList() {
    usePageTitle('Therapists');

    const searchParams = useSearchParams();

    const [approvalFilter, setApprovalFilter] = useState(searchParams.get('approvalStatus') || '');
    const [isPendingReviewOnly, setIsPendingReviewOnly] = useState(searchParams.get('pendingReview') === 'true');
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebounced] = useState('');
    const [page, setPage] = useState(1);
    const [selected, setSelected] = useState(null);

    const {
        actionError, actionSuccess, isMutating, handleApprove, handleReject, resetFeedback,
    } = useTherapistQueueActions({ setSelected });

    useEffect(() => {
        const t = setTimeout(() => { setDebounced(search); setPage(1); }, 400);
        return () => clearTimeout(t);
    }, [search]);

    const params = {
        ...(debouncedSearch && { search: debouncedSearch }),
        ...(approvalFilter && { approvalStatus: approvalFilter }),
        ...(isPendingReviewOnly && { pendingReview: 'true' }),
        page,
        limit: PAGE_SIZE,
    };

    const { data: pendingCountData } = useAdminTherapists({ approvalStatus: APPROVAL_STATUS.PENDING, limit: 1 });
    const pendingBadge = pendingCountData?.pagination?.total ?? 0;
    const { data: reviewCountData } = useAdminTherapists({ approvalStatus: APPROVAL_STATUS.REVIEW, limit: 1 });
    const reviewBadge = reviewCountData?.pagination?.total ?? 0;
    const { data: pendingReviewCountData } = useAdminTherapists({ pendingReview: 'true', limit: 1 });
    const pendingReviewBadge = pendingReviewCountData?.pagination?.total ?? 0;

    const { data, isLoading, error } = useAdminTherapists(params);

    const therapists = data?.therapists ?? [];
    const pagination = data?.pagination;

    const handleTabChange = (value) => {
        setApprovalFilter(value);
        setPage(1);
        setSelected(null);
        resetFeedback();
    };

    const handlePendingReviewToggle = (next) => {
        setIsPendingReviewOnly(next);
        setPage(1);
        setSelected(null);
        resetFeedback();
    };

    const handleRowSelect = (therapist) => {
        setSelected(prev => prev?.id === therapist.id ? null : therapist);
        resetFeedback();
    };

    const closePanel = () => {
        setSelected(null);
        resetFeedback();
    };

    const emptyFilterLabel = isPendingReviewOnly
        ? `${approvalFilter} pending-review`.trim()
        : (approvalFilter || '');

    return (
        <div className="flex min-h-screen relative">
            <div className={`flex-1 min-w-0 p-4 md:p-6 transition-all duration-300 ${selected ? 'lg:mr-95' : ''}`}>
                <div className="mb-5">
                    <h1 className="text-xl md:text-2xl font-bold text-text-main ">Therapists</h1>
                    <p className="text-text-muted  text-sm mt-0.5">
                        {pagination ? `${pagination.total.toLocaleString()} therapists` : 'Manage therapist applications'}
                    </p>
                </div>

                <TherapistStatusTabs
                    activeTab={approvalFilter}
                    onTabChange={handleTabChange}
                    pendingBadge={pendingBadge}
                    reviewBadge={reviewBadge}
                />

                <div className="mb-4">
                    <PendingReviewFilter
                        isActive={isPendingReviewOnly}
                        onToggle={handlePendingReviewToggle}
                        count={pendingReviewBadge}
                    />
                </div>

                <TherapistSearchInput
                    value={search}
                    onChange={setSearch}
                    onClear={() => setSearch('')}
                />

                <TherapistTable
                    therapists={therapists}
                    isLoading={isLoading}
                    error={error}
                    selectedId={selected?.id ?? null}
                    onSelect={handleRowSelect}
                    emptyFilterLabel={emptyFilterLabel}
                    page={page}
                    pagination={pagination}
                    onPageChange={setPage}
                />
            </div>

            {selected && (
                <TherapistReviewDrawer
                    therapist={selected}
                    onDismiss={() => setSelected(null)}
                    onClose={closePanel}
                    onApprove={handleApprove}
                    onReject={handleReject}
                    loading={isMutating}
                    error={actionError}
                    success={actionSuccess}
                />
            )}
        </div>
    );
}

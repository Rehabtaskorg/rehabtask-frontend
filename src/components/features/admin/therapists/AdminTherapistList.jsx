/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { usePageTitle } from '@/hooks/usePageTitle';
import {
    useAdminTherapists,
    useApproveTherapist,
    useRejectTherapist,
} from '@/hooks/useAdmin';
import { APPROVAL_STATUS } from '@/lib/constants';
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
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebounced] = useState('');
    const [page, setPage] = useState(1);
    const [selected, setSelected] = useState(null);
    const [actionError, setActionError] = useState('');
    const [actionSuccess, setActionSuccess] = useState('');

    useEffect(() => {
        const t = setTimeout(() => { setDebounced(search); setPage(1); }, 400);
        return () => clearTimeout(t);
    }, [search]);

    const params = {
        ...(debouncedSearch && { search: debouncedSearch }),
        ...(approvalFilter && { approvalStatus: approvalFilter }),
        page,
        limit: PAGE_SIZE,
    };

    const { data: pendingCountData } = useAdminTherapists({ approvalStatus: APPROVAL_STATUS.PENDING, limit: 1 });
    const pendingBadge = pendingCountData?.pagination?.total ?? 0;
    const { data: reviewCountData } = useAdminTherapists({ approvalStatus: APPROVAL_STATUS.REVIEW, limit: 1 });
    const reviewBadge = reviewCountData?.pagination?.total ?? 0;

    const { data, isLoading, error } = useAdminTherapists(params);
    const approve = useApproveTherapist();
    const reject = useRejectTherapist();
    const mutating = approve.isPending || reject.isPending;

    const therapists = data?.therapists ?? [];
    const pagination = data?.pagination;

    const handleApprove = async (therapistUserId) => {
        setActionError(''); setActionSuccess('');
        try {
            await approve.mutateAsync(therapistUserId);
            setActionSuccess('Application approved successfully.');
            setSelected(prev =>
                prev?.id === therapistUserId
                    ? { ...prev, therapistProfile: { ...prev.therapistProfile, approvalStatus: APPROVAL_STATUS.APPROVED } }
                    : prev
            );
        } catch (e) {
            setActionError(e?.response?.data?.message || 'Failed to approve application.');
        }
    };

    const handleReject = async (therapistUserId, reason) => {
        setActionError(''); setActionSuccess('');
        try {
            await reject.mutateAsync({ therapistUserId, reason });
            setActionSuccess('Application rejected.');
            setSelected(prev =>
                prev?.id === therapistUserId
                    ? { ...prev, therapistProfile: { ...prev.therapistProfile, approvalStatus: APPROVAL_STATUS.REJECTED, rejectionReason: reason } }
                    : prev
            );
        } catch (e) {
            setActionError(e?.response?.data?.message || 'Failed to reject application.');
        }
    };

    const handleTabChange = (value) => {
        setApprovalFilter(value);
        setPage(1);
        setSelected(null);
        setActionError('');
        setActionSuccess('');
    };

    const handleRowSelect = (therapist) => {
        setSelected(prev => prev?.id === therapist.id ? null : therapist);
        setActionError('');
        setActionSuccess('');
    };

    const closePanel = () => {
        setSelected(null);
        setActionError('');
        setActionSuccess('');
    };

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
                    emptyFilterLabel={approvalFilter || ''}
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
                    loading={mutating}
                    error={actionError}
                    success={actionSuccess}
                />
            )}
        </div>
    );
}

'use client';

import { useState, useEffect } from 'react';
import { usePageTitle } from "@/hooks/usePageTitle";
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    MdArrowBack, MdBlock, MdCheckCircle, MdEmail,
    MdPerson, MdCalendarMonth, MdVerifiedUser,
    MdCardMembership, MdDescription, MdBusiness,
    MdEdit, MdClose,
} from 'react-icons/md';
import {
    useAdminUser,
    useDeactivateUser,
    useReactivateUser,
    useUpdateUser,
} from '@/hooks/useAdmin';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmtDate = (d) =>
    d ? new Date(d).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : '—';

const getDisplayName = (user) =>
    user.customerProfile?.fullName ||
    user.therapistProfile?.fullName ||
    user.email.split('@')[0];

const getInitials = (user) => {
    const name = user.customerProfile?.fullName || user.therapistProfile?.fullName || user.email;
    return name.split(/\s+/).map(w => w[0]).join('').toUpperCase().slice(0, 2);
};

const ROLE_STYLES = {
    admin: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    sub_admin: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
    therapist: 'bg-blue-100   text-blue-700   dark:bg-blue-900/30   dark:text-blue-400',
    customer: 'bg-slate-100  text-slate-600  dark:bg-slate-700     dark:text-slate-300',
};

const APPROVAL_STYLES = {
    approved: 'text-emerald-600 dark:text-emerald-400',
    rejected: 'text-red-600 dark:text-red-400',
    pending: 'text-amber-600 dark:text-amber-400',
};

function Skeleton({ className }) {
    return <div className={`animate-pulse rounded bg-slate-200 dark:bg-slate-700 ${className}`} />;
}

// ─── Detail row ───────────────────────────────────────────────────────────────

function DetailRow({ icon: Icon, label, value, valueClass = '' }) {
    return (
        <div className="flex items-start gap-3 py-3 border-b border-border-light dark:border-border-dark last:border-0">
            <div className="mt-0.5 p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 shrink-0">
                <Icon className="text-base text-text-muted dark:text-slate-400" />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-xs text-text-muted dark:text-slate-400">{label}</p>
                <p className={`text-sm font-medium text-text-main dark:text-white mt-0.5 ${valueClass}`}>{value || '—'}</p>
            </div>
        </div>
    );
}

// ─── Section card ─────────────────────────────────────────────────────────────

function SectionCard({ title, children }) {
    return (
        <div className="bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-border-light dark:border-border-dark">
                <h3 className="font-semibold text-text-main dark:text-white text-sm">{title}</h3>
            </div>
            <div className="px-5">{children}</div>
        </div>
    );
}

// ─── Editable field ───────────────────────────────────────────────────────────

function EditableField({ label, value, onChange, type = 'text', placeholder = '' }) {
    return (
        <div className="py-3 border-b border-border-light dark:border-border-dark last:border-0">
            <label className="block text-xs text-text-muted dark:text-slate-400 mb-1">{label}</label>
            <input
                type={type}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full px-3 py-2 text-sm rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-text-main dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
        </div>
    );
}

function EditableSelect({ label, value, onChange, options }) {
    return (
        <div className="py-3 border-b border-border-light dark:border-border-dark last:border-0">
            <label className="block text-xs text-text-muted dark:text-slate-400 mb-1">{label}</label>
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-text-main dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            >
                {options.map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                ))}
            </select>
        </div>
    );
}

function EditableTextarea({ label, value, onChange, placeholder = '' }) {
    return (
        <div className="py-3 border-b border-border-light dark:border-border-dark last:border-0">
            <label className="block text-xs text-text-muted dark:text-slate-400 mb-1">{label}</label>
            <textarea
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                rows={3}
                className="w-full px-3 py-2 text-sm rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-text-main dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
            />
        </div>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminUserDetailPage() {
    usePageTitle("User Details");
    const { userId } = useParams();
    const router = useRouter();
    const [actionError, setActionError] = useState('');
    const [actionSuccess, setActionSuccess] = useState('');
    const [editing, setEditing] = useState(false);
    const [confirmDeactivate, setConfirmDeactivate] = useState(false);
    const [confirmReactivate, setConfirmReactivate] = useState(false);
    const [editForm, setEditForm] = useState({});

    const { data: user, isLoading, error } = useAdminUser(userId);
    const deactivate = useDeactivateUser();
    const reactivate = useReactivateUser();
    const updateUser = useUpdateUser();

    const mutating = deactivate.isPending || reactivate.isPending;

    // Initialize edit form when edit mode starts
    useEffect(() => {
        if (user && editing) {
            const form = { email: user.email };
            if (user.role === 'customer' && user.customerProfile) {
                form.fullName = user.customerProfile.fullName || '';
                form.phone = user.customerProfile.phone || '';
                form.customerType = user.customerProfile.customerType || 'individual';
                form.agencyName = user.customerProfile.agencyName || '';
            }
            if (user.role === 'therapist' && user.therapistProfile) {
                form.fullName = user.therapistProfile.fullName || '';
                form.phone = user.therapistProfile.phone || '';
                form.primaryLicenseType = user.therapistProfile.primaryLicenseType || '';
                form.bio = user.therapistProfile.bio || '';
            }
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setEditForm(form);
        }
    }, [user, editing]);

    // ── Loading ──
    if (isLoading || !user) {
        return (
            <div className="p-4 md:p-6 max-w-3xl mx-auto space-y-5">
                <Skeleton className="h-8 w-32" />
                <Skeleton className="h-32 rounded-xl" />
                <Skeleton className="h-48 rounded-xl" />
                <Skeleton className="h-40 rounded-xl" />
            </div>
        );
    }

    // ── Error ──
    if (error) {
        return (
            <div className="p-4 md:p-6 max-w-3xl mx-auto">
                <Link href="/admin/users" className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-primary mb-6 transition-colors">
                    <MdArrowBack /> Back to Users
                </Link>
                <div className="bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark rounded-xl p-12 text-center">
                    <p className="text-text-muted dark:text-slate-400 text-sm">User not found or failed to load.</p>
                    <button
                        onClick={() => router.back()}
                        className="mt-4 text-primary text-sm font-medium hover:underline"
                    >
                        Go back
                    </button>
                </div>
            </div>
        );
    }

    // ── Handlers (user is guaranteed non-null below) ──

    const handleDeactivate = async () => {
        setActionError(''); setActionSuccess('');
        try {
            await deactivate.mutateAsync(userId);
            setActionSuccess('User has been deactivated.');
            setConfirmDeactivate(false);
        } catch (e) {
            setActionError(e?.response?.data?.message || 'Failed to deactivate user.');
        }
    };

    const handleReactivate = async () => {
        setActionError(''); setActionSuccess('');
        try {
            await reactivate.mutateAsync(userId);
            setActionSuccess('User has been reactivated.');
        } catch (e) {
            setActionError(e?.response?.data?.message || 'Failed to reactivate user.');
        }
    };

    const handleSaveEdit = async () => {
        setActionError(''); setActionSuccess('');
        const changes = {};
        if (editForm.email !== user.email) changes.email = editForm.email;
        if (user.role === 'customer' && user.customerProfile) {
            if (editForm.fullName !== (user.customerProfile.fullName || '')) changes.fullName = editForm.fullName;
            if (editForm.phone !== (user.customerProfile.phone || '')) changes.phone = editForm.phone;
            if (editForm.customerType !== (user.customerProfile.customerType || 'individual')) changes.customerType = editForm.customerType;
            if (editForm.agencyName !== (user.customerProfile.agencyName || '')) changes.agencyName = editForm.agencyName;
        }
        if (user.role === 'therapist' && user.therapistProfile) {
            if (editForm.fullName !== (user.therapistProfile.fullName || '')) changes.fullName = editForm.fullName;
            if (editForm.phone !== (user.therapistProfile.phone || '')) changes.phone = editForm.phone;
            if (editForm.primaryLicenseType !== (user.therapistProfile.primaryLicenseType || '')) changes.primaryLicenseType = editForm.primaryLicenseType;
            if (editForm.bio !== (user.therapistProfile.bio || '')) changes.bio = editForm.bio;
        }

        if (Object.keys(changes).length === 0) {
            setEditing(false);
            return;
        }

        try {
            await updateUser.mutateAsync({ userId, data: changes });
            setActionSuccess('User updated successfully.');
            setEditing(false);
        } catch (e) {
            setActionError(e?.response?.data?.message || 'Failed to update user.');
        }
    };

    const displayName = getDisplayName(user);
    const initials = getInitials(user);
    const isTherapist = user.role === 'therapist';
    const isCustomer = user.role === 'customer';
    const tp = user.therapistProfile;
    const cp = user.customerProfile;
    const latestSub = cp?.subscriptions?.[0];
    const canEdit = isCustomer || isTherapist;

    return (
        <div className="p-4 md:p-6 max-w-3xl mx-auto space-y-5">

            {/* Back nav */}
            <Link
                href="/admin/users"
                className="inline-flex items-center gap-1.5 text-sm text-text-muted dark:text-slate-400 hover:text-primary dark:hover:text-primary transition-colors"
            >
                <MdArrowBack className="text-base" />
                Back to Users
            </Link>

            {/* Status messages */}
            {actionError && (
                <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm">
                    {actionError}
                </div>
            )}
            {actionSuccess && (
                <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 text-sm">
                    <MdCheckCircle className="shrink-0" /> {actionSuccess}
                </div>
            )}

            {/* Profile header card */}
            <div className="bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark rounded-xl p-5">
                <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                    {/* Avatar */}
                    <div className="h-16 w-16 rounded-2xl bg-primary/10 dark:bg-primary/20 flex items-center justify-center text-xl font-bold text-primary shrink-0">
                        {initials}
                    </div>

                    {/* Identity */}
                    <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                            <h1 className="text-lg font-bold text-text-main dark:text-white">{displayName}</h1>
                            <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${ROLE_STYLES[user.role] ?? 'bg-slate-100 text-slate-600'}`}>
                                {user.role.replace('_', ' ')}
                            </span>
                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${user.isActive ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                                <span className={`h-1.5 w-1.5 rounded-full ${user.isActive ? 'bg-emerald-500' : 'bg-red-500'}`} />
                                {user.isActive ? 'Active' : 'Deactivated'}
                            </span>
                        </div>
                        <p className="text-sm text-text-muted dark:text-slate-400">{user.email}</p>
                        <p className="text-xs text-text-muted dark:text-slate-500 mt-1">
                            Member since {fmtDate(user.createdAt)}
                        </p>
                    </div>

                    {/* Action buttons */}
                    <div className="shrink-0 flex items-center gap-2">
                        {canEdit && !editing && (
                            <button
                                onClick={() => setEditing(true)}
                                className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border-light dark:border-border-dark text-sm font-medium text-text-main dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                            >
                                <MdEdit className="text-base" />
                                Edit
                            </button>
                        )}
                        {editing && (
                            <>
                                <button
                                    onClick={handleSaveEdit}
                                    disabled={updateUser.isPending}
                                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
                                >
                                    <MdCheckCircle className="text-base" />
                                    {updateUser.isPending ? 'Saving…' : 'Save'}
                                </button>
                                <button
                                    onClick={() => setEditing(false)}
                                    className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border-light dark:border-border-dark text-sm font-medium text-text-main dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                                >
                                    <MdClose className="text-base" />
                                    Cancel
                                </button>
                            </>
                        )}
                        {!editing && (
                            user.isActive ? (
                                confirmDeactivate ? (
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={handleDeactivate}
                                            disabled={mutating}
                                            className="px-4 py-2 rounded-xl bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
                                        >
                                            {mutating ? 'Processing…' : 'Confirm'}
                                        </button>
                                        <button
                                            onClick={() => setConfirmDeactivate(false)}
                                            className="px-4 py-2 rounded-xl border border-border-light dark:border-border-dark text-sm font-medium text-text-main dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => setConfirmDeactivate(true)}
                                        disabled={mutating}
                                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm font-medium hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <MdBlock className="text-base" />
                                        Deactivate
                                    </button>
                                )
                            ) : (
                                confirmReactivate ? (
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => { handleReactivate(); setConfirmReactivate(false); }}
                                            disabled={mutating}
                                            className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50"
                                        >
                                            {mutating ? 'Processing…' : 'Confirm'}
                                        </button>
                                        <button
                                            onClick={() => setConfirmReactivate(false)}
                                            className="px-4 py-2 rounded-xl border border-border-light dark:border-border-dark text-sm font-medium text-text-main dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => setConfirmReactivate(true)}
                                        disabled={mutating}
                                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 text-sm font-medium hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <MdCheckCircle className="text-base" />
                                        Reactivate
                                    </button>
                                )
                            )
                        )}
                    </div>
                </div>
            </div>

            {/* Account info */}
            {editing ? (
                <SectionCard title="Edit Account">
                    <EditableField
                        label="Email address"
                        value={editForm.email || ''}
                        onChange={(v) => setEditForm(f => ({ ...f, email: v }))}
                        type="email"
                    />
                </SectionCard>
            ) : (
                <SectionCard title="Account Information">
                    <DetailRow icon={MdEmail} label="Email address" value={user.email} />
                    <DetailRow icon={MdPerson} label="Role" value={user.role.replace('_', ' ')} valueClass="capitalize" />
                    <DetailRow icon={MdCalendarMonth} label="Joined" value={fmtDate(user.createdAt)} />
                    {!user.isActive && user.deactivatedAt && (
                        <DetailRow icon={MdBlock} label="Deactivated on" value={fmtDate(user.deactivatedAt)} valueClass="text-red-500 dark:text-red-400" />
                    )}
                </SectionCard>
            )}

            {/* Therapist profile details */}
            {isTherapist && tp && (
                editing ? (
                    <SectionCard title="Edit Therapist Profile">
                        <EditableField
                            label="Full name"
                            value={editForm.fullName || ''}
                            onChange={(v) => setEditForm(f => ({ ...f, fullName: v }))}
                        />
                        <EditableField
                            label="Phone"
                            value={editForm.phone || ''}
                            onChange={(v) => setEditForm(f => ({ ...f, phone: v }))}
                            placeholder="+1XXXXXXXXXX"
                        />
                        <div className="flex flex-col gap-1">
                            <label className="text-sm font-medium text-text-muted">Primary license type</label>
                            <select
                                value={editForm.primaryLicenseType || ''}
                                onChange={(e) => setEditForm(f => ({ ...f, primaryLicenseType: e.target.value }))}
                                className="w-full px-3 py-2 rounded-lg border border-border-light dark:border-border-dark bg-white dark:bg-card-dark text-text-main dark:text-white text-sm"
                            >
                                <option value="">Select License Type</option>
                                <option value="Physical Therapist">Physical Therapist (PT)</option>
                                <option value="Occupational Therapist">Occupational Therapist (OT)</option>
                                <option value="Speech-Language Pathologist">Speech-Language Pathologist (SLP)</option>
                                <option value="Physical Therapist Assistant">PT Assistant (PTA)</option>
                                <option value="Occupational Therapist Assistant">OT Assistant (OTA)</option>
                            </select>
                        </div>
                        <EditableTextarea
                            label="Bio"
                            value={editForm.bio || ''}
                            onChange={(v) => setEditForm(f => ({ ...f, bio: v }))}
                            placeholder="Therapist bio..."
                        />
                    </SectionCard>
                ) : (
                    <SectionCard title="Therapist Profile">
                        <DetailRow icon={MdVerifiedUser} label="Full name" value={tp.fullName} />
                        <DetailRow icon={MdDescription} label="Primary license type" value={tp.primaryLicenseType || 'Not set'} />
                        <DetailRow
                            icon={MdCheckCircle}
                            label="Approval status"
                            value={tp.approvalStatus}
                            valueClass={`capitalize ${APPROVAL_STYLES[tp.approvalStatus] ?? ''}`}
                        />
                        {tp.licenseDocuments?.length > 0 && (
                            <DetailRow
                                icon={MdDescription}
                                label="License documents"
                                value={`${tp.licenseDocuments.length} document${tp.licenseDocuments.length !== 1 ? 's' : ''} uploaded`}
                            />
                        )}
                        {tp.workAreas?.length > 0 && (
                            <DetailRow
                                icon={MdCalendarMonth}
                                label="Service areas"
                                value={`${tp.workAreas.length} area${tp.workAreas.length !== 1 ? 's' : ''} configured`}
                            />
                        )}
                        <div className="py-3">
                            <Link
                                href={`/admin/therapists/${user.id}`}
                                className="inline-flex items-center gap-1.5 text-sm text-primary font-medium hover:underline"
                            >
                                <MdVerifiedUser className="text-base" />
                                View therapist application
                            </Link>
                        </div>
                    </SectionCard>
                )
            )}

            {/* Customer profile details */}
            {isCustomer && cp && (
                editing ? (
                    <SectionCard title="Edit Customer Profile">
                        <EditableField
                            label="Full name"
                            value={editForm.fullName || ''}
                            onChange={(v) => setEditForm(f => ({ ...f, fullName: v }))}
                        />
                        <EditableField
                            label="Phone"
                            value={editForm.phone || ''}
                            onChange={(v) => setEditForm(f => ({ ...f, phone: v }))}
                            placeholder="+1XXXXXXXXXX"
                        />
                        <EditableSelect
                            label="Account type"
                            value={editForm.customerType || 'individual'}
                            onChange={(v) => setEditForm(f => ({ ...f, customerType: v }))}
                            options={[
                                { value: 'individual', label: 'Individual' },
                                { value: 'agency', label: 'Agency' },
                            ]}
                        />
                        {editForm.customerType === 'agency' && (
                            <EditableField
                                label="Agency name"
                                value={editForm.agencyName || ''}
                                onChange={(v) => setEditForm(f => ({ ...f, agencyName: v }))}
                            />
                        )}
                    </SectionCard>
                ) : (
                    <SectionCard title="Customer Profile">
                        <DetailRow icon={MdPerson} label="Full name" value={cp.fullName} />
                        <DetailRow
                            icon={MdBusiness}
                            label="Account type"
                            value={cp.customerType || 'Individual'}
                            valueClass="capitalize"
                        />
                        {cp.customerType === 'agency' && cp.agencyName && (
                            <DetailRow icon={MdBusiness} label="Agency name" value={cp.agencyName} />
                        )}
                        {latestSub && (
                            <DetailRow
                                icon={MdCardMembership}
                                label="Subscription"
                                value={`${latestSub.planType} — ${latestSub.status}`}
                                valueClass={`capitalize ${latestSub.status === 'active' ? 'text-emerald-600 dark:text-emerald-400' : ''}`}
                            />
                        )}
                    </SectionCard>
                )
            )}

            {/* Quick links */}
            {!editing && (
                <div className="bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark rounded-xl p-5">
                    <p className="text-xs font-semibold text-text-muted dark:text-slate-400 uppercase tracking-wide mb-3">
                        Quick Links
                    </p>
                    <div className="flex flex-wrap gap-2">
                        <Link
                            href={`/admin/bookings?userId=${user.id}`}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border-light dark:border-border-dark text-sm text-text-main dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                        >
                            <MdCalendarMonth className="text-base text-text-muted" />
                            View Bookings
                        </Link>
                        <Link
                            href={`/admin/payments?userId=${user.id}`}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border-light dark:border-border-dark text-sm text-text-main dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                        >
                            <MdCardMembership className="text-base text-text-muted" />
                            View Payments
                        </Link>
                        {isCustomer && (
                            <Link
                                href={`/admin/subscriptions?userId=${user.id}`}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border-light dark:border-border-dark text-sm text-text-main dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                            >
                                <MdCardMembership className="text-base text-text-muted" />
                                View Subscriptions
                            </Link>
                        )}
                    </div>
                </div>
            )}

        </div>
    );
}

import { APPROVAL_STATUS } from "@/lib/constants";

export const THERAPIST_STATUS_STYLES = {
    [APPROVAL_STATUS.PENDING]: 'bg-amber-100  text-amber-700    ',
    [APPROVAL_STATUS.REVIEW]: 'bg-blue-100   text-blue-700      ',
    [APPROVAL_STATUS.APPROVED]: 'bg-emerald-100 text-emerald-700  ',
    [APPROVAL_STATUS.REJECTED]: 'bg-red-100    text-red-700        ',
    incomplete: 'bg-slate-100  text-slate-600       ',
};

export const THERAPIST_STATUS_FALLBACK = 'bg-slate-100 text-slate-600';

export const fmtDate = (d) =>
    d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';

export const fmtDateLong = (d) =>
    d ? new Date(d).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : '—';

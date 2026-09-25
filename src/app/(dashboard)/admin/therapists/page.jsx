import { Suspense } from 'react';
import { AdminTherapistList } from '@/components/features/admin/therapists/AdminTherapistList';

export const metadata = { title: 'Therapists' };

export default function AdminTherapistsPage() {
    return (
        <Suspense fallback={
            <div className="p-6 space-y-4">
                <div className="animate-pulse h-8 w-48 bg-slate-200  rounded" />
                <div className="animate-pulse h-10 w-64 bg-slate-200  rounded-xl" />
                <div className="animate-pulse h-72 bg-slate-200  rounded-xl" />
            </div>
        }>
            <AdminTherapistList />
        </Suspense>
    );
}

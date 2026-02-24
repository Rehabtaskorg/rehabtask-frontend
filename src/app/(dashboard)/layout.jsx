'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { authAPi } from '@/lib/auth.api';
import OnboardingBanner from '@/components/therapist/OnboardingBanner';
import { useUnreadCount } from '@/hooks/useMessages';
import {
    MdDashboard, MdSearch, MdSend, MdCalendarMonth,
    MdChatBubble, MdPayments, MdPerson, MdMap,
    MdSchedule, MdSettings, MdLogout, MdDescription,
    MdPersonSearch, MdCalendarToday, MdStars
} from "react-icons/md";

function TherapistMessagesLink({ pathname }) {
    const unreadCount = useUnreadCount();
    const isActive = pathname.startsWith('/therapist/messages');

    return (
        <Link
            href="/therapist/messages"
            className={isActive ? 'sidebar-nav-link-active' : 'sidebar-nav-link'}
        >
            <MdChatBubble className="sidebar-icon" />
            <span className="flex-1">Messages</span>
            {unreadCount > 0 && (
                <span className="min-w-4.5 h-4.5 px-1 rounded-full bg-primary text-white text-[9px] font-bold flex items-center justify-center leading-none">
                    {unreadCount > 99 ? '99+' : unreadCount}
                </span>
            )}
        </Link>
    )

}

function CustomerMessagesLink({ pathname }) {
    const unreadCount = useUnreadCount();
    const isActive = pathname.startsWith('/customer/messages');

    return (
        <Link
            href="/customer/messages"
            className={`flex items-center justify-between px-3 py-2 rounded-lg transition-colors text-sm font-medium ${isActive ? 'bg-primary text-white' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
        >
            <div className="flex items-center gap-3">
                <MdChatBubble className="sidebar-icon" />
                <span>Messages</span>
            </div>
            {unreadCount > 0 && (
                <span className="min-w-4.5 h-4.5 px-1 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center leading-none">
                    {unreadCount > 99 ? '99+' : unreadCount}
                </span>
            )}
        </Link>
    )
}

function NavLink({ href, icon: Icon, label, pathname, matchStart = true }) {
    const isActive = matchStart ? pathname.startsWith(href) : pathname === href;
    return (
        <Link href={href} className={isActive ? 'sidebar-nav-link-active' : 'sidebar-nav-link'}>
            <Icon className="sidebar-icon" />
            <span>{label}</span>
        </Link>
    )
}

export default function DashboardLayout({ children }) {
    const router = useRouter();
    const pathname = usePathname();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [authError, setAuthError] = useState(false);

    useEffect(() => {
        let isMounted = true;

        const fetchUser = async () => {
            try {
                const res = await authAPi.getCurrentUser()

                if (!isMounted) return;

                const userData = res.data.data.user;

                const isOnCustomerDashboard = pathname.startsWith("/customer");
                const isOnTherapistDashboard = pathname.startsWith("/therapist");

                const shouldRedirectToTherapist =
                    isOnCustomerDashboard && userData.role === "therapist";
                const shouldRedirectToCustomer =
                    isOnTherapistDashboard && userData.role === "customer";

                if (shouldRedirectToTherapist) {
                    router.replace("/therapist/dashboard");
                    return;
                }

                if (shouldRedirectToCustomer) {
                    router.replace("/customer/dashboard");
                    return;
                }
                setUser(userData);
                setLoading(false)
            } catch (error) {
                console.error("Auth error:", error);
                if (!isMounted) return;
                setAuthError(true);
                setLoading(false);
                setTimeout(() => { if (isMounted) { router.replace("/login"); } }, 100);
            }
        };

        fetchUser();
        return () => { isMounted = false; };
    }, [router, pathname]);

    const handleLogout = async () => {
        try {
            await authAPi.logout();
            router.push("/login");
        } catch (error) {
            console.error("Logout error:", error);
            router.push("/login")
        } finally {
            router.push("/login");
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-4 text-text-muted dark:text-gray-400">Loading...</p>
                </div>
            </div>
        );
    }

    if (authError || !user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark">
                <div className="text-center">
                    <p className="text-text-muted dark:text-gray-400">Redirecting to login...</p>
                </div>
            </div>
        );
    }

    const isOnOnboardingRoute = pathname.startsWith("/therapist/onboarding");
    const therapistName = user.therapistProfile?.fullName || "";
    const customerName = user.customerProfile?.fullName || "";
    const initials = (user.role === 'therapist' ? therapistName : customerName)
        .split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

    return (
        <div className="flex min-h-screen bg-background-light dark:bg-background-dark">

            {/* ── THERAPIST SIDEBAR ── */}
            {user.role === 'therapist' && !isOnOnboardingRoute && (
                <aside className="w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-card-dark flex flex-col fixed h-full z-50">
                    <div className="p-6">
                        <div className="flex flex-col mb-8">
                            <h1 className="text-primary text-xl font-bold leading-none">RehabTask</h1>
                            <p className="text-slate-500 dark:text-slate-400 text-xs mt-1 font-medium">Therapist Portal</p>
                        </div>
                        <nav className="space-y-1">
                            <NavLink href="/therapist/dashboard" icon={MdDashboard} label="Dashboard" pathname={pathname} matchStart={false} />
                            <NavLink href="/therapist/requests" icon={MdSearch} label="Browse Requests" pathname={pathname} />
                            <NavLink href="/therapist/offers" icon={MdSend} label="My Offers" pathname={pathname} />
                            <NavLink href="/therapist/bookings" icon={MdCalendarMonth} label="My Bookings" pathname={pathname} />
                            <TherapistMessagesLink pathname={pathname} />
                            <NavLink href="/therapist/earnings" icon={MdPayments} label="Earnings" pathname={pathname} />
                        </nav>
                    </div>

                    <div className="mt-auto p-6 space-y-1 border-t border-slate-100 dark:border-slate-800">
                        <NavLink href="/therapist/profile" icon={MdPerson} label="My Profile" pathname={pathname} />
                        {/* <NavLink href="/therapist/work-areas" icon={MdMap} label="Work Areas" pathname={pathname} /> */}
                        {/* <NavLink href="/therapist/onboarding/availability" icon={MdSchedule} label="Availability" pathname={pathname} /> */}
                        {/* <NavLink href="/therapist/account-settings" icon={MdSettings} label="Account Settings" pathname={pathname} /> */}
                        <button
                            onClick={handleLogout}
                            className="sidebar-nav-link w-full text-left text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                        >
                            <MdLogout className="sidebar-icon" />
                            <span>Logout</span>
                        </button>
                    </div>
                </aside>
            )}

            {/* ── CUSTOMER SIDEBAR ── */}
            {user.role === 'customer' && (
                <aside className="w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-card-dark flex flex-col fixed h-full z-50">
                    <div className="p-6">
                        <h1 className="text-primary text-xl font-bold leading-none">RehabTask</h1>
                    </div>
                    <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
                        <NavLink href="/customer/dashboard" icon={MdDashboard} label="Dashboard" pathname={pathname} matchStart={false} />
                        <NavLink href="/customer/requests" icon={MdDescription} label="My Requests" pathname={pathname} />
                        <NavLink href="/customer/find-therapists" icon={MdPersonSearch} label="Find Therapists" pathname={pathname} />
                        <NavLink href="/customer/bookings" icon={MdCalendarToday} label="My Bookings" pathname={pathname} />
                        <CustomerMessagesLink pathname={pathname} />
                        <NavLink href="/customer/payments" icon={MdPayments} label="Payment History" pathname={pathname} />
                        <NavLink href="/customer/subscription" icon={MdStars} label="Subscription" pathname={pathname} />
                        <NavLink href="/customer/profile" icon={MdSettings} label="Account Settings" pathname={pathname} />
                        <button
                            onClick={handleLogout}
                            className="sidebar-nav-link w-full text-left text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                        >
                            <MdLogout className="sidebar-icon" />
                            <span>Logout</span>
                        </button>
                    </nav>
                    <div className="p-4 mt-auto border-t border-slate-200 dark:border-slate-800">
                        <div className="flex items-center gap-3 p-2 rounded-lg bg-primary/5">
                            <div className="h-10 w-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-sm font-bold text-slate-600 dark:text-slate-300 shrink-0">
                                {initials}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold truncate text-slate-900 dark:text-white">{customerName}</p>
                                <p className="text-xs text-slate-500 truncate">Individual Account</p>
                            </div>
                        </div>
                    </div>
                </aside>
            )}

            {/* ── ONBOARDING (minimal sidebar) ── */}
            {user.role === 'therapist' && isOnOnboardingRoute && (
                <aside className="w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-card-dark flex flex-col fixed h-full z-50">
                    <div className="p-6">
                        <h1 className="text-primary text-xl font-bold leading-none">RehabTask</h1>
                        <p className="text-slate-500 text-xs mt-1">Setup your profile</p>
                    </div>
                </aside>
            )}

            {/* ── MAIN CONTENT ── */}
            <main className="ml-64 flex-1 min-h-screen">
                {user.role === 'therapist' && !isOnOnboardingRoute && <OnboardingBanner />}
                {children}
            </main>
        </div>
    );
}
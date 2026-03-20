'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { authAPi } from '@/lib/auth.api';
import { supabase } from '@/lib/supabase';
import { getTherapistRedirect } from '@/lib/therapistRouteAccess';
import { TherapistAccessProvider } from '@/contexts/TherapistAccessContext';
import { AdminUserProvider } from '@/contexts/AdminUserContext';
import { SocketProvider } from '@/components/providers/SocketProvider';
import OnboardingBanner from '@/components/therapist/OnboardingBanner';
import { useUnreadCount } from '@/hooks/useMessages';
import {
    MdDashboard, MdSearch, MdSend, MdCalendarMonth,
    MdChatBubble, MdPayments, MdPerson,
    MdSchedule, MdSettings, MdLogout, MdDescription,
    MdPersonSearch, MdCalendarToday, MdStars,
    MdMenu, MdClose, MdLock, MdPeople, MdSupervisorAccount,
    MdGavel, MdQuestionAnswer, MdNotifications,
    MdManageAccounts, MdVerifiedUser,
    MdCardMembership, MdAttachMoney, MdAdminPanelSettings,
    MdHistory, MdAssessment, MdMedicalServices,
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

function DisabledNavItem({ icon: Icon, label }) {
    return (
        <div
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-400 dark:text-slate-600 cursor-not-allowed text-sm font-medium select-none"
            title="Available after account approval"
        >
            <Icon className="sidebar-icon" />
            <span className="flex-1">{label}</span>
            <MdLock className="text-xs opacity-50" />
        </div>
    );
}

export default function DashboardLayout({ children }) {
    const router = useRouter();
    const pathname = usePathname();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [authError, setAuthError] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // Close sidebar whenever the route changes
    useEffect(() => {
        setSidebarOpen(false);
    }, [pathname]);

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

                // Route guard for therapist approval state
                // NOTE: Backend returns profile data under "profile" key (not "therapistProfile")
                if (userData.role === "therapist") {
                    const redirect = getTherapistRedirect(pathname, {
                        onboardingComplete: userData.profile?.onboardingComplete ?? false,
                        approvalStatus: userData.profile?.approvalStatus ?? "pending",
                        onboardingStep: userData.profile?.onboardingStep ?? 1,
                    });

                    if (redirect && pathname !== redirect) {
                        router.replace(redirect);
                        return; // Don't set user or loading=false; keep spinner until redirect
                    }
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
            // Clear backend session (invalidate tokens, clears httpOnly cookies)
            await authAPi.logout();
            router.push("/login");
        } catch (error) {
            console.error("Logout error:", error);
        } finally {
            // always clear frontend supabase local session (localStorage)
            await supabase.auth.signOut();
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

    // Backend returns both therapist and customer data under "profile" key
    const profileName = user.profile?.fullName || "";
    const initials = profileName
        .split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

    // Compute therapist access state for context and sidebar
    const therapistAccess = user?.role === "therapist" ? (() => {
        const tp = user.profile; // Backend maps therapistProfile → "profile"
        const status = tp?.approvalStatus ?? "pending";
        const step = tp?.onboardingStep ?? 1;
        const isComplete = tp?.onboardingComplete ?? false;
        // Step 5+ means all essential steps are done — treat as functionally complete
        const functionallyComplete = isComplete || step >= 5;
        return {
            approvalStatus: status,
            onboardingComplete: functionallyComplete,
            onboardingStep: step,
            canAccessMarketplace: status === "approved",
            canEditPersonalInfo: status !== "incomplete",
            canEditCredentials: status === "approved" || status === "rejected",
            isFullyApproved: status === "approved" && functionallyComplete,
        };
    })() : null;

    // Sub-admin permission-based sidebar filtering
    const subAdminPermissions = user.role === 'sub_admin' ? (user.profile?.permissions || []) : null;
    const hasAdminPermission = (permission) => {
        if (user.role === 'admin') return true;
        return subAdminPermissions?.includes(permission) ?? false;
    };

    const adminNavItems = [
        { href: '/admin/users', icon: MdManageAccounts, label: 'Users', permission: 'users' },
        { href: '/admin/therapists', icon: MdVerifiedUser, label: 'Therapists', permission: 'therapists' },
        { href: '/admin/disputes', icon: MdGavel, label: 'Disputes', permission: 'disputes' },
        { href: '/admin/bookings', icon: MdCalendarMonth, label: 'Bookings', permission: 'bookings' },
        { href: '/admin/subscriptions', icon: MdCardMembership, label: 'Subscriptions', permission: 'subscriptions' },
        { href: '/admin/payments', icon: MdAttachMoney, label: 'Payments', permission: 'payments' },
        { href: '/admin/faqs', icon: MdQuestionAnswer, label: 'FAQs', permission: 'faqs' },
        { href: '/admin/notifications', icon: MdNotifications, label: 'Notifications', permission: 'notifications' },
    ];

    // Route guard: redirect sub-admins away from pages they don't have permission for
    if (user.role === 'sub_admin' && pathname.startsWith('/admin/')) {
        const currentNavItem = adminNavItems.find(item => pathname.startsWith(item.href));
        if (currentNavItem && !hasAdminPermission(currentNavItem.permission)) {
            router.replace('/admin/dashboard');
            return (
                <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                        <p className="mt-4 text-text-muted dark:text-gray-400">Redirecting...</p>
                    </div>
                </div>
            );
        }
        // Block sub-admins from admin-only pages
        const adminOnlyPaths = ['/admin/sub-admins', '/admin/audit-logs', '/admin/reports'];
        if (adminOnlyPaths.some(p => pathname.startsWith(p))) {
            router.replace('/admin/dashboard');
            return (
                <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                        <p className="mt-4 text-text-muted dark:text-gray-400">Redirecting...</p>
                    </div>
                </div>
            );
        }
    }

    return (
        <SocketProvider userId={user.id}>
        <div className="flex min-h-screen bg-background-light dark:bg-background-dark">

            {/* Mobile top bar — hidden on lg+ */}
            <div className="fixed top-0 left-0 right-0 h-14 bg-white dark:bg-card-dark border-b border-slate-200 dark:border-border-dark flex items-center px-4 z-50 lg:hidden">
                <button
                    onClick={() => setSidebarOpen(true)}
                    className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300"
                    aria-label="Open navigation"
                >
                    <MdMenu className="text-xl" />
                </button>
                <span className="ml-3 text-primary font-bold text-lg leading-none">RehabTask</span>
            </div>

            {/* ── THERAPIST SIDEBAR ── */}
            {user.role === 'therapist' && !isOnOnboardingRoute && (
                <>
                    <aside className={`w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-card-dark flex flex-col fixed h-full z-50 transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
                        <button
                            onClick={() => setSidebarOpen(false)}
                            className="lg:hidden absolute top-3 right-3 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400"
                            aria-label="Close navigation"
                        >
                            <MdClose className="text-xl" />
                        </button>
                        <div className="p-6">
                            <div className="flex flex-col mb-8">
                                <h1 className="text-primary text-xl font-bold leading-none">RehabTask</h1>
                                <p className="text-slate-500 dark:text-slate-400 text-xs mt-1 font-medium">Therapist Portal</p>
                            </div>
                            <nav className="space-y-1">
                                <NavLink href="/therapist/dashboard" icon={MdDashboard} label="Dashboard" pathname={pathname} matchStart={false} />
                                {therapistAccess?.canAccessMarketplace ? (
                                    <>
                                        <NavLink href="/therapist/requests" icon={MdSearch} label="Browse Requests" pathname={pathname} />
                                        <NavLink href="/therapist/offers" icon={MdSend} label="My Offers" pathname={pathname} />
                                        <NavLink href="/therapist/bookings" icon={MdCalendarMonth} label="My Bookings" pathname={pathname} />
                                        <TherapistMessagesLink pathname={pathname} />
                                        <NavLink href="/therapist/earnings" icon={MdPayments} label="Earnings" pathname={pathname} />
                                    </>
                                ) : (
                                    <>
                                        <DisabledNavItem icon={MdSearch} label="Browse Requests" />
                                        <DisabledNavItem icon={MdSend} label="My Offers" />
                                        <DisabledNavItem icon={MdCalendarMonth} label="My Bookings" />
                                        <DisabledNavItem icon={MdChatBubble} label="Messages" />
                                        <DisabledNavItem icon={MdPayments} label="Earnings" />
                                    </>
                                )}
                            </nav>
                        </div>

                        <div className="mt-auto p-6 space-y-1 border-t border-slate-100 dark:border-slate-800">
                            <NavLink href="/therapist/profile" icon={MdPerson} label="My Profile" pathname={pathname} />
                            <NavLink href="/therapist/account-settings" icon={MdSettings} label="Account Settings" pathname={pathname} />
                            <button
                                onClick={handleLogout}
                                className="sidebar-nav-link w-full text-left text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                            >
                                <MdLogout className="sidebar-icon" />
                                <span>Logout</span>
                            </button>
                        </div>
                    </aside>
                    {sidebarOpen && (
                        <div
                            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
                            onClick={() => setSidebarOpen(false)}
                        />
                    )}
                </>
            )}

            {/* ── CUSTOMER SIDEBAR ── */}
            {user.role === 'customer' && (
                <>
                    <aside className={`w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-card-dark flex flex-col fixed h-full z-50 transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
                        <button
                            onClick={() => setSidebarOpen(false)}
                            className="lg:hidden absolute top-3 right-3 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400"
                            aria-label="Close navigation"
                        >
                            <MdClose className="text-xl" />
                        </button>
                        <div className="p-6">
                            <h1 className="text-primary text-xl font-bold leading-none">RehabTask</h1>
                        </div>
                        <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
                            <NavLink href="/customer/dashboard" icon={MdDashboard} label="Dashboard" pathname={pathname} matchStart={false} />
                            {user?.profile?.customerType === "agency" && (
                                <Link href="/customer/patients" className={`sidebar-nav-link ${pathname.startsWith("/customer/patients") ? "sidebar-nav-link-active" : ""}`}>
                                    <MdPeople className="text-lg shrink-0" />
                                    My Patients
                                </Link>
                            )}
                            <NavLink href="/customer/requests" icon={MdDescription} label="My Requests" pathname={pathname} />
                            <NavLink href="/customer/find-therapists" icon={MdPersonSearch} label="Find Therapists" pathname={pathname} />
                            <NavLink href="/customer/bookings" icon={MdCalendarToday} label="My Bookings" pathname={pathname} />
                            <NavLink href="/customer/disputes" icon={MdGavel} label="Disputes" pathname={pathname} />
                            <CustomerMessagesLink pathname={pathname} />
                            <NavLink href="/customer/payments" icon={MdPayments} label="Payment History" pathname={pathname} />
                            <NavLink href="/customer/subscription" icon={MdStars} label="Subscription" pathname={pathname} />
                            <NavLink href="/customer/faqs" icon={MdQuestionAnswer} label="FAQs" pathname={pathname} />
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
                                    <p className="text-sm font-semibold truncate text-slate-900 dark:text-white">{profileName}</p>
                                    <div className="text-xs text-text-muted dark:text-gray-400 truncate">
                                        {user?.profile?.customerType === "agency"
                                            ? (user?.profile?.agencyName || "Agency Account")
                                            : "Individual Account"}
                                    </div>
                                    {user?.profile?.customerType === "agency" && (
                                        <span className="text-[10px] font-semibold text-primary bg-primary/10 px-1.5 py-0.5 rounded-full">
                                            Agency
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </aside>
                    {sidebarOpen && (
                        <div
                            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
                            onClick={() => setSidebarOpen(false)}
                        />
                    )}
                </>
            )}

            {/* ── ONBOARDING (minimal sidebar) ── */}
            {user.role === 'therapist' && isOnOnboardingRoute && (
                <>
                    <aside className={`w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-card-dark flex flex-col fixed h-full z-50 transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
                        <button
                            onClick={() => setSidebarOpen(false)}
                            className="lg:hidden absolute top-3 right-3 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400"
                            aria-label="Close navigation"
                        >
                            <MdClose className="text-xl" />
                        </button>
                        <div className="p-6">
                            <h1 className="text-primary text-xl font-bold leading-none">RehabTask</h1>
                            <p className="text-slate-500 text-xs mt-1">Setup your profile</p>
                        </div>
                    </aside>
                    {sidebarOpen && (
                        <div
                            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
                            onClick={() => setSidebarOpen(false)}
                        />
                    )}
                </>
            )}

            {/* ── ADMIN SIDEBAR ── */}
            {(user.role === 'admin' || user.role === 'sub_admin') && (
                <>
                    <aside className={`w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-card-dark flex flex-col fixed h-full z-50 transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
                        <button
                            onClick={() => setSidebarOpen(false)}
                            className="lg:hidden absolute top-3 right-3 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400"
                            aria-label="Close navigation"
                        >
                            <MdClose className="text-xl" />
                        </button>
                        <div className="p-5 border-b border-slate-100 dark:border-slate-800">
                            <h1 className="text-primary text-xl font-bold leading-none">RehabTask</h1>
                            <p className="text-slate-500 dark:text-slate-400 text-xs mt-1 font-medium flex items-center gap-1">
                                <MdAdminPanelSettings className="text-sm" />
                                {user.role === 'sub_admin' ? 'Sub-Admin Portal' : 'Admin Portal'}
                            </p>
                        </div>
                        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
                            <NavLink href="/admin/dashboard" icon={MdDashboard} label="Dashboard" pathname={pathname} matchStart={false} />
                            {adminNavItems.filter(item => hasAdminPermission(item.permission)).map(item => (
                                <NavLink key={item.href} href={item.href} icon={item.icon} label={item.label} pathname={pathname} />
                            ))}
                            {user.role === 'admin' && (
                                <>
                                    <NavLink href="/admin/sub-admins" icon={MdSupervisorAccount} label="Sub-Admins" pathname={pathname} />
                                    <NavLink href="/admin/reports" icon={MdAssessment} label="Reports" pathname={pathname} />
                                    <NavLink href="/admin/visit-types" icon={MdMedicalServices} label="Visit Types" pathname={pathname} />
                                    <NavLink href="/admin/audit-logs" icon={MdHistory} label="Audit Logs" pathname={pathname} />
                                </>
                            )}
                        </nav>
                        <div className="p-4 border-t border-slate-100 dark:border-slate-800 space-y-1">
                            <NavLink href="/admin/settings" icon={MdSettings} label="Settings" pathname={pathname} />
                            <button
                                onClick={handleLogout}
                                className="sidebar-nav-link w-full text-left text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                            >
                                <MdLogout className="sidebar-icon" />
                                <span>Logout</span>
                            </button>
                            <div className="flex items-center gap-3 p-2 mt-2 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                                <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-xs font-bold text-white shrink-0">
                                    {initials || 'A'}
                                </div>
                                <div className="min-w-0">
                                    <p className="text-sm font-semibold truncate text-slate-900 dark:text-white">{profileName || 'Admin'}</p>
                                    <p className="text-xs text-text-muted dark:text-slate-400 capitalize">{user.role.replace('_', ' ')}</p>
                                </div>
                            </div>
                        </div>
                    </aside>
                    {sidebarOpen && (
                        <div
                            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
                            onClick={() => setSidebarOpen(false)}
                        />
                    )}
                </>
            )}

            {/* ── MAIN CONTENT ── */}
                <main className="ml-0 lg:ml-64 flex-1 min-h-screen pt-14 lg:pt-0">
                    {user.role === 'therapist' && !isOnOnboardingRoute && <OnboardingBanner />}
                    {user.role === 'therapist' && therapistAccess ? (
                        <TherapistAccessProvider value={therapistAccess}>
                            {children}
                        </TherapistAccessProvider>
                    ) : (user.role === 'admin' || user.role === 'sub_admin') ? (
                        <AdminUserProvider value={{ id: user.id, email: user.email, role: user.role, permissions: subAdminPermissions }}>
                            {children}
                        </AdminUserProvider>
                    ) : (
                        children
                    )}
                </main>
        </div>
        </SocketProvider>
    );
}
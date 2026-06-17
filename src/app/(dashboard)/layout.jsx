'use client';

import { useEffect, useState, useCallback } from 'react';
import { usePostHog } from 'posthog-js/react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { authAPi } from '@/lib/auth.api';
import { destroySocket } from '@/lib/socket';
import { getTherapistRedirect } from '@/lib/therapistRouteAccess';
import { TherapistAccessProvider } from '@/contexts/TherapistAccessContext';
import { AdminUserProvider } from '@/contexts/AdminUserContext';
import { SidebarProvider, useSidebar } from '@/contexts/SidebarContext';
import { SocketProvider } from '@/components/providers/SocketProvider';
import OnboardingBanner from '@/components/therapist/OnboardingBanner';
import useOnboardingStore from '@/store/onboardingStore';
import { useUnreadCount } from '@/hooks/useMessages';
import { useIdleTimeout } from '@/hooks/useIdleTimeout';
import { LOGOUT_REASON, USER_ROLES, CUSTOMER_TYPES } from '@/lib/constants';
import {
    MdDashboard, MdSearch, MdSend, MdCalendarMonth,
    MdChatBubble, MdPayments, MdPerson,
    MdSettings, MdLogout, MdDescription,
    MdPersonSearch, MdCalendarToday, MdStars,
    MdMenu, MdClose, MdLock, MdPeople, MdSupervisorAccount,
    MdGavel, MdQuestionAnswer, MdNotifications,
    MdManageAccounts, MdVerifiedUser,
    MdCardMembership, MdAttachMoney, MdAdminPanelSettings,
    MdHistory, MdAssessment, MdMedicalServices,
    MdKeyboardDoubleArrowLeft, MdKeyboardDoubleArrowRight,
} from "react-icons/md";

/**
 * Sidebar messages link for therapists.
 * Shows an unread-count badge when there are unread messages.
 *
 * @param {{ pathname: string, collapsed?: boolean }} props
 */
function TherapistMessagesLink({ pathname, collapsed = false }) {
    const unreadCount = useUnreadCount();
    const isActive = pathname.startsWith('/therapist/messages');

    return (
        <Link
            href="/therapist/messages"
            className={`${isActive ? 'sidebar-nav-link-active' : 'sidebar-nav-link'} ${collapsed ? 'justify-center px-0! gap-0!' : ''} group/nav relative`}
            title={collapsed ? "Messages" : undefined}
        >
            <div className="relative shrink-0">
                <MdChatBubble className="sidebar-icon" />
                {collapsed && unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-3.5 h-3.5 px-0.5 rounded-full bg-red-500 text-white text-[8px] font-bold flex items-center justify-center leading-none">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </div>
            {!collapsed && <span className="flex-1">Messages</span>}
            {!collapsed && unreadCount > 0 && (
                <span className="min-w-4.5 h-4.5 px-1 rounded-full bg-primary text-white text-[9px] font-bold flex items-center justify-center leading-none">
                    {unreadCount > 99 ? '99+' : unreadCount}
                </span>
            )}
            {collapsed && (
                <span className="absolute left-full ml-2 px-2 py-1 bg-slate-800  text-white text-xs font-medium rounded-md whitespace-nowrap opacity-0 pointer-events-none group-hover/nav:opacity-100 transition-opacity z-60">
                    Messages {unreadCount > 0 ? `(${unreadCount})` : ""}
                </span>
            )}
        </Link>
    )
}

/**
 * Sidebar messages link for customers.
 * Shows an unread-count badge when there are unread messages.
 *
 * @param {{ pathname: string, collapsed?: boolean }} props
 */
function CustomerMessagesLink({ pathname, collapsed = false }) {
    const unreadCount = useUnreadCount();
    const isActive = pathname.startsWith('/customer/messages');

    return (
        <Link
            href="/customer/messages"
            className={`${isActive ? 'sidebar-nav-link-active' : 'sidebar-nav-link'} ${collapsed ? 'justify-center px-0! gap-0!' : ''} group/nav relative`}
            title={collapsed ? "Messages" : undefined}
        >
            <div className="relative shrink-0">
                <MdChatBubble className="sidebar-icon" />
                {collapsed && unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-3.5 h-3.5 px-0.5 rounded-full bg-red-500 text-white text-[8px] font-bold flex items-center justify-center leading-none">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </div>
            {!collapsed && <span className="flex-1">Messages</span>}
            {!collapsed && unreadCount > 0 && (
                <span className="min-w-4.5 h-4.5 px-1 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center leading-none">
                    {unreadCount > 99 ? '99+' : unreadCount}
                </span>
            )}
            {collapsed && (
                <span className="absolute left-full ml-2 px-2 py-1 bg-slate-800  text-white text-xs font-medium rounded-md whitespace-nowrap opacity-0 pointer-events-none group-hover/nav:opacity-100 transition-opacity z-60">
                    Messages {unreadCount > 0 ? `(${unreadCount})` : ""}
                </span>
            )}
        </Link>
    )
}

/**
 * Generic sidebar navigation link.
 * Highlights as active based on the current pathname.
 *
 * @param {{ href: string, icon: React.ElementType, label: string, pathname: string, matchStart?: boolean, locked?: boolean, collapsed?: boolean }} props
 */
function NavLink({ href, icon: Icon, label, pathname, matchStart = true, locked = false, collapsed = false }) {
    const isActive = matchStart ? pathname.startsWith(href) : pathname === href;
    return (
        <Link href={href} className={`${isActive ? 'sidebar-nav-link-active' : 'sidebar-nav-link'} ${collapsed ? 'justify-center px-0! gap-0!' : ''} group/nav relative`} title={collapsed ? label : undefined}>
            <Icon className="sidebar-icon shrink-0" />
            {!collapsed && <span className="flex-1">{label}</span>}
            {!collapsed && locked && <MdLock className="text-xs opacity-50" />}
            {collapsed && (
                <span className="absolute left-full ml-2 px-2 py-1 bg-slate-800  text-white text-xs font-medium rounded-md whitespace-nowrap opacity-0 pointer-events-none group-hover/nav:opacity-100 transition-opacity z-60">
                    {label}
                </span>
            )}
        </Link>
    )
}

/**
 * Root layout for all authenticated dashboard routes.
 * Fetches the current user on mount, enforces role-based route guards,
 * and renders the appropriate sidebar via DashboardInner.
 *
 * @param {{ children: React.ReactNode }} props
 */
export default function DashboardLayout({ children }) {
    const router = useRouter();
    const pathname = usePathname();
    const posthog = usePostHog();
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
                const res = await authAPi.getCurrentUser();

                if (!isMounted) return;

                const userData = res.data.data.user;
                const isOnCustomerDashboard = pathname.startsWith("/customer");
                const isOnTherapistDashboard = pathname.startsWith("/therapist");

                const shouldRedirectToTherapist =
                    isOnCustomerDashboard && userData.role === USER_ROLES.THERAPIST;
                const shouldRedirectToCustomer =
                    isOnTherapistDashboard && userData.role === USER_ROLES.CUSTOMER;

                if (shouldRedirectToTherapist) {
                    router.replace("/therapist/dashboard");
                    return;
                }

                if (shouldRedirectToCustomer) {
                    router.replace("/customer/dashboard");
                    return;
                }

                // Guard: user has no profile (incomplete OAuth onboarding)
                // Redirect to onboarding to complete role selection + profile setup
                if (!userData.profile && userData.role !== USER_ROLES.ADMIN && userData.role !== USER_ROLES.SUB_ADMIN) {
                    const isOnOnboarding = pathname.startsWith("/oauth/onboarding");
                    if (!isOnOnboarding) {
                        router.replace("/oauth/onboarding");
                        return;
                    }
                }

                // Route guard for therapist approval state
                // NOTE: Backend returns profile data under "profile" key (not "therapistProfile")
                if (userData.role === USER_ROLES.THERAPIST) {
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

                // Identify the user in PostHog so all subsequent events are linked.
                // No email or fullName — PII not needed for analytics.
                posthog?.identify(userData.id, {
                    role: userData.role,
                    customer_type: userData.profile?.customerType ?? null,
                    onboarding_complete: userData.profile?.onboardingComplete ?? null,
                    license_type: userData.profile?.primaryLicenseType ?? null,
                });

                setUser(userData);
                setLoading(false);
            } catch (error) {
                if (!isMounted) return;

                // ACCOUNT_DEACTIVATED: the API interceptor already called /auth/logout
                // and is setting window.location.href. Don't also call router.replace —
                // two simultaneous redirects is what produces the visible flash loop.
                if (error?.response?.data?.code === "ACCOUNT_DEACTIVATED") return;

                setAuthError(true);
                setLoading(false);
                setTimeout(() => { if (isMounted) { router.replace("/login"); } }, 100);
            }
        };

        fetchUser();
        return () => { isMounted = false; };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [router, posthog]);

    /**
     * Logs the current user out: calls the logout API, tears down the socket,
     * resets client-side state, detaches PostHog, then navigates to the destination.
     *
     * @param {string} [redirectTo="/"] - Path to navigate to after logout.
     */
    const handleLogout = useCallback(async (redirectTo = "/") => {
        // Guard: onClick passes a MouseEvent when called directly from a button —
        // treat that as "no redirect specified" and fall back to "/".
        const destination = typeof redirectTo === "string" ? redirectTo : "/";
        try {
            await authAPi.logout();
        } catch (_) {
            // best-effort — session may already be invalid
        } finally {
            destroySocket();
            useOnboardingStore.getState().reset();
            posthog?.reset();
        }
        router.push(destination);
    }, [router, posthog]);

    useIdleTimeout(user ? () => handleLogout(`/login?reason=${LOGOUT_REASON.IDLE_TIMEOUT}`) : null);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background-light ">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-4 text-text-muted ">Loading...</p>
                </div>
            </div>
        );
    }

    if (authError || !user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background-light ">
                <div className="text-center">
                    <p className="text-text-muted ">Redirecting to login...</p>
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
    const therapistAccess = user?.role === USER_ROLES.THERAPIST ? (() => {
        const tp = user.profile; // Backend maps therapistProfile → "profile"
        const status = tp?.approvalStatus ?? "pending";
        const step = tp?.onboardingStep ?? 1;
        const isComplete = tp?.onboardingComplete ?? false;
        const functionallyComplete = isComplete || step >= 8;
        return {
            approvalStatus: status,
            rejectionReason: tp?.rejectionReason ?? null,
            onboardingComplete: functionallyComplete,
            onboardingStep: step,
            canAccessMarketplace: status === "approved",
            canEditPersonalInfo: status !== "incomplete",
            canEditCredentials: status === "approved" || status === "rejected",
            isFullyApproved: status === "approved" && functionallyComplete,
        };
    })() : null;

    // Sub-admin permission-based sidebar filtering
    const subAdminPermissions = user.role === USER_ROLES.SUB_ADMIN ? (user.profile?.permissions || []) : null;
    const hasAdminPermission = (permission) => {
        if (user.role === USER_ROLES.ADMIN) return true;
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
    if (user.role === USER_ROLES.SUB_ADMIN && pathname.startsWith('/admin/')) {
        const currentNavItem = adminNavItems.find(item => pathname.startsWith(item.href));
        if (currentNavItem && !hasAdminPermission(currentNavItem.permission)) {
            router.replace('/admin/dashboard');
            return (
                <div className="min-h-screen flex items-center justify-center bg-background-light ">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                        <p className="mt-4 text-text-muted ">Redirecting...</p>
                    </div>
                </div>
            );
        }
        // Block sub-admins from admin-only pages
        const adminOnlyPaths = ['/admin/sub-admins', '/admin/audit-logs', '/admin/reports'];
        if (adminOnlyPaths.some(p => pathname.startsWith(p))) {
            router.replace('/admin/dashboard');
            return (
                <div className="min-h-screen flex items-center justify-center bg-background-light ">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                        <p className="mt-4 text-text-muted ">Redirecting...</p>
                    </div>
                </div>
            );
        }
    }

    return (
        <SocketProvider userId={user.id}>
            <SidebarProvider>
                <DashboardInner
                    user={user}
                    pathname={pathname}
                    sidebarOpen={sidebarOpen}
                    setSidebarOpen={setSidebarOpen}
                    handleLogout={handleLogout}
                    isOnOnboardingRoute={isOnOnboardingRoute}
                    profileName={profileName}
                    initials={initials}
                    therapistAccess={therapistAccess}
                    adminNavItems={adminNavItems}
                    hasAdminPermission={hasAdminPermission}
                    subAdminPermissions={subAdminPermissions}
                >
                    {children}
                </DashboardInner>
            </SidebarProvider>
        </SocketProvider>
    );
}

/**
 * Button that toggles the sidebar between expanded and collapsed states.
 *
 * @param {{ collapsed: boolean }} props
 */
function CollapseToggle({ collapsed }) {
    const { toggleSidebar } = useSidebar();
    return (
        <button
            onClick={toggleSidebar}
            className="hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-primary hover:bg-slate-100  transition-colors"
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
            {collapsed ? <MdKeyboardDoubleArrowRight className="text-lg" /> : <MdKeyboardDoubleArrowLeft className="text-lg" />}
        </button>
    );
}

/**
 * Renders the full dashboard shell: mobile top bar, role-specific sidebar, and main content area.
 * Receives all derived state from DashboardLayout so it stays a pure presentational component.
 *
 * @param {{ user: object, pathname: string, sidebarOpen: boolean, setSidebarOpen: Function, handleLogout: Function, isOnOnboardingRoute: boolean, profileName: string, initials: string, therapistAccess: object|null, adminNavItems: Array, hasAdminPermission: Function, subAdminPermissions: string[]|null, children: React.ReactNode }} props
 */
function DashboardInner({ user, pathname, sidebarOpen, setSidebarOpen, handleLogout, isOnOnboardingRoute, profileName, initials, therapistAccess, adminNavItems, hasAdminPermission, subAdminPermissions, children }) {
    const { isCollapsed } = useSidebar();
    const sidebarWidth = isOnOnboardingRoute ? 'lg:w-64' : isCollapsed ? 'lg:w-16' : 'lg:w-64';
    const mainMargin = isOnOnboardingRoute ? 'lg:ml-64' : isCollapsed ? 'lg:ml-16' : 'lg:ml-64';
    const c = !isOnOnboardingRoute && isCollapsed;

    return (
        <div className="flex min-h-screen bg-background-light ">

            {/* Mobile top bar */}
            <div className="fixed top-0 left-0 right-0 h-14 bg-white  border-b border-slate-200  flex items-center px-4 z-50 lg:hidden">
                <button
                    onClick={() => setSidebarOpen(true)}
                    className="p-2 rounded-lg hover:bg-slate-100  text-slate-600 "
                    aria-label="Open navigation"
                >
                    <MdMenu className="text-xl" />
                </button>
                <Image
                    src="/images/logo/rehabtask_horizontal.png"
                    alt="RehabTask"
                    height={32}
                    width={120}
                    className="ml-3 h-8 w-auto"
                />
            </div>

            {/* ── THERAPIST SIDEBAR ── */}
            {user.role === USER_ROLES.THERAPIST && !isOnOnboardingRoute && (
                <>
                    <aside className={`w-64 ${sidebarWidth} border-r border-slate-200  bg-white  flex flex-col fixed h-full z-50 transition-all duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
                        <button onClick={() => setSidebarOpen(false)} className="lg:hidden absolute top-3 right-3 p-1.5 rounded-lg hover:bg-slate-100  text-slate-400" aria-label="Close navigation">
                            <MdClose className="text-xl" />
                        </button>
                        <div className={`${c ? 'p-3' : 'p-6'} flex flex-col`}>
                            <div className={`flex items-center ${c ? 'justify-center mb-4' : 'justify-between mb-8'}`}>
                                <div>
                                    {c ? (
                                        <Image src="/images/logo/rehabtask_icon.png" alt="RehabTask" width={32} height={32} className="w-8 h-8" />
                                    ) : (
                                        <Image src="/images/logo/rehabtask_horizontal.png" alt="RehabTask" height={40} width={150} className="h-10 w-auto" />
                                    )}
                                </div>
                                {!c && <CollapseToggle collapsed={c} />}
                            </div>
                            {c && <div className="flex justify-center mb-3"><CollapseToggle collapsed={c} /></div>}
                            <nav className={`space-y-1 ${c ? 'w-full' : ''}`}>
                                <NavLink href="/therapist/dashboard" icon={MdDashboard} label="Dashboard" pathname={pathname} matchStart={false} collapsed={c} />
                                {therapistAccess?.canAccessMarketplace ? (
                                    <>
                                        <NavLink href="/therapist/requests" icon={MdSearch} label="Browse Requests" pathname={pathname} collapsed={c} />
                                        <NavLink href="/therapist/offers" icon={MdSend} label="My Offers" pathname={pathname} collapsed={c} />
                                        <NavLink href="/therapist/bookings" icon={MdCalendarMonth} label="My Bookings" pathname={pathname} collapsed={c} />
                                        <TherapistMessagesLink pathname={pathname} collapsed={c} />
                                        <NavLink href="/therapist/earnings" icon={MdPayments} label="Earnings" pathname={pathname} collapsed={c} />
                                    </>
                                ) : (
                                    <>
                                        <NavLink href="/therapist/requests" icon={MdSearch} label="Browse Requests" pathname={pathname} locked collapsed={c} />
                                        <NavLink href="/therapist/offers" icon={MdSend} label="My Offers" pathname={pathname} locked collapsed={c} />
                                        <NavLink href="/therapist/bookings" icon={MdCalendarMonth} label="My Bookings" pathname={pathname} locked collapsed={c} />
                                        <NavLink href="/therapist/messages" icon={MdChatBubble} label="Messages" pathname={pathname} locked collapsed={c} />
                                        <NavLink href="/therapist/earnings" icon={MdPayments} label="Earnings" pathname={pathname} locked collapsed={c} />
                                    </>
                                )}
                            </nav>
                        </div>

                        <div className={`mt-auto ${c ? 'p-2' : 'p-6'} space-y-1 border-t border-slate-100 `}>
                            <NavLink href="/therapist/profile" icon={MdPerson} label="My Profile" pathname={pathname} collapsed={c} />
                            <NavLink href="/therapist/account-settings" icon={MdSettings} label="Account Settings" pathname={pathname} collapsed={c} />
                            <button onClick={() => handleLogout("/")} className={`sidebar-nav-link w-full text-red-500 hover:bg-red-50  ${c ? 'justify-center px-0! gap-0!' : 'text-left'}`} title={c ? "Logout" : undefined}>
                                <MdLogout className="sidebar-icon shrink-0" />
                                {!c && <span>Logout</span>}
                            </button>
                        </div>
                    </aside>
                    {sidebarOpen && <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />}
                </>
            )}

            {/* ── CUSTOMER SIDEBAR ── */}
            {user.role === USER_ROLES.CUSTOMER && (
                <>
                    <aside className={`w-64 ${sidebarWidth} border-r border-slate-200  bg-white  flex flex-col fixed h-full z-50 transition-all duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
                        <button onClick={() => setSidebarOpen(false)} className="lg:hidden absolute top-3 right-3 p-1.5 rounded-lg hover:bg-slate-100  text-slate-400" aria-label="Close navigation">
                            <MdClose className="text-xl" />
                        </button>
                        <div className={`${c ? 'p-3' : 'p-6'} flex ${c ? 'flex-col items-center gap-2' : 'items-center justify-between'}`}>
                            {c ? (
                                <Image src="/images/logo/rehabtask_icon.png" alt="RehabTask" width={32} height={32} className="w-8 h-8" />
                            ) : (
                                <Image src="/images/logo/rehabtask_horizontal.png" alt="RehabTask" height={40} width={150} className="h-10 w-auto" />
                            )}
                            <CollapseToggle collapsed={c} />
                        </div>
                        <nav className={`flex-1 ${c ? 'px-2' : 'px-4'} space-y-1 overflow-y-auto`}>
                            <NavLink href="/customer/dashboard" icon={MdDashboard} label="Dashboard" pathname={pathname} matchStart={false} collapsed={c} />
                            {user?.profile?.customerType === CUSTOMER_TYPES.AGENCY && (
                                <NavLink href="/customer/patients" icon={MdPeople} label="My Patients" pathname={pathname} collapsed={c} />
                            )}
                            <NavLink href="/customer/requests" icon={MdDescription} label="My Requests" pathname={pathname} collapsed={c} />
                            <NavLink href="/customer/find-therapists" icon={MdPersonSearch} label="Find Therapists" pathname={pathname} collapsed={c} />
                            <NavLink href="/customer/bookings" icon={MdCalendarToday} label="My Bookings" pathname={pathname} collapsed={c} />
                            <NavLink href="/customer/disputes" icon={MdGavel} label="Disputes" pathname={pathname} collapsed={c} />
                            <CustomerMessagesLink pathname={pathname} collapsed={c} />
                            <NavLink href="/customer/payments" icon={MdPayments} label="Payments & Refunds" pathname={pathname} collapsed={c} />
                            <NavLink href="/customer/subscription" icon={MdStars} label="Subscription" pathname={pathname} collapsed={c} />
                            <NavLink href="/customer/faqs" icon={MdQuestionAnswer} label="FAQs" pathname={pathname} collapsed={c} />
                            <NavLink href="/customer/profile" icon={MdSettings} label="Account Settings" pathname={pathname} collapsed={c} />
                            <button onClick={() => handleLogout("/")} className={`sidebar-nav-link w-full text-red-500 hover:bg-red-50  ${c ? 'justify-center px-0! gap-0!' : 'text-left'}`} title={c ? "Logout" : undefined}>
                                <MdLogout className="sidebar-icon shrink-0" />
                                {!c && <span>Logout</span>}
                            </button>
                        </nav>
                        <div className={`${c ? 'p-2' : 'p-4'} mt-auto border-t border-slate-200 `}>
                            {!c ? (
                                <div className="flex items-center gap-3 p-2 rounded-lg bg-primary/5">
                                    <div className="h-10 w-10 rounded-full bg-slate-200  flex items-center justify-center text-sm font-bold text-slate-600  shrink-0">
                                        {initials}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold truncate text-slate-900 ">{profileName}</p>
                                        <div className="text-xs text-text-muted  truncate">
                                            {user?.profile?.customerType === CUSTOMER_TYPES.AGENCY ? (user?.profile?.agencyName || "Agency Account") : "Individual Account"}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex justify-center">
                                    <div className="h-9 w-9 rounded-full bg-slate-200  flex items-center justify-center text-xs font-bold text-slate-600 " title={profileName}>
                                        {initials}
                                    </div>
                                </div>
                            )}
                        </div>
                    </aside>
                    {sidebarOpen && <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />}
                </>
            )}

            {/* ── ONBOARDING (minimal sidebar — no collapse) ── */}
            {user.role === USER_ROLES.THERAPIST && isOnOnboardingRoute && (
                <>
                    <aside className={`w-64 border-r border-slate-200  bg-white  flex flex-col fixed h-full z-50 transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
                        <button onClick={() => setSidebarOpen(false)} className="lg:hidden absolute top-3 right-3 p-1.5 rounded-lg hover:bg-slate-100  text-slate-400" aria-label="Close navigation">
                            <MdClose className="text-xl" />
                        </button>
                        <div className="p-6">
                            <Image src="/images/logo/rehabtask_horizontal.png" alt="RehabTask" height={28} width={105} className="h-7 w-auto" />
                            <p className="text-slate-500 text-xs mt-1">Setup your profile</p>
                        </div>
                    </aside>
                    {sidebarOpen && <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />}
                </>
            )}

            {/* ── ADMIN SIDEBAR ── */}
            {(user.role === USER_ROLES.ADMIN || user.role === USER_ROLES.SUB_ADMIN) && (
                <>
                    <aside className={`w-64 ${sidebarWidth} border-r border-slate-200  bg-white  flex flex-col fixed h-full z-50 transition-all duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
                        <button onClick={() => setSidebarOpen(false)} className="lg:hidden absolute top-3 right-3 p-1.5 rounded-lg hover:bg-slate-100  text-slate-400" aria-label="Close navigation">
                            <MdClose className="text-xl" />
                        </button>
                        <div className={`${c ? 'p-3' : 'p-5'} flex ${c ? 'flex-col items-center gap-2' : 'items-start justify-between'} border-b border-slate-100 `}>
                            <div>
                                {c ? (
                                    <Image src="/images/logo/rehabtask_icon.png" alt="RehabTask" width={32} height={32} className="w-8 h-8" />
                                ) : (
                                    <Image src="/images/logo/rehabtask_horizontal.png" alt="RehabTask" height={40} width={150} className="h-10 w-auto" />
                                )}
                                {!c && (
                                    <p className="text-slate-500  text-xs mt-1 font-medium flex items-center gap-1">
                                        <MdAdminPanelSettings className="text-sm" />
                                        {user.role === USER_ROLES.SUB_ADMIN ? 'Sub-Admin Portal' : 'Admin Portal'}
                                    </p>
                                )}
                            </div>
                            <CollapseToggle collapsed={c} />
                        </div>
                        <nav className={`flex-1 ${c ? 'px-2' : 'px-3'} py-4 space-y-0.5 overflow-y-auto`}>
                            <NavLink href="/admin/dashboard" icon={MdDashboard} label="Dashboard" pathname={pathname} matchStart={false} collapsed={c} />
                            {adminNavItems.filter(item => hasAdminPermission(item.permission)).map(item => (
                                <NavLink key={item.href} href={item.href} icon={item.icon} label={item.label} pathname={pathname} collapsed={c} />
                            ))}
                            {user.role === USER_ROLES.ADMIN && (
                                <>
                                    <NavLink href="/admin/sub-admins" icon={MdSupervisorAccount} label="Sub-Admins" pathname={pathname} collapsed={c} />
                                    <NavLink href="/admin/reports" icon={MdAssessment} label="Reports" pathname={pathname} collapsed={c} />
                                    <NavLink href="/admin/visit-types" icon={MdMedicalServices} label="Visit Types" pathname={pathname} collapsed={c} />
                                    <NavLink href="/admin/audit-logs" icon={MdHistory} label="Audit Logs" pathname={pathname} collapsed={c} />
                                </>
                            )}
                        </nav>
                        <div className={`${c ? 'p-2' : 'p-4'} border-t border-slate-100  space-y-1`}>
                            <NavLink href="/admin/settings" icon={MdSettings} label="Settings" pathname={pathname} collapsed={c} />
                            <button onClick={() => handleLogout("/")} className={`sidebar-nav-link w-full text-red-500 hover:bg-red-50  ${c ? 'justify-center px-0! gap-0!' : 'text-left'}`} title={c ? "Logout" : undefined}>
                                <MdLogout className="sidebar-icon shrink-0" />
                                {!c && <span>Logout</span>}
                            </button>
                            {!c ? (
                                <div className="flex items-center gap-3 p-2 mt-2 rounded-lg bg-slate-50 ">
                                    <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-xs font-bold text-white shrink-0">
                                        {initials || 'A'}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-semibold truncate text-slate-900 ">{profileName || 'Admin'}</p>
                                        <p className="text-xs text-text-muted  capitalize">{user.role.replace('_', ' ')}</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex justify-center mt-2">
                                    <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-xs font-bold text-white" title={profileName || 'Admin'}>
                                        {initials || 'A'}
                                    </div>
                                </div>
                            )}
                        </div>
                    </aside>
                    {sidebarOpen && <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />}
                </>
            )}

            {/* ── MAIN CONTENT ── */}
            <main className={`ml-0 ${mainMargin} flex-1 min-h-screen pt-14 lg:pt-0 transition-all duration-300`}>
                {user.role === USER_ROLES.THERAPIST && !isOnOnboardingRoute && <OnboardingBanner />}
                {user.role === USER_ROLES.THERAPIST && therapistAccess ? (
                    <TherapistAccessProvider value={therapistAccess}>
                        {children}
                    </TherapistAccessProvider>
                ) : (user.role === USER_ROLES.ADMIN || user.role === USER_ROLES.SUB_ADMIN) ? (
                    <AdminUserProvider value={{ id: user.id, email: user.email, role: user.role, permissions: subAdminPermissions }}>
                        {children}
                    </AdminUserProvider>
                ) : (
                    children
                )}
            </main>
        </div>
    );
}
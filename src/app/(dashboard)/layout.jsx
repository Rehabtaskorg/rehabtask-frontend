'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { authAPi } from '@/lib/auth.api';
import OnboardingBanner from '@/components/therapist/OnboardingBanner';

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

                // check if user is on the correct dashboard
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

                setTimeout(() => {
                    if (isMounted) {
                        router.replace("/login");
                    }
                }, 100);
            }
        };

        fetchUser();

        return () => {
            isMounted = false;
        }
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

    // Check if on onboarding route
    const isOnOnboardingRoute = pathname.startsWith("/therapist/onboarding");

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark">
            <nav className="bg-card-light dark:bg-card-dark shadow-sm border-b border-border-light dark:border-border-dark">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center">
                            <h1 className="text-xl font-bold text-primary">RehabMarket</h1>

                            <div className="ml-10 flex items-baseline space-x-4">
                                {user.role === 'customer' && (
                                    <>
                                        <Link
                                            href="/customer/dashboard"
                                            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${pathname === '/customer/dashboard'
                                                ? 'bg-primary/10 text-primary'
                                                : 'text-text-muted dark:text-gray-300 hover:bg-muted-light dark:hover:bg-muted-dark'
                                                }`}
                                        >
                                            Dashboard
                                        </Link>
                                        <Link
                                            href="/customer/requests"
                                            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${pathname.startsWith('/customer/requests')
                                                ? 'bg-primary/10 text-primary'
                                                : 'text-text-muted dark:text-gray-300 hover:bg-muted-light dark:hover:bg-muted-dark'
                                                }`}
                                        >
                                            Requests
                                        </Link>
                                        <Link
                                            href="/customer/bookings"
                                            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${pathname.startsWith('/customer/bookings')
                                                ? 'bg-primary/10 text-primary'
                                                : 'text-text-muted dark:text-gray-300 hover:bg-muted-light dark:hover:bg-muted-dark'
                                                }`}
                                        >
                                            Bookings
                                        </Link>
                                        <Link
                                            href="/customer/payments"
                                            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${pathname.startsWith('/customer/payments')
                                                ? 'bg-primary/10 text-primary'
                                                : 'text-text-muted dark:text-gray-300 hover:bg-muted-light dark:hover:bg-muted-dark'
                                                }`}
                                        >
                                            Payments
                                        </Link>
                                        <Link
                                            href="/customer/profile"
                                            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${pathname.startsWith('/customer/profile')
                                                    ? 'bg-primary/10 text-primary'
                                                    : 'text-text-muted dark:text-gray-300 hover:bg-muted-light dark:hover:bg-muted-dark'
                                                }`}
                                        >
                                            Profile
                                        </Link>
                                    </>
                                )}

                                {user.role === 'therapist' && !isOnOnboardingRoute && (
                                    <>
                                        <Link
                                            href="/therapist/dashboard"
                                            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${pathname === '/therapist/dashboard'
                                                ? 'bg-primary/10 text-primary'
                                                : 'text-text-muted dark:text-gray-300 hover:bg-muted-light dark:hover:bg-muted-dark'
                                                }`}
                                        >
                                            Dashboard
                                        </Link>
                                        <Link
                                            href="/therapist/requests"
                                            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${pathname.startsWith('/therapist/requests')
                                                ? 'bg-primary/10 text-primary'
                                                : 'text-text-muted dark:text-gray-300 hover:bg-muted-light dark:hover:bg-muted-dark'
                                                }`}
                                        >
                                            Requests
                                        </Link>
                                        <Link
                                            href="/therapist/bookings"
                                            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${pathname.startsWith('/therapist/bookings')
                                                ? 'bg-primary/10 text-primary'
                                                : 'text-text-muted dark:text-gray-300 hover:bg-muted-light dark:hover:bg-muted-dark'
                                                }`}
                                        >
                                            Bookings
                                        </Link>
                                        <Link
                                            href="/therapist/earnings"
                                            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${pathname.startsWith('/therapist/earnings')
                                                ? 'bg-primary/10 text-primary'
                                                : 'text-text-muted dark:text-gray-300 hover:bg-muted-light dark:hover:bg-muted-dark'
                                                }`}
                                        >
                                            Earnings
                                        </Link>
                                        <Link
                                            href="/therapist/profile"
                                            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${pathname.startsWith('/therapist/profile')
                                                ? 'bg-primary/10 text-primary'
                                                : 'text-text-muted dark:text-gray-300 hover:bg-muted-light dark:hover:bg-muted-dark'
                                                }`}
                                        >
                                            Profile
                                        </Link>
                                    </>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center">
                            <div className="flex items-center space-x-4">
                                <span className="text-sm text-text-main dark:text-white">
                                    {user.role === 'customer'
                                        ? user.customerProfile?.fullName
                                        : user.therapistProfile?.fullName
                                    }
                                </span>
                                <span className="px-2 py-1 text-xs font-medium bg-primary/10 text-primary rounded">
                                    {user.role}
                                </span>
                                <button
                                    onClick={handleLogout}
                                    className="text-sm text-text-muted dark:text-gray-300 hover:text-text-main dark:hover:text-white font-medium transition-colors"
                                >
                                    Logout
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Show onboarding banner only for therapists not on onboarding routes */}
            {user.role === 'therapist' && !isOnOnboardingRoute && <OnboardingBanner />}

            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                {children}
            </main>
        </div>
    );
}
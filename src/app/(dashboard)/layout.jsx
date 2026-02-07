'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { authAPi } from '@/lib/auth.api';

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
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    if (authError || !user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <p className="text-gray-600">Redirecting to login...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <nav className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center">
                            <h1 className="text-xl font-bold text-blue-600">RehabMarket</h1>

                            <div className="ml-10 flex items-baseline space-x-4">
                                {user.role === 'customer' && (
                                    <>
                                        <Link
                                            href="/customer/dashboard"
                                            className={`px-3 py-2 rounded-md text-sm font-medium ${pathname === '/customer/dashboard'
                                                ? 'bg-blue-100 text-blue-700'
                                                : 'text-gray-700 hover:bg-gray-100'
                                                }`}
                                        >
                                            Dashboard
                                        </Link>
                                        <Link
                                            href="/customer/requests"
                                            className={`px-3 py-2 rounded-md text-sm font-medium ${pathname.startsWith('/customer/requests')
                                                ? 'bg-blue-100 text-blue-700'
                                                : 'text-gray-700 hover:bg-gray-100'
                                                }`}
                                        >
                                            Requests
                                        </Link>
                                        <Link
                                            href="/customer/bookings"
                                            className={`px-3 py-2 rounded-md text-sm font-medium ${pathname.startsWith('/customer/bookings')
                                                ? 'bg-blue-100 text-blue-700'
                                                : 'text-gray-700 hover:bg-gray-100'
                                                }`}
                                        >
                                            Bookings
                                        </Link>
                                        <Link
                                            href="/customer/payments"
                                            className={`px-3 py-2 rounded-md text-sm font-medium ${pathname.startsWith('/customer/payments')
                                                ? 'bg-blue-100 text-blue-700'
                                                : 'text-gray-700 hover:bg-gray-100'
                                                }`}
                                        >
                                            Payments
                                        </Link>
                                    </>
                                )}

                                {user.role === 'therapist' && (
                                    <>
                                        <Link
                                            href="/therapist/dashboard"
                                            className={`px-3 py-2 rounded-md text-sm font-medium ${pathname === '/therapist/dashboard'
                                                ? 'bg-blue-100 text-blue-700'
                                                : 'text-gray-700 hover:bg-gray-100'
                                                }`}
                                        >
                                            Dashboard
                                        </Link>
                                        <Link
                                            href="/therapist/requests"
                                            className={`px-3 py-2 rounded-md text-sm font-medium ${pathname.startsWith('/therapist/requests')
                                                ? 'bg-blue-100 text-blue-700'
                                                : 'text-gray-700 hover:bg-gray-100'
                                                }`}
                                        >
                                            Requests
                                        </Link>
                                        <Link
                                            href="/therapist/bookings"
                                            className={`px-3 py-2 rounded-md text-sm font-medium ${pathname.startsWith('/therapist/bookings')
                                                ? 'bg-blue-100 text-blue-700'
                                                : 'text-gray-700 hover:bg-gray-100'
                                                }`}
                                        >
                                            Bookings
                                        </Link>
                                        <Link
                                            href="/therapist/earnings"
                                            className={`px-3 py-2 rounded-md text-sm font-medium ${pathname.startsWith('/therapist/earnings')
                                                ? 'bg-blue-100 text-blue-700'
                                                : 'text-gray-700 hover:bg-gray-100'
                                                }`}
                                        >
                                            Earnings
                                        </Link>
                                        <Link
                                            href="/therapist/profile"
                                            className={`px-3 py-2 rounded-md text-sm font-medium ${pathname.startsWith('/therapist/profile')
                                                ? 'bg-blue-100 text-blue-700'
                                                : 'text-gray-700 hover:bg-gray-100'
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
                                <span className="text-sm text-gray-700">
                                    {user.role === 'customer'
                                        ? user.customerProfile?.fullName
                                        : user.therapistProfile?.fullName
                                    }
                                </span>
                                <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                                    {user.role}
                                </span>
                                <button
                                    onClick={handleLogout}
                                    className="text-sm text-gray-700 hover:text-gray-900 font-medium"
                                >
                                    Logout
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                {children}
            </main>
        </div>
    );
}
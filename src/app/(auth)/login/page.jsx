"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

export default function LoginPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({ email: "", password: "" });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const res = await api.post("/auth/login", formData);
            const { user } = res.data.data;

            if (user.role === "customer") {
                router.push("/customer/dashboard");
            }
            else if (user.role === "therapist") {
                router.push("/therapist/dashboard")
            }

        } catch (err) {
            setError(err.response?.data?.message || "Login failed");
        }
        finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8 w-full">
            <div>
                <h2 className="text-center text-3xl font-bold text-gray-900">
                    Sign in to RehabTask
                </h2>
            </div>
            <form className="space-y-6" onSubmit={handleSubmit}>
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
                        {error}
                    </div>
                )}

                <div className="space-y-4">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                            Email
                        </label>
                        <input
                            id="email"
                            type="email"
                            required
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />
                    </div>
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                            Password
                        </label>
                        <input
                            id="password"
                            type="password"
                            required
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400"
                >
                    {loading ? "Signing in..." : "Sign in"}
                </button>

                <div className="text-center text-sm">
                    <span className="text-gray-600">Don&apos;t have an account? </span>
                    <a href="/register/customer" className="text-blue-600 hover:text-blue-700">
                        Register as Customer
                    </a>
                    <span className="text-gray-600"> or </span>
                    <a href="/register/therapist" className="text-blue-600 hover:text-blue-700">
                        Register as Therapist
                    </a>
                </div>
            </form>
        </div>
    );
}

import { useEffect, useState } from "react";
import { authAPi } from "@/services/auth.api";

export function useAuth() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let mounted = true;

        const fetchUser = async () => {
            try {
                const response = await authAPi.getCurrentUser();
                if (!mounted) return;

                setUser(response.data.data.user);
            } catch (error) {
                if (!mounted) return;
                setUser(null);
            } finally {
                if (mounted) setLoading(false);
            }
        };

        fetchUser();

        return () => {
            mounted = false;
        };
    }, []);

    return { user, loading };
}
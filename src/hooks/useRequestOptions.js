import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export const useRequestOptions = (type) =>
    useQuery({
        queryKey: ["request-options", type],
        queryFn: () => api.get(`/request-options?type=${type}`).then((r) => r.data.data),
        staleTime: 5 * 60 * 1000,
    });

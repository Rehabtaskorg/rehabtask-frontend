import { useQuery } from "@tanstack/react-query";
import { faqsApi } from "@/lib/faqs";

export const usePublicFaqs = () => {
    const { data, isLoading, error, refetch } = useQuery({
        queryKey: ["public", "faqs"],
        queryFn: () => faqsApi.getAll().then((r) => r.data.data),
    });

    return {
        faqs: Array.isArray(data) ? data : [],
        loading: isLoading,
        error,
        refetch,
    };
};

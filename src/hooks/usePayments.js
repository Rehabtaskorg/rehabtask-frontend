"use client";

import { useQuery } from "@tanstack/react-query";
import { paymentsApi } from "@/lib/payments.api";

export function usePaymentHistory() {
    return useQuery({
        queryKey: ["customer-payment-history"],
        queryFn: async () => {
            const res = await paymentsApi.getPaymentHistory();
            return res.data.data;
        },
    });
}

export function useRefundSummary() {
    return useQuery({
        queryKey: ["customer-refund-summary"],
        queryFn: async () => {
            const res = await paymentsApi.getRefundSummary();
            return res.data.data;
        },
    });
}

export function useRefundHistory() {
    return useQuery({
        queryKey: ["customer-refund-history"],
        queryFn: async () => {
            const res = await paymentsApi.getRefundHistory();
            return res.data.data;
        },
    });
}

export function useCustomerConnectStatus() {
    return useQuery({
        queryKey: ["customer-connect-status"],
        queryFn: async () => {
            const res = await paymentsApi.getCustomerConnectStatus();
            return res.data.data;
        },
    });
}

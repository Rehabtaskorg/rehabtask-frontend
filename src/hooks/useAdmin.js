"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    notificationsApi, adminUsersApi, adminTherapistsApi, adminDisputesApi,
    adminBookingsApi, adminSubscriptionsApi, adminPaymentsApi,
    adminCommissionApi, adminFaqsApi, adminNotificationsApi,
    adminSubAdminsApi, adminAuditApi,
} from '@/lib/admin';

// Notifications (user-facing)
export const useNotifications = (params) =>
    useQuery({
        queryKey: ['notifications', params],
        queryFn: () => notificationsApi.getNotifications(params).then(r => r.data.data),
    });

export const useMarkNotificationRead = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id) => notificationsApi.markAsRead(id),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
    });
};

export const useMarkAllNotificationsRead = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: () => notificationsApi.markAllAsRead(),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
    });
};

// Admin - Users
export const useAdminUsers = ({ enabled, ...params } = {}) =>
    useQuery({
        queryKey: ['admin', 'users', params],
        queryFn: () => adminUsersApi.list(params).then(r => r.data.data),
        enabled: enabled !== false,
    });

export const useAdminUser = (userId) =>
    useQuery({
        queryKey: ['admin', 'users', userId],
        queryFn: () => adminUsersApi.get(userId).then(r => r.data.data),
        enabled: !!userId,
    });

export const useDeactivateUser = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (userId) => adminUsersApi.deactivate(userId),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'users'] }),
    });
};

export const useReactivateUser = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (userId) => adminUsersApi.reactivate(userId),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'users'] }),
    });
};

export const useUpdateUser = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ userId, data }) => adminUsersApi.update(userId, data),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'users'] }),
    });
};

// Admin - Therapists
export const useAdminTherapists = ({ enabled, ...params } = {}) =>
    useQuery({
        queryKey: ['admin', 'therapists', params],
        queryFn: () => adminTherapistsApi.list(params).then(r => r.data.data),
        enabled: enabled !== false,
    });

export const useAdminTherapist = (therapistUserId) =>
    useQuery({
        queryKey: ['admin', 'therapists', therapistUserId],
        queryFn: () => adminTherapistsApi.get(therapistUserId).then(r => r.data.data),
        enabled: !!therapistUserId,
    });

export const useApproveTherapist = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (therapistUserId) => adminTherapistsApi.approve(therapistUserId),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'therapists'] }),
    });
};

export const useRejectTherapist = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ therapistUserId, reason }) =>
            adminTherapistsApi.reject(therapistUserId, { reason }),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'therapists'] }),
    });
};

// Admin - Disputes
export const useAdminDisputes = ({ enabled, ...params } = {}) =>
    useQuery({
        queryKey: ['admin', 'disputes', params],
        queryFn: () => adminDisputesApi.list(params).then(r => r.data.data),
        enabled: enabled !== false,
    });

export const useAdminDispute = (id) =>
    useQuery({
        queryKey: ['admin', 'disputes', id],
        queryFn: () => adminDisputesApi.get(id).then(r => r.data.data),
        enabled: !!id,
    });

export const useUpdateDispute = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, ...data }) => adminDisputesApi.update(id, data),
        onSuccess: (_, vars) => {
            qc.invalidateQueries({ queryKey: ['admin', 'disputes'] });
            if (vars.id) qc.invalidateQueries({ queryKey: ['admin', 'disputes', vars.id] });
        },
    });
};

export const useAssignDispute = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, assignedAdminId }) =>
            adminDisputesApi.assign(id, { assignedAdminId }),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'disputes'] }),
    });
};

export const useReopenDispute = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id) => adminDisputesApi.reopen(id),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'disputes'] }),
    });
};

// Admin - Bookings
export const useAdminBookingStats = ({ enabled } = {}) =>
    useQuery({
        queryKey: ['admin', 'bookings', 'stats'],
        queryFn: () => adminBookingsApi.stats().then(r => r.data.data),
        enabled: enabled !== false,
    });

export const useAdminBookings = ({ enabled, ...params } = {}) =>
    useQuery({
        queryKey: ['admin', 'bookings', params],
        queryFn: () => adminBookingsApi.list(params).then(r => r.data.data),
        enabled: enabled !== false,
    });

export const useAdminBooking = (id) =>
    useQuery({
        queryKey: ['admin', 'bookings', id],
        queryFn: () => adminBookingsApi.get(id).then(r => r.data.data),
        enabled: !!id,
    });

export const useCancelAdminBooking = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, reason }) => adminBookingsApi.cancel(id, { reason }),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'bookings'] }),
    });
};

export const useApproveBookingReschedule = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id) => adminBookingsApi.approveReschedule(id),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'bookings'] }),
    });
};

export const useDenyBookingReschedule = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, reason }) => adminBookingsApi.denyReschedule(id, { reason }),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'bookings'] }),
    });
};

// Admin - Subscriptions
export const useAdminSubscriptionStats = ({ enabled } = {}) =>
    useQuery({
        queryKey: ['admin', 'subscriptions', 'stats'],
        queryFn: () => adminSubscriptionsApi.stats().then(r => r.data.data),
        enabled: enabled !== false,
    });

export const useAdminSubscriptions = (params) =>
    useQuery({
        queryKey: ['admin', 'subscriptions', 'list', params],
        queryFn: () => adminSubscriptionsApi.list(params).then(r => r.data.data),
    });

export const useAdminSubscription = (id) =>
    useQuery({
        queryKey: ['admin', 'subscriptions', id],
        queryFn: () => adminSubscriptionsApi.get(id).then(r => r.data.data),
        enabled: !!id,
    });

export const useCancelAdminSubscription = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id) => adminSubscriptionsApi.cancel(id),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['admin', 'subscriptions'] });
        },
    });
};

// Admin - Payments
export const useAdminPaymentStats = ({ enabled } = {}) =>
    useQuery({
        queryKey: ['admin', 'payments', 'stats'],
        queryFn: () => adminPaymentsApi.stats().then(r => r.data.data),
        enabled: enabled !== false,
    });

export const useAdminPayments = (params) =>
    useQuery({
        queryKey: ['admin', 'payments', 'list', params],
        queryFn: () => adminPaymentsApi.list(params).then(r => r.data.data),
    });

export const useAdminPayment = (id) =>
    useQuery({
        queryKey: ['admin', 'payments', id],
        queryFn: () => adminPaymentsApi.get(id).then(r => r.data.data),
        enabled: !!id,
    });

export const useReleaseAdminPayment = () => {
    const qc = useQueryClient();
    return useMutation({
        // Accepts { id } for full release, or { id, amount } for partial release
        mutationFn: ({ id, amount }) =>
            adminPaymentsApi.release(id, amount != null ? { amount } : {}),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'payments'] }),
    });
};

export const useRefundAdminPayment = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ paymentId, reason }) => adminPaymentsApi.refund(paymentId, { reason }),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'payments'] }),
    });
};

// Admin - Commission
export const useAdminCommission = () =>
    useQuery({
        queryKey: ['admin', 'commission', 'current'],
        queryFn: () => adminCommissionApi.getCurrent().then(r => r.data.data),
    });

export const useAdminCommissionHistory = () =>
    useQuery({
        queryKey: ['admin', 'commission', 'history'],
        queryFn: () => adminCommissionApi.getHistory().then(r => r.data.data),
    });

export const useSetCommissionRate = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (data) => adminCommissionApi.setRate(data),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'commission'] }),
    });
};

// Admin - FAQS
export const useAdminFaqs = () =>
    useQuery({
        queryKey: ['admin', 'faqs'],
        queryFn: () => adminFaqsApi.list().then(r => r.data.data),
    });

export const useCreateFaq = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (data) => adminFaqsApi.create(data),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'faqs'] }),
    });
};

export const useUpdateFaq = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, ...data }) => adminFaqsApi.update(id, data),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'faqs'] }),
    });
};

export const useDeleteFaq = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id) => adminFaqsApi.remove(id),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'faqs'] }),
    });
};

// Admin - Notifications
export const useAdminNotifications = (params) =>
    useQuery({
        queryKey: ['admin', 'notifications', params],
        queryFn: () => adminNotificationsApi.list(params).then(r => r.data.data),
    });

export const useBroadcastNotification = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (data) => adminNotificationsApi.broadcast(data),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'notifications'] }),
    });
};

// Admin - Sub-Admins
export const useAdminSubAdmins = () =>
    useQuery({
        queryKey: ['admin', 'sub-admins'],
        queryFn: () => adminSubAdminsApi.list().then(r => r.data.data),
    });

export const useAdminSubAdmin = (userId) =>
    useQuery({
        queryKey: ['admin', 'sub-admins', userId],
        queryFn: () => adminSubAdminsApi.get(userId).then(r => r.data.data),
        enabled: !!userId,
    });

export const useCreateSubAdmin = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (data) => adminSubAdminsApi.create(data),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'sub-admins'] }),
    });
};

export const usePromoteSubAdmin = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ userId, permissions }) =>
            adminSubAdminsApi.promote(userId, { permissions }),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'sub-admins'] }),
    });
};

export const useUpdateSubAdminPermissions = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ userId, permissions }) =>
            adminSubAdminsApi.updatePermissions(userId, { permissions }),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'sub-admins'] }),
    });
};

export const useDeactivateSubAdmin = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (userId) => adminSubAdminsApi.deactivate(userId),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'sub-admins'] }),
    });
};

export const useReactivateSubAdmin = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (userId) => adminSubAdminsApi.reactivate(userId),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'sub-admins'] }),
    });
};

export const useResendSubAdminInvite = () =>
    useMutation({
        mutationFn: (userId) => adminSubAdminsApi.resendInvite(userId),
    });

// Admin - Audit Logs
export const useAdminAuditLogs = ({ enabled, ...params } = {}) =>
    useQuery({
        queryKey: ['admin', 'audit-logs', params],
        queryFn: () => adminAuditApi.list(params).then(r => r.data.data),
        enabled: enabled !== false,
    });
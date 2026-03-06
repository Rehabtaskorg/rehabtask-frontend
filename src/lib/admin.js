import { api } from "./api";

// User facing notifications
export const notificationsApi = {
    getNotifications: (params) => api.get('/notifications', { params }),
    markAsRead: (id) => api.put(`/notifications/${id}/read`),
    markAllAsRead: () => api.put('/notifications/read-all'),
};

// Admin - Users
export const adminUsersApi = {
    list: (params) => api.get('/admin/users', { params }),
    get: (userId) => api.get(`/admin/users/${userId}`),
    update: (userId, data) => api.put(`/admin/users/${userId}`, data),
    deactivate: (userId) => api.put(`/admin/users/${userId}/deactivate`),
    reactivate: (userId) => api.put(`/admin/users/${userId}/reactivate`),
};

// Admin - Therapists
export const adminTherapistsApi = {
    list: (params) => api.get('/admin/therapists', { params }),
    get: (therapistUserId) => api.get(`/admin/therapists/${therapistUserId}`),
    approve: (therapistUserId) => api.put(`/admin/therapists/${therapistUserId}/approve`),
    reject: (therapistUserId, data) => api.put(`/admin/therapists/${therapistUserId}/reject`, data),
};

// Admin - Disputes
export const adminDisputesApi = {
    list: (params) => api.get('/admin/disputes', { params }),
    get: (id) => api.get(`/admin/disputes/${id}`),
    update: (id, data) => api.put(`/admin/disputes/${id}`, data),
    assign: (id, data) => api.put(`/admin/disputes/${id}/assign`, data),
    reopen: (id) => api.put(`/admin/disputes/${id}/reopen`),
}

// Admin - Bookings
export const adminBookingsApi = {
    list: (params) => api.get('/admin/bookings', { params }),
    get: (id) => api.get(`/admin/bookings/${id}`),
    cancel: (id, data) => api.put(`/admin/bookings/${id}/cancel`, data),
};

// Admin - Subscriptions
export const adminSubscriptionsApi = {
    stats: () => api.get('/admin/subscriptions/stats'),
    list: (params) => api.get('/admin/subscriptions', { params }),
    get: (id) => api.get(`/admin/subscriptions/${id}`),
    cancel: (id) => api.put(`/admin/subscriptions/${id}/cancel`),
};

// Admin - Payments
export const adminPaymentsApi = {
    stats: () => api.get('/admin/payments/stats'),
    list: (params) => api.get('/admin/payments', { params }),
    get: (id) => api.get(`/admin/payments/${id}`),
    release: (id) => api.put(`/admin/payments/${id}/release`),
    refund: (id, data) => api.put(`/admin/payments/${id}/refund`, data),
};

// Admin - Commission
export const adminCommissionApi = {
    getCurrent: () => api.get('/admin/commission'),
    getHistory: () => api.get('/admin/commission/history'),
    setRate: (data) => api.post('/admin/commission', data),
};

// Admin - FAQs
export const adminFaqsApi = {
    list: () => api.get('/admin/faqs'),
    create: (data) => api.post('/admin/faqs', data),
    update: (id, data) => api.put(`/admin/faqs/${id}`, data),
    remove: (id) => api.delete(`/admin/faqs/${id}`),
};

// Admin - Notifications
export const adminNotificationsApi = {
    list: (params) => api.get('/admin/notifications', { params }),
    broadcast: (data) => api.post('/admin/notifications/broadcast', data),
};

// Admin - Sub-Admins
export const adminSubAdminsApi = {
    list: () => api.get('/admin/sub-admins'),
    get: (userId) => api.get(`/admin/sub-admins/${userId}`),
    create: (data) => api.post('/admin/sub-admins', data),
    promote: (userId, data) => api.post(`/admin/sub-admins/${userId}/promote`, data),
    updatePermissions: (userId, data) => api.put(`/admin/sub-admins/${userId}/permissions`, data),
    deactivate: (userId) => api.put(`/admin/sub-admins/${userId}/deactivate`),
    reactivate: (userId) => api.put(`/admin/sub-admins/${userId}/reactivate`),
};
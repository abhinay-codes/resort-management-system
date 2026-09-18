import apiClient from './apiClient';

const BASE_URL = '/api/customer/notifications';

export const notificationService = {
  getMyNotifications: async (unreadOnly = false) => {
    return apiClient(`${BASE_URL}?unreadOnly=${unreadOnly}`, {
      method: 'GET',
      auth: true,
    });
  },

  getUnreadCount: async () => {
    return apiClient(`${BASE_URL}/unread-count`, {
      method: 'GET',
      auth: true,
    });
  },

  markAsRead: async (id) => {
    return apiClient(`${BASE_URL}/${id}/read`, {
      method: 'PATCH',
      auth: true,
    });
  },

  markAllAsRead: async () => {
    return apiClient(`${BASE_URL}/read-all`, {
      method: 'PATCH',
      auth: true,
    });
  },
};

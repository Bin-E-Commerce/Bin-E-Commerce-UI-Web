import { API_VERSION } from '@/config/api.config';
import authorizedAxios from '@/utils/authorizedAxios';
import type {
    ApiResponse,
    ListNotificationsParams,
    NotificationListResponse,
    NotificationUnreadCounts,
} from './types/notification.types';

export const notificationService = {
    // Lấy feed có cursor để popup hiện nhanh và vẫn mở rộng được thành Notification Center đầy đủ sau này.
    list(params: ListNotificationsParams): Promise<NotificationListResponse> {
        return authorizedAxios
            .get<ApiResponse<NotificationListResponse>>(
                `${API_VERSION}/notifications`,
                { params },
            )
            .then((response) => response.data.data);
    },

    // Một endpoint trả cả tổng chuông lẫn badge theo navigation code, tránh mỗi sidebar item gọi một request riêng.
    getUnreadCounts(): Promise<NotificationUnreadCounts> {
        return authorizedAxios
            .get<ApiResponse<NotificationUnreadCounts>>(
                `${API_VERSION}/notifications/unread-counts`,
            )
            .then((response) => response.data.data);
    },

    // Mark-read idempotent nên có thể gọi trước khi điều hướng mà không sợ tạo trạng thái trùng.
    markRead(notificationId: string): Promise<void> {
        return authorizedAxios
            .patch(`${API_VERSION}/notifications/${notificationId}/read`)
            .then(() => undefined);
    },

    // Dùng endpoint bulk ở backend thay vì gửi nhiều request mark-read nối tiếp từ trình duyệt.
    markAllRead(): Promise<number> {
        return authorizedAxios
            .post<ApiResponse<{ updated: number }>>(
                `${API_VERSION}/notifications/read-all`,
                {},
            )
            .then((response) => response.data.data.updated);
    },
};

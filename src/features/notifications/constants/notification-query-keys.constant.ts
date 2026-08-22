import type { NotificationReadStatus } from '@/services/notifications';

// Query key tập trung giúp socket, mutation, chuông và sidebar invalidate cùng một cache namespace.
export const notificationQueryKeys = {
    all: ['notifications'] as const,
    // Gắn cache với userId để tài khoản vừa đăng nhập không nhìn thấy feed/count còn sót của tài khoản trước.
    counts: (userId: string) =>
        ['notifications', userId, 'unread-counts'] as const,
    // Status nằm ở cuối key để mỗi tab có cache riêng nhưng vẫn cùng namespace của đúng người dùng.
    feed: (userId: string, status: NotificationReadStatus) =>
        ['notifications', userId, 'feed', status] as const,
};

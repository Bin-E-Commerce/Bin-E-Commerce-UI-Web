export type NotificationReadStatus = 'all' | 'unread' | 'read';

export interface NotificationItem {
    id: string;
    category: string;
    type: string;
    title: string;
    message: string;
    actionUrl: string | null;
    badgeKey: string | null;
    priority: 'low' | 'normal' | 'high' | 'urgent';
    createdAt: string;
    readAt: string | null;
}

export interface NotificationListResponse {
    items: NotificationItem[];
    nextCursor: string | null;
}

export interface NotificationUnreadCounts {
    total: number;
    byCategory: Record<string, number>;
    byBadgeKey: Record<string, number>;
}

export type NotificationRealtimeItem = Omit<NotificationItem, 'readAt'>;

export interface ListNotificationsParams {
    status: NotificationReadStatus;
    cursor?: string;
    limit?: number;
}

export interface MarkNotificationsReadFilter {
    category?: string;
    badgeKey?: string;
}

export interface ApiResponse<T> {
    data: T;
    message: string;
    statusCode: number;
}

'use client';

import { useQuery } from '@tanstack/react-query';

import { useAppSelector } from '@/store/hooks';
import { notificationService } from '@/services/notifications';
import { notificationQueryKeys } from '../constants/notification-query-keys.constant';

// Hook dùng chung cho chuông và sidebar; React Query tự gộp request vì cả hai dùng cùng query key.
export function useNotificationCounts() {
    const { accessToken, user } = useAppSelector((state) => state.auth);
    const userId = user?.id ?? '';

    return useQuery({
        queryKey: notificationQueryKeys.counts(userId),
        queryFn: () => notificationService.getUnreadCounts(),
        enabled: Boolean(accessToken && userId),
        staleTime: 15_000,
        // Đồng bộ lại badge định kỳ khi Redis/socket rớt; focus và reconnect mạng cập nhật ngay, còn tab nền không poll.
        refetchInterval: 30_000,
        refetchOnWindowFocus: true,
        refetchOnReconnect: true,
    });
}

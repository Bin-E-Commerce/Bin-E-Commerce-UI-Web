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
        staleTime: 30_000,
        // Polling chậm là lớp dự phòng khi WebSocket bị proxy/firewall ngắt; socket vẫn là đường cập nhật tức thời chính.
        refetchInterval: 60_000,
    });
}

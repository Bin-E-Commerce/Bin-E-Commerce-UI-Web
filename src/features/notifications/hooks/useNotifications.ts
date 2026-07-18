'use client';

import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { notificationService } from '@/services/notifications';
import type { NotificationReadStatus } from '@/services/notifications';
import { useAppSelector } from '@/store/hooks';
import { notificationQueryKeys } from '../constants/notification-query-keys.constant';

// Feed chỉ tải khi popup mở; cursor giúp tải tiếp mà không làm thay đổi thứ tự notification đang hiển thị.
export function useNotifications(status: NotificationReadStatus, enabled: boolean) {
    const { accessToken, user } = useAppSelector((state) => state.auth);
    const userId = user?.id ?? '';

    return useInfiniteQuery({
        queryKey: notificationQueryKeys.feed(userId, status),
        queryFn: ({ pageParam }) =>
            notificationService.list({
                status,
                cursor: pageParam,
                limit: 15,
            }),
        initialPageParam: undefined as string | undefined,
        getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
        enabled: Boolean(accessToken && userId) && enabled,
        // Feed phải được xem là stale ngay để lần mở chuông tiếp theo luôn đối chiếu lại nguồn dữ liệu REST.
        staleTime: 0,
        refetchOnMount: 'always',
    });
}

// Mutation đọc một notification làm mới cả feed và count để chuông/sidebar luôn đồng nhất.
export function useMarkNotificationRead() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (notificationId: string) =>
            notificationService.markRead(notificationId),
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: notificationQueryKeys.all,
            });
        },
    });
}

// Backend xử lý bulk receipt; FE chỉ refresh một lần sau khi thao tác hoàn tất.
export function useMarkAllNotificationsRead() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: () => notificationService.markAllRead(),
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: notificationQueryKeys.all,
            });
        },
    });
}

'use client';

import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { notificationService } from '@/services/notifications';
import type {
    NotificationReadStatus,
    NotificationUnreadCounts,
} from '@/services/notifications';
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

// Đánh dấu toàn bộ notification của một sidebar badge và cập nhật count lạc quan để badge biến mất ngay khi menu được mở.
export function useMarkNotificationsReadByBadgeKey() {
    const queryClient = useQueryClient();
    const userId = useAppSelector((state) => state.auth.user?.id ?? '');
    const countsQueryKey = notificationQueryKeys.counts(userId);

    return useMutation({
        mutationFn: (badgeKey: string) =>
            notificationService.markAllRead({ badgeKey }),
        // Lưu snapshot trước khi sửa cache để có thể hoàn tác chính xác nếu request backend thất bại.
        onMutate: async (badgeKey) => {
            await queryClient.cancelQueries({ queryKey: countsQueryKey });
            const previous =
                queryClient.getQueryData<NotificationUnreadCounts>(
                    countsQueryKey,
                );
            const badgeUnread = previous?.byBadgeKey[badgeKey] ?? 0;

            if (previous && badgeUnread > 0) {
                queryClient.setQueryData<NotificationUnreadCounts>(
                    countsQueryKey,
                    {
                        ...previous,
                        total: Math.max(0, previous.total - badgeUnread),
                        byBadgeKey: {
                            ...previous.byBadgeKey,
                            [badgeKey]: 0,
                        },
                    },
                );
            }

            return { previous };
        },
        // API lỗi thì trả badge về trạng thái trước thao tác để UI không báo sai dữ liệu đã đọc.
        onError: (_error, _badgeKey, context) => {
            if (context?.previous) {
                queryClient.setQueryData(countsQueryKey, context.previous);
            }
        },
        // Luôn đối chiếu lại MongoDB sau request để feed, chuông và sidebar cùng dùng trạng thái chuẩn.
        onSettled: async () => {
            await queryClient.invalidateQueries({
                queryKey: notificationQueryKeys.all,
            });
        },
    });
}

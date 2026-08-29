'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { io } from 'socket.io-client';
import { toast } from 'sonner';

import { API_BASE_URL } from '@/config/api.config';
import type { NotificationRealtimeItem } from '@/services/notifications';
import { useAppSelector } from '@/store/hooks';
import { notificationQueryKeys } from '../constants/notification-query-keys.constant';

interface NotificationProviderProps {
    children: React.ReactNode;
}

// Provider duy trì một kết nối realtime cấp ứng dụng, cập nhật React Query và hiển thị toast cho mọi layout/role.
export function NotificationProvider({ children }: NotificationProviderProps) {
    const router = useRouter();
    const queryClient = useQueryClient();
    const accessToken = useAppSelector((state) => state.auth.accessToken);

    // Mỗi access token có đúng một socket; logout/token đổi sẽ cleanup kết nối cũ trước khi tạo kết nối mới.
    useEffect(() => {
        if (!accessToken) {
            queryClient.removeQueries({ queryKey: notificationQueryKeys.all });
            return;
        }

        const socket = io(`${API_BASE_URL}/notifications`, {
            transports: ['websocket'],
            auth: { token: accessToken },
            reconnection: true,
            reconnectionDelay: 1_000,
            reconnectionDelayMax: 10_000,
        });

        // Sau reconnect, tải lại REST vì Redis Pub/Sub không lưu event đã phát trong thời gian client mất mạng.
        socket.on('connect', () => {
            void queryClient.invalidateQueries({
                queryKey: notificationQueryKeys.all,
            });
        });

        // Socket chỉ báo có thay đổi; REST cache được invalidate để MongoDB tiếp tục là nguồn dữ liệu chuẩn.
        socket.on('notification.created', (notification: NotificationRealtimeItem) => {
            void queryClient.invalidateQueries({
                queryKey: notificationQueryKeys.all,
            });

            const actionUrl = notification.actionUrl;
            toast(notification.title, {
                description: notification.message,
                duration: 7_000,
                action: actionUrl
                    ? {
                          label: 'Xem',
                          onClick: () => router.push(actionUrl),
                      }
                    : undefined,
            });
        });

        return () => {
            socket.removeAllListeners();
            socket.disconnect();
        };
    }, [accessToken, queryClient, router]);

    return children;
}

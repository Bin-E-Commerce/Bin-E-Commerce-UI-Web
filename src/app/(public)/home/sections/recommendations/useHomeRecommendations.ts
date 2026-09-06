// Hook này tải tối đa 24 recommendation ở Home; lỗi API được giữ ngoài luồng để section dùng catalog fallback.

'use client';

import { useQuery } from '@tanstack/react-query';
import { useAppSelector } from '@/store/hooks';
import {
    getRecommendationSessionId,
    getRecommendations,
} from '@/services/recommendation';

// Đọc session auth trước khi gọi endpoint guest/user và tránh request recommendation khi app chưa hydrate xong.
export function useHomeRecommendations() {
    const initialized = useAppSelector((state) => state.auth.initialized);
    const userId = useAppSelector((state) => state.auth.user?.id ?? null);
    const sessionId = getRecommendationSessionId();
    const actorKey = userId
        ? `user:${userId}`
        : `session:${sessionId ?? 'anonymous'}`;
    return useQuery({
        // Cô lập cache theo actor để recommendation cá nhân không bị dùng chung giữa guest và user.
        queryKey: ['recommendations', 'home', actorKey],
        queryFn: () =>
            getRecommendations({
                surface: 'home',
                page: 1,
                pageSize: 24,
            }),
        enabled: initialized,
        staleTime: 60_000,
        retry: 1,
    });
}

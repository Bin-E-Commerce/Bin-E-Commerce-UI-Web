// Hook này tải tối đa 24 recommendation ở Home; lỗi API được giữ ngoài luồng để section dùng catalog fallback.

'use client';

import { useQuery } from '@tanstack/react-query';
import { useAppSelector } from '@/store/hooks';
import { getRecommendations } from '@/services/recommendation';
import { useRecommendationSessionId } from '@/services/recommendation/hooks/use-recommendation-session';

// Đọc session auth trước khi gọi endpoint guest/user và tránh request recommendation khi app chưa hydrate xong.
export function useHomeRecommendations() {
    const initialized = useAppSelector((state) => state.auth.initialized);
    const userId = useAppSelector((state) => state.auth.user?.id ?? null);
    const sessionId = useRecommendationSessionId();
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
        // Chờ session được tạo sau hydration để query key không đổi giữa SSR và client lần render đầu.
        enabled: initialized && Boolean(sessionId),
        staleTime: 60_000,
        retry: 1,
    });
}

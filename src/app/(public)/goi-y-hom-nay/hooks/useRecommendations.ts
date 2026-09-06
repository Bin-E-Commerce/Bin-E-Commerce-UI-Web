// Hook này đọc từng trang sản phẩm gợi ý; quyền truy cập được kiểm soát ở component trước khi gọi API.

'use client';

import { useQuery } from '@tanstack/react-query';

import {
    getRecommendationSessionId,
    getRecommendations,
} from '@/services/recommendation';
import { useAppSelector } from '@/store/hooks';
import { RECOMMENDATIONS_PAGE_SIZE } from '../constants/recommendations.constants';

// Tải đúng 24 sản phẩm theo trang để giao diện luôn khớp với lưới sáu cột trên màn hình lớn.
export function useRecommendations(enabled: boolean, page: number) {
    const userId = useAppSelector((state) => state.auth.user?.id ?? null);
    const sessionId = getRecommendationSessionId();
    const actorKey = userId
        ? `user:${userId}`
        : `session:${sessionId ?? 'anonymous'}`;

    return useQuery({
        // Cô lập cache theo user và session để login/logout không hiển thị recommendation của actor trước đó.
        queryKey: ['recommendations', 'products', actorKey, page],
        queryFn: () =>
            getRecommendations({
                surface: 'recommendations_page',
                page,
                pageSize: RECOMMENDATIONS_PAGE_SIZE,
            }),
        enabled,
        staleTime: 30_000,
    });
}

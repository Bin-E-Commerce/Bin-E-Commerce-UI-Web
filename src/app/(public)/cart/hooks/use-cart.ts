// Hook này hydrate active cart sau khi frontend biết auth restore đã hoàn tất.
// Làm mới giá và tồn kho khi mở giỏ hoặc quay lại tab; checkout vẫn xác minh lại trước khi đặt hàng.

'use client';

import { useQuery } from '@tanstack/react-query';
import { useAppSelector } from '@/store/hooks';
import { getActiveCart } from '@/services/cart';

// Tải cart sau khi auth restore; luôn refetch khi mount/focus để không giữ giá cũ trong khoảng staleTime.
export function useCart() {
    const { initialized, accessToken, user } = useAppSelector(
        (state) => state.auth,
    );
    const userId = user?.id ?? null;
    const isAuthenticated = Boolean(initialized && accessToken && userId);

    return useQuery({
        queryKey: ['cart', userId ?? 'anonymous'],
        queryFn: () => getActiveCart(),
        enabled: isAuthenticated,
        staleTime: 30_000,
        refetchOnMount: 'always',
        refetchOnWindowFocus: 'always',
    });
}

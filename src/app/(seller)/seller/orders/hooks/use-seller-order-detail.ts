// Hook này tải detail Seller theo orderId ổn định để refresh hoặc mở trực tiếp URL vẫn lấy đúng snapshot.

'use client';

import { useQuery } from '@tanstack/react-query';

import { getSellerOrder } from '@/services/order';

// Chỉ kích hoạt request khi route đã có orderId hợp lệ, tránh gọi API với giá trị undefined trong lúc hydration.
export function useSellerOrderDetail(orderId: string) {
    return useQuery({
        queryKey: ['seller-order-detail', orderId],
        queryFn: () => getSellerOrder(orderId),
        enabled: Boolean(orderId),
        staleTime: 30_000,
    });
}

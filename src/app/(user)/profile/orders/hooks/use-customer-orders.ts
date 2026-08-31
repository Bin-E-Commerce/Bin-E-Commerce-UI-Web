'use client';

// File này quản lý query/mutation của lịch sử đơn hàng Customer và fallback ảnh cho dữ liệu order cũ.

import {
    keepPreviousData,
    useMutation,
    useQuery,
    useQueryClient,
} from '@tanstack/react-query';
import { toast } from 'sonner';

import {
    cancelOrder,
    getOrder,
    listOrders,
    type CustomerOrderListItem,
    type CustomerOrderStage,
} from '@/services/order/order.api';
import { useOrderProductImages } from '@/hooks/use-order-product-images';
import { getErrorMessage } from '@/utils/getErrorMessage';

// Query danh sách giữ dữ liệu trang trước trong lúc chuyển trang để giao diện không bị nhấp nháy.
export function useCustomerOrders(
    stage: CustomerOrderStage | undefined,
    page: number,
    enabled = true,
) {
    return useQuery({
        queryKey: ['customer-orders', stage ?? 'ALL', page],
        queryFn: () => listOrders({ stage, page, pageSize: 10 }),
        placeholderData: keepPreviousData,
        staleTime: 30_000,
        enabled,
    });
}

// Lấy ảnh hiện tại của product chỉ cho preview item thiếu ảnh snapshot, giúp các đơn cũ vẫn có ảnh hiển thị.
// Query này không ghi ngược vào order và không thay thế snapshot của đơn mới; mỗi product chỉ được gọi một lần.
export function useLegacyOrderPreviewImages(orders: CustomerOrderListItem[]) {
    return useOrderProductImages(
        orders.flatMap((order) => order.previewItems ?? []),
    );
}

// Lấy ảnh hiện tại cho item thiếu snapshot ảnh, dùng chung cho cả danh sách và chi tiết đơn hàng cũ.
// Dữ liệu chỉ phục vụ fallback hiển thị; hook không ghi ngược hoặc làm thay đổi snapshot order.
export function useMissingProductImages(
    items: Array<{ productId: string; imageUrl: string | null }>,
) {
    return useOrderProductImages(items);
}

// Query chi tiết luôn đọc theo orderId trên URL nên refresh trang vẫn khôi phục đúng dữ liệu.
export function useCustomerOrder(orderId: string, enabled = true) {
    return useQuery({
        queryKey: ['customer-order', orderId],
        queryFn: () => getOrder(orderId),
        enabled: Boolean(orderId) && enabled,
        staleTime: 30_000,
    });
}

// Mutation hủy đơn làm mới cả detail và mọi biến thể list filter của Customer.
export function useCancelCustomerOrder(orderId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (reason?: string) => cancelOrder(orderId, reason),
        onSuccess: async (order) => {
            queryClient.setQueryData(['customer-order', orderId], order);
            await queryClient.invalidateQueries({
                queryKey: ['customer-orders'],
            });
            toast.success('Đã hủy đơn hàng.');
        },
        onError: (error) => toast.error(getErrorMessage(error)),
    });
}

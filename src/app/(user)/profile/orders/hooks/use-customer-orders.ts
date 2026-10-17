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
    type CustomerOrderFilter,
} from '@/services/order';
import { useOrderProductImages } from '@/hooks/orders/use-order-product-images';
import { getErrorMessage } from '@/utils/getErrorMessage';

// Query danh sách giữ dữ liệu trang trước trong lúc chuyển trang để giao diện không bị nhấp nháy.
export function useCustomerOrders(
    filter: CustomerOrderFilter,
    page: number,
    enabled = true,
) {
    return useQuery({
        queryKey: [
            'customer-orders',
            filter.status ?? 'ALL_STATUS',
            filter.stage ?? 'ALL_STAGES',
            page,
        ],
        queryFn: () => listOrders({ ...filter, page, pageSize: 10 }),
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

// Query chi tiết đọc theo orderId và polling khi đơn đang vận chuyển để card xác nhận nhận hàng tự xuất hiện sau webhook giao thành công.
export function useCustomerOrder(orderId: string, enabled = true) {
    return useQuery({
        queryKey: ['customer-order', orderId],
        queryFn: () => getOrder(orderId),
        enabled: Boolean(orderId) && enabled,
        staleTime: 30_000,
        refetchInterval: (query) => {
            // Chỉ poll lúc đơn đang giao; khi đã giao, hoàn tất hoặc hủy thì dừng để tránh request nền vô ích.
            return query.state.data?.fulfillmentStatus === 'SHIPPING'
                ? 15_000
                : false;
        },
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

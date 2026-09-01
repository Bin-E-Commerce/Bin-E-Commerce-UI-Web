// File này gom query/mutation của delivery confirmation và review theo order detail.
// Hook chỉ quản lý cache, loading và toast; quyết định hiển thị hoặc dữ liệu form vẫn thuộc component UI.

'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { confirmOrderDelivery, type DeliveryConfirmationInput } from '@/services/order/order.api';
import { productService } from '@/services/product/product.service';
import { getErrorMessage } from '@/utils/getErrorMessage';

// Lấy trạng thái review theo order để form hiển thị đúng item đã gửi hoặc còn có thể đánh giá.
export function useOrderReviewStatus(orderId: string, enabled = true) {
    return useQuery({
        queryKey: ['order-review-status', orderId],
        queryFn: () => productService.getOrderReviewStatus(orderId),
        enabled: Boolean(orderId) && enabled,
        staleTime: 30_000,
    });
}

// Gửi xác nhận nhận hàng rồi đồng bộ detail, danh sách order và review status trong cùng một lần mutation.
export function useConfirmOrderDelivery(orderId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (input: DeliveryConfirmationInput) => confirmOrderDelivery(orderId, input),
        onSuccess: async (order) => {
            queryClient.setQueryData(['customer-order', orderId], order);
            await Promise.all([
                queryClient.invalidateQueries({ queryKey: ['customer-orders'] }),
                queryClient.invalidateQueries({ queryKey: ['order-review-status', orderId] }),
            ]);
            toast.success(order.deliveryConfirmation.status === 'ISSUE_REPORTED' ? 'Đã ghi nhận vấn đề của bạn.' : 'Đã xác nhận nhận hàng.');
        },
        onError: (error) => toast.error(getErrorMessage(error)),
    });
}

// Gửi review tùy chọn cho từng order item, làm mới order status và product detail để review mới xuất hiện ngay.
export function useCreateOrderReview(orderId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (input: { productId: string; orderItemId: string; rating: number; title?: string; content?: string; images?: string[]; videos?: string[]; isAnonymous?: boolean }) =>
            productService.createReview(input.productId, {
                orderItemId: input.orderItemId,
                rating: input.rating,
                title: input.title,
                content: input.content,
                images: input.images,
                videos: input.videos,
                isAnonymous: input.isAnonymous,
            }),
        onSuccess: async (_review, variables) => {
            await Promise.all([
                queryClient.invalidateQueries({ queryKey: ['order-review-status', orderId] }),
                queryClient.invalidateQueries({ queryKey: ['products', 'detail', variables.productId] }),
            ]);
            toast.success('Đã gửi đánh giá. Cảm ơn bạn đã chia sẻ trải nghiệm.');
        },
        onError: (error) => toast.error(getErrorMessage(error)),
    });
}

type UpdateOrderReviewInput = {
    reviewId: string;
    productId: string;
    rating: number;
    title?: string;
    content?: string;
    images?: string[];
    videos?: string[];
    isAnonymous?: boolean;
};

// Cập nhật review và làm mới cả order review status lẫn product detail để thay đổi xuất hiện ngay ở hai màn hình.
export function useUpdateOrderReview(orderId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (input: UpdateOrderReviewInput) => productService.updateReview(input.reviewId, {
            rating: input.rating,
            title: input.title,
            content: input.content,
            images: input.images,
            videos: input.videos,
            isAnonymous: input.isAnonymous,
        }),
        onSuccess: async (_review, variables) => {
            await Promise.all([
                queryClient.invalidateQueries({ queryKey: ['order-review-status', orderId] }),
                queryClient.invalidateQueries({ queryKey: ['products', 'detail', variables.productId] }),
            ]);
            toast.success('Đã cập nhật đánh giá của bạn.');
        },
        onError: (error) => toast.error(getErrorMessage(error)),
    });
}

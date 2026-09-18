// Hook này thực hiện mutation thêm item, quản lý loading/toast và làm mới active cart sau khi server xác nhận.
// Hook không optimistic update vì giá và tồn kho chỉ được quyết định bởi Cart Service.

'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { useAppSelector } from '@/store/hooks';
import { getErrorMessage } from '@/utils/getErrorMessage';
import { addCartItem } from '@/services/cart';
import {
    clearRecommendationAttribution,
    getStoredRecommendationAttribution,
    trackRecommendationInteraction,
} from '@/services/recommendation';
import type { AddCartItemInput, Cart } from '../types/cart.types';

// Cờ trình bày chỉ điều khiển toast của frontend; không được truyền xuống Cart API.
type AddCartItemMutationInput = AddCartItemInput & {
    showSuccessToast?: boolean;
};

// Cung cấp mutation dùng chung cho product detail và các CTA thêm vào giỏ sau này.
export function useAddCartItem() {
    const queryClient = useQueryClient();
    const userId = useAppSelector((state) => state.auth.user?.id ?? null);

    return useMutation<Cart, unknown, AddCartItemMutationInput>({
        mutationFn: (mutationInput) => {
            const { showSuccessToast, ...input } = mutationInput;
            void showSuccessToast;
            return addCartItem(input);
        },
        onSuccess: async (cart, input) => {
            // Ghi đè cache bằng response chuẩn rồi invalidate để các component khác nhận totalItems mới nhất.
            queryClient.setQueryData(['cart', userId ?? 'anonymous'], cart);
            await queryClient.invalidateQueries({
                queryKey: ['cart', userId ?? 'anonymous'],
            });
            const attribution = getStoredRecommendationAttribution(
                input.productId,
            );
            const trackingPromise = trackRecommendationInteraction({
                interactionType: 'PRODUCT_ADDED_TO_CART',
                productId: input.productId,
                variantId: input.variantId,
                quantity: input.quantity,
                page: 'product_detail',
                ...attribution,
            });
            // Chỉ xóa context sau khi Gateway nhận event; nếu tracking lỗi, lần thao tác sau vẫn còn cơ hội gửi lại attribution.
            void trackingPromise
                .then(() => {
                    if (attribution)
                        clearRecommendationAttribution(input.productId);
                })
                .catch(() => undefined);
            if (input.showSuccessToast !== false) {
                toast.success('Đã thêm sản phẩm vào giỏ hàng.');
            }
        },
        onError: (error) => {
            toast.error(getErrorMessage(error));
        },
    });
}

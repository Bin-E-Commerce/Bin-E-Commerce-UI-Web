// Hook này chứa mutation cập nhật và xóa item dùng chung cho mini-cart và trang cart.
// Hook luôn lấy response đầy đủ từ backend để cache phản ánh đúng quantity, subtotal và tồn kho đã được xác nhận.

'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { removeCartItem, updateCartItem } from '@/services/cart';
import { trackRecommendationInteraction } from '@/services/recommendation';
import { useAppSelector } from '@/store/hooks';
import { getErrorMessage } from '@/utils/getErrorMessage';
import type { Cart, UpdateCartItemInput } from '../types/cart.types';

type RemoveCartItemInput = {
    itemId: string;
    productId: string;
    variantId: string;
    quantity: number;
};

// Cập nhật quantity trên server rồi ghi đè cache cart để mọi nơi trong header và trang cart đồng bộ.
export function useUpdateCartItem() {
    const queryClient = useQueryClient();
    const userId = useAppSelector((state) => state.auth.user?.id ?? null);
    const queryKey = ['cart', userId ?? 'anonymous'];

    return useMutation<Cart, unknown, UpdateCartItemInput>({
        mutationFn: updateCartItem,
        onSuccess: async (cart) => {
            // Không optimistic update vì quantity hợp lệ còn phụ thuộc tồn kho do Cart Service xác nhận.
            queryClient.setQueryData(queryKey, cart);
            await queryClient.invalidateQueries({ queryKey });
            toast.success('Đã cập nhật số lượng sản phẩm.');
        },
        onError: (error) => {
            toast.error(getErrorMessage(error));
        },
    });
}

// Xóa item trên server rồi cập nhật lại cache để badge, mini-cart và trang cart cùng bỏ item vừa xóa.
export function useRemoveCartItem() {
    const queryClient = useQueryClient();
    const userId = useAppSelector((state) => state.auth.user?.id ?? null);
    const queryKey = ['cart', userId ?? 'anonymous'];

    return useMutation<Cart, unknown, RemoveCartItemInput>({
        // Dùng itemId cho request nhưng giữ snapshot từ UI để tracking không phụ thuộc cache cart.
        mutationFn: ({ itemId }) => removeCartItem(itemId),
        onSuccess: async (cart, variables) => {
            queryClient.setQueryData(queryKey, cart);
            await queryClient.invalidateQueries({ queryKey });
            // Gửi event sau khi xóa thành công; không gửi trước để tránh ghi nhận thao tác thất bại.
            void trackRecommendationInteraction({
                interactionType: 'PRODUCT_REMOVED_FROM_CART',
                productId: variables.productId,
                variantId: variables.variantId,
                quantity: variables.quantity,
                page: 'cart',
            }).catch(() => undefined);
            toast.success('Đã xóa sản phẩm khỏi giỏ hàng.');
        },
        onError: (error) => {
            toast.error(getErrorMessage(error));
        },
    });
}

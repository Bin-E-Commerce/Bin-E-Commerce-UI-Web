// Hook này thực hiện mutation thêm item, quản lý loading/toast và làm mới active cart sau khi server xác nhận.
// Hook không optimistic update vì giá và tồn kho chỉ được quyết định bởi Cart Service.

'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { useAppSelector } from '@/store/hooks';
import { getErrorMessage } from '@/utils/getErrorMessage';
import { addCartItem } from '@/services/cart';
import type { AddCartItemInput, Cart } from '../types/cart.types';

// Cung cấp mutation dùng chung cho product detail và các CTA thêm vào giỏ sau này.
export function useAddCartItem() {
    const queryClient = useQueryClient();
    const userId = useAppSelector((state) => state.auth.user?.id ?? null);

    return useMutation<Cart, unknown, AddCartItemInput>({
        mutationFn: addCartItem,
        onSuccess: async (cart) => {
            // Ghi đè cache bằng response chuẩn rồi invalidate để các component khác nhận totalItems mới nhất.
            queryClient.setQueryData(['cart', userId ?? 'anonymous'], cart);
            await queryClient.invalidateQueries({
                queryKey: ['cart', userId ?? 'anonymous'],
            });
            toast.success('Đã thêm sản phẩm vào giỏ hàng.');
        },
        onError: (error) => {
            toast.error(getErrorMessage(error));
        },
    });
}

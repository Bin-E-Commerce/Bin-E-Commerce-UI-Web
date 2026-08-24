'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { sellerProductService } from '@/services/product';
import { getErrorMessage } from '@/utils/getErrorMessage';

// Điều phối xóa mềm sản phẩm và làm mới toàn bộ cache list/summary để sản phẩm biến mất ngay sau khi thành công.
export function useDeleteSellerProduct() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (productId: string) =>
            sellerProductService.deleteProduct(productId),
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: ['seller-products'],
            });
            toast.success('Đã xóa sản phẩm khỏi shop.');
        },
        onError: (error: unknown) => {
            toast.error(getErrorMessage(error));
        },
    });
}

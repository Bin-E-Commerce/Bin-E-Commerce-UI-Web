'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { sellerProductService } from '@/services/product';
import { getErrorMessage } from '@/utils/getErrorMessage';

// Điều phối restore và làm mới toàn bộ cache sản phẩm để product chuyển tab ngay sau khi backend xác nhận.
export function useRestoreSellerProduct() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (productId: string) =>
            sellerProductService.restoreProduct(productId),
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: ['seller-products'],
            });
            toast.success('Đã khôi phục sản phẩm về trạng thái đang ẩn.');
        },
        onError: (error: unknown) => {
            toast.error(getErrorMessage(error));
        },
    });
}

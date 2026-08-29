'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { sellerProductService } from '@/services/product';
import type { SellerProductPublicationStatus } from '@/services/product';
import { getErrorMessage } from '@/utils/getErrorMessage';

// Điều phối mutation trạng thái và làm mới cả list/detail cache để giao diện không hiển thị trạng thái cũ.
export function useChangeSellerProductStatus() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ productId, status }: { productId: string; status: SellerProductPublicationStatus }) =>
            sellerProductService.changeStatus(productId, status),
        onSuccess: (response) => {
            // Làm mới cache ở nền để mutation kết thúc ngay sau PATCH, tránh giữ modal và khóa tương tác nếu query đọc bị chậm.
            void Promise.all([
                queryClient.invalidateQueries({ queryKey: ['seller-products'] }),
                queryClient.invalidateQueries({
                    queryKey: ['seller', 'product-detail', response.id],
                }),
            ]);
            toast.success(
                response.status === 'ACTIVE'
                    ? 'Sản phẩm đã được bật bán.'
                    : 'Sản phẩm đã được tắt bán.',
            );
        },
        onError: (error: unknown) => {
            toast.error(getErrorMessage(error));
        },
    });
}

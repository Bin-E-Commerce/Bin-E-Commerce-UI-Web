// File này tải detail Seller với dữ liệu Inventory mới nhất để màn hình chỉnh sửa không dùng tồn kho cache cũ.
'use client';

import { useQuery } from '@tanstack/react-query';

import { sellerProductService } from '@/services/product';

// Tải chi tiết từ endpoint có kiểm tra ownership và không gửi request khi route chưa có productId hợp lệ.
export function useSellerProductDetail(productId: string | undefined) {
    return useQuery({
        queryKey: ['seller', 'product-detail', productId],
        queryFn: () =>
            sellerProductService.getOwnedProductById(productId as string),
        enabled: Boolean(productId),
        // Tồn kho thay đổi theo checkout ở service khác nên edit/detail phải revalidate ngay khi được mở.
        staleTime: 0,
        refetchOnMount: 'always',
    });
}

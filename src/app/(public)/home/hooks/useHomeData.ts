'use client';

import { useQuery } from '@tanstack/react-query';

import { catalogService } from '@/services/catalog';
import { productService } from '@/services/product';
import type { HomeData } from '../types/home.types';

const HOME_PRODUCT_LIMIT = 24;
const HOME_CATEGORY_LIMIT = 20;

// Tải song song sản phẩm và danh mục để homepage không tạo waterfall giữa hai service độc lập.
async function fetchHomeData(): Promise<HomeData> {
    const [productResult, categoryResult] = await Promise.allSettled([
        productService.listProducts({
            page: 1,
            pageSize: HOME_PRODUCT_LIMIT,
            status: 'ACTIVE',
        }),
        catalogService.listCategories({
            page: 1,
            pageSize: HOME_CATEGORY_LIMIT,
            level: 0,
        }),
    ]);

    // Sản phẩm là nội dung chính nên lỗi Product Service phải được báo rõ; danh mục chỉ là nội dung bổ trợ.
    if (productResult.status === 'rejected') {
        throw productResult.reason;
    }

    return {
        products: productResult.value.items,
        totalProducts: productResult.value.total,
        categories:
            categoryResult.status === 'fulfilled'
                ? categoryResult.value.items
                : [],
    };
}

// Quản lý cache homepage để quay lại trang không phải tải lại danh sách sản phẩm ngay lập tức.
export function useHomeData() {
    return useQuery({
        queryKey: ['home', 'catalog-preview'],
        queryFn: fetchHomeData,
        // Card sản phẩm hiển thị lượt bán nên cần lấy lại dữ liệu sau khi đơn chuyển trạng thái.
        staleTime: 30_000,
    });
}

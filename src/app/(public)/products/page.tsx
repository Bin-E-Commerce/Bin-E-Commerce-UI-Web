// Route listing sản phẩm công khai, xử lý query ở client có Suspense để URL search không chặn prerender toàn trang.
import { Suspense } from 'react';
import type { Metadata } from 'next';
import { ProductSearchPage } from '@/features/product-search/components/ProductSearchPage';
import { ProductSearchSkeleton } from '@/features/product-search/components/ProductSearchSkeleton';

export const metadata: Metadata = {
    title: 'Tìm kiếm sản phẩm và cửa hàng',
    description: 'Tìm sản phẩm, thương hiệu và cửa hàng trên Bin E-Commerce.',
    robots: { index: false, follow: true },
};

// Bao component dùng useSearchParams trong Suspense để build production không render cả trang phía client.
export default function ProductsPage() {
    return (
        <Suspense fallback={<ProductSearchSkeleton />}>
            <ProductSearchPage />
        </Suspense>
    );
}

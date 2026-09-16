// File này ghép hai carousel product detail; không query API và không quyết định ranking/exclusion.

import type { PublicProduct } from '@/services/product';

import { ProductRecommendationCarousel } from './ProductRecommendationCarousel';
import type { ProductDetailRecommendation } from '../../types/product-detail.types';

interface ProductRecommendationsSectionProps {
    shopProducts: PublicProduct[];
    products: ProductDetailRecommendation[];
    shopHref: string | null;
}

// Ghép hai carousel độc lập; lỗi hoặc rỗng của một nguồn không được ẩn nguồn còn lại trên product detail.
export function ProductRecommendationsSection({
    shopProducts,
    products,
    shopHref,
}: ProductRecommendationsSectionProps) {
    return (
        <div className="space-y-3">
            {shopHref && shopProducts.length > 0 ? (
                <ProductRecommendationCarousel
                    title="Các sản phẩm khác của Shop"
                    actionLabel="Xem tất cả"
                    actionHref={shopHref}
                    products={shopProducts.map((product) => ({ product }))}
                    showNavigation={false}
                />
            ) : null}

            <ProductRecommendationCarousel
                title="Có thể bạn cũng thích"
                actionLabel="Xem thêm"
                actionHref="/goi-y-hom-nay"
                products={products}
                showRecommendationMetadata
                requiresAuth
                showNavigation={false}
                layout="grid"
                actionPlacement="footer"
            />
        </div>
    );
}

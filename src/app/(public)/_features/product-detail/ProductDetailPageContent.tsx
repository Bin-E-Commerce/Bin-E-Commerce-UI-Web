'use client';

import { ProductDescriptionSection } from './components/content/ProductDescriptionSection';
import { ProductSpecificationsSection } from './components/content/ProductSpecificationsSection';
import { ProductGallery } from './components/gallery/ProductGallery';
import { ProductBreadcrumbs } from './components/navigation/ProductBreadcrumbs';
import { ProductPurchasePanel } from './components/purchase/ProductPurchasePanel';
import { ProductRecommendationsSection } from './components/recommendations/ProductRecommendationsSection';
import { ProductReviewsSection } from './components/reviews/ProductReviewsSection';
import { ProductShopPanel } from './components/shop/ProductShopPanel';
import { ProductDetailErrorState } from './components/states/ProductDetailErrorState';
import { ProductDetailSkeleton } from './components/states/ProductDetailSkeleton';
import { useProductDetail } from './hooks/useProductDetail';
import { getProductBreadcrumbs } from './utils/product-detail-presentation';

interface ProductDetailPageContentProps {
    productId: string;
}

// Điều phối dữ liệu và các section của trang chi tiết, giữ route chỉ chịu trách nhiệm đọc tham số URL.
export function ProductDetailPageContent({
    productId,
}: ProductDetailPageContentProps) {
    const productQuery = useProductDetail(productId);

    if (productQuery.isPending) {
        return <ProductDetailSkeleton />;
    }

    if (productQuery.isError || !productQuery.data) {
        return <ProductDetailErrorState onRetry={() => productQuery.refetch()} />;
    }

    const { product, recommendations } = productQuery.data;
    const breadcrumbs = getProductBreadcrumbs(product);

    return (
        <div className="w-full overflow-x-hidden bg-zinc-100 pb-12 text-zinc-950">
            <div className="mx-auto w-full max-w-7xl px-3 py-4 sm:px-6 lg:px-8">
                <ProductBreadcrumbs
                    items={breadcrumbs}
                    productName={product.name}
                />

                <div className="mt-3 grid min-w-0 grid-cols-1 overflow-hidden border border-zinc-200 bg-white shadow-sm lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
                    <ProductGallery
                        productName={product.name}
                        images={product.images ?? []}
                        videoUrl={product.videoUrl}
                        videoDurationSeconds={product.videoDurationSeconds}
                    />
                    <ProductPurchasePanel product={product} />
                </div>
            </div>

            {product.externalShop ? (
                <ProductShopPanel shop={product.externalShop} />
            ) : null}

            <div className="mx-auto grid max-w-7xl gap-3 px-3 py-3 sm:px-6 lg:px-8">
                <ProductSpecificationsSection product={product} />
                <ProductDescriptionSection
                    description={product.description}
                    shortDescription={product.shortDescription}
                />
            </div>

            <div className="mx-auto max-w-7xl px-3 pb-3 sm:px-6 lg:px-8">
                <ProductReviewsSection product={product} />
            </div>

            <ProductRecommendationsSection products={recommendations} />
        </div>
    );
}

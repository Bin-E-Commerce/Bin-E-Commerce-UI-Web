import { ProductCard } from '@/app/(public)/products/components/ProductCard';
import type { ProductDetailRecommendation } from '../../types/product-detail.types';

interface ProductRecommendationsSectionProps {
    products: ProductDetailRecommendation[];
}

// Hiển thị sản phẩm liên quan bằng card dùng chung để luồng khám phá nhất quán với trang chủ.
export function ProductRecommendationsSection({
    products,
}: ProductRecommendationsSectionProps) {
    if (products.length === 0) return null;

    return (
        <section className="border-y border-zinc-200 bg-white">
            <div className="mx-auto max-w-7xl px-3 py-7 sm:px-6 lg:px-8">
                <div className="mb-5 flex items-end justify-between gap-4">
                    <div>
                        <p className="text-xs font-semibold uppercase text-red-600">
                            Có thể bạn quan tâm
                        </p>
                        <h2 className="mt-1 text-xl font-bold text-zinc-950 sm:text-2xl">
                            Sản phẩm liên quan
                        </h2>
                    </div>
                    <p className="hidden max-w-md text-right text-sm leading-6 text-zinc-500 sm:block">
                        Khám phá thêm các lựa chọn đang có trên Bin E-Commerce.
                    </p>
                </div>

                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3 lg:grid-cols-6">
                    {products.map((item) => (
                        <ProductCard
                            key={item.product.id}
                            product={item.product}
                            rank={item.rank}
                            trackingPage="product_detail"
                            trackingContext={{
                                recommendationRequestId:
                                    item.recommendationRequestId,
                                recommendationItemId: item.product.id,
                                recommendationSource: item.source,
                                recommendationRank: item.rank,
                                surface: 'product_detail',
                            }}
                            recommendationReason={item.reasons?.[0]}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}

'use client';

import { useHomeData } from './hooks/useHomeData';
import { HomeCampaignSection } from './sections/campaign/HomeCampaignSection';
import { HomeCategorySection } from './sections/categories/HomeCategorySection';
import { HomeProductSection } from './sections/products/HomeProductSection';
import { HomeRecommendationSection } from './sections/recommendations/HomeRecommendationSection';
import { HomeErrorState } from './sections/states/HomeErrorState';
import { HomePageSkeleton } from './sections/states/HomePageSkeleton';
import { HomeStoreSection } from './sections/stores/HomeStoreSection';
import { HomeShortcutSection } from './sections/shortcuts/HomeShortcutSection';
import { HomeShowcasePrompt } from './components/HomeShowcasePrompt';
import {
    collectFeaturedShops,
    selectFeaturedProducts,
} from './utils/product-presentation';

// Điều phối các section của homepage từ một nguồn dữ liệu chung để chỉ gọi API một lần.
export function HomePageContent() {
    const homeQuery = useHomeData();

    if (homeQuery.isPending) return <HomePageSkeleton />;
    if (homeQuery.isError) {
        return <HomeErrorState onRetry={() => void homeQuery.refetch()} />;
    }

    const { products, categories } = homeQuery.data;
    const featuredProducts = selectFeaturedProducts(products, 6);
    const featuredIds = new Set(featuredProducts.map((product) => product.id));
    const remainingProducts = products.filter(
        (product) => !featuredIds.has(product.id),
    );
    const topSearchProducts = remainingProducts.slice(0, 6);
    const recommendationProducts = remainingProducts.slice(6, 30);
    const shops = collectFeaturedShops(products, 5);

    return (
        <div className="bg-zinc-100 pb-10 text-zinc-950">
            <HomeShowcasePrompt />
            <HomeCampaignSection />
            <HomeShortcutSection />
            {categories.length > 0 ? (
                <HomeCategorySection categories={categories} />
            ) : null}
            <HomeProductSection
                id="products"
                title="Giá tốt hôm nay"
                description="Sản phẩm đang hoạt động với mức giá cập nhật trực tiếp từ hệ thống."
                products={featuredProducts}
                mode="rail"
            />
            {shops.length > 0 ? <HomeStoreSection shops={shops} /> : null}
            {topSearchProducts.length > 0 ? (
                <HomeProductSection
                    title="Tìm kiếm hàng đầu"
                    description="Những lựa chọn đáng chú ý trong danh sách sản phẩm hiện tại."
                    products={topSearchProducts}
                    mode="rail"
                />
            ) : null}
            {recommendationProducts.length > 0 ? (
                <HomeRecommendationSection products={recommendationProducts} />
            ) : null}
        </div>
    );
}

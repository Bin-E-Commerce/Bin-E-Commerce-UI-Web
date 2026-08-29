'use client';

import { useHomeData } from './hooks/useHomeData';
import { HomeCampaignSection } from './sections/campaign/HomeCampaignSection';
import { HomeCategorySection } from './sections/categories/HomeCategorySection';
import { HomeProductSection } from './sections/products/HomeProductSection';
import { HomeErrorState } from './sections/states/HomeErrorState';
import { HomePageSkeleton } from './sections/states/HomePageSkeleton';
import { HomeStoreSection } from './sections/stores/HomeStoreSection';
import { HomeShortcutSection } from './sections/shortcuts/HomeShortcutSection';
import {
    collectFeaturedShops,
    selectFeaturedProducts,
    selectCampaignProducts,
} from './utils/product-presentation';

// Điều phối các section của homepage từ một nguồn dữ liệu chung để chỉ gọi API một lần.
export function HomePageContent() {
    const homeQuery = useHomeData();

    if (homeQuery.isPending) return <HomePageSkeleton />;
    if (homeQuery.isError) {
        return <HomeErrorState onRetry={() => void homeQuery.refetch()} />;
    }

    const { products, categories, totalProducts } = homeQuery.data;
    const campaignProducts = selectCampaignProducts(products, 3);
    const featuredProducts = selectFeaturedProducts(products, 6);
    const featuredIds = new Set(featuredProducts.map((product) => product.id));
    const remainingProducts = products.filter(
        (product) => !featuredIds.has(product.id),
    );
    const topSearchProducts = remainingProducts.slice(0, 6);
    const recommendationProducts = remainingProducts.slice(6, 18);
    const shops = collectFeaturedShops(products, 5);

    return (
        <div className="bg-zinc-100 pb-10 text-zinc-950">
            <HomeCampaignSection
                products={campaignProducts}
                totalProducts={totalProducts}
            />
            <HomeShortcutSection />
            {categories.length > 0 ? (
                <HomeCategorySection categories={categories} />
            ) : null}
            <HomeProductSection
                id="products"
                eyebrow="Ưu đãi nổi bật"
                title="Giá tốt hôm nay"
                description="Sản phẩm đang hoạt động với mức giá cập nhật trực tiếp từ hệ thống."
                products={featuredProducts}
                mode="rail"
            />
            {shops.length > 0 ? <HomeStoreSection shops={shops} /> : null}
            {topSearchProducts.length > 0 ? (
                <HomeProductSection
                    eyebrow="Xu hướng mua sắm"
                    title="Tìm kiếm hàng đầu"
                    description="Những lựa chọn đáng chú ý trong danh sách sản phẩm hiện tại."
                    products={topSearchProducts}
                    mode="rail"
                    ranked
                />
            ) : null}
            {recommendationProducts.length > 0 ? (
                <HomeProductSection
                    id="recommendations"
                    eyebrow="Dành cho bạn"
                    title="Gợi ý hôm nay"
                    description="Khám phá thêm sản phẩm mới từ các gian hàng trên Bin E-Commerce."
                    products={recommendationProducts}
                    mode="grid"
                />
            ) : null}
        </div>
    );
}

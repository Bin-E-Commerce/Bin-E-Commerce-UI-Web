import type { PublicProduct } from '@/services/product';
import {
    getProductRating,
    getProductThumbnail,
} from '@/app/(public)/products/utils/product-formatters';

// Chọn đủ sản phẩm có ảnh cho cụm banner và giữ nguyên thứ tự API để nội dung ổn định giữa các lần render.
export function selectCampaignProducts(
    products: PublicProduct[],
    limit: number,
): PublicProduct[] {
    const productsWithImage = products.filter((product) =>
        Boolean(getProductThumbnail(product)),
    );
    const source =
        productsWithImage.length >= limit ? productsWithImage : products;
    const seenNames = new Set<string>();
    const seenImages = new Set<string>();

    // Tránh lặp sản phẩm cùng tên hoặc thumbnail trong cụm campaign.
    const distinctProducts = source.filter((product) => {
        const normalizedName = product.name.trim().toLocaleLowerCase('vi-VN');
        const thumbnail = getProductThumbnail(product);
        if (
            seenNames.has(normalizedName) ||
            (thumbnail !== null && seenImages.has(thumbnail))
        ) {
            return false;
        }

        seenNames.add(normalizedName);
        if (thumbnail !== null) seenImages.add(thumbnail);
        return true;
    });

    return distinctProducts.slice(0, limit);
}

// Sắp xếp sản phẩm đáng chú ý theo tín hiệu mua và đánh giá, không tạo dữ liệu khuyến mãi giả.
export function selectFeaturedProducts(
    products: PublicProduct[],
    limit: number,
): PublicProduct[] {
    return [...products]
        .sort((left, right) => {
            const soldDifference = right.totalSold - left.totalSold;
            if (soldDifference !== 0) return soldDifference;
            return getProductRating(right) - getProductRating(left);
        })
        .slice(0, limit);
}

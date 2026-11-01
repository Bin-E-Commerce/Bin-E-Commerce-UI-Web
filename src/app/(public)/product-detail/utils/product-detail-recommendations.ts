// File này chứa các pure helper cho product detail; không gọi API, không sở hữu state UI và bảo vệ scope hai carousel.

import type { PublicProduct } from '@/services/product';

// Seller shop ID là namespace duy nhất cho catalog sản phẩm trên trang chi tiết.
export function getProductShopFilter(
    product: PublicProduct,
): { sellerShopId: string } | null {
    return product.sellerShopId ? { sellerShopId: product.sellerShopId } : null;
}

// Trả về shop seller để các bộ lọc cùng shop không phụ thuộc nguồn dữ liệu cũ.
function getShopIdentity(product: PublicProduct): string | null {
    return product.sellerShopId ?? null;
}

// Loại sản phẩm hiện tại và giữ tối đa sáu card cùng shop cho carousel catalog.
export function filterShopProducts(
    products: PublicProduct[],
    currentProduct: PublicProduct,
    limit = 6,
): PublicProduct[] {
    const currentShopId = getShopIdentity(currentProduct);
    if (!currentShopId) return [];
    const safeLimit = Number.isFinite(limit)
        ? Math.min(Math.max(Math.trunc(limit), 0), 6)
        : 6;

    const seenProductIds = new Set<string>();
    return products
        .filter((product) => {
            const isAllowed =
                product.id !== currentProduct.id &&
                getShopIdentity(product) === currentShopId &&
                !seenProductIds.has(product.id);
            if (isAllowed) seenProductIds.add(product.id);
            return isAllowed;
        })
        .slice(0, safeLimit);
}

// Bảo vệ UI trước response cũ hoặc fallback sai scope; recommendation không lặp self/cùng shop.
export function filterRecommendationProducts(
    products: PublicProduct[],
    currentProduct: PublicProduct,
    limit = 24,
): PublicProduct[] {
    const currentShopId = getShopIdentity(currentProduct);
    const safeLimit = Number.isFinite(limit)
        ? Math.min(Math.max(Math.trunc(limit), 0), 24)
        : 24;

    const seenProductIds = new Set<string>();
    return products
        .filter((product) => {
            const isAllowed =
                product.id !== currentProduct.id &&
                (!currentShopId ||
                    getShopIdentity(product) !== currentShopId) &&
                !seenProductIds.has(product.id);
            if (isAllowed) seenProductIds.add(product.id);
            return isAllowed;
        })
        .slice(0, safeLimit);
}

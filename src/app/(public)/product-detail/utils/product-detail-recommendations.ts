// File này chứa các pure helper cho product detail; không gọi API, không sở hữu state UI và bảo vệ scope hai carousel.

import type { PublicProduct } from '@/services/product';

// Lấy định danh shop theo origin và fallback theo relation object để response external cũ không bị mất shop carousel.
function getShopIdentity(product: PublicProduct): string | null {
    // Một số response cũ có thể thiếu originType; chỉ fallback sang external khi không có origin rõ ràng.
    if (
        product.originType === 'EXTERNAL' ||
        (!product.originType &&
            (product.externalShop || product.externalShopId))
    ) {
        return product.externalShop?.id ?? product.externalShopId ?? null;
    }

    return product.sellerShopId ?? null;
}

// Tạo đúng query param theo namespace shop; externalShopId và sellerShopId không được dùng thay thế cho nhau.
export function getProductShopFilter(
    product: PublicProduct,
): { sellerShopId: string } | { externalShopId: string } | null {
    const shopId = getShopIdentity(product);
    if (!shopId) return null;

    const isExternalProduct =
        product.originType === 'EXTERNAL' ||
        (!product.originType &&
            Boolean(product.externalShop || product.externalShopId));
    return isExternalProduct
        ? { externalShopId: shopId }
        : { sellerShopId: shopId };
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

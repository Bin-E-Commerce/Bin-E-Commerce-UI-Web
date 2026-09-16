// File này kiểm thử pure helper lọc scope product detail; không mock API vì helper không có side effect hay dependency ngoài.

import type { PublicProduct } from '@/services/product';

import {
    filterRecommendationProducts,
    filterShopProducts,
    getProductShopFilter,
} from './product-detail-recommendations';

// Tạo product tối thiểu để test tập trung vào origin/shop identity thay vì chi tiết hiển thị của card.
function product(id: string, shopId = 'shop-1'): PublicProduct {
    return {
        id,
        originType: 'INTERNAL',
        sellerShopId: shopId,
        name: id,
        slug: id,
        minPrice: '100',
        maxPrice: '100',
        displayPrice: '100',
        displayOriginalPrice: null,
        totalSold: 0,
        reviewCount: 0,
    };
}

// Bộ test bảo vệ hai invariant: shop carousel tối đa sáu card và recommendation không lặp self/cùng shop.
describe('product detail recommendation helpers', () => {
    // Kiểm tra query lấy dư một item vẫn cho đủ sáu sản phẩm khác cùng shop sau khi loại self.
    it('should remove current product and keep at most six products from its shop', () => {
        // Arrange
        const current = product('current');
        const candidates = [
            current,
            ...Array.from({ length: 7 }, (_, index) =>
                product(`same-${index}`),
            ),
            product('other-shop', 'shop-2'),
        ];

        // Act
        const result = filterShopProducts(candidates, current);

        // Assert
        expect(result).toHaveLength(6);
        expect(result.map((item) => item.id)).toEqual([
            'same-0',
            'same-1',
            'same-2',
            'same-3',
            'same-4',
            'same-5',
        ]);
    });

    // Kiểm tra recommendation không dùng lại candidate cùng shop và không vượt page size 24.
    it('should remove current shop and cap recommendation products at twenty-four', () => {
        // Arrange
        const current = product('current');
        const candidates = [
            current,
            ...Array.from({ length: 25 }, (_, index) =>
                product(`same-shop-${index}`),
            ),
            ...Array.from({ length: 25 }, (_, index) =>
                product(`other-${index}`, 'shop-2'),
            ),
        ];

        // Act
        const result = filterRecommendationProducts(candidates, current);

        // Assert
        expect(result).toHaveLength(24);
        expect(result.every((item) => item.sellerShopId === 'shop-2')).toBe(
            true,
        );
    });

    // Kiểm tra externalShopId được tách namespace với sellerShopId khi lọc catalog crawl.
    it('should filter external shop products by external shop identity', () => {
        // Arrange
        const current = {
            ...product('external-current'),
            originType: 'EXTERNAL' as const,
            sellerShopId: null,
            externalShopId: 'external-shop-1',
        };
        const candidates = [
            current,
            {
                ...product('external-same'),
                originType: 'EXTERNAL' as const,
                sellerShopId: null,
                externalShopId: 'external-shop-1',
            },
            {
                ...product('external-other'),
                originType: 'EXTERNAL' as const,
                sellerShopId: null,
                externalShopId: 'external-shop-2',
            },
        ];

        // Act
        const result = filterShopProducts(candidates, current);

        // Assert
        expect(result.map((item) => item.id)).toEqual(['external-same']);
    });

    // Đảm bảo response lặp product không tạo card trùng trong carousel shop.
    it('should deduplicate products before applying the carousel limit', () => {
        // Arrange
        const current = product('current');
        const candidates = [
            product('shop-product'),
            product('shop-product'),
            product('shop-product-2'),
        ];

        // Act
        const result = filterShopProducts(candidates, current);

        // Assert
        expect(result.map((item) => item.id)).toEqual([
            'shop-product',
            'shop-product-2',
        ]);
    });

    // Đảm bảo product external dùng đúng query namespace, không bị gửi nhầm sellerShopId.
    it('should build an external shop filter from the external shop id', () => {
        const current = {
            ...product('external-current'),
            originType: 'EXTERNAL' as const,
            sellerShopId: 'seller-shop-with-same-value',
            externalShopId: 'external-shop-1',
        };

        expect(getProductShopFilter(current)).toEqual({
            externalShopId: 'external-shop-1',
        });
    });
});

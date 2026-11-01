// File này kiểm thử pure helper lọc scope product detail; không mock API vì helper không có side effect hay dependency ngoài.

import type { PublicProduct } from '@/services/product';

import {
    filterRecommendationProducts,
    filterShopProducts,
} from './product-detail-recommendations';

// Tạo product tối thiểu để test phạm vi shop thay vì chi tiết hiển thị của card.
function product(id: string, shopId = 'shop-1'): PublicProduct {
    return {
        id,
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
});

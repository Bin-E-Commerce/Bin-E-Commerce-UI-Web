// File này kiểm tra mapper description không làm lộ shortDescription hay định danh option nội bộ sang AI.
// Đây là unit test thuần dữ liệu, không gọi HTTP và không cần render React component.

import { buildProductDescriptionRequest } from './build-product-description-request';
import type {
    SellerProductCreateReferences,
    SellerProductCreateFormValues,
} from '../../../types/seller-product-create-form.type';

// Tạo form fixture tối thiểu để test mapper tập trung vào contract mô tả.
function createValues(): SellerProductCreateFormValues {
    return {
        name: 'Giày da nam công sở',
        categoryId: 'category-1',
        brandId: '',
        description: 'Mô tả hiện tại của sản phẩm.',
        shortDescription: 'Tóm tắt riêng không gửi cho use case mô tả.',
        gtin: '',
        sellerSku: '',
        condition: 'new',
        countryOfOrigin: '',
        images: [{ assetId: 'asset-1', publicUrl: 'https://cdn.example.com/shoe.jpg', previewUrl: '', fileName: 'shoe.jpg' }],
        video: null,
        attributes: {},
        options: [],
        variants: [],
        package: { weightGrams: '', lengthCm: '', widthCm: '', heightCm: '' },
    };
}

// Dùng category không có thuộc tính động để mapper không phụ thuộc Catalog Service trong unit test.
function createReferences(): SellerProductCreateReferences {
    return {
        category: { id: 'category-1', name: 'Giày dép', path: 'Thời trang > Giày dép' },
        brand: null,
        attributes: [],
    };
}

// Mapper phải giữ description/draftName nhưng loại shortDescription khỏi sellerInput gửi tới endpoint mới.
test('builds a description request without shortDescription', () => {
    // Arrange
    const values = createValues();
    const references = createReferences();

    // Act
    const request = buildProductDescriptionRequest(values, references);

    // Assert
    expect(request.sellerInput).toEqual({
        draftName: 'Giày da nam công sở',
        description: 'Mô tả hiện tại của sản phẩm.',
    });
    expect(request.images).toHaveLength(1);
});

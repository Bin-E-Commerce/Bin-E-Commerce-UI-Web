// File này chuyển state của wizard thành payload AI tối thiểu và an toàn cho Gateway.
// Chỉ ảnh đã có HTTPS CDN URL được đưa vào request; preview blob/local URL không được gửi ra ngoài.

import type { CatalogCategoryAttribute } from '@/services/catalog';
import type { ProductNameSuggestionsRequest } from '@/services/ai';
import type {
    ProductCreateImageValue,
    ProductCreateAttributeValue,
    SellerProductCreateFormValues,
    SellerProductCreateReferences,
} from '../../../types/seller-product-create-form.type';

// Chuyển một giá trị thuộc tính động thành text dễ hiểu mà không gửi option ID nội bộ cho AI.
// Option ID chỉ có ý nghĩa trong Catalog Service nên hàm tra displayValue trước khi đưa dữ liệu ra khỏi domain.
// Giá trị scalar và multi-select được gộp thành chuỗi ngắn để giữ prompt hữu ích nhưng không làm phình token.
function getAttributeText(
    attribute: CatalogCategoryAttribute,
    value: ProductCreateAttributeValue | undefined,
): string {
    if (!value) return '';

    const selectedOptionValues = value.selectedOptionIds
        .map((optionId) => attribute.options.find((option) => option.id === optionId)?.displayValue)
        .filter((optionValue): optionValue is string => Boolean(optionValue));
    const scalarValue = value.valueText || value.valueNumber || (value.valueBoolean === null ? '' : String(value.valueBoolean));

    return [...selectedOptionValues, scalarValue].filter(Boolean).join(', ');
}

// Chỉ lấy tối đa ba ảnh CDN hợp lệ theo contract backend; ảnh thiếu asset/public URL sẽ làm component disabled.
export function getReadyProductImages(images: ProductCreateImageValue[]) {
    return images
        .filter(
            (image) =>
                image.assetId &&
                image.fileName &&
                image.publicUrl.startsWith('https://'),
        )
        .slice(0, 3)
        .map((image) => ({
            assetId: image.assetId,
            publicUrl: image.publicUrl,
            fileName: image.fileName,
        }));
}

// Gom category, brand, seller text và thuộc tính đã hiển thị thành payload; không tự submit hay thay đổi form.
export function buildProductNameSuggestionRequest(
    values: SellerProductCreateFormValues,
    references: SellerProductCreateReferences,
): ProductNameSuggestionsRequest {
    const attributes = references.attributes
        .map((attribute) => ({
            label: attribute.displayName || attribute.name,
            value: getAttributeText(attribute, values.attributes[attribute.id]),
        }))
        .filter((attribute) => attribute.value.length > 0);

    return {
        category: {
            name: references.category?.name ?? '',
            ...(references.category?.path ? { path: references.category.path } : {}),
        },
        ...(references.brand?.name ? { brand: references.brand.name } : {}),
        sellerInput: {
            ...(values.name.trim() ? { draftName: values.name.trim() } : {}),
            ...(values.shortDescription.trim()
                ? { shortDescription: values.shortDescription.trim() }
                : {}),
            ...(values.description.trim() ? { description: values.description.trim() } : {}),
            ...(attributes.length > 0 ? { attributes } : {}),
        },
        images: getReadyProductImages(values.images),
        locale: 'vi-VN',
    };
}

import type {
    CreateSellerProductPayload,
    CreateSellerProductStatus,
    SellerProductStatus,
    UpdateSellerProductPayload,
} from '@/services/product';
import type { CatalogCategoryAttribute } from '@/services/catalog';
import type { SellerProductCreateFormValues } from '../types/seller-product-create-form.type';
import { isUuid } from './product-create-validation';

const SELECT_INPUT_TYPES = new Set(['SINGLE_SELECT', 'MULTI_SELECT']);
const NUMBER_INPUT_TYPES = new Set(['INTEGER', 'DECIMAL']);

// Chuyển form state sang contract API, loại bỏ chuỗi rỗng và chỉ gửi đúng kênh dữ liệu của từng thuộc tính động.
export function toCreateSellerProductPayload(
    values: SellerProductCreateFormValues,
    attributes: CatalogCategoryAttribute[],
    status: CreateSellerProductStatus,
): CreateSellerProductPayload {
    const mappedAttributes: CreateSellerProductPayload['attributes'] = [];

    // Mỗi input type chỉ được ánh xạ sang đúng một kênh dữ liệu mà backend chấp nhận.
    for (const attribute of attributes) {
        // Không gửi categoryAttributeId không hợp lệ. Đây là lớp bảo vệ cuối cùng
        // trước HTTP request, phòng trường hợp form state còn dữ liệu từ category cũ.
        if (!isUuid(attribute.id)) continue;

        const value = values.attributes[attribute.id];
        if (!value || !hasAttributeValue(value)) continue;

        if (SELECT_INPUT_TYPES.has(attribute.inputType)) {
            // Chỉ chấp nhận UUID nằm trong chính danh sách option của attribute.
            // Kiểm tra membership này ngăn option của category/attribute khác lọt qua dù vẫn có định dạng UUID.
            const validOptionIds = new Set(
                attribute.options
                    .map((option) => option.id)
                    .filter((optionId) => isUuid(optionId)),
            );
            mappedAttributes.push({
                categoryAttributeId: attribute.id,
                // Lọc lần cuối ở boundary API để dữ liệu cũ hoặc option lỗi không thể gây 400 từ backend.
                selectedOptionIds: value.selectedOptionIds.filter(
                    (optionId) => isUuid(optionId) && validOptionIds.has(optionId),
                ),
            });
            continue;
        }
        if (NUMBER_INPUT_TYPES.has(attribute.inputType)) {
            mappedAttributes.push({
                categoryAttributeId: attribute.id,
                valueNumber: Number(value.valueNumber),
            });
            continue;
        }
        if (attribute.inputType === 'BOOLEAN') {
            mappedAttributes.push({
                categoryAttributeId: attribute.id,
                valueBoolean: value.valueBoolean ?? false,
            });
            continue;
        }
        mappedAttributes.push({
            categoryAttributeId: attribute.id,
            valueText: value.valueText.trim(),
        });
    }

    return {
        name: values.name.trim(),
        categoryId: values.categoryId,
        brandId: emptyToUndefined(values.brandId),
        description: values.description.trim(),
        shortDescription: emptyToUndefined(values.shortDescription),
        gtin: emptyToUndefined(values.gtin),
        sellerSku: emptyToUndefined(values.sellerSku),
        condition: values.condition,
        countryOfOrigin: emptyToUndefined(values.countryOfOrigin),
        status,
        images: values.images.map((image, index) => ({
            imageUrl: image.publicUrl,
            altText: values.name.trim() || image.fileName,
            sortOrder: index,
            isThumbnail: index === 0,
        })),
        // Video là tùy chọn nên chỉ gửi khi upload đã hoàn tất và metadata thời lượng hợp lệ.
        video: values.video
            ? {
                  assetId: values.video.assetId,
                  videoUrl: values.video.publicUrl,
                  durationSeconds: values.video.durationSeconds,
              }
            : undefined,
        attributes: mappedAttributes,
        options: values.options.map((option, optionIndex) => ({
            clientId: option.clientId,
            name: option.name.trim(),
            position: optionIndex,
            values: option.values.map((value, valueIndex) => ({
                clientId: value.clientId,
                value: value.value.trim(),
                position: valueIndex,
            })),
        })),
        variants: values.variants.map((variant) => ({
            optionValueClientIds: variant.optionValueClientIds,
            sku: emptyToUndefined(variant.sku),
            gtin: emptyToUndefined(variant.gtin),
            withoutGtin: !variant.gtin.trim() && variant.withoutGtin,
            price: Number(variant.price),
            originalPrice: variant.originalPrice
                ? Number(variant.originalPrice)
                : undefined,
            stockQuantity: Number(variant.stockQuantity),
            imageUrl: emptyToUndefined(variant.imageUrl),
        })),
        package: {
            weightGrams: Number(values.package.weightGrams),
            lengthCm: Number(values.package.lengthCm),
            widthCm: Number(values.package.widthCm),
            heightCm: Number(values.package.heightCm),
        },
    };
}

// Chuyển form edit sang payload full replacement và chỉ gửi ID của variant đã tồn tại để backend giữ lịch sử SKU.
export function toUpdateSellerProductPayload(
    values: SellerProductCreateFormValues,
    attributes: CatalogCategoryAttribute[],
    status: SellerProductStatus,
): UpdateSellerProductPayload {
    const payload = toCreateSellerProductPayload(
        values,
        attributes,
        status === 'INACTIVE' ? 'DRAFT' : status,
    );

    return {
        ...payload,
        status,
        images: payload.images.map((image, index) => ({
            ...image,
            id: values.images[index]?.assetId,
        })),
        variants: payload.variants.map((variant, index) => ({
            ...variant,
            id: values.variants[index]?.id,
        })),
    };
}

// Kiểm tra một thuộc tính có dữ liệu thật để không gửi object rỗng xuống backend.
function hasAttributeValue(
    value: SellerProductCreateFormValues['attributes'][string],
): boolean {
    return (
        value.selectedOptionIds.length > 0 ||
        Boolean(value.valueText.trim()) ||
        Boolean(value.valueNumber.trim()) ||
        value.valueBoolean !== null
    );
}

// Chuẩn hóa trường tùy chọn để payload dùng undefined thay cho chuỗi rỗng.
function emptyToUndefined(value: string): string | undefined {
    const normalized = value.trim();
    return normalized || undefined;
}

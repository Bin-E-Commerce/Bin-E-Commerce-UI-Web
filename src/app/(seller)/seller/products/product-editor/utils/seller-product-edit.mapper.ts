// File này ánh xạ detail Seller vào form chỉnh sửa và luôn ưu tiên tồn khả dụng từ Inventory.
import type { SellerProductDetail } from '@/services/product';
import type {
    ProductCreateAttributeValue,
    SellerProductCreateFormValues,
} from '../types/seller-product-create-form.type';

const EMPTY_ATTRIBUTE: ProductCreateAttributeValue = {
    selectedOptionIds: [],
    valueText: '',
    valueNumber: '',
    valueBoolean: null,
};

// Chuyển detail response thành state wizard, giữ các ID nội bộ trong form để update có thể nhận diện variant cũ.
export function toSellerProductEditFormValues(
    product: SellerProductDetail,
): SellerProductCreateFormValues {
    const options = product.options.map((option) => ({
        clientId: option.id,
        name: option.name,
        values: option.values.map((value) => ({
            clientId: value.id,
            value: value.value,
        })),
    }));

    const variants = product.variants.map((variant) => {
        const choices = [...(variant.optionChoices ?? [])].sort(
            (left, right) =>
                left.optionValue.option.position -
                right.optionValue.option.position,
        );
        const optionValueClientIds = choices.map(
            (choice) => choice.optionValueId,
        );
        return {
            id: variant.id,
            key: optionValueClientIds.join('|') || 'default',
            label: variant.name,
            optionValueClientIds,
            sku: variant.sellerSku ?? '',
            gtin: variant.gtin ?? '',
            withoutGtin: variant.withoutGtin ?? !variant.gtin,
            price: variant.price,
            originalPrice: variant.originalPrice ?? '',
            // Khi edit, ô kho phải phản ánh đúng số lượng có thể bán hiện tại,
            // không dùng stockQuantity là snapshot tổng vật lý đã cũ sau các lần reserve/release.
            stockQuantity: String(variant.inventory?.quantityAvailable ?? 0),
            imageUrl: variant.imageUrl ?? '',
        };
    });

    const attributes = Object.fromEntries(
        product.attributeValues.map((attribute) => {
            const selectedOptionIds = Array.isArray(
                attribute.metadata?.selectedOptionIds,
            )
                ? attribute.metadata.selectedOptionIds.filter(
                      (optionId): optionId is string =>
                          typeof optionId === 'string',
                  )
                : [];
            return [
                attribute.categoryAttributeId,
                {
                    ...EMPTY_ATTRIBUTE,
                    selectedOptionIds,
                    valueText: attribute.valueText ?? '',
                    valueNumber: attribute.valueNumber ?? '',
                    valueBoolean: attribute.valueBoolean ?? null,
                },
            ];
        }),
    );

    return {
        name: product.name,
        categoryId: product.categoryId,
        brandId: product.brand?.id ?? '',
        description: product.description ?? '',
        shortDescription: product.shortDescription ?? '',
        gtin: product.gtin ?? '',
        sellerSku: product.sellerSku ?? '',
        condition: product.condition,
        countryOfOrigin: product.countryOfOrigin ?? '',
        images: (product.images ?? []).map((image) => ({
            assetId: image.id,
            publicUrl: image.imageUrl,
            previewUrl: image.imageUrl,
            fileName: image.imageUrl.split('/').pop() || 'product-image',
        })),
        video: product.videoUrl
            ? {
                  assetId: product.videoAssetId ?? '',
                  publicUrl: product.videoUrl,
                  previewUrl: product.videoUrl,
                  fileName:
                      product.videoUrl.split('/').pop() || 'product-video',
                  durationSeconds: product.videoDurationSeconds ?? 10,
              }
            : null,
        attributes,
        options,
        variants: variants.length > 0 ? variants : [],
        package: {
            weightGrams: String(product.packageWeightGrams ?? ''),
            lengthCm: String(product.packageLengthCm ?? ''),
            widthCm: String(product.packageWidthCm ?? ''),
            heightCm: String(product.packageHeightCm ?? ''),
        },
    };
}

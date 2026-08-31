// Tiện ích sinh ma trận biến thể từ các giá trị Seller nhập trong form sản phẩm.

import type {
    ProductCreateOption,
    ProductCreateVariant,
} from '../types/seller-product-create-form.type';

// Sinh đầy đủ tích Descartes của tối đa hai nhóm phân loại và giữ lại dữ liệu giá/kho seller đã nhập ở các tổ hợp chưa đổi.
export function buildProductVariants(
    options: ProductCreateOption[],
    currentVariants: ProductCreateVariant[],
): ProductCreateVariant[] {
    const normalizedOptions = options
        .map((option) => ({
            ...option,
            name: option.name.trim(),
            values: option.values.filter((value) => value.value.trim()),
        }))
        .filter((option) => option.name && option.values.length > 0);

    if (normalizedOptions.length === 0) {
        return [
            currentVariants.find((variant) => variant.key === 'default') ??
                createVariant('default', 'Sản phẩm mặc định', []),
        ];
    }

    // Mỗi vòng flatMap gắn thêm một lựa chọn vào tổ hợp hiện có, tạo đúng số dòng variant cần lưu.
    const combinations = normalizedOptions.reduce<
        Array<{ ids: string[]; labels: string[] }>
    >(
        (rows, option) =>
            rows.flatMap((row) =>
                option.values.map((value) => ({
                    ids: [...row.ids, value.clientId],
                    labels: [...row.labels, value.value.trim()],
                })),
            ),
        [{ ids: [], labels: [] }],
    );
    const currentByKey = new Map(
        currentVariants.map((variant) => [variant.key, variant]),
    );

    return combinations.map((combination) => {
        const key = combination.ids.join('|');
        const label = combination.labels.join(' / ');
        const existingVariant = currentByKey.get(key);

        // Giữ lại giá, tồn kho, SKU và dữ liệu Seller đã nhập nhưng luôn đồng bộ nhãn theo giá trị mới nhất.
        // Nếu chỉ trả lại existingVariant, lần gõ đầu tiên "x" sẽ bị giữ nguyên khi Seller hoàn thành "xs" hoặc "xl".
        return existingVariant
            ? {
                  ...existingVariant,
                  label,
                  optionValueClientIds: combination.ids,
              }
            : createVariant(key, label, combination.ids);
    });
}

// Tạo một dòng variant rỗng với mặc định an toàn để React Hook Form điều khiển nhất quán.
function createVariant(
    key: string,
    label: string,
    optionValueClientIds: string[],
): ProductCreateVariant {
    return {
        key,
        label,
        optionValueClientIds,
        sku: '',
        gtin: '',
        withoutGtin: true,
        price: '',
        originalPrice: '',
        stockQuantity: '0',
        imageUrl: '',
    };
}

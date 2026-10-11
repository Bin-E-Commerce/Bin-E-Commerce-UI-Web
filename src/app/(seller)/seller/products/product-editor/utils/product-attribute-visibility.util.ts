// Quy định thuộc tính ngành hàng nào được đưa vào luồng tạo và sửa sản phẩm.
// Tiện ích chỉ lọc hai thuộc tính tổ chức hiện chưa có dữ liệu đáng tin cậy;
// mọi thuộc tính Catalog khác vẫn được giữ nguyên.

import type { CatalogCategoryAttribute } from '@/services/catalog';

const HIDDEN_ATTRIBUTE_NAMES = new Set([
    'manufacturer trader name',
    'manufacturer trader address',
    'ten to chuc chiu trach nhiem san xuat',
    'dia chi to chuc chiu trach nhiem san xuat',
]);

// Chuẩn hóa tên và slug để so sánh ổn định dù Catalog trả dấu, dấu phân cách hoặc chữ hoa khác nhau.
function normalizeAttributeName(value: string): string {
    return value
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLocaleLowerCase('en-US')
        .replace(/[^a-z0-9]+/g, ' ')
        .trim();
}

// Ẩn hai thuộc tính tổ chức theo tên nghiệp vụ, không phụ thuộc ID Catalog có thể khác giữa môi trường.
export function isVisibleProductAttribute(
    attribute: CatalogCategoryAttribute,
): boolean {
    return ![
        attribute.name,
        attribute.displayName,
        attribute.slug,
    ].some((name) => {
        const normalizedName = normalizeAttributeName(name);
        return [...HIDDEN_ATTRIBUTE_NAMES].some(
            (hiddenName) =>
                normalizedName === hiddenName ||
                normalizedName.startsWith(`${hiddenName} `),
        );
    });
}

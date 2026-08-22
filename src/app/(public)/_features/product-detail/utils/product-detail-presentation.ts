import type {
    ProductAttributeValue,
    ProductDetail,
    ProductImage,
} from '@/services/product';
import type {
    ProductBreadcrumbItem,
    ProductGalleryImage,
    ProductSpecificationItem,
} from '../types/product-detail.types';

// Chuẩn hóa pathname ảnh Tiki để các URL cache nhiều kích thước vẫn được nhận diện là cùng một ảnh gốc.
function getImageSourceKey(imageUrl: string): string {
    try {
        const url = new URL(imageUrl);
        return url.pathname.replace(/^\/cache\/[^/]+\//, '/');
    } catch {
        return imageUrl;
    }
}

// Chấm điểm URL ảnh để ưu tiên bản gốc hoặc bản w1200 thay cho thumbnail độ phân giải thấp.
function getImageQualityScore(imageUrl: string): number {
    if (!imageUrl.includes('/cache/')) return 3;
    if (/\/cache\/w1200\//.test(imageUrl)) return 2;
    if (/\/cache\/w300\//.test(imageUrl)) return 1;
    return 0;
}

// Khử trùng ảnh theo nguồn gốc và giữ phiên bản chất lượng cao nhất cho gallery chi tiết.
export function getUniqueProductImages(
    images: ProductImage[] = [],
): ProductGalleryImage[] {
    const imageBySource = new Map<string, ProductGalleryImage>();

    images.forEach((image) => {
        const sourceKey = getImageSourceKey(image.imageUrl);
        const current = imageBySource.get(sourceKey);
        if (
            !current ||
            getImageQualityScore(image.imageUrl) >
                getImageQualityScore(current.imageUrl)
        ) {
            imageBySource.set(sourceKey, { ...image, sourceKey });
        }
    });

    return [...imageBySource.values()].sort(
        (left, right) => left.sortOrder - right.sortOrder,
    );
}

// Đọc breadcrumb được crawler lưu trong metadata nhưng chỉ nhận các phần tử có tên hợp lệ.
export function getProductBreadcrumbs(
    product: ProductDetail,
): ProductBreadcrumbItem[] {
    const chain = product.metadata?.sourceCategoryChain;
    if (!Array.isArray(chain)) return [];

    return chain.flatMap((item) => {
        if (!item || typeof item !== 'object') return [];
        const record = item as Record<string, unknown>;
        if (typeof record.name !== 'string') return [];

        return [{
            name: record.name,
            slug: typeof record.slug === 'string' ? record.slug : undefined,
        }];
    });
}

// Chuyển giá trị thuộc tính theo đúng kiểu dữ liệu để bảng thông số không hiển thị null hoặc object thô.
function formatAttributeValue(attribute: ProductAttributeValue): string | null {
    if (attribute.valueText?.trim()) return attribute.valueText.trim();
    if (attribute.valueNumber !== null && attribute.valueNumber !== undefined) {
        return String(attribute.valueNumber);
    }
    if (typeof attribute.valueBoolean === 'boolean') {
        return attribute.valueBoolean ? 'Có' : 'Không';
    }

    return null;
}

// Map thuộc tính nguồn sang danh sách label-value ngắn gọn để admin hoặc người mua đọc được ngay.
export function getProductSpecifications(
    product: ProductDetail,
): ProductSpecificationItem[] {
    return product.attributeValues.flatMap((attribute) => {
        const value = formatAttributeValue(attribute);
        if (!value) return [];

        const sourceName = attribute.metadata?.sourceName;
        return [{
            id: attribute.id,
            label:
                typeof sourceName === 'string'
                    ? sourceName
                    : 'Thông tin sản phẩm',
            value,
        }];
    });
}

// Chuẩn hóa avatar shop nguồn vì dữ liệu Tiki có thể chỉ lưu phần path tương đối.
export function getProductShopAvatarUrl(
    avatarUrl?: string | null,
): string | null {
    if (!avatarUrl) return null;
    if (/^https?:\/\//i.test(avatarUrl)) return avatarUrl;

    return `https://vcdn.tikicdn.com/ts/seller/${avatarUrl.replace(/^\/+/, '')}`;
}

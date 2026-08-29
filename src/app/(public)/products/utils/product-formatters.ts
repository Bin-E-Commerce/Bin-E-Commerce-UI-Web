import type { PublicProduct } from '@/services/product';

const PRICE_FORMATTER = new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
});

// Chuyển giá numeric dạng chuỗi từ PostgreSQL sang số an toàn cho các phép tính giao diện.
export function parseProductPrice(value?: string | null): number {
    const price = Number(value ?? 0);
    return Number.isFinite(price) ? price : 0;
}

// Hiển thị giá theo chuẩn tiền Việt để mọi màn hình sản phẩm dùng cùng một định dạng.
export function formatProductPrice(value?: string | null): string {
    return PRICE_FORMATTER.format(parseProductPrice(value));
}

// Ưu tiên ảnh thumbnail và fallback sang ảnh đầu tiên khi dữ liệu nguồn không đánh dấu ảnh chính.
export function getProductThumbnail(product: PublicProduct): string | null {
    const images = product.images ?? [];
    const thumbnail = images.find((image) => image.isThumbnail);
    return thumbnail?.imageUrl ?? images[0]?.imageUrl ?? null;
}

// Giới hạn rating trong khoảng 0-5 để dữ liệu nguồn lỗi không phá vỡ giao diện đánh giá.
export function getProductRating(product: PublicProduct): number {
    const rating = Number(product.ratingAvg ?? 0);
    if (!Number.isFinite(rating)) return 0;
    return Math.min(5, Math.max(0, rating));
}

// Rút gọn lượt bán để card sản phẩm không bị giãn khi số liệu lớn.
export function formatSoldCount(totalSold: number): string {
    if (totalSold >= 1_000) {
        return `${(totalSold / 1_000).toFixed(totalSold >= 10_000 ? 0 : 1)}k`;
    }

    return String(totalSold);
}

// Tính phần trăm giảm giá từ giá gốc và trả về 0 khi dữ liệu không tạo thành một ưu đãi hợp lệ.
export function calculateDiscountPercent(
    price?: string | null,
    originalPrice?: string | null,
): number {
    const current = parseProductPrice(price);
    const original = parseProductPrice(originalPrice);
    if (current <= 0 || original <= current) return 0;

    return Math.round(((original - current) / original) * 100);
}

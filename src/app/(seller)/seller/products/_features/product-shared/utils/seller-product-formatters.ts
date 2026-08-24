// Định dạng giá lưu dạng numeric string thành tiền Việt Nam và tránh hiển thị NaN khi dữ liệu nguồn lỗi.
export function formatSellerProductPrice(value: string): string {
    const price = Number(value);
    if (!Number.isFinite(price)) return '0 đ';

    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
        maximumFractionDigits: 0,
    }).format(price);
}

// Hiển thị khoảng giá khi các variant có giá khác nhau, nếu cùng giá chỉ render một giá trị.
export function formatSellerProductPriceRange(
    minPrice: string,
    maxPrice: string,
): string {
    if (Number(minPrice) === Number(maxPrice)) {
        return formatSellerProductPrice(minPrice);
    }

    return `${formatSellerProductPrice(minPrice)} - ${formatSellerProductPrice(maxPrice)}`;
}

// Đổi thời điểm ISO từ API thành nhãn ngắn theo múi giờ trình duyệt của người bán.
export function formatSellerProductUpdatedAt(value: string): string {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return 'Chưa xác định';

    return new Intl.DateTimeFormat('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    }).format(date);
}

// Rút gọn số liệu vận hành lớn để bảng dễ quét nhưng vẫn giữ giá trị đầy đủ ở mức nhỏ.
export function formatSellerProductMetric(value: number): string {
    return new Intl.NumberFormat('vi-VN', {
        notation: value >= 1_000 ? 'compact' : 'standard',
        maximumFractionDigits: 1,
    }).format(value);
}

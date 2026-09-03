// Các formatter thuần cho trang shop.
// Tách khỏi component để format không tạo logic lặp giữa header và toolbar.

const countFormatter = new Intl.NumberFormat('vi-VN');
const joinDateFormatter = new Intl.DateTimeFormat('vi-VN', {
    month: 'long',
    year: 'numeric',
    timeZone: 'Asia/Ho_Chi_Minh',
});

// Định dạng số lượng theo locale hiển thị của storefront.
export function formatShopCount(value: number): string {
    return countFormatter.format(value);
}

// Hiển thị ngày tham gia theo locale của storefront, không phụ thuộc timezone của browser server.
export function formatShopJoinDate(value: string): string {
    const date = new Date(value);
    return Number.isNaN(date.getTime())
        ? 'Chưa cập nhật'
        : joinDateFormatter.format(date);
}

// Hiển thị activity cũ thành thông tin dễ hiểu thay vì đẩy raw timestamp ra giao diện.
export function formatLastActive(value: string | null): string {
    if (!value) return 'Chưa có dữ liệu hoạt động';
    const lastActiveAt = new Date(value);
    if (Number.isNaN(lastActiveAt.getTime()))
        return 'Chưa có dữ liệu hoạt động';

    const elapsedMinutes = Math.floor(
        (Date.now() - lastActiveAt.getTime()) / 60_000,
    );
    if (elapsedMinutes < 1) return 'Hoạt động vừa xong';
    if (elapsedMinutes < 60) return `Hoạt động ${elapsedMinutes} phút trước`;
    const elapsedHours = Math.floor(elapsedMinutes / 60);
    if (elapsedHours < 24) return `Hoạt động ${elapsedHours} giờ trước`;
    return `Hoạt động ${Math.floor(elapsedHours / 24)} ngày trước`;
}

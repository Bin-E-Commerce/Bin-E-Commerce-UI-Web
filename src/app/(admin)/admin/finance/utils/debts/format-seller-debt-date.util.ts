// Định dạng mốc hạn/cập nhật của ví theo locale Việt Nam; giá trị null hoặc lỗi dữ liệu không làm hỏng bảng.
export function formatSellerDebtDate(value: string | null): string {
    if (!value) return 'Chưa có hạn';

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return 'Không xác định';

    return date.toLocaleString('vi-VN', {
        dateStyle: 'short',
        timeStyle: 'short',
    });
}

// File này chứa các hàm format thuần cho Seller order UI; không chứa logic quyền hoặc gọi API.

import type { SellerOrderStatus } from '@/services/order/seller-order.api';

// Định dạng tiền Việt từ số tiền dạng string do PostgreSQL trả về, giữ số 0 và không làm tròn ở frontend.
export function formatSellerMoney(value: string): string {
    const amount = Number(value);
    if (!Number.isFinite(amount)) return `${value} đ`;
    return `${new Intl.NumberFormat('vi-VN').format(amount)} đ`;
}

// Hiển thị thời gian order theo locale Việt Nam mà không thay đổi timestamp gốc từ API.
export function formatSellerOrderDate(value: string): string {
    return new Intl.DateTimeFormat('vi-VN', {
        dateStyle: 'medium',
        timeStyle: 'short',
    }).format(new Date(value));
}

// Chuyển enum backend thành nhãn ngắn, bao phủ cả status tương lai để UI không bị trống chữ.
export function getSellerOrderStatusLabel(status: SellerOrderStatus): string {
    const labels: Record<SellerOrderStatus, string> = {
        PENDING: 'Đang xử lý',
        CONFIRMED: 'Đã xác nhận',
        FAILED: 'Thất bại',
        CANCELLED: 'Đã hủy',
    };
    return labels[status] ?? status;
}

// Các hàm format Seller order chỉ xử lý trình bày, không chứa quyền hoặc gọi API.
import type { SellerOrderStatus } from '@/services/order/seller-order.api';

// Định dạng tiền VND từ decimal string do PostgreSQL trả về.
export function formatSellerMoney(value: string): string { const amount = Number(value); return Number.isFinite(amount) ? `${new Intl.NumberFormat('vi-VN').format(amount)} ₫` : `${value} ₫`; }

// Định dạng timestamp ISO theo múi giờ và locale Việt Nam.
export function formatSellerOrderDate(value: string): string { return new Intl.DateTimeFormat('vi-VN', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value)); }

// Map cả enum cũ và lifecycle enum mới để dữ liệu migration dần vẫn có nhãn rõ ràng.
export function getSellerOrderStatusLabel(status: SellerOrderStatus): string { const labels: Record<SellerOrderStatus, string> = { PENDING: 'Đang xử lý', CONFIRMED: 'Đã xác nhận', FAILED: 'Thất bại', CANCELLED: 'Đã hủy', TO_SHIP: 'Cần xử lý', SHIPPING: 'Đang vận chuyển', DELIVERED: 'Đã giao', COMPLETED: 'Hoàn thành', DELIVERY_FAILED: 'Giao thất bại', RETURN_REFUND: 'Trả hàng / hoàn tiền' }; return labels[status] ?? status; }

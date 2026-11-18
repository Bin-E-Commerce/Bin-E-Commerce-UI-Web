// Kiểu props cho CTA thanh toán/hủy đơn Pay2S dùng chung giữa danh sách và chi tiết đơn.
// Layout chỉ quyết định vị trí trình bày; trạng thái giao dịch và quyền hủy do backend kiểm tra.

export interface CustomerPay2sPaymentRetryProps {
    orderId: string;
    layout?: 'footer' | 'inline';
}

export interface CustomerPay2sLegacyPaymentRedirectProps {
    params: Promise<{ orderId: string }>;
}

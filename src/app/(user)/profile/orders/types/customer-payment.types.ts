// Kiểu props cho CTA thanh toán lại dùng chung ở danh sách và chi tiết đơn Customer.

export interface CustomerPay2sPaymentRetryProps {
    orderId: string;
}

export interface CustomerPay2sLegacyPaymentRedirectProps {
    params: Promise<{ orderId: string }>;
}

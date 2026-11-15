// Contract nội bộ cho trang thanh toán Pay2S; không đưa response thô của provider ra client.

export type Pay2sCustomerPaymentStatus =
    | 'PENDING'
    | 'PAID'
    | 'REFUND_PENDING'
    | 'REFUNDED'
    | 'CANCELLED'
    | 'EXPIRED'
    | 'RETRYABLE';

export interface Pay2sCustomerPaymentDetails {
    orderId: string;
    orderNumber: string;
    amount: string;
    status: Pay2sCustomerPaymentStatus;
    expiresAt: string | null;
    bankName: string | null;
    accountHolder: string | null;
    accountNumber: string | null;
    orderInfo: string | null;
    qrData: string | null;
    qrUrl: string | null;
    paymentUrl: string | null;
}

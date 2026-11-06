// Payload customer gửi khi hủy hoặc sửa đơn; lý do bắt buộc còn tài khoản chỉ dùng cho Pay2S đã thanh toán.
export interface CancelOrderInput {
    reason: string;
    refundBankAccount?: RefundBankAccountInput;
    savedRefundBankAccountId?: string;
}

// Thông tin nhận tiền tối thiểu để admin chuyển hoàn ngoài hệ thống.
export interface RefundBankAccountInput {
    bankCode: string;
    bankName: string;
    accountHolder: string;
    accountNumber: string;
}

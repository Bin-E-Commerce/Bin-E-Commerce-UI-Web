// Payload customer gửi khi hủy order; tài khoản ngân hàng chỉ dùng cho khoản Pay2S đã thanh toán.
export interface CancelOrderInput {
    reason?: string;
    refundBankAccount?: RefundBankAccountInput;
}

// Thông tin nhận tiền tối thiểu để admin chuyển hoàn ngoài hệ thống.
export interface RefundBankAccountInput {
    bankCode: string;
    bankName: string;
    accountHolder: string;
    accountNumber: string;
}

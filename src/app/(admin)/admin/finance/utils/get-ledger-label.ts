// Ánh xạ mã ledger thành nhãn hiển thị; loại giao dịch mới vẫn dùng mã gốc làm fallback.

// Giữ nhãn nghiệp vụ tập trung để các bảng finance có thể dùng chung mà không phụ thuộc UI.
export function getLedgerLabel(kind: string): string {
    const labels: Record<string, string> = {
        ORDER_PAYMENT: 'Thanh toán đơn hàng Pay2S',
        WALLET_DEPOSIT: 'Seller nạp ví',
        COD_REMITTANCE: 'Đối soát COD',
        PAY2S_REFUND_MANUAL: 'Hoàn Pay2S thủ công',
        COD_REFUND: 'Hoàn tiền COD',
        WITHDRAWAL_RESERVED: 'Giữ chỗ yêu cầu rút',
        WITHDRAWAL_PAID: 'Đã tất toán yêu cầu rút',
        SELLER_PAYOUT: 'Chi payout seller',
        RETURN_SHIPPING_FEE: 'Phí vận chuyển hoàn',
        CUSTOMER_RETURN_SHIPPING_RECEIVABLE: 'Phí hoàn khách còn phải trả',
        SHIPPING_FUND_ALLOCATION: 'Phân bổ quỹ vận chuyển',
        SHIPPING_FUND_REFUND: 'Hoàn lại quỹ vận chuyển',
    };
    return labels[kind] ?? kind;
}

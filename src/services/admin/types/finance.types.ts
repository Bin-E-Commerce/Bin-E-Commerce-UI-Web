// Contract trang tài chính admin; số dư platform là mô phỏng và không đại diện số tiền ngân hàng thật.
export interface AdminFinanceLedgerEntry {
    id: string;
    kind: string;
    amount: string;
    shopId: string | null;
    orderId: string | null;
    returnRequestId: string | null;
    reference: string | null;
    settlementBatchId: string | null;
    createdBy: string | null;
    createdAt: string;
}

export interface AdminFinanceWithdrawal {
    id: string;
    shopId: string;
    amount: string;
    bankName: string;
    accountHolder: string;
    accountNumberMasked: string;
    status: 'REQUESTED' | 'PROCESSING' | 'PAID' | 'REJECTED' | 'FAILED';
    transferReference: string | null;
    adminNote: string | null;
    createdAt: string;
    processedAt: string | null;
}

export interface AdminFinanceDeposit {
    id: string;
    shopId: string;
    amount: string;
    status: string;
    createdAt: string;
    confirmedAt: string | null;
}

export interface AdminFinanceSnapshot {
    platformBalance: string;
    sellerPayableBalance: string;
    reservedWithdrawalBalance: string;
    shippingFundBalance: string;
    customerReturnShippingReceivable: string;
    pendingWithdrawals: number;
    depositTotal: string;
    ledger: AdminFinanceLedgerEntry[];
    withdrawals: AdminFinanceWithdrawal[];
    deposits: AdminFinanceDeposit[];
    totalLedger: number;
    page: number;
    pageSize: number;
}

export interface AdminFinanceWithdrawalDetail extends AdminFinanceWithdrawal {
    bankCode: string;
    accountNumber: string;
    sellerUserId: string;
    transferMemo: string;
    pay2sTransactionId: string | null;
    pay2sTransactionNumber: string | null;
    pay2sTransferAmount: string | null;
    pay2sTransferDetectedAt: string | null;
    recipientConfirmedBy: string | null;
    recipientConfirmedAt: string | null;
}

export interface AdminPayoutReadiness {
    ready: boolean;
    missing: Array<'WEBHOOK_TOKEN' | 'SOURCE_ACCOUNT_NUMBER'>;
}

// Chuỗi nạp ví đã xác nhận và yêu cầu rút mới theo ngày, phục vụ dashboard admin.
export interface AdminWalletActivityResponse {
    from: string;
    to: string;
    deposits: Array<{ day: string; count: number }>;
    withdrawalRequests: Array<{ day: string; count: number }>;
}

// Contract hiển thị COD khách đã trả và đơn đã hoàn tất, còn chờ admin xác nhận tiền thu hộ.
export interface AdminFinanceCodRemittance {
    orderId: string;
    orderNumber: string;
    amount: string;
    completedAt: string;
    createdAt: string;
}

// Hồ sơ chờ chuyển hoàn thủ công; amount và nguồn do Order Service chốt, UI không tự tính lại.
export interface AdminFinanceRefund {
    sourceType: 'PAYMENT_ATTEMPT' | 'ORDER_RETURN' | 'DELIVERY_ISSUE';
    id: string;
    orderId: string;
    orderNumber: string;
    paymentMethod: 'COD' | 'PAY2S';
    status: 'REFUND_PENDING' | 'REFUND_FAILED';
    amount: string;
    reason: string;
    providerTransactionId: string | null;
    refundFailureNote: string | null;
    createdAt: string;
}

// Khiếu nại chưa nhận hàng chờ admin phân xử; evidence chỉ chứa URL đã upload và loại media.
export interface AdminFinanceDeliveryIssue {
    id: string;
    orderId: string;
    orderNumber: string;
    paymentStatus:
        | 'COD_PENDING_COLLECTION'
        | 'PENDING'
        | 'FAILED'
        | 'PAID'
        | 'REFUND_PENDING'
        | 'REFUNDED';
    reason: string;
    itemIds: string[];
    note: string | null;
    evidence: Array<{ assetId: string; url: string; type: 'image' | 'video' }>;
    returnRequestId: string | null;
    createdAt: string;
}

export interface AdminFinancePage<T> {
    items: T[];
    total: number;
}

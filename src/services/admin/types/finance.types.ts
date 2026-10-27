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
    sandboxDepositTotal: string;
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
}

export interface AdminPayoutReadiness {
    ready: boolean;
    missing: Array<'CLIENT_ID' | 'API_KEY' | 'CHECKSUM_KEY'>;
    balance: string | null;
}

export interface AdminSellerPayoutResult {
    status: 'PROCESSING' | 'PAID' | 'FAILED';
    approvalState: string | null;
    transactionState: string | null;
}

// Contract hiển thị COD khách đã trả và đơn đã hoàn tất, còn chờ admin xác nhận tiền thu hộ.
export interface AdminFinanceCodRemittance {
    orderId: string;
    orderNumber: string;
    amount: string;
    completedAt: string;
    createdAt: string;
}

export interface AdminFinancePage<T> {
    items: T[];
    total: number;
}

// Contract gửi bằng chứng hoàn thủ công; backend kiểm tra lại amount và trạng thái trước khi ghi sổ.
export interface AdminFinanceRefundRequest {
    amount: string;
    reference: string;
    proof: {
        assetId: string;
        url: string;
        type: 'image';
    };
}

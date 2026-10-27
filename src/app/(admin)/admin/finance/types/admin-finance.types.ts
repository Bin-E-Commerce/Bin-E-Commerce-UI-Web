// Kiểu state UI của popup payout và thao tác nhóm ledger trong trang tài chính admin.
export type AdminFinanceWithdrawalAction = 'payout' | 'reject';

export interface AdminFinanceWithdrawalActionInput {
    withdrawalId: string;
    action: AdminFinanceWithdrawalAction;
    note?: string;
}

// State form refund thủ công; late payment dùng orderId còn return bình thường dùng returnRequestId.
export type AdminFinanceRefundCase = 'RETURN' | 'LATE_PAYMENT';

export interface AdminFinanceRefundInput {
    caseType: AdminFinanceRefundCase;
    targetId: string;
    amount: string;
    reference: string;
    proofUrl: string;
    proofAssetId: string;
}

// Kiểu props cho các lát UI của trang tài chính admin; hợp đồng API được tái sử dụng từ service admin.
import type { AdminFinanceRefundCase } from './admin-finance.types';
import type {
    AdminFinanceCodRemittance,
    AdminFinanceDeposit,
    AdminFinanceLedgerEntry,
    AdminFinanceSnapshot,
    AdminFinanceWithdrawal,
    AdminFinanceWithdrawalDetail,
    AdminPayoutReadiness,
    AdminSellerPayoutResult,
} from '@/services/admin/types/finance.types';

// Chỉ số dashboard dùng snapshot đã được backend giới hạn quyền truy cập.
export interface FinanceMetricsProps {
    overview: AdminFinanceSnapshot;
}

// Bảng rút tiền chỉ gửi id được chọn về trang để tải chi tiết khi admin mở dialog.
export interface SellerWithdrawalsSectionProps {
    withdrawals: AdminFinanceWithdrawal[];
    pendingWithdrawals: number;
    onSelectWithdrawal: (withdrawalId: string) => void;
}

// Bảng ledger nhận trạng thái lựa chọn và các thao tác batch từ trang sở hữu mutation.
export interface PlatformLedgerSectionProps {
    ledger: AdminFinanceLedgerEntry[];
    selectedLedgerIds: string[];
    settlementBatchId: string | null;
    isBatchPending: boolean;
    isReconcilePending: boolean;
    onToggleLedgerSelection: (
        entry: AdminFinanceLedgerEntry,
        checked: boolean | 'indeterminate',
    ) => void;
    onCreateBatch: () => void;
    onReconcileBatch: (batchId: string) => void;
}

// Refund form giữ controlled inputs ở trang để trạng thái và payload gửi API không đổi khi tách UI.
export interface ManualRefundSectionProps {
    refundCaseType: AdminFinanceRefundCase;
    setRefundCaseType: (caseType: AdminFinanceRefundCase) => void;
    refundTargetId: string;
    setRefundTargetId: (value: string) => void;
    refundAmount: string;
    setRefundAmount: (value: string) => void;
    refundReference: string;
    setRefundReference: (value: string) => void;
    refundProofAssetId: string;
    setRefundProofAssetId: (value: string) => void;
    refundProofUrl: string;
    setRefundProofUrl: (value: string) => void;
    canSubmitRefund: boolean;
    isRefundError: boolean;
    isRefundPending: boolean;
    onSubmitRefund: () => void;
}

// Thẻ phụ chỉ trình bày các khoản nạp có sẵn trong snapshot tài chính.
export interface FinanceContextCardsProps {
    deposits: AdminFinanceDeposit[];
}

// Dialog dùng dữ liệu chi tiết payout và các callback đã được trang gắn với mutation tương ứng.
export interface WithdrawalDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    isLoading: boolean;
    isError: boolean;
    detail: AdminFinanceWithdrawalDetail | undefined;
    isPayosWithdrawal: boolean;
    payoutReadiness: AdminPayoutReadiness | undefined;
    payoutStatus: AdminSellerPayoutResult | undefined;
    adminNote: string;
    onAdminNoteChange: (value: string) => void;
    isWithdrawalPending: boolean;
    isWithdrawalError: boolean;
    isReadinessPending: boolean;
    isReadinessError: boolean;
    isPayoutStatusError: boolean;
    hasEnoughPayoutBalance: boolean;
    onCopyMemo: () => void;
    onPayout: () => void;
    onReject: () => void;
}

// Bảng COD giữ input theo orderId và không tự quản lý tải dữ liệu hoặc xác nhận sổ tiền.
export interface CodRemittanceTableProps {
    items: AdminFinanceCodRemittance[];
    references: Record<string, string>;
    pendingOrderId: string | undefined;
    isPending: boolean;
    onReferenceChange: (orderId: string, value: string) => void;
    onConfirm: (orderId: string, reference: string) => void;
}

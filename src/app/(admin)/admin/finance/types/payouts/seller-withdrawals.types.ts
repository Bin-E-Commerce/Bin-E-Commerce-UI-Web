// Kiểu dữ liệu cho danh sách payout và dialog xử lý rút tiền seller của admin.
// Các hợp đồng API vẫn được tái sử dụng từ service admin, không định nghĩa lại ở UI.
import type {
    AdminFinanceWithdrawal,
    AdminFinanceWithdrawalDetail,
    AdminPayoutReadiness,
} from '@/services/admin/types/finance.types';

// Các bước UI cho phép admin thực hiện trên một yêu cầu rút tiền.
export type AdminFinanceWithdrawalAction = 'start' | 'confirm' | 'reject';

// Từ chối cần lý do; ghi chú khi bắt đầu hoặc xác nhận chuyển khoản là tùy chọn.
export type AdminFinanceWithdrawalActionInput =
    | {
          withdrawalId: string;
          action: 'start' | 'confirm';
          acknowledged?: boolean;
          note?: string;
      }
    | {
          withdrawalId: string;
          action: 'reject';
          note: string;
      };

// Bảng rút tiền chỉ gửi ID được chọn để trang tải chi tiết khi admin mở dialog.
export interface SellerWithdrawalsSectionProps {
    withdrawals: AdminFinanceWithdrawal[];
    pendingWithdrawals: number;
    page: number;
    pageSize: number;
    total: number;
    isLoading: boolean;
    isFetching: boolean;
    isError: boolean;
    onPageChange: (page: number) => void;
    onSelectWithdrawal: (withdrawalId: string) => void;
}

// Dialog nhận dữ liệu payout và callback; trạng thái nghiệp vụ vẫn do trang/backend sở hữu.
export interface WithdrawalDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    isLoading: boolean;
    isError: boolean;
    detail: AdminFinanceWithdrawalDetail | undefined;
    payoutReadiness: AdminPayoutReadiness | undefined;
    manualTransferAcknowledged: boolean;
    recipientConfirmed: boolean;
    adminNote: string;
    onAdminNoteChange: (value: string) => void;
    onManualTransferAcknowledgedChange: (checked: boolean) => void;
    onRecipientConfirmedChange: (checked: boolean) => void;
    isWithdrawalPending: boolean;
    isWithdrawalError: boolean;
    isReadinessPending: boolean;
    isReadinessError: boolean;
    onCopyMemo: () => void;
    onStartProcessing: () => void;
    onConfirmTransfer: () => void;
    onReject: () => void;
}

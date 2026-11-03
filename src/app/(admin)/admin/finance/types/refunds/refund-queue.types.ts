// Hợp đồng UI cho danh sách refund phân trang và hộp thoại xử lý từng đơn.
// Component chỉ phát lựa chọn và dữ liệu biểu mẫu; trạng thái tài chính do API quản lý.
import type {
    AdminFinanceRefund,
    AdminRefundRecipientAccountInput,
} from '@/services/admin/types/finance.types';

// Props của bảng giúp danh sách giữ gọn và không sở hữu việc tải dữ liệu.
export interface RefundQueueTableProps {
    refunds: AdminFinanceRefund[];
    total: number;
    page: number;
    pageSize: number;
    isLoading: boolean;
    isFetching: boolean;
    isError: boolean;
    onRefresh: () => void;
    onPageChange: (page: number) => void;
    onSelectRefund: (refund: AdminFinanceRefund) => void;
}

// Dialog nhận snapshot hoàn tiền và callback; nó không tự cập nhật trạng thái đơn.
export interface RefundProcessingDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    refund: AdminFinanceRefund | null;
    failureNote: string;
    isSavingRecipientAccount: boolean;
    isConfirmingRefund: boolean;
    isRecordingFailure: boolean;
    onFailureNoteChange: (value: string) => void;
    onSaveRecipientAccount: (account: AdminRefundRecipientAccountInput) => void;
    onConfirmRefund: () => Promise<void>;
    onRecordFailure: () => void;
}

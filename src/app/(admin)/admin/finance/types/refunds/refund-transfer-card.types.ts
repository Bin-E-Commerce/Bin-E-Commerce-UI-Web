// Hợp đồng cho thẻ nhận hoàn: hiển thị QR/tài khoản và chuyển trạng thái xác minh người nhận cho dialog cha.
import type {
    AdminFinanceRefund,
    AdminRefundRecipientAccountInput,
} from '@/services/admin/types/finance.types';

// Props cho QR/tài khoản nhận và callback xác minh giao dịch OUT trước khi dialog cho chốt hoàn.
export interface RefundTransferCardProps {
    refund: AdminFinanceRefund;
    isSavingRecipientAccount: boolean;
    recipientConfirmed: boolean;
    onRecipientConfirmedChange: (confirmed: boolean) => void;
    onSaveRecipientAccount: (account: AdminRefundRecipientAccountInput) => void;
}

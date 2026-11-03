import type {
    AdminFinanceRefund,
    AdminRefundRecipientAccountInput,
} from '@/services/admin/types/finance.types';

// Dữ liệu tối thiểu để thẻ chuyển khoản dựng QR tại trình duyệt, không gọi API bên thứ ba.
export interface RefundTransferCardProps {
    refund: AdminFinanceRefund;
    isSavingRecipientAccount: boolean;
    isConfirmingRefund: boolean;
    onSaveRecipientAccount: (account: AdminRefundRecipientAccountInput) => void;
    onConfirmRefund: () => Promise<void>;
}

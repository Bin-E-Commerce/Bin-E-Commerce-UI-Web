// Props của form hủy/cập nhật yêu cầu; dữ liệu ngân hàng chỉ truyền vào từ query đã scope theo user/order.

import type {
    CancelOrderInput,
    RefundBankAccountInput,
} from '@/services/order/types/cancel-order.types';

// Hợp đồng giữa trang chi tiết và dialog hủy đơn, gồm yêu cầu nạp tiền hoàn khi Pay2S đã thu.
export type CancelOrderDialogProps = {
    loading: boolean;
    requiresRefundBankAccount: boolean;
    mode?: 'cancel' | 'edit';
    initialReason?: string | null;
    initialRefundBankAccount?: RefundBankAccountInput | null;
    onConfirm: (input: CancelOrderInput) => Promise<void>;
};

// Props của một lựa chọn lý do nhanh; component báo lại chuỗi lý do được chọn cho dialog.
export type QuickReasonOptionProps = {
    value: string;
    selected: boolean;
    onSelect: (value: string) => void;
};

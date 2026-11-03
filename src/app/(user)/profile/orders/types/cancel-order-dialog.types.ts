import type { CancelOrderInput } from '@/services/order/types/cancel-order.types';

// Hợp đồng giữa trang chi tiết và dialog hủy đơn, gồm yêu cầu nạp tiền hoàn khi Pay2S đã thu.
export type CancelOrderDialogProps = {
    loading: boolean;
    requiresRefundBankAccount: boolean;
    onConfirm: (input: CancelOrderInput) => Promise<void>;
};

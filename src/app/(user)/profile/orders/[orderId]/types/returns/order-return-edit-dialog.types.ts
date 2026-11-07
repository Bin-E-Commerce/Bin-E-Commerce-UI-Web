// Contracts riêng cho hộp thoại customer chỉnh sửa yêu cầu hoàn hàng.

import type { OrderResponse } from '@/app/(public)/checkout/types/checkout.types';
import type {
    OrderReturnResponse,
    UpdateOrderReturnInput,
} from '@/services/order';

export interface ReturnReasonOption {
    value: OrderReturnResponse['reason'];
    label: string;
}

export interface EditOrderReturnDialogProps {
    open: boolean;
    isSubmitting: boolean;
    request: OrderReturnResponse | null;
    order: OrderResponse;
    onOpenChange: (open: boolean) => void;
    onSave: (returnId: string, input: UpdateOrderReturnInput) => Promise<void>;
}

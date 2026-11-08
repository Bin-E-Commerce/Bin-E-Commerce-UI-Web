// Props và biến mutation của panel hoàn hàng thuộc order detail Customer.
import type { OrderResponse } from '@/app/(public)/checkout/types/checkout.types';
import type { UpdateOrderReturnInput } from '@/services/order';

export interface OrderReturnPanelProps {
    order: OrderResponse;
}

export interface UpdateOrderReturnMutationVariables {
    returnId: string;
    input: UpdateOrderReturnInput;
}

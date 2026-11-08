// Props của thẻ xác nhận giao hàng và báo lỗi gắn với order detail hiện tại.
import type { OrderResponse } from '@/app/(public)/checkout/types/checkout.types';

export interface DeliveryConfirmationCardProps {
    order: OrderResponse;
    onOrderCompleted: () => void;
}

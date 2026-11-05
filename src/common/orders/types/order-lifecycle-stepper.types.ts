// Types của lifecycle stepper; hành động và snapshot nhạy cảm chỉ được truyền từ trang đã xác thực quyền sở hữu.

import type { ReactNode } from 'react';

import type { RefundBankAccountInput } from '@/services/order/types/cancel-order.types';
import type { OrderReturnStatus } from '@/services/order';
import type { ShipmentStatus } from '@/services/shipping';

export type OrderLifecycleStage =
    | 'TO_SHIP'
    | 'SHIPPING'
    | 'DELIVERED'
    | 'COMPLETED'
    | 'CANCELLED'
    | 'DELIVERY_FAILED'
    | 'RETURN_REFUND';

export type LegacyOrderStatus =
    'PENDING' | 'CONFIRMED' | 'FAILED' | 'CANCELLED';
export type OrderLifecycleMode = 'customer' | 'seller';
export type LifecycleState = 'complete' | 'current' | 'upcoming';

export interface OrderLifecycleStepperProps {
    mode: OrderLifecycleMode;
    currentStage?: OrderLifecycleStage | null;
    legacyStatus?: LegacyOrderStatus | string | null;
    cancelledAt?: string | null;
    cancelReason?: string | null;
    cancelRefundBankAccount?: RefundBankAccountInput | null;
    cancelActionSlot?: ReactNode;
    shipmentStatus?: ShipmentStatus | null;
    returnStatus?: OrderReturnStatus | null;
    actionSlot?: ReactNode;
}

export interface LifecycleStep {
    key: string;
    title: string;
    description: string;
}

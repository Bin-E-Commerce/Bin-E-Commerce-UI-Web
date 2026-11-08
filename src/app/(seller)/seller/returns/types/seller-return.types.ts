// File này khai báo filter và request snapshot dùng trong Seller Returns.
// Kiểu request luôn lấy từ Order Service để UI không tự nhân bản hợp đồng API.

import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import type { listSellerReturns } from '@/services/order';
import type { SellerReturnFinancePreview } from '@/services/order';

export type ReturnQueueFilter =
    | 'ALL'
    | 'REQUESTED'
    | 'AWAITING_SHIPMENT'
    | 'RECEIVED'
    | 'RESOLVED'
    | 'CUSTOMER_CANCELLED';

export type SellerReturnRequest = Awaited<
    ReturnType<typeof listSellerReturns>
>[number];

// Snapshot dùng để seller xác nhận khoản phí shop sẽ chịu trước khi duyệt return.
export interface SellerReturnApprovalContext {
    request: SellerReturnRequest;
    finance: SellerReturnFinancePreview;
}

// Props của cảnh báo tài chính và card queue được khai báo cạnh các kiểu feature thay vì trong JSX component.
export interface SellerReturnApprovalDialogProps {
    approval: SellerReturnApprovalContext | null;
    pending: boolean;
    onClose: () => void;
    onConfirm: () => void;
}

export interface SellerReturnRequestCardProps {
    item: SellerReturnRequest;
    reviewPending: boolean;
    inspectPending: boolean;
    shipmentPending: boolean;
    onReview: (
        approved: boolean,
        returnShippingPayer?: 'CUSTOMER' | 'SELLER',
    ) => void;
    onInspect: (passed: boolean) => void;
    onCreateShipment: () => void;
    onViewDetails: () => void;
}

// Kiểu input mutation nằm ở ranh giới service để component không lặp hợp đồng API.
export interface ReviewReturnMutationInput {
    returnId: string;
    approved: boolean;
    note?: string;
    returnShippingPayer?: 'CUSTOMER' | 'SELLER';
}

export interface InspectReturnMutationInput {
    returnId: string;
    passed: boolean;
}

export interface SellerReturnSummaryCardProps {
    label: string;
    value: number;
    description: string;
    icon: LucideIcon;
    emphasized?: boolean;
}

export interface ReturnFilterButtonProps {
    active: boolean;
    count?: number;
    onClick: () => void;
    children: ReactNode;
}

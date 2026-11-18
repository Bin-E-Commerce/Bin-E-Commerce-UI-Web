// Hợp đồng đầu vào của mục lục điều hướng và slot hành động cho trang chi tiết đơn.
// Component chỉ trình bày/điều hướng; nội dung slot và nghiệp vụ thao tác do trang sở hữu.
import type { ReactNode } from 'react';

export type OrderDetailSectionNavProps = {
    itemCount: number;
    paymentLabel: string;
    customerActionLabel: string | null;
    customerActionNeedsAttention: boolean;
    showReview: boolean;
    showReturns: boolean;
    actions?: ReactNode;
};

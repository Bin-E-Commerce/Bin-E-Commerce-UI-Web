// Contract cho các trạng thái lỗi dashboard; phần trình bày không tự suy luận trạng thái API.

export type SellerDashboardErrorState =
    | 'service-unavailable'
    | 'checking-shop-status'
    | 'finance-locked'
    | 'shop-restricted'
    | 'status-unconfirmed';

export interface SellerDashboardErrorProps {
    state: SellerDashboardErrorState;
    debtBalance?: string;
    onRetry: () => void;
    isRetrying: boolean;
}

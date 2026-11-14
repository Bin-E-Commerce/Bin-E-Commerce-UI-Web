// Composition root của Seller Dashboard; route page chỉ render component này.

'use client';

import { SellerDashboardActionQueue } from './SellerDashboardActionQueue';
import { SellerDashboardError } from './SellerDashboardError';
import { SellerDashboardEmptyState } from './SellerDashboardEmptyState';
import { SellerDashboardFinanceLockBanner } from './SellerDashboardFinanceLockBanner';
import { SellerDashboardHeader } from './SellerDashboardHeader';
import { SellerDashboardKpiGrid } from './SellerDashboardKpiGrid';
import { SellerDashboardLatestOrders } from './SellerDashboardLatestOrders';
import { SellerDashboardLoading } from './SellerDashboardLoading';
import { SellerDashboardRevenueChart } from './SellerDashboardRevenueChart';
import { SellerDashboardTopProducts } from './SellerDashboardTopProducts';
import { useSellerDashboard } from '../hooks/use-seller-dashboard';
import type { SellerDashboardErrorState } from '../types/seller-dashboard-error.types';

// Điều phối trạng thái tải, lỗi, rỗng và các vùng dashboard từ một snapshot duy nhất.
// Trạng thái rỗng chỉ được dùng khi shop thật sự chưa có dữ liệu, không được che các queue cần xử lý.
export function SellerDashboardPageContent() {
    const {
        range,
        changeRange,
        dashboardQuery,
        walletQuery,
        isDashboardForbidden,
    } = useSellerDashboard();

    // Làm mới cả snapshot lẫn ví khi shop đang khóa để seller thấy trạng thái thanh toán mới nhất.
    function refreshDashboard(): void {
        void dashboardQuery.refetch();
        if (dashboardQuery.data?.shop.financeLocked || isDashboardForbidden) {
            void walletQuery.refetch();
        }
    }

    if (dashboardQuery.isLoading && !dashboardQuery.data) {
        return <SellerDashboardLoading />;
    }

    // 403 phải được xử lý cả khi cache còn snapshot cũ; không để dữ liệu stale che trạng thái shop hiện tại.
    if (
        dashboardQuery.isError &&
        (!dashboardQuery.data || isDashboardForbidden)
    ) {
        // Phân biệt 403 do trạng thái shop với lỗi dịch vụ; ví là nguồn xác nhận có khóa công nợ hay không.
        let errorState: SellerDashboardErrorState = 'service-unavailable';
        if (isDashboardForbidden) {
            if (walletQuery.isPending || walletQuery.isFetching) {
                errorState = 'checking-shop-status';
            } else if (walletQuery.isError || !walletQuery.data) {
                errorState = 'status-unconfirmed';
            } else if (walletQuery.data.debt?.shopLocked) {
                errorState = 'finance-locked';
            } else {
                errorState = 'shop-restricted';
            }
        }

        return (
            <SellerDashboardError
                state={errorState}
                debtBalance={walletQuery.data?.debt?.debtBalance}
                onRetry={refreshDashboard}
                isRetrying={
                    dashboardQuery.isFetching || walletQuery.isFetching
                }
            />
        );
    }

    const snapshot = dashboardQuery.data;
    if (!snapshot) return <SellerDashboardLoading />;
    const financeLockBanner = snapshot.shop.financeLocked ? (
        <SellerDashboardFinanceLockBanner
            debtBalance={walletQuery.data?.debt?.debtBalance}
        />
    ) : null;

    const hasActivity =
        snapshot.kpis.orderCount > 0 ||
        snapshot.orderStatusCounts.all > 0 ||
        snapshot.kpis.pendingReturns > 0 ||
        snapshot.kpis.activeProducts > 0 ||
        snapshot.topProducts.length > 0;

    if (!hasActivity) {
        return (
            <div className="space-y-4">
                {financeLockBanner}
                <SellerDashboardHeader
                    snapshot={snapshot}
                    range={range}
                    onRangeChange={changeRange}
                    onRefresh={refreshDashboard}
                    isRefreshing={dashboardQuery.isFetching}
                />
                <SellerDashboardEmptyState />
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {financeLockBanner}
            <SellerDashboardHeader
                snapshot={snapshot}
                range={range}
                onRangeChange={changeRange}
                onRefresh={refreshDashboard}
                isRefreshing={dashboardQuery.isFetching}
            />

            <SellerDashboardKpiGrid snapshot={snapshot} />

            <section className="grid gap-3 xl:grid-cols-[1.35fr_0.65fr]">
                <SellerDashboardRevenueChart snapshot={snapshot} />
                <SellerDashboardActionQueue snapshot={snapshot} />
            </section>

            <section className="grid gap-3 xl:grid-cols-2">
                <SellerDashboardLatestOrders snapshot={snapshot} />
                <SellerDashboardTopProducts snapshot={snapshot} />
            </section>

            {dashboardQuery.isFetching ? (
                <p className="text-right text-xs text-zinc-400">
                    Đang cập nhật dữ liệu mới...
                </p>
            ) : null}
        </div>
    );
}

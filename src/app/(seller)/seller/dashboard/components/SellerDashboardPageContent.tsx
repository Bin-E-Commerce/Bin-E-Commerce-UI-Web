// Composition root của Seller Dashboard; route page chỉ render component này.

'use client';

import { SellerDashboardActionQueue } from './SellerDashboardActionQueue';
import { SellerDashboardError } from './SellerDashboardError';
import { SellerDashboardEmptyState } from './SellerDashboardEmptyState';
import { SellerDashboardHeader } from './SellerDashboardHeader';
import { SellerDashboardKpiGrid } from './SellerDashboardKpiGrid';
import { SellerDashboardLatestOrders } from './SellerDashboardLatestOrders';
import { SellerDashboardLoading } from './SellerDashboardLoading';
import { SellerDashboardRevenueChart } from './SellerDashboardRevenueChart';
import { SellerDashboardTopProducts } from './SellerDashboardTopProducts';
import { useSellerDashboard } from '../hooks/use-seller-dashboard';

// Điều phối trạng thái tải, lỗi, rỗng và các vùng dashboard từ một snapshot duy nhất.
// Trạng thái rỗng chỉ được dùng khi shop thật sự chưa có dữ liệu, không được che các queue cần xử lý.
export function SellerDashboardPageContent() {
    const { range, changeRange, dashboardQuery } = useSellerDashboard();

    if (dashboardQuery.isLoading && !dashboardQuery.data) {
        return <SellerDashboardLoading />;
    }

    if (dashboardQuery.isError && !dashboardQuery.data) {
        return (
            <SellerDashboardError
                onRetry={() => void dashboardQuery.refetch()}
                isRetrying={dashboardQuery.isFetching}
            />
        );
    }

    const snapshot = dashboardQuery.data;
    if (!snapshot) return <SellerDashboardLoading />;

    const hasActivity =
        snapshot.kpis.orderCount > 0 ||
        snapshot.orderStatusCounts.all > 0 ||
        snapshot.kpis.pendingReturns > 0 ||
        snapshot.kpis.activeProducts > 0 ||
        snapshot.topProducts.length > 0;

    if (!hasActivity) {
        return (
            <div className="space-y-4">
                <SellerDashboardHeader
                    snapshot={snapshot}
                    range={range}
                    onRangeChange={changeRange}
                    onRefresh={() => void dashboardQuery.refetch()}
                    isRefreshing={dashboardQuery.isFetching}
                />
                <SellerDashboardEmptyState />
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <SellerDashboardHeader
                snapshot={snapshot}
                range={range}
                onRangeChange={changeRange}
                onRefresh={() => void dashboardQuery.refetch()}
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

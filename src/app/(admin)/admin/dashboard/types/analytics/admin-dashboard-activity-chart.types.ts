// Dữ liệu đã được ghép theo ngày từ các API nghiệp vụ; chỉ số chỉ có mặt khi quyền tương ứng được cấp.
import type { AdminDashboardMetricState } from '../admin-dashboard-state.types';

export type AdminDashboardActivityMetric =
    | 'sellerApplications'
    | 'newUsers'
    | 'walletDeposits'
    | 'withdrawalRequests';

export interface AdminDashboardActivityPoint {
    day: string;
    sellerApplications: number;
    newUsers: number;
    walletDeposits: number;
    withdrawalRequests: number;
}

export interface AdminDashboardDailyActivityCount {
    day: string;
    count: number;
}

export interface AdminDashboardActivityData {
    daily: AdminDashboardActivityPoint[];
    availableSeries: AdminDashboardActivityMetric[];
    totals: Record<AdminDashboardActivityMetric, number>;
}

export interface AdminDashboardActivityChartProps {
    overview: AdminDashboardActivityData | null;
    state: AdminDashboardMetricState;
    hasPartialError: boolean;
}

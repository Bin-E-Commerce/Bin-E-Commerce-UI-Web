// Tải hàng đợi và hoạt động vận hành theo đúng permission mà backend gắn với session admin.
'use client';

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { canAccessAdminPath } from '@/services/auth/access';
import type { AuthUser } from '@/services/auth/types/auth.types';
import { adminSellerApplicationsService } from '@/services/admin/api/seller-applications.api';
import { adminShopProfileChangesService } from '@/services/admin/api/shop-profile-changes.api';
import { adminUsersService } from '@/services/admin/api/users.api';
import {
    getAdminFinance,
    getAdminWalletActivity,
    getPendingAdminCodRemittances,
} from '@/services/admin/api/finance.api';
import type { AdminDashboardMetricState } from '../types/admin-dashboard-state.types';
import type {
    AdminDashboardActivityData,
    AdminDashboardActivityMetric,
    AdminDashboardActivityPoint,
    AdminDashboardDailyActivityCount,
} from '../types/analytics/admin-dashboard-activity-chart.types';

// Ưu tiên trạng thái lỗi hơn loading để dữ liệu cũ không che việc API vừa thất bại.
function getMetricState(
    isError: boolean,
    isPending: boolean,
): AdminDashboardMetricState {
    if (isError) return 'error';
    if (isPending) return 'loading';
    return 'ready';
}

// Dùng ngày lịch Việt Nam và biên cuối loại trừ để mọi service thống kê cùng đúng 30 ngày.
function getLastThirtyDaysRange(): { from: string; to: string } {
    const now = new Date();
    // Đọc thành phần ngày theo múi giờ vận hành để trình duyệt ở múi giờ khác vẫn truy vấn đúng ngày Việt Nam.
    const parts = new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Asia/Ho_Chi_Minh',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    }).formatToParts(now);
    const dateParts = Object.fromEntries(
        parts.map((part) => [part.type, part.value]),
    );
    // Chuyển ngày lịch đã tách thành UTC date để cộng trừ ngày không bị DST hoặc lệch nửa đêm.
    const vietnamToday = new Date(
        Date.UTC(
            Number(dateParts.year),
            Number(dateParts.month) - 1,
            Number(dateParts.day),
        ),
    );
    const exclusiveEnd = new Date(vietnamToday);
    exclusiveEnd.setUTCDate(exclusiveEnd.getUTCDate() + 1);
    const start = new Date(exclusiveEnd);
    start.setUTCDate(start.getUTCDate() - 30);

    return {
        from: start.toISOString().slice(0, 10),
        to: exclusiveEnd.toISOString().slice(0, 10),
    };
}

// Ghép aggregate độc lập thành cùng 30 ngày, điền 0 cho ngày không phát sinh thay vì nối sai các ngày có dữ liệu.
function mergeDailyActivity(
    range: { from: string; to: string },
    sources: Partial<
        Record<AdminDashboardActivityMetric, AdminDashboardDailyActivityCount[]>
    >,
    availableSeries: AdminDashboardActivityMetric[],
): AdminDashboardActivityData {
    const points = new Map<string, AdminDashboardActivityPoint>();
    const cursor = new Date(`${range.from}T00:00:00.000Z`);
    const exclusiveEnd = new Date(`${range.to}T00:00:00.000Z`);

    // Khoảng đến từ query nội bộ đã giới hạn 31 ngày; UTC chỉ dùng để tăng lịch ngày, không quy đổi timestamp nghiệp vụ.
    while (cursor < exclusiveEnd) {
        const day = cursor.toISOString().slice(0, 10);
        points.set(day, {
            day,
            sellerApplications: 0,
            newUsers: 0,
            walletDeposits: 0,
            withdrawalRequests: 0,
        });
        cursor.setUTCDate(cursor.getUTCDate() + 1);
    }

    // Chỉ ghi dữ liệu có ngày trong cửa sổ được yêu cầu; phản hồi ngoài khoảng không làm lệch trục thời gian.
    for (const metric of availableSeries) {
        for (const item of sources[metric] ?? []) {
            const point = points.get(item.day);
            if (point) point[metric] = item.count;
        }
    }

    const daily = Array.from(points.values());
    const totals: Record<AdminDashboardActivityMetric, number> = {
        sellerApplications: 0,
        newUsers: 0,
        walletDeposits: 0,
        withdrawalRequests: 0,
    };

    // Tổng legend được tính từ cùng các điểm đã vẽ nên không lệch với khoảng ngày hoặc quyền đang hiển thị.
    for (const point of daily) {
        for (const metric of availableSeries) {
            totals[metric] += point[metric];
        }
    }

    return { daily, availableSeries, totals };
}

// Chỉ truy vấn hàng đợi và chuỗi thời gian mà accessProfile backend cấp cho session hiện tại.
export function useAdminDashboardOverview(user: AuthUser | null) {
    const canReadApplications = canAccessAdminPath(
        '/admin/sellers/applications',
        user,
    );
    const canReadProfileChanges = canAccessAdminPath(
        '/admin/sellers/profile-changes',
        user,
    );
    const canReadFinance = canAccessAdminPath('/admin/finance', user);
    const canReadNewUsers = canAccessAdminPath('/admin/users', user);
    const activityRange = useMemo(() => getLastThirtyDaysRange(), []);

    const applicationsQuery = useQuery({
        queryKey: ['admin-dashboard', 'seller-applications'],
        queryFn: () =>
            adminSellerApplicationsService.list({
                status: 'pending_review',
                page: 1,
                pageSize: 1,
            }),
        enabled: canReadApplications,
        staleTime: 30_000,
        retry: 1,
    });
    const profileChangesQuery = useQuery({
        queryKey: ['admin-dashboard', 'shop-profile-changes'],
        queryFn: () =>
            adminShopProfileChangesService.list({
                status: 'pending_review',
                page: 1,
                pageSize: 1,
            }),
        enabled: canReadProfileChanges,
        staleTime: 30_000,
        retry: 1,
    });
    const withdrawalsQuery = useQuery({
        queryKey: ['admin-dashboard', 'withdrawals'],
        queryFn: () => getAdminFinance(1, 1),
        enabled: canReadFinance,
        staleTime: 30_000,
        retry: 1,
    });
    const codRemittancesQuery = useQuery({
        queryKey: ['admin-dashboard', 'cod-remittances'],
        queryFn: () => getPendingAdminCodRemittances(1, 1),
        enabled: canReadFinance,
        staleTime: 30_000,
        retry: 1,
    });
    const sellerActivityQuery = useQuery({
        queryKey: [
            'admin-dashboard',
            'seller-application-activity',
            activityRange.from,
            activityRange.to,
        ],
        queryFn: () => adminSellerApplicationsService.activity(activityRange),
        enabled: canReadApplications,
        staleTime: 30_000,
        retry: 1,
    });
    const userActivityQuery = useQuery({
        queryKey: [
            'admin-dashboard',
            'new-user-activity',
            activityRange.from,
            activityRange.to,
        ],
        queryFn: () => adminUsersService.getActivity(activityRange),
        enabled: canReadNewUsers,
        staleTime: 30_000,
        retry: 1,
    });
    const walletActivityQuery = useQuery({
        queryKey: [
            'admin-dashboard',
            'wallet-activity',
            activityRange.from,
            activityRange.to,
        ],
        queryFn: () => getAdminWalletActivity(activityRange),
        enabled: canReadFinance,
        staleTime: 30_000,
        retry: 1,
    });

    const activityQueries = [
        ...(canReadApplications ? [sellerActivityQuery] : []),
        ...(canReadNewUsers ? [userActivityQuery] : []),
        ...(canReadFinance ? [walletActivityQuery] : []),
    ];
    const activityState: AdminDashboardMetricState =
        activityQueries.length === 0
            ? 'ready'
            : activityQueries.some((query) => query.isPending)
              ? 'loading'
              : activityQueries.every((query) => query.isError)
                ? 'error'
                : 'ready';
    const activityHasPartialError =
        activityQueries.some((query) => query.isError) &&
        activityQueries.some((query) => query.isSuccess || query.data);
    const activityData = useMemo(
        () => {
            const availableSeries: AdminDashboardActivityMetric[] = [];
            const activitySources: Partial<
                Record<
                    AdminDashboardActivityMetric,
                    AdminDashboardDailyActivityCount[]
                >
            > = {};

            // Chỉ vẽ nguồn tải thành công hoặc có cache; lỗi của một service không được thể hiện thành đường zero giả.
            if (
                canReadApplications &&
                (sellerActivityQuery.isSuccess || sellerActivityQuery.data)
            ) {
                availableSeries.push('sellerApplications');
                activitySources.sellerApplications =
                    sellerActivityQuery.data?.daily ?? [];
            }
            if (
                canReadNewUsers &&
                (userActivityQuery.isSuccess || userActivityQuery.data)
            ) {
                availableSeries.push('newUsers');
                activitySources.newUsers = userActivityQuery.data?.daily ?? [];
            }
            if (
                canReadFinance &&
                (walletActivityQuery.isSuccess || walletActivityQuery.data)
            ) {
                availableSeries.push('walletDeposits', 'withdrawalRequests');
                activitySources.walletDeposits =
                    walletActivityQuery.data?.deposits ?? [];
                activitySources.withdrawalRequests =
                    walletActivityQuery.data?.withdrawalRequests ?? [];
            }

            return mergeDailyActivity(
                activityRange,
                activitySources,
                availableSeries,
            );
        },
        [
            activityRange,
            sellerActivityQuery.data,
            userActivityQuery.data,
            walletActivityQuery.data,
            sellerActivityQuery.isSuccess,
            userActivityQuery.isSuccess,
            walletActivityQuery.isSuccess,
            canReadApplications,
            canReadNewUsers,
            canReadFinance,
        ],
    );

    const isLoading =
        (canReadApplications && applicationsQuery.isPending) ||
        (canReadProfileChanges && profileChangesQuery.isPending) ||
        (canReadFinance &&
            (withdrawalsQuery.isPending || codRemittancesQuery.isPending));
    const hasError =
        (canReadApplications && applicationsQuery.isError) ||
        (canReadProfileChanges && profileChangesQuery.isError) ||
        (canReadFinance &&
            (withdrawalsQuery.isError || codRemittancesQuery.isError));
    const isReady =
        (!canReadApplications || applicationsQuery.isSuccess) &&
        (!canReadProfileChanges || profileChangesQuery.isSuccess) &&
        (!canReadFinance ||
            (withdrawalsQuery.isSuccess && codRemittancesQuery.isSuccess));
    const hasVisibleQueues =
        canReadApplications || canReadProfileChanges || canReadFinance;

    // Chỉ cộng tổng khi toàn bộ hàng đợi người dùng được xem đã tải thành công, tránh hiển thị số thiếu như tổng thật.
    const pendingTotal =
        hasVisibleQueues && isReady
            ? (canReadApplications
                  ? (applicationsQuery.data?.meta.totalItems ?? 0)
                  : 0) +
              (canReadProfileChanges
                  ? (profileChangesQuery.data?.meta.totalItems ?? 0)
                  : 0) +
              (canReadFinance
                  ? (withdrawalsQuery.data?.pendingWithdrawals ?? 0) +
                    (codRemittancesQuery.data?.total ?? 0)
                  : 0)
            : null;

    // Làm mới đồng thời các hàng đợi và chuỗi hoạt động được cấp quyền; backend tiếp tục xác thực permission.
    async function refreshAll() {
        const refreshes = [];
        if (canReadApplications) {
            refreshes.push(applicationsQuery.refetch());
            refreshes.push(sellerActivityQuery.refetch());
        }
        if (canReadProfileChanges)
            refreshes.push(profileChangesQuery.refetch());
        if (canReadNewUsers) refreshes.push(userActivityQuery.refetch());
        if (canReadFinance) {
            refreshes.push(withdrawalsQuery.refetch());
            refreshes.push(codRemittancesQuery.refetch());
            refreshes.push(walletActivityQuery.refetch());
        }
        await Promise.all(refreshes);
    }

    return {
        canReadApplications,
        canReadProfileChanges,
        canReadFinance,
        canReadOperationalActivity:
            canReadApplications || canReadNewUsers || canReadFinance,
        applicationsCount: applicationsQuery.data?.meta.totalItems ?? null,
        profileChangesCount: profileChangesQuery.data?.meta.totalItems ?? null,
        withdrawalsCount: withdrawalsQuery.data?.pendingWithdrawals ?? null,
        codRemittancesCount: codRemittancesQuery.data?.total ?? null,
        applicationsState: getMetricState(
            applicationsQuery.isError,
            applicationsQuery.isPending,
        ),
        profileChangesState: getMetricState(
            profileChangesQuery.isError,
            profileChangesQuery.isPending,
        ),
        withdrawalsState: getMetricState(
            withdrawalsQuery.isError,
            withdrawalsQuery.isPending,
        ),
        codRemittancesState: getMetricState(
            codRemittancesQuery.isError,
            codRemittancesQuery.isPending,
        ),
        activityData,
        activityState,
        activityHasPartialError,
        hasVisibleQueues,
        hasError,
        isLoading,
        isRefreshing:
            applicationsQuery.isFetching ||
            profileChangesQuery.isFetching ||
            withdrawalsQuery.isFetching ||
            codRemittancesQuery.isFetching ||
            sellerActivityQuery.isFetching ||
            userActivityQuery.isFetching ||
            walletActivityQuery.isFetching,
        pendingTotal,
        refreshAll,
    };
}

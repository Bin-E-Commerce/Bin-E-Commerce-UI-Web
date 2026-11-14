// Hook quản lý range, cache và refresh định kỳ cho snapshot Seller Dashboard.

'use client';

import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useState } from 'react';
import {
    getSellerDashboardOverview,
    type SellerDashboardRange,
} from '@/services/seller';
import { getSellerWallet } from '@/services/seller/api/seller-wallet.api';
import { useAppSelector } from '@/store/hooks';

// Một snapshot được dùng chung cho toàn bộ dashboard, tránh mỗi card tự gọi một API riêng.
export function useSellerDashboard() {
    const [range, setRange] = useState<SellerDashboardRange>('30d');
    const userId = useAppSelector((state) => state.auth.user?.id ?? null);
    const dashboardQuery = useQuery({
        queryKey: ['seller-dashboard', userId, range],
        queryFn: () => getSellerDashboardOverview(range),
        retry: (failureCount, error) => {
            const status = axios.isAxiosError(error)
                ? error.response?.status
                : undefined;
            // 4xx là lỗi quyền/trạng thái nghiệp vụ, gọi lại không thể tự sửa nguyên nhân.
            if (status && status >= 400 && status < 500) return false;
            return failureCount < 2;
        },
        // Giữ snapshot khi đổi range cùng tài khoản, nhưng không lộ dữ liệu seller trước khi tài khoản mới tải xong.
        placeholderData: (previousData, previousQuery) =>
            previousQuery?.queryKey[1] === userId ? previousData : undefined,
        staleTime: 60_000,
        refetchInterval: 60_000,
        refetchIntervalInBackground: false,
        refetchOnWindowFocus: false,
    });
    // Khi API dashboard trả 403, ví xác định đây là khóa công nợ hay trạng thái shop cần admin xử lý.
    const isDashboardForbidden =
        axios.isAxiosError(dashboardQuery.error) &&
        dashboardQuery.error.response?.status === 403;
    // Chỉ gọi API ví khi shop báo khóa tài chính hoặc dashboard bị từ chối vì trạng thái shop.
    const walletQuery = useQuery({
        queryKey: ['seller-wallet-debt-summary', userId],
        queryFn: () => getSellerWallet(1, 1),
        enabled:
            Boolean(userId) &&
            (dashboardQuery.data?.shop.financeLocked === true ||
                isDashboardForbidden),
        retry: (failureCount, error) => {
            const status = axios.isAxiosError(error)
                ? error.response?.status
                : undefined;
            // Lỗi quyền/trạng thái 4xx cần người dùng hoặc admin xử lý, không retry liên tục.
            if (status && status >= 400 && status < 500) return false;
            return failureCount < 2;
        },
        staleTime: 0,
        refetchInterval: 60_000,
        refetchOnMount: 'always',
        refetchOnWindowFocus: false,
    });

    // Đổi range chỉ thay query key; React Query giữ snapshot cũ để layout không nhấp nháy.
    const changeRange = (nextRange: string) => {
        if (nextRange === '7d' || nextRange === '30d' || nextRange === '90d') {
            setRange(nextRange);
        }
    };

    return {
        range,
        changeRange,
        dashboardQuery,
        walletQuery,
        isDashboardForbidden,
    };
}

// Hook quản lý range, cache và refresh định kỳ cho snapshot Seller Dashboard.

'use client';

import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import {
    getSellerDashboardOverview,
    type SellerDashboardRange,
} from '@/services/seller';

// Một snapshot được dùng chung cho toàn bộ dashboard, tránh mỗi card tự gọi một API riêng.
export function useSellerDashboard() {
    const [range, setRange] = useState<SellerDashboardRange>('30d');
    const dashboardQuery = useQuery({
        queryKey: ['seller-dashboard', range],
        queryFn: () => getSellerDashboardOverview(range),
        placeholderData: keepPreviousData,
        staleTime: 60_000,
        refetchInterval: 60_000,
        refetchIntervalInBackground: false,
        refetchOnWindowFocus: false,
    });

    // Đổi range chỉ thay query key; React Query giữ snapshot cũ để layout không nhấp nháy.
    const changeRange = (nextRange: string) => {
        if (nextRange === '7d' || nextRange === '30d' || nextRange === '90d') {
            setRange(nextRange);
        }
    };

    return { range, changeRange, dashboardQuery };
}

// Hook này quản lý filter, search và pagination cho Seller order list mà không gọi lại request khi UI chưa đổi input.

'use client';

import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { useDeferredValue, useState } from 'react';

import {
    listSellerOrders,
    type SellerOrderStatus,
} from '@/services/order/seller-order.api';

// Đồng bộ state filter với query key để mỗi tổ hợp shop/status/search/page được cache riêng và chuyển trang mượt.
export function useSellerOrders() {
    const [status, setStatus] = useState<SellerOrderStatus | undefined>();
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const deferredSearch = useDeferredValue(search.trim());

    const ordersQuery = useQuery({
        queryKey: ['seller-orders', status, deferredSearch, page],
        queryFn: () =>
            listSellerOrders({
                status,
                search: deferredSearch,
                page,
                pageSize: 10,
            }),
        placeholderData: keepPreviousData,
        staleTime: 30_000,
    });

    // Đổi search luôn quay về trang đầu để không giữ page cũ vượt quá kết quả mới.
    const changeSearch = (value: string) => {
        setSearch(value);
        setPage(1);
    };

    // Mỗi status có tổng số order khác nhau nên reset page khi seller chuyển tab.
    const changeStatus = (value: SellerOrderStatus | undefined) => {
        setStatus(value);
        setPage(1);
    };

    return {
        status,
        search,
        page,
        ordersQuery,
        changeSearch,
        changeStatus,
        setPage,
    };
}

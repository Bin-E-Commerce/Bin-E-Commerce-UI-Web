// Hook này quản lý filter, search và pagination cho Seller order list mà không gọi lại request khi UI chưa đổi input.

'use client';

import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { useDeferredValue, useState } from 'react';

import {
    listSellerOrders,
    type SellerOrderStatus,
    type SellerOrderStage,
} from '@/services/order/seller-order.api';

const SELLER_STAGE_FILTERS: SellerOrderStatus[] = [
    'TO_SHIP',
    'SHIPPING',
    'DELIVERED',
    'COMPLETED',
    'CANCELLED',
    'DELIVERY_FAILED',
    'RETURN_REFUND',
];

// Phân biệt order status và fulfillment stage trước khi tạo query để backend không nhận DELIVERED ở tham số status.
function isSellerStageFilter(
    status: SellerOrderStatus,
): status is SellerOrderStage {
    return SELLER_STAGE_FILTERS.includes(status);
}

// Đồng bộ state filter với query key để mỗi tổ hợp shop/status/search/page được cache riêng và chuyển trang mượt.
export function useSellerOrders() {
    const [status, setStatus] = useState<SellerOrderStatus | undefined>();
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const deferredSearch = useDeferredValue(search.trim());

    const ordersQuery = useQuery({
        queryKey: ['seller-orders', status, deferredSearch, page],
        queryFn: () => {
            const stageFilter =
                status && isSellerStageFilter(status) ? status : undefined;

            return listSellerOrders({
                status: status && !stageFilter ? status : undefined,
                stage: stageFilter,
                search: deferredSearch,
                page,
                pageSize: 10,
            });
        },
        placeholderData: keepPreviousData,
        staleTime: 30_000,
        refetchOnMount: 'always',
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

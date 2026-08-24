'use client';

import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { useDeferredValue, useState } from 'react';

import { sellerProductService } from '@/services/product';
import type {
    SellerProductSortBy,
    SellerProductSortOrder,
    SellerProductStatus,
} from '@/services/product';

// Quản lý filter, phân trang và cache request danh sách sản phẩm của seller trong một hook độc lập với UI.
export function useSellerProducts() {
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState<SellerProductStatus | undefined>();
    const [sortBy, setSortBy] =
        useState<SellerProductSortBy>('updatedAt');
    const [sortOrder, setSortOrder] =
        useState<SellerProductSortOrder>('DESC');
    const [page, setPage] = useState(1);
    const deferredSearch = useDeferredValue(search.trim());

    const productsQuery = useQuery({
        queryKey: [
            'seller-products',
            deferredSearch,
            status,
            sortBy,
            sortOrder,
            page,
        ],
        queryFn: () =>
            sellerProductService.listOwnedProducts({
                search: deferredSearch || undefined,
                status,
                sortBy,
                sortOrder,
                page,
                pageSize: 20,
            }),
        placeholderData: keepPreviousData,
        staleTime: 30_000,
    });

    // Đổi từ khóa và quay về trang đầu để không giữ một page vượt quá số kết quả mới.
    const changeSearch = (value: string) => {
        setSearch(value);
        setPage(1);
    };

    // Đổi tab trạng thái và reset phân trang vì mỗi tab có tổng số sản phẩm khác nhau.
    const changeStatus = (value: SellerProductStatus | undefined) => {
        setStatus(value);
        setPage(1);
    };

    // Đổi tiêu chí sắp xếp theo cặp field/direction đã được backend whitelist trong DTO.
    const changeSort = (
        nextSortBy: SellerProductSortBy,
        nextSortOrder: SellerProductSortOrder,
    ) => {
        setSortBy(nextSortBy);
        setSortOrder(nextSortOrder);
        setPage(1);
    };

    return {
        search,
        status,
        sortBy,
        sortOrder,
        page,
        productsQuery,
        changeSearch,
        changeStatus,
        changeSort,
        setPage,
    };
}

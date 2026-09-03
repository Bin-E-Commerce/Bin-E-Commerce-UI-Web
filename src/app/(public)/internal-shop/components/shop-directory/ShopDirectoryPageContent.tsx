// Màn hình khám phá shop nội bộ dành cho customer.
// Feature này chỉ gọi public shop API, không trộn dữ liệu crawl và không thay đổi logic checkout.

'use client';

import type { FormEvent } from 'react';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { publicShopService } from '@/services/seller';
import { ShopDirectoryHero } from './ShopDirectoryHero';
import { ShopDirectoryResults } from './ShopDirectoryResults';
import { ShopDirectorySearchBar } from './ShopDirectorySearchBar';
import { ShopDirectoryPagination } from './ShopDirectoryPagination';

const PAGE_SIZE = 12;

// Điều phối query, tìm kiếm và phân trang; input chỉ submit một lần để tránh request theo từng ký tự.
export function ShopDirectoryPageContent() {
    const [search, setSearch] = useState('');
    const [submittedSearch, setSubmittedSearch] = useState('');
    const [page, setPage] = useState(1);
    const shopQuery = useQuery({
        queryKey: ['public-shops', submittedSearch, page],
        queryFn: () =>
            publicShopService.list({
                search: submittedSearch || undefined,
                page,
                pageSize: PAGE_SIZE,
            }),
        staleTime: 60_000,
    });

    // Giữ thao tác tìm kiếm nhẹ và reset về trang đầu vì kết quả mới có tổng số trang khác.
    function handleSearchSubmit(event: FormEvent<HTMLFormElement>): void {
        event.preventDefault();
        setSubmittedSearch(search.trim());
        setPage(1);
    }

    // Xóa cả từ khóa đang nhập và từ khóa đã gửi để danh sách trở về trạng thái ban đầu ngay lập tức.
    function handleClearSearch(): void {
        setSearch('');
        setSubmittedSearch('');
        setPage(1);
    }

    // Chặn page vượt biên ngay tại UI để không tạo request vô nghĩa khi người dùng bấm liên tục.
    function handlePageChange(nextPage: number): void {
        const totalPages = shopQuery.data?.totalPages ?? 1;
        setPage(Math.min(Math.max(1, nextPage), totalPages));
    }

    const shops = shopQuery.data?.items ?? [];
    const totalPages = shopQuery.data?.totalPages ?? 0;
    return (
        <main className="min-h-[75vh] bg-zinc-50 px-3 py-6 sm:px-6 sm:py-10 lg:px-8">
            <div className="mx-auto w-full max-w-7xl">
                <ShopDirectoryHero />

                <section className="mt-10">
                    <ShopDirectorySearchBar
                        search={search}
                        resultLabel={
                            shopQuery.data && submittedSearch
                                ? `${shopQuery.data.total.toLocaleString('vi-VN')} kết quả theo tên, mô tả hoặc khu vực`
                                : shopQuery.data
                                  ? `${shopQuery.data.total.toLocaleString('vi-VN')} shop sẵn sàng để bạn trải nghiệm`
                                  : 'Tìm nhanh shop phù hợp để bắt đầu'
                        }
                        isFetching={shopQuery.isFetching}
                        onSearchChange={setSearch}
                        onSubmit={handleSearchSubmit}
                        onClear={handleClearSearch}
                    />
                    <div className="mt-6">
                        <ShopDirectoryResults
                            shops={shops}
                            isPending={shopQuery.isPending}
                            isError={shopQuery.isError}
                            onRetry={() => void shopQuery.refetch()}
                        />
                    </div>
                    <ShopDirectoryPagination
                        page={page}
                        totalPages={totalPages}
                        totalItems={shopQuery.data?.total ?? shops.length}
                        onPageChange={handlePageChange}
                    />
                </section>
            </div>
        </main>
    );
}

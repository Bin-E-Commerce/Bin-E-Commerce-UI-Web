// Màn hình công nợ admin kết hợp snapshot tổng hợp và bảng lọc server-side; không cho phép chỉnh số dư tại đây.
'use client';

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { AlertTriangle, RefreshCw, ShieldAlert, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { publicShopService } from '@/services/seller';
import {
    getAdminFinance,
    getAdminSellerDebts,
} from '@/services/admin/api/finance.api';
import type { AdminSellerWalletDebtFilter } from '@/services/admin/types/finance.types';
import { formatMoney } from '../../utils/format-finance-money';
import { SellerDebtTable } from './SellerDebtTable';

const DEBT_TABLE_PAGE_SIZE = 20;

// Ghép snapshot tổng hợp với danh sách công nợ server-side để admin theo dõi shop mà không chỉnh số dư tại màn hình này.
// Bộ lọc và phân trang giữ query key đúng với kết quả đang xem; nút làm mới chỉ vô hiệu hóa dữ liệu thuộc tài chính.
export function AdminSellerDebtsPageClient() {
    const queryClient = useQueryClient();
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState<AdminSellerWalletDebtFilter>('ALL');
    const overviewQuery = useQuery({
        queryKey: ['admin-finance', 'overview'],
        queryFn: () => getAdminFinance(1, 1),
        staleTime: 15_000,
    });
    const debtsQuery = useQuery({
        queryKey: [
            'admin-finance',
            'seller-debts',
            page,
            DEBT_TABLE_PAGE_SIZE,
            status,
            search,
        ],
        queryFn: () =>
            getAdminSellerDebts({
                page,
                pageSize: DEBT_TABLE_PAGE_SIZE,
                status,
                search: search || undefined,
            }),
        staleTime: 15_000,
    });
    const items = debtsQuery.data?.items ?? [];
    const shopIds = [...new Set(items.map((item) => item.shopId))];
    // Chỉ tải hồ sơ public cho 20 shop đang hiển thị; lỗi nhận diện không che mất số nợ trả về từ Order Service.
    const shopQueries = useQuery({
        queryKey: ['admin-finance', 'seller-debt-shops', shopIds],
        queryFn: async () =>
            Promise.all(
                shopIds.map(async (shopId) => {
                    try {
                        const response =
                            await publicShopService.getBySlug(shopId);
                        return [shopId, response.shop] as const;
                    } catch {
                        return [shopId, undefined] as const;
                    }
                }),
            ),
        enabled: shopIds.length > 0,
        staleTime: 60_000,
        retry: false,
    });
    const shopsById = new Map(shopQueries.data ?? []);
    const overview = overviewQuery.data;

    return (
        <main className="space-y-5 pb-8">
            <header className="flex flex-wrap items-end justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight text-zinc-950">
                        Công nợ seller
                    </h1>
                    <p className="mt-1 max-w-2xl text-sm text-zinc-500">
                        Theo dõi số dư âm, hạn thanh toán và trạng thái khóa của
                        từng shop.
                    </p>
                </div>
                <Button
                    type="button"
                    variant="outline"
                    onClick={() =>
                        void queryClient.invalidateQueries({
                            queryKey: ['admin-finance'],
                        })
                    }
                    className="rounded-xl"
                >
                    <RefreshCw aria-hidden="true" /> Làm mới
                </Button>
            </header>

            {overviewQuery.isError ? (
                <p
                    role="alert"
                    className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
                >
                    Chưa tải được số tổng hợp. Bảng chi tiết vẫn có thể được xem
                    bên dưới.
                </p>
            ) : null}

            <section
                className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3"
                aria-label="Tổng quan công nợ seller"
            >
                <article className="flex min-h-32 flex-col justify-between rounded-2xl border border-rose-200 bg-gradient-to-br from-rose-50/80 to-white p-4 shadow-sm">
                    <div className="flex items-center gap-3">
                        <span className="flex size-9 items-center justify-center rounded-xl bg-rose-600 text-white">
                            <Wallet className="size-4" aria-hidden="true" />
                        </span>
                        <p className="text-sm font-medium text-rose-900">
                            Tổng công nợ
                        </p>
                    </div>
                    <div>
                        <p className="text-xl font-semibold tracking-tight text-rose-700 tabular-nums">
                            {overview
                                ? formatMoney(overview.sellerDebtBalance ?? '0')
                                : '—'}
                        </p>
                        <p className="mt-0.5 text-xs text-rose-800/70">
                            {overview?.sellerDebtShopCount ?? '—'} shop đang nợ
                        </p>
                    </div>
                </article>
                <article className="flex min-h-32 flex-col justify-between rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
                    <div className="flex items-center gap-3">
                        <span className="flex size-9 items-center justify-center rounded-xl bg-zinc-950 text-white">
                            <AlertTriangle
                                className="size-4"
                                aria-hidden="true"
                            />
                        </span>
                        <p className="text-sm font-medium text-zinc-700">
                            Khoản quá hạn
                        </p>
                    </div>
                    <div>
                        <p className="text-xl font-semibold tracking-tight text-zinc-950 tabular-nums">
                            {overview
                                ? formatMoney(
                                      overview.overdueSellerDebtBalance ?? '0',
                                  )
                                : '—'}
                        </p>
                        <p className="mt-0.5 text-xs text-zinc-500">
                            {overview?.overdueSellerDebtShopCount ?? '—'} shop
                            quá hạn
                        </p>
                    </div>
                </article>
                <article className="flex min-h-32 flex-col justify-between rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
                    <div className="flex items-center gap-3">
                        <span className="flex size-9 items-center justify-center rounded-xl bg-zinc-950 text-white">
                            <ShieldAlert
                                className="size-4"
                                aria-hidden="true"
                            />
                        </span>
                        <p className="text-sm font-medium text-zinc-700">
                            Shop đang khóa
                        </p>
                    </div>
                    <div>
                        <p className="text-xl font-semibold tracking-tight text-zinc-950 tabular-nums">
                            {overview?.sellerDebtLockedShopCount ?? '—'}
                        </p>
                        <p className="mt-0.5 text-xs text-zinc-500">
                            Shop bị khóa do chính sách công nợ
                        </p>
                    </div>
                </article>
            </section>

            {/* Bộ lọc chạy server-side; đổi điều kiện trở về trang đầu để không giữ offset của kết quả cũ. */}
            <SellerDebtTable
                items={items}
                shopsById={shopsById}
                page={page}
                pageSize={DEBT_TABLE_PAGE_SIZE}
                total={debtsQuery.data?.total ?? 0}
                isLoading={debtsQuery.isPending}
                isFetching={debtsQuery.isFetching}
                isError={debtsQuery.isError}
                search={search}
                status={status}
                onSearchChange={(value) => {
                    setSearch(value);
                    setPage(1);
                }}
                onStatusChange={(value) => {
                    setStatus(value as AdminSellerWalletDebtFilter);
                    setPage(1);
                }}
                onPageChange={setPage}
            />
        </main>
    );
}

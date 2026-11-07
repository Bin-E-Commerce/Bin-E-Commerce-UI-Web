// Thành phần xử lý COD đã thu; gọi API admin và chỉ bỏ khoản khỏi danh sách sau khi backend ghi nhận thành công.
'use client';

import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { RefreshCw, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CodRemittanceTable } from './CodRemittanceTable';
import { FinanceSectionHeader } from '../shared/FinanceSectionHeader';
import { FinanceTablePagination } from '../shared/FinanceTablePagination';
import { FinanceTableToolbar } from '../shared/FinanceTableToolbar';
import { FINANCE_TABLE_PAGE_SIZE } from '../../constants/finance-pagination.constant';
import {
    confirmAdminCodRemittance,
    getPendingAdminCodRemittances,
} from '@/services/admin/api/finance.api';

// Admin ghi mã tham chiếu cho khoản COD đã thực nhận; thao tác thành công sẽ cập nhật ví và sổ tài chính.
export function CodRemittanceSection() {
    const queryClient = useQueryClient();
    const [references, setReferences] = useState<Record<string, string>>({});
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const remittancesQuery = useQuery({
        queryKey: [
            'admin-cod-remittances',
            page,
            FINANCE_TABLE_PAGE_SIZE,
            search,
        ],
        queryFn: () =>
            getPendingAdminCodRemittances(
                page,
                FINANCE_TABLE_PAGE_SIZE,
                search || undefined,
            ),
        staleTime: 15_000,
    });
    const total = remittancesQuery.data?.total ?? 0;
    const totalPages = Math.max(1, Math.ceil(total / FINANCE_TABLE_PAGE_SIZE));

    // Khi đối soát làm giảm tổng trang, quay về trang cuối còn hợp lệ thay vì giữ danh sách trắng.
    useEffect(() => {
        if (!remittancesQuery.isPending && page > totalPages) {
            setPage(totalPages);
        }
    }, [page, remittancesQuery.isPending, totalPages]);

    // Khóa xác nhận đồng thời trên UI; backend tiếp tục khóa order và dùng source key để bảo vệ retry.
    const confirmMutation = useMutation({
        mutationFn: (input: { orderId: string; reference: string }) =>
            confirmAdminCodRemittance(input.orderId, input.reference),
        onSuccess: async (_result, input) => {
            setReferences((current) => {
                const next = { ...current };
                delete next[input.orderId];
                return next;
            });
            await Promise.all([
                queryClient.invalidateQueries({
                    queryKey: ['admin-cod-remittances'],
                }),
                queryClient.invalidateQueries({ queryKey: ['admin-finance'] }),
            ]);
        },
    });

    return (
        <section className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
            <FinanceSectionHeader
                icon={Truck}
                title="COD chờ đối soát"
                description="Đơn đã hoàn tất sẽ được ghi vào tiền chờ của seller. Chỉ xác nhận khi tiền thu hộ đã về tài khoản nền tảng."
                countLabel={
                    remittancesQuery.isError
                        ? 'Không tải được'
                        : remittancesQuery.isPending
                          ? 'Đang tải…'
                          : `${total} đơn`
                }
                actions={
                    <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        aria-label="Làm mới danh sách COD chờ đối soát"
                        onClick={() => void remittancesQuery.refetch()}
                        disabled={remittancesQuery.isFetching}
                    >
                        <RefreshCw
                            aria-hidden="true"
                            className={
                                remittancesQuery.isFetching
                                    ? 'animate-spin'
                                    : undefined
                            }
                        />
                    </Button>
                }
            />

            <FinanceTableToolbar
                searchValue={search}
                searchLabel="Tìm đơn COD chờ đối soát"
                searchPlaceholder="Tìm theo mã đơn hoặc mã giao dịch"
                onSearchChange={(value) => {
                    // Đổi từ khóa phải tải kết quả từ đầu để không nằm ngoài tổng trang mới.
                    setPage(1);
                    setSearch(value);
                }}
            />

            {remittancesQuery.isPending ? (
                <div className="h-24 animate-pulse bg-zinc-50" />
            ) : remittancesQuery.isError ? (
                <p role="alert" className="px-5 py-8 text-sm text-red-700">
                    Không thể tải COD chờ đối soát. Kiểm tra quyền xem tài chính
                    rồi thử làm mới.
                </p>
            ) : remittancesQuery.data.items.length === 0 ? (
                <p className="px-5 py-8 text-center text-sm text-zinc-500">
                    {search
                        ? 'Không tìm thấy đơn COD phù hợp.'
                        : 'Chưa có đơn COD nào đã hoàn tất cần đối soát.'}
                </p>
            ) : (
                <CodRemittanceTable
                    items={remittancesQuery.data.items}
                    references={references}
                    pendingOrderId={
                        confirmMutation.isPending
                            ? confirmMutation.variables?.orderId
                            : undefined
                    }
                    isPending={confirmMutation.isPending}
                    onReferenceChange={(orderId, value) =>
                        setReferences((current) => ({
                            ...current,
                            [orderId]: value,
                        }))
                    }
                    onConfirm={(orderId, reference) =>
                        confirmMutation.mutate({ orderId, reference })
                    }
                />
            )}

            {!remittancesQuery.isPending &&
            !remittancesQuery.isError &&
            total > 0 ? (
                <FinanceTablePagination
                    page={page}
                    pageSize={FINANCE_TABLE_PAGE_SIZE}
                    total={total}
                    isFetching={remittancesQuery.isFetching}
                    itemLabel="đơn COD chờ đối soát"
                    onPageChange={setPage}
                />
            ) : null}

            {confirmMutation.isError && (
                <p
                    role="alert"
                    className="border-t border-red-100 px-5 py-3 text-sm text-red-700"
                >
                    Không thể xác nhận đối soát COD. Kiểm tra mã giao dịch,
                    quyền đối soát và trạng thái đơn rồi thử lại.
                </p>
            )}
        </section>
    );
}

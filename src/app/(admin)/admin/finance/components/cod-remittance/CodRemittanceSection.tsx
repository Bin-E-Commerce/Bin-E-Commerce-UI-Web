// Thành phần xử lý COD đã thu; gọi API admin và chỉ bỏ khoản khỏi danh sách sau khi backend ghi nhận thành công.
'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CodRemittanceTable } from './CodRemittanceTable';
import {
    confirmAdminCodRemittance,
    getPendingAdminCodRemittances,
} from '@/services/admin/api/finance.api';

// Admin ghi mã tham chiếu cho khoản COD đã thực nhận; thao tác thành công sẽ cập nhật ví và sổ tài chính.
export function CodRemittanceSection() {
    const queryClient = useQueryClient();
    const [references, setReferences] = useState<Record<string, string>>({});
    const remittancesQuery = useQuery({
        queryKey: ['admin-cod-remittances'],
        queryFn: () => getPendingAdminCodRemittances(1, 50),
        staleTime: 15_000,
    });

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
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 px-5 py-4">
                <div>
                    <h2 className="font-semibold text-zinc-950">
                        COD chờ đối soát
                    </h2>
                    <p className="mt-1 text-xs text-zinc-500">
                        Đơn đã hoàn tất sẽ được ghi vào tiền chờ của seller. Chỉ
                        xác nhận khi tiền thu hộ đã về tài khoản nền tảng.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-700">
                        {remittancesQuery.data?.total ?? 0} đơn
                    </span>
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
                </div>
            </div>

            {remittancesQuery.isPending ? (
                <div className="h-24 animate-pulse bg-zinc-50" />
            ) : remittancesQuery.isError ? (
                <p role="alert" className="px-5 py-8 text-sm text-red-700">
                    Không thể tải COD chờ đối soát. Kiểm tra quyền xem tài chính
                    rồi thử làm mới.
                </p>
            ) : remittancesQuery.data.items.length === 0 ? (
                <p className="px-5 py-8 text-center text-sm text-zinc-500">
                    Chưa có đơn COD nào đã hoàn tất cần đối soát.
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

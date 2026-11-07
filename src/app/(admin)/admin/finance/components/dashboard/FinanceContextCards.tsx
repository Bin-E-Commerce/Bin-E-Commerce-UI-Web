// Thẻ hiển thị khoản nạp gần đây và danh tính shop.
// Không sở hữu số liệu tài chính hoặc thay đổi trạng thái giao dịch.
'use client';

import Image from 'next/image';
import { useState } from 'react';
import { useQueries } from '@tanstack/react-query';
import { CalendarDays, Store, Wallet } from 'lucide-react';
import { publicShopService } from '@/services/seller';
import type { FinanceContextCardsProps } from '../../types/dashboard/finance-dashboard.types';
import { formatMoney } from '../../utils/format-finance-money';
import { FinanceSectionHeader } from '../shared/FinanceSectionHeader';
import { FinanceTableToolbar } from '../shared/FinanceTableToolbar';

// Bố cục shop, trạng thái/thời điểm và số tiền thành ba vùng riêng để admin quét nhanh.
// Hồ sơ được tải từ API public bằng UUID shop; nếu không lấy được thì dùng mã shop dự phòng.
// Badge chỉ phản ánh trạng thái do server trả về, không cập nhật hoặc xác nhận giao dịch.
export function FinanceContextCards({ deposits }: FinanceContextCardsProps) {
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState('ALL');
    // Snapshot finance chỉ giữ shopId; truy vấn mỗi shop một lần để các giao dịch dùng chung cache.
    const shopIds = [...new Set(deposits.map((deposit) => deposit.shopId))];
    const shopQueries = useQueries({
        queries: shopIds.map((shopId) => ({
            queryKey: ['admin-finance', 'deposit-shop', shopId],
            queryFn: () => publicShopService.getBySlug(shopId),
            staleTime: 60_000,
            // Hồ sơ chỉ bổ sung nhận diện nên lỗi tải không được trì hoãn nội dung tài chính.
            retry: false,
        })),
    });
    const shopsById = new Map(
        shopIds.map((shopId, index) => [
            shopId,
            shopQueries[index]?.data?.shop,
        ]),
    );
    // Snapshot overview chỉ giữ 10 khoản gần đây; lọc tại client và nêu rõ phạm vi để không ngụ ý đang tìm toàn lịch sử.
    const normalizedSearch = search.toLocaleLowerCase('vi-VN');
    const filteredDeposits = deposits.filter((deposit) => {
        const shopName = shopsById.get(deposit.shopId)?.name ?? '';
        const matchesSearch =
            !normalizedSearch ||
            [
                deposit.id,
                deposit.shopId,
                deposit.amount,
                deposit.status,
                shopName,
            ]
                .join(' ')
                .toLocaleLowerCase('vi-VN')
                .includes(normalizedSearch);
        const matchesStatus = status === 'ALL' || deposit.status === status;
        return matchesSearch && matchesStatus;
    });

    return (
        <article className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm shadow-zinc-950/[0.04]">
            <FinanceSectionHeader
                icon={Wallet}
                title="Nạp ví seller gần đây"
                description="Các khoản nạp ví đã ghi nhận gần đây."
                countLabel={
                    filteredDeposits.length === deposits.length
                        ? `${deposits.length} giao dịch gần đây`
                        : `${filteredDeposits.length} / ${deposits.length} giao dịch`
                }
            />

            <FinanceTableToolbar
                searchValue={search}
                searchLabel="Tìm giao dịch nạp ví gần đây"
                searchPlaceholder="Tìm theo shop, mã giao dịch hoặc số tiền"
                onSearchChange={setSearch}
                statusValue={status}
                statusLabel="Lọc trạng thái giao dịch nạp"
                statusOptions={[
                    { value: 'ALL', label: 'Tất cả trạng thái' },
                    { value: 'PAID', label: 'Đã nạp' },
                    { value: 'PENDING', label: 'Đang xử lý' },
                    { value: 'FAILED', label: 'Thất bại' },
                    { value: 'EXPIRED', label: 'Hết hạn' },
                ]}
                onStatusChange={setStatus}
            />

            {filteredDeposits.length ? (
                <ul className="divide-y divide-zinc-100">
                    {filteredDeposits.map((deposit) => {
                        const createdAt = new Date(deposit.createdAt);
                        const shop = shopsById.get(deposit.shopId);
                        const shopReference = deposit.shopId
                            .slice(0, 8)
                            .toUpperCase();
                        // Dịch trạng thái đã biết; mã lạ được giữ nguyên để admin vẫn đối soát được.
                        const statusLabel =
                            deposit.status === 'PAID'
                                ? 'Đã nạp'
                                : deposit.status === 'PENDING'
                                  ? 'Đang xử lý'
                                  : deposit.status === 'FAILED'
                                    ? 'Thất bại'
                                    : deposit.status === 'EXPIRED'
                                      ? 'Hết hạn'
                                      : deposit.status;
                        // Tông xanh xác nhận đã nạp, đỏ báo lỗi cuối cùng, còn giao dịch chưa kết thúc dùng màu hổ phách.
                        const statusTone =
                            deposit.status === 'PAID'
                                ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                                : deposit.status === 'FAILED' ||
                                    deposit.status === 'EXPIRED'
                                  ? 'border-red-200 bg-red-50 text-red-700'
                                  : 'border-amber-200 bg-amber-50 text-amber-800';

                        return (
                            <li
                                key={deposit.id}
                                className="grid gap-4 px-5 py-4 transition-colors hover:bg-zinc-50/70 sm:grid-cols-[minmax(0,1.4fr)_minmax(10rem,0.9fr)_minmax(9rem,auto)] sm:items-center sm:px-6"
                            >
                                <div className="flex min-w-0 items-center gap-3.5">
                                    <span className="relative flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-50 text-zinc-500 shadow-sm ring-4 ring-zinc-100/70">
                                        {shop?.logoUrl ? (
                                            <Image
                                                src={shop.logoUrl}
                                                alt={`Logo ${shop.name}`}
                                                fill
                                                sizes="48px"
                                                className="object-cover"
                                            />
                                        ) : (
                                            <Store
                                                className="size-5"
                                                aria-hidden="true"
                                            />
                                        )}
                                    </span>
                                    <div className="min-w-0">
                                        <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-zinc-400">
                                            Cửa hàng
                                        </p>
                                        <p className="mt-1 truncate text-sm font-semibold text-zinc-900">
                                            {shop?.name ??
                                                `Shop #${shopReference}`}
                                        </p>
                                        <p className="mt-0.5 truncate text-xs text-zinc-500">
                                            {shop?.slug
                                                ? `@${shop.slug}`
                                                : `Mã shop ${shopReference}`}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex min-w-0 flex-col items-start gap-2 pl-[3.875rem] sm:pl-0">
                                    <span
                                        className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${statusTone}`}
                                    >
                                        {statusLabel}
                                    </span>
                                    <p className="inline-flex items-center gap-1.5 text-xs text-zinc-500">
                                        <CalendarDays
                                            className="size-3.5 shrink-0"
                                            aria-hidden="true"
                                        />
                                        {createdAt.toLocaleDateString('vi-VN')}{' '}
                                        lúc{' '}
                                        {createdAt.toLocaleTimeString('vi-VN', {
                                            hour: '2-digit',
                                            minute: '2-digit',
                                        })}
                                    </p>
                                </div>

                                <div className="border-t border-zinc-100 pt-3 pl-[3.875rem] sm:border-l sm:border-t-0 sm:py-1 sm:pl-5 sm:text-right">
                                    <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-zinc-400">
                                        Số tiền nạp
                                    </p>
                                    <p className="mt-1 font-semibold tabular-nums text-zinc-950">
                                        {formatMoney(deposit.amount)}
                                    </p>
                                </div>
                            </li>
                        );
                    })}
                </ul>
            ) : (
                <div className="flex items-center gap-3 px-5 py-6 sm:px-6">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-zinc-100 text-zinc-500">
                        <Wallet className="size-4" aria-hidden="true" />
                    </span>
                    <div>
                        <p className="text-sm font-medium text-zinc-800">
                            {deposits.length && (search || status !== 'ALL')
                                ? 'Không tìm thấy giao dịch phù hợp'
                                : 'Chưa có giao dịch nạp'}
                        </p>
                        <p className="mt-1 text-xs text-zinc-500">
                            {deposits.length && (search || status !== 'ALL')
                                ? 'Thử đổi từ khóa hoặc trạng thái lọc.'
                                : 'Chỉ các giao dịch nạp gần đây sẽ hiển thị tại đây.'}
                        </p>
                    </div>
                </div>
            )}
        </article>
    );
}

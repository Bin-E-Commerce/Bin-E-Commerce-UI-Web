// Bảng công nợ seller trình bày shop, khoản nợ, hạn và trạng thái; không thực hiện thao tác thay đổi số dư.
'use client';

import { AlertCircle, CalendarClock, Landmark, Store } from 'lucide-react';
import type { SellerDebtTableProps } from '../../types/debts/seller-debt-table.types';
import { formatMoney } from '../../utils/format-finance-money';
import { formatSellerDebtDate } from '../../utils/debts/format-seller-debt-date.util';
import { FinanceSectionHeader } from '../shared/FinanceSectionHeader';
import { FinanceTablePagination } from '../shared/FinanceTablePagination';
import { FinanceTableToolbar } from '../shared/FinanceTableToolbar';

// Mỗi hàng chỉ dùng snapshot từ Order Service; hồ sơ shop public có thể lỗi nên mã shop vẫn luôn là fallback.
export function SellerDebtTable({
    items,
    shopsById,
    page,
    pageSize,
    total,
    isLoading,
    isFetching,
    isError,
    search,
    status,
    onSearchChange,
    onStatusChange,
    onPageChange,
}: SellerDebtTableProps) {
    return (
        <section className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm shadow-zinc-950/[0.04]">
            <FinanceSectionHeader
                icon={Landmark}
                title="Danh sách công nợ"
                description="Các shop đang có số dư âm hoặc còn marker khóa tài chính."
                countLabel={
                    isError
                        ? 'Không tải được'
                        : isLoading
                          ? 'Đang tải…'
                          : `${total} shop`
                }
            />
            <FinanceTableToolbar
                searchValue={search}
                searchLabel="Tìm shop có công nợ"
                searchPlaceholder="Tìm theo mã shop (UUID)"
                onSearchChange={onSearchChange}
                statusValue={status}
                statusLabel="Lọc tình trạng công nợ"
                statusOptions={[
                    { value: 'ALL', label: 'Tất cả trạng thái' },
                    { value: 'DEBT', label: 'Đang có công nợ' },
                    { value: 'OVERDUE', label: 'Quá hạn' },
                    { value: 'LOCKED', label: 'Đang khóa' },
                ]}
                onStatusChange={onStatusChange}
            />

            {isError ? (
                <p
                    role="alert"
                    className="px-5 py-12 text-center text-sm text-rose-700"
                >
                    Không tải được danh sách công nợ. Hãy bấm Làm mới để thử
                    lại.
                </p>
            ) : isLoading ? (
                <div
                    role="status"
                    aria-label="Đang tải danh sách công nợ"
                    className="space-y-3 px-5 py-5"
                >
                    {[1, 2, 3].map((item) => (
                        <div
                            key={item}
                            className="h-16 animate-pulse rounded-xl bg-zinc-100"
                        />
                    ))}
                </div>
            ) : items.length === 0 ? (
                <div className="flex flex-col items-center px-5 py-14 text-center">
                    <span className="flex size-12 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-500 ring-1 ring-zinc-200">
                        <Store className="size-5" aria-hidden="true" />
                    </span>
                    <p className="mt-3 text-sm font-semibold text-zinc-800">
                        {search || status !== 'ALL'
                            ? 'Không tìm thấy shop phù hợp'
                            : 'Hiện không có shop công nợ'}
                    </p>
                    <p className="mt-1 max-w-md text-xs leading-5 text-zinc-500">
                        {search || status !== 'ALL'
                            ? 'Thử đổi mã shop hoặc trạng thái lọc.'
                            : 'Shop có số dư âm hoặc đang khóa tài chính sẽ xuất hiện tại đây.'}
                    </p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[860px] text-left text-sm">
                        <thead className="bg-zinc-50/80 text-[10px] font-semibold uppercase tracking-[0.12em] text-zinc-500">
                            <tr>
                                <th className="w-[32%] px-5 py-3.5">Shop</th>
                                <th className="w-[19%] px-5 py-3.5">
                                    Khoản nợ
                                </th>
                                <th className="w-[19%] px-5 py-3.5">
                                    Hạn thanh toán
                                </th>
                                <th className="w-[17%] px-5 py-3.5">
                                    Trạng thái
                                </th>
                                <th className="w-[13%] px-5 py-3.5">
                                    Cập nhật
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100/80">
                            {items.map((item) => {
                                const shop = shopsById.get(item.shopId);
                                const shopReference = item.shopId
                                    .slice(0, 8)
                                    .toUpperCase();

                                return (
                                    <tr
                                        key={item.shopId}
                                        className="transition-colors hover:bg-zinc-50/70"
                                    >
                                        <td className="px-5 py-4 align-middle">
                                            <div className="flex min-w-0 items-center gap-3">
                                                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-zinc-200 bg-zinc-50 text-zinc-600">
                                                    <Store
                                                        className="size-4"
                                                        aria-hidden="true"
                                                    />
                                                </span>
                                                <div className="min-w-0">
                                                    <p className="truncate font-semibold text-zinc-900">
                                                        {shop?.name ??
                                                            `Shop #${shopReference}`}
                                                    </p>
                                                    <p className="mt-1 truncate font-mono text-[11px] text-zinc-500">
                                                        {shop?.slug
                                                            ? `@${shop.slug}`
                                                            : item.shopId}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4 align-middle">
                                            <p className="font-semibold tabular-nums text-rose-700">
                                                {formatMoney(item.debtBalance)}
                                            </p>
                                            {item.isAtLimit ? (
                                                <p className="mt-1 text-[11px] text-amber-700">
                                                    Đã chạm ngưỡng khóa
                                                </p>
                                            ) : null}
                                        </td>
                                        <td className="px-5 py-4 align-middle">
                                            <p className="inline-flex items-center gap-1.5 text-xs text-zinc-600">
                                                <CalendarClock
                                                    className="size-3.5 shrink-0 text-zinc-400"
                                                    aria-hidden="true"
                                                />
                                                {formatSellerDebtDate(
                                                    item.dueAt,
                                                )}
                                            </p>
                                        </td>
                                        <td className="px-5 py-4 align-middle">
                                            {/* Nợ quá hạn là cảnh báo chính; marker khóa được hiển thị riêng để không che mất từng trạng thái. */}
                                            <div className="flex flex-wrap gap-1.5">
                                                <span
                                                    className={`inline-flex min-h-7 items-center rounded-full border px-2.5 py-1 text-[11px] font-medium ${item.isOverdue ? 'border-rose-200 bg-rose-50 text-rose-700' : item.isAtLimit ? 'border-amber-200 bg-amber-50 text-amber-800' : 'border-zinc-200 bg-zinc-50 text-zinc-600'}`}
                                                >
                                                    {item.isOverdue
                                                        ? 'Quá hạn'
                                                        : item.isAtLimit
                                                          ? 'Đạt ngưỡng'
                                                          : 'Trong hạn'}
                                                </span>
                                                {item.financeLockedAt ? (
                                                    <span className="inline-flex min-h-7 items-center gap-1 rounded-full border border-zinc-300 bg-zinc-100 px-2.5 py-1 text-[11px] font-medium text-zinc-800">
                                                        <AlertCircle
                                                            className="size-3"
                                                            aria-hidden="true"
                                                        />
                                                        Đang khóa
                                                    </span>
                                                ) : null}
                                            </div>
                                        </td>
                                        <td className="px-5 py-4 align-middle text-xs text-zinc-600">
                                            {formatSellerDebtDate(
                                                item.updatedAt,
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {!isError && !isLoading && items.length > 0 ? (
                <FinanceTablePagination
                    page={page}
                    pageSize={pageSize}
                    total={total}
                    isFetching={isFetching}
                    itemLabel="shop"
                    onPageChange={onPageChange}
                />
            ) : null}
        </section>
    );
}

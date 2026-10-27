// Bảng yêu cầu rút tiền chỉ hiển thị thông tin tài khoản đã che và mở chi tiết theo lựa chọn của admin.
'use client';

import { Button } from '@/components/ui/button';
import type { SellerWithdrawalsSectionProps } from '../../types/admin-finance-page.types';
import { formatMoney } from '../../utils/format-finance-money';

// Danh sách rút tiền giữ thông tin tóm tắt và phát id để trang tải dữ liệu nhạy cảm khi mở chi tiết.
export function SellerWithdrawalsSection({
    withdrawals,
    pendingWithdrawals,
    onSelectWithdrawal,
}: SellerWithdrawalsSectionProps) {
    return (
        <section className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 px-5 py-4">
                <div>
                    <h2 className="font-semibold text-zinc-950">
                        Yêu cầu rút tiền seller
                    </h2>
                    <p className="mt-1 text-xs text-zinc-500">
                        {pendingWithdrawals} yêu cầu đang chờ hoặc xử lý; tiền
                        đã giữ chỗ trong ví seller.
                    </p>
                </div>
                <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-700">
                    {withdrawals.length} gần nhất
                </span>
            </div>
            {withdrawals.length === 0 ? (
                <p className="px-5 py-10 text-center text-sm text-zinc-500">
                    Chưa có yêu cầu rút tiền.
                </p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-zinc-50 text-xs uppercase tracking-wide text-zinc-500">
                            <tr>
                                <th className="px-5 py-3">Số tiền</th>
                                <th className="px-5 py-3">Tài khoản nhận</th>
                                <th className="px-5 py-3">Trạng thái</th>
                                <th className="px-5 py-3">Ngày gửi</th>
                                <th className="px-5 py-3 text-right">
                                    Thao tác
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100">
                            {withdrawals.map((withdrawal) => (
                                <tr key={withdrawal.id}>
                                    <td className="px-5 py-4 font-semibold tabular-nums">
                                        {formatMoney(withdrawal.amount)}
                                    </td>
                                    <td className="px-5 py-4">
                                        <p className="font-medium">
                                            {withdrawal.bankName}
                                        </p>
                                        <p className="mt-1 text-xs text-zinc-500">
                                            {withdrawal.accountHolder} ·{' '}
                                            {withdrawal.accountNumberMasked}
                                        </p>
                                    </td>
                                    <td className="px-5 py-4">
                                        <span className="rounded-full border border-zinc-200 px-2.5 py-1 text-xs">
                                            {withdrawal.status === 'PROCESSING'
                                                ? 'Chờ chuyển khoản / đối soát'
                                                : withdrawal.status}
                                        </span>
                                    </td>
                                    <td className="px-5 py-4 text-zinc-500">
                                        {new Date(
                                            withdrawal.createdAt,
                                        ).toLocaleString('vi-VN')}
                                    </td>
                                    <td className="px-5 py-4 text-right">
                                        <Button
                                            type="button"
                                            size="sm"
                                            variant="outline"
                                            onClick={() =>
                                                onSelectWithdrawal(
                                                    withdrawal.id,
                                                )
                                            }
                                        >
                                            Xem / xử lý
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </section>
    );
}

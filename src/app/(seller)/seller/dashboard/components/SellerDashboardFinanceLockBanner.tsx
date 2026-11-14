// Cảnh báo khóa tài chính đặt cạnh số liệu dashboard và dẫn seller tới nơi xử lý công nợ.

import Link from 'next/link';
import { ArrowUpRight, CircleAlert, LockKeyhole } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';
import type { SellerDashboardFinanceLockBannerProps } from '../types/seller-dashboard-finance-lock.types';
import { formatDashboardMoney } from '../utils/dashboard-formatters';

// Giải thích trạng thái khóa, hiển thị số nợ nếu ví tải được và giữ đường xử lý luôn sẵn có.
export function SellerDashboardFinanceLockBanner({
    debtBalance,
}: SellerDashboardFinanceLockBannerProps) {
    const numericDebt = Number(debtBalance ?? 0);
    const formattedDebt = Number.isFinite(numericDebt)
        ? formatDashboardMoney(numericDebt)
        : null;

    return (
        <section
            role="status"
            className="relative overflow-hidden rounded-2xl border border-rose-200 bg-gradient-to-r from-rose-50 via-white to-red-50/70 shadow-[0_8px_24px_-18px_rgba(190,18,60,0.45)]"
        >
            <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
                <div className="flex min-w-0 items-start gap-3">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-rose-700 to-red-600 text-white shadow-sm shadow-rose-900/20">
                        <LockKeyhole className="size-5" aria-hidden="true" />
                    </span>
                    <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                            <h2 className="font-semibold text-rose-950">
                                Gian hàng đang tạm khóa do công nợ
                            </h2>
                            <span className="rounded-full border border-rose-200 bg-rose-100/80 px-2.5 py-1 text-[11px] font-semibold text-rose-800">
                                Cần thanh toán
                            </span>
                        </div>
                        <p className="mt-1 text-sm leading-5 text-zinc-600">
                            {formattedDebt && numericDebt > 0 ? (
                                <>
                                    Khoản cần thanh toán hiện tại:{' '}
                                    <strong className="font-semibold text-rose-700">
                                        {formattedDebt}
                                    </strong>
                                    .{' '}
                                </>
                            ) : (
                                'Xem số dư và hạn thanh toán trong mục tài chính. '
                            )}
                            Vào Tài chính → Nạp tiền, nạp đủ công nợ và hoàn
                            tất Pay2S. Shop tự mở lại sau khi giao dịch được xác
                            nhận; nếu vừa trả, bấm “Làm mới” sau khoảng một
                            phút.
                        </p>
                        <p className="mt-2 flex items-center gap-1.5 text-xs text-rose-800/75">
                            <CircleAlert
                                className="size-3.5 shrink-0"
                                aria-hidden="true"
                            />
                            Trạng thái đăng nhập tài khoản và trạng thái hoạt
                            động của shop được quản lý riêng.
                        </p>
                    </div>
                </div>
                <Link
                    href="/seller/finance"
                    className={buttonVariants({
                        variant: 'destructiveSolid',
                        className: 'shrink-0 shadow-sm shadow-rose-900/15',
                    })}
                >
                    Xem công nợ
                    <ArrowUpRight aria-hidden="true" />
                </Link>
            </div>
        </section>
    );
}

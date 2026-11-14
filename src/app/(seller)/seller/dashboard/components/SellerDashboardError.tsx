// Trình bày nguyên nhân dashboard bị chặn cùng cách xử lý phù hợp và cho phép seller kiểm tra lại.

import Link from 'next/link';
import {
    ArrowUpRight,
    CircleAlert,
    LoaderCircle,
    LockKeyhole,
    RefreshCw,
    TriangleAlert,
} from 'lucide-react';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { formatDashboardMoney } from '../utils/dashboard-formatters';
import type { SellerDashboardErrorProps } from '../types/seller-dashboard-error.types';

// Giải thích lỗi tải dashboard và cho phép yêu cầu lấy snapshot lại.
export function SellerDashboardError({
    state,
    debtBalance,
    onRetry,
    isRetrying,
}: SellerDashboardErrorProps) {
    const debtAmount = Number(debtBalance ?? 0);
    const formattedDebt = Number.isFinite(debtAmount)
        ? formatDashboardMoney(debtAmount)
        : null;

    // Khóa công nợ là trạng thái nghiệp vụ có đường khắc phục cụ thể; không trình bày như lỗi hệ thống.
    if (state === 'finance-locked') {
        return (
            <Card className="border-rose-200 bg-gradient-to-br from-white via-rose-50/60 to-amber-50/70 shadow-sm">
                <CardContent className="p-5 sm:p-7">
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                        <div className="flex min-w-0 items-start gap-4">
                            <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-rose-700 text-white shadow-sm shadow-rose-900/20">
                                <LockKeyhole
                                    className="size-5"
                                    aria-hidden="true"
                                />
                            </span>
                            <div className="min-w-0">
                                <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-200 bg-white px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-rose-800">
                                    <CircleAlert
                                        className="size-3.5"
                                        aria-hidden="true"
                                    />
                                    Shop đang bị khóa
                                </span>
                                <h1 className="mt-3 text-xl font-semibold tracking-tight text-zinc-950 sm:text-2xl">
                                    Gian hàng tạm khóa do công nợ quá hạn
                                </h1>
                                <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-600">
                                    {formattedDebt && debtAmount > 0
                                        ? `Khoản cần thanh toán: ${formattedDebt}. `
                                        : 'Shop đang có công nợ cần xử lý. '}
                                    Tài khoản vẫn đăng nhập được, nhưng shop chưa
                                    thể tiếp tục hoạt động.
                                </p>

                                <ol className="mt-5 grid gap-3 sm:grid-cols-3">
                                    <li className="rounded-xl border border-zinc-200 bg-white/90 p-3">
                                        <span className="flex size-7 items-center justify-center rounded-lg bg-zinc-950 text-xs font-semibold text-white">
                                            1
                                        </span>
                                        <p className="mt-2 text-sm font-semibold text-zinc-900">
                                            Mở mục Tài chính
                                        </p>
                                        <p className="mt-1 text-xs leading-5 text-zinc-500">
                                            Kiểm tra khoản nợ và hạn thanh toán.
                                        </p>
                                    </li>
                                    <li className="rounded-xl border border-zinc-200 bg-white/90 p-3">
                                        <span className="flex size-7 items-center justify-center rounded-lg bg-zinc-950 text-xs font-semibold text-white">
                                            2
                                        </span>
                                        <p className="mt-2 text-sm font-semibold text-zinc-900">
                                            Thanh toán hết công nợ
                                        </p>
                                        <p className="mt-1 text-xs leading-5 text-zinc-500">
                                            Nạp vào ví shop đủ khoản công nợ đang
                                            hiển thị rồi hoàn tất Pay2S.
                                        </p>
                                    </li>
                                    <li className="rounded-xl border border-zinc-200 bg-white/90 p-3">
                                        <span className="flex size-7 items-center justify-center rounded-lg bg-zinc-950 text-xs font-semibold text-white">
                                            3
                                        </span>
                                        <p className="mt-2 text-sm font-semibold text-zinc-900">
                                            Chờ hệ thống mở lại shop
                                        </p>
                                        <p className="mt-1 text-xs leading-5 text-zinc-500">
                                            Sau khi thanh toán được xác nhận,
                                            trạng thái sẽ tự cập nhật.
                                        </p>
                                    </li>
                                </ol>
                                <p className="mt-3 text-xs leading-5 text-zinc-500">
                                    Vừa thanh toán? Bấm “Kiểm tra lại”; việc đồng
                                    bộ mở khóa có thể mất khoảng một phút.
                                </p>
                            </div>
                        </div>

                        <div className="flex shrink-0 flex-col gap-2 sm:flex-row lg:flex-col">
                            <Link
                                href="/seller/finance"
                                className={buttonVariants({
                                    className: 'h-9 justify-center px-4',
                                })}
                            >
                                Xem công nợ và thanh toán
                                <ArrowUpRight aria-hidden="true" />
                            </Link>
                            <Button
                                type="button"
                                variant="outline"
                                className="h-9 bg-white"
                                onClick={onRetry}
                                disabled={isRetrying}
                            >
                                <RefreshCw
                                    className={
                                        isRetrying ? 'animate-spin' : ''
                                    }
                                />
                                Kiểm tra lại
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    // 403 cần đợi API ví xác nhận công nợ trước khi hướng seller sang đúng bước tiếp theo.
    if (state === 'checking-shop-status') {
        return (
            <Card className="border-amber-200 bg-white shadow-sm">
                <CardContent className="flex min-h-64 flex-col items-center justify-center px-6 text-center">
                    <span className="flex size-12 items-center justify-center rounded-2xl bg-zinc-950 text-white">
                        <LoaderCircle
                            className="size-5 animate-spin"
                            aria-hidden="true"
                        />
                    </span>
                    <h1 className="mt-5 text-xl font-semibold text-zinc-950">
                        Đang kiểm tra trạng thái gian hàng
                    </h1>
                    <p className="mt-2 max-w-md text-sm leading-6 text-zinc-500">
                        Dashboard đang đối chiếu trạng thái shop với thông tin
                        công nợ để chỉ đúng cách xử lý.
                    </p>
                </CardContent>
            </Card>
        );
    }

    // Nếu không có khóa nợ đã xác nhận, hướng người bán kiểm tra ví hoặc nhờ admin xem trạng thái shop.
    if (state === 'shop-restricted' || state === 'status-unconfirmed') {
        const hasConfirmedRestriction = state === 'shop-restricted';

        return (
            <Card className="border-amber-200 bg-gradient-to-br from-white to-amber-50/60 shadow-sm">
                <CardContent className="flex min-h-72 flex-col items-center justify-center px-6 py-8 text-center">
                    <span className="flex size-12 items-center justify-center rounded-2xl bg-zinc-950 text-white">
                        <LockKeyhole className="size-5" aria-hidden="true" />
                    </span>
                    <h1 className="mt-5 text-xl font-semibold text-zinc-950">
                        {hasConfirmedRestriction
                            ? 'Shop chưa được phép hoạt động'
                            : 'Chưa xác định được lý do khóa shop'}
                    </h1>
                    <p className="mt-2 max-w-xl text-sm leading-6 text-zinc-600">
                        {hasConfirmedRestriction
                            ? 'Ví hiện không ghi nhận khóa do công nợ. Nếu shop đã thanh toán hoặc không có khoản nợ, hãy liên hệ quản trị viên để kiểm tra trạng thái vận hành.'
                            : 'Không tải được trạng thái ví để xác nhận công nợ. Hãy kiểm tra trang tài chính; nếu đã thanh toán mà shop vẫn khóa, liên hệ quản trị viên.'}
                    </p>
                    <div className="mt-5 flex flex-col gap-2 sm:flex-row">
                        <Link
                            href="/seller/finance"
                            className={buttonVariants({
                                className: 'justify-center',
                            })}
                        >
                            Kiểm tra công nợ
                            <ArrowUpRight aria-hidden="true" />
                        </Link>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onRetry}
                            disabled={isRetrying}
                        >
                            <RefreshCw
                                className={isRetrying ? 'animate-spin' : ''}
                            />
                            Thử lại
                        </Button>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card
            size="sm"
            className="border-slate-200 bg-gradient-to-br from-white via-slate-50/50 to-slate-100/70 shadow-sm"
        >
            <CardContent className="flex min-h-64 flex-col items-center justify-center px-6 text-center">
                <span className="flex size-12 items-center justify-center rounded-2xl bg-zinc-950 text-white">
                    <TriangleAlert className="size-5" />
                </span>
                <h1 className="mt-5 text-xl font-semibold text-zinc-950">
                    Chưa thể tải dashboard
                </h1>
                <p className="mt-2 max-w-md text-sm leading-6 text-zinc-500">
                    Một dịch vụ dữ liệu của Seller Center đang tạm thời không
                    phản hồi. Vui lòng thử lại sau ít phút.
                </p>
                <Button
                    type="button"
                    className="mt-5"
                    onClick={onRetry}
                    disabled={isRetrying}
                >
                    <RefreshCw className={isRetrying ? 'animate-spin' : ''} />
                    Thử lại
                </Button>
            </CardContent>
        </Card>
    );
}

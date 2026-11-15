// Màn hình Bin hiển thị QR Pay2S, hạn cố định phía server và thao tác hủy/thử lại cho đơn Customer.

'use client';

import { useEffect, useState, type MouseEvent } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { QRCodeSVG } from 'qrcode.react';
import {
    ArrowLeft,
    BadgeCheck,
    Building2,
    Check,
    CheckCircle2,
    Clock3,
    Copy,
    CreditCard,
    ExternalLink,
    LoaderCircle,
    PackageCheck,
    QrCode,
    RefreshCw,
    ShieldCheck,
    XCircle,
} from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { usePay2sPaymentPage } from '@/app/(user)/profile/orders/hooks/use-pay2s-payment-page';

// Giữ số tiền từ backend và chỉ định dạng cách hiển thị tại trang thanh toán.
function formatMoney(value: string): string {
    return `${Number(value).toLocaleString('vi-VN')} ₫`;
}

// Hiển thị countdown từ timestamp tuyệt đối để reload không cộng lại thời gian thanh toán.
function formatCountdown(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
}

// Trang thanh toán lấy trạng thái Pay2S server-side, không tin vào query string hay giá trị browser lưu.
export function Pay2sPaymentPageContent() {
    const params = useParams<{ orderId: string }>();
    const router = useRouter();
    const orderId = params.orderId;
    const { paymentQuery, cancelMutation, retryMutation } =
        usePay2sPaymentPage(orderId);
    const [now, setNow] = useState<number | null>(null);
    const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
    const payment = paymentQuery.data;

    // Khởi tạo giờ sau hydration; interval chỉ dùng để render còn hạn, API vẫn là nguồn quyết định trạng thái.
    useEffect(() => {
        setNow(Date.now());
        const timer = window.setInterval(() => setNow(Date.now()), 1_000);
        return () => window.clearInterval(timer);
    }, []);

    // Sao chép thông tin chuyển khoản từ response đã được server allowlist; lỗi quyền clipboard được báo rõ.
    async function copyPaymentValue(value: string | null, label: string) {
        if (!value) return;
        try {
            await navigator.clipboard.writeText(value);
            toast.success(`Đã sao chép ${label.toLowerCase()}.`);
        } catch {
            toast.error(
                'Không thể sao chép. Vui lòng chọn và sao chép thủ công.',
            );
        }
    }

    // Giữ dialog mở khi backend/provider từ chối hủy để người dùng không hiểu nhầm order đã được đóng.
    function confirmCancelPayment(event: MouseEvent<HTMLButtonElement>): void {
        event.preventDefault();
        if (cancelMutation.isPending) return;
        cancelMutation.mutate(undefined, {
            onSuccess: () => setCancelDialogOpen(false),
        });
    }

    if (paymentQuery.isPending) {
        return (
            <main className="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:px-6">
                <Skeleton className="h-10 w-56 rounded-xl" />
                <Skeleton className="h-[620px] rounded-[2rem]" />
            </main>
        );
    }

    if (paymentQuery.isError || !payment) {
        return (
            <main className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
                <section className="rounded-3xl border border-zinc-200 bg-white p-8 text-center shadow-sm">
                    <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-600">
                        <CreditCard className="size-7" aria-hidden="true" />
                    </div>
                    <h1 className="mt-5 text-xl font-bold text-zinc-950">
                        Không thể tải thông tin thanh toán
                    </h1>
                    <p className="mt-2 text-sm leading-6 text-zinc-500">
                        Vui lòng thử lại hoặc mở chi tiết đơn hàng để kiểm tra
                        trạng thái.
                    </p>
                    <div className="mt-6 flex flex-wrap justify-center gap-3">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => void paymentQuery.refetch()}
                        >
                            <RefreshCw
                                className="mr-2 size-4"
                                aria-hidden="true"
                            />
                            Tải lại
                        </Button>
                        <Button
                            type="button"
                            onClick={() =>
                                router.push(`/profile/orders/${orderId}`)
                            }
                        >
                            Xem đơn hàng
                        </Button>
                    </div>
                </section>
            </main>
        );
    }

    const isPending = payment.status === 'PENDING';
    const isRetryable = payment.status === 'RETRYABLE';
    const hasOpenOrder = isPending || isRetryable;
    const secondsLeft =
        payment.expiresAt && now !== null
            ? Math.max(
                  0,
                  Math.ceil(
                      (new Date(payment.expiresAt).getTime() - now) / 1_000,
                  ),
              )
            : null;
    const qrValue = payment.qrData ?? payment.qrUrl;
    // Chỉ cho quét QR khi server còn hạn; bộ đếm client không tự chốt order nhưng ngăn thanh toán vào phiên đã hết giờ.
    const canDisplayPayment =
        isPending && secondsLeft !== null && secondsLeft > 0;

    return (
        <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-10">
            <Link
                href={`/profile/orders/${orderId}`}
                className="mb-6 inline-flex items-center gap-2 rounded-lg text-sm font-medium text-zinc-600 transition hover:text-zinc-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400"
            >
                <ArrowLeft className="size-4" aria-hidden="true" />
                Quay lại chi tiết đơn hàng
            </Link>

            <section className="overflow-hidden rounded-[2rem] border border-zinc-200 bg-white shadow-[0_20px_70px_-40px_rgba(24,24,27,0.35)]">
                <header className="flex flex-col gap-5 border-b border-zinc-100 bg-gradient-to-br from-zinc-50 via-white to-indigo-50/50 px-5 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-8 sm:py-8">
                    <div className="flex items-start gap-4">
                        <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-zinc-950 text-white shadow-sm">
                            <QrCode className="size-6" aria-hidden="true" />
                        </div>
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-400">
                                BIN E-COMMERCE · PAY2S
                            </p>
                            <h1 className="mt-1 text-2xl font-bold tracking-tight text-zinc-950 sm:text-3xl">
                                Thanh toán đơn hàng
                            </h1>
                            <p className="mt-2 text-sm text-zinc-500">
                                Mã đơn{' '}
                                <span className="font-semibold text-zinc-700">
                                    {payment.orderNumber}
                                </span>
                            </p>
                        </div>
                    </div>
                    <div className="rounded-2xl border border-zinc-200 bg-white px-5 py-3 sm:min-w-48 sm:text-right">
                        <p className="text-xs font-medium text-zinc-500">
                            Tổng thanh toán
                        </p>
                        <p className="mt-1 text-2xl font-bold tracking-tight text-zinc-950">
                            {formatMoney(payment.amount)}
                        </p>
                    </div>
                </header>

                <div className="p-5 sm:p-8">
                    {isPending && secondsLeft !== 0 ? (
                        <div className="mb-6 flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-4 text-emerald-950">
                            <CheckCircle2
                                className="mt-0.5 size-5 shrink-0 text-emerald-700"
                                aria-hidden="true"
                            />
                            <div>
                                <p className="font-semibold">
                                    Đang chờ xác nhận thanh toán
                                </p>
                                <p className="mt-1 text-sm leading-6 text-emerald-900/75">
                                    Trang sẽ tự cập nhật khi Pay2S gửi kết quả.
                                    Bạn có thể giữ trang này mở trong lúc chuyển
                                    khoản.
                                </p>
                            </div>
                        </div>
                    ) : null}

                    {isPending && secondsLeft === 0 ? (
                        <div className="mb-6 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4 text-amber-950">
                            <Clock3
                                className="mt-0.5 size-5 shrink-0 text-amber-700"
                                aria-hidden="true"
                            />
                            <div>
                                <p className="font-semibold">
                                    Đang cập nhật phiên thanh toán
                                </p>
                                <p className="mt-1 text-sm leading-6 text-amber-900/75">
                                    Thời hạn đã kết thúc. Vui lòng không chuyển
                                    khoản theo mã QR này; hệ thống đang đồng bộ
                                    trạng thái đơn hàng.
                                </p>
                            </div>
                        </div>
                    ) : null}

                    {payment.status === 'PAID' ? (
                        <div className="mb-6 flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-4 text-emerald-950">
                            <BadgeCheck
                                className="mt-0.5 size-5 shrink-0 text-emerald-700"
                                aria-hidden="true"
                            />
                            <div>
                                <p className="font-semibold">
                                    Thanh toán thành công
                                </p>
                                <p className="mt-1 text-sm text-emerald-900/75">
                                    Đơn hàng đã được xác nhận trên Bin.
                                </p>
                            </div>
                        </div>
                    ) : null}

                    {payment.status === 'REFUND_PENDING' ? (
                        <div className="mb-6 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4 text-amber-950">
                            <Clock3
                                className="mt-0.5 size-5 shrink-0 text-amber-700"
                                aria-hidden="true"
                            />
                            <div>
                                <p className="font-semibold">
                                    Đã nhận thanh toán muộn
                                </p>
                                <p className="mt-1 text-sm leading-6 text-amber-900/75">
                                    Đơn đã đóng trước khi Pay2S xác nhận; khoản
                                    tiền đang chờ xử lý hoàn.
                                </p>
                            </div>
                        </div>
                    ) : null}

                    {payment.status === 'REFUNDED' ? (
                        <div className="mb-6 flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-4 text-emerald-950">
                            <Check
                                className="mt-0.5 size-5 shrink-0 text-emerald-700"
                                aria-hidden="true"
                            />
                            <div>
                                <p className="font-semibold">
                                    Khoản thanh toán đã được hoàn
                                </p>
                                <p className="mt-1 text-sm text-emerald-900/75">
                                    Bạn có thể xem chi tiết hoàn tiền trong đơn
                                    hàng.
                                </p>
                            </div>
                        </div>
                    ) : null}

                    {payment.status === 'CANCELLED' ||
                    payment.status === 'EXPIRED' ? (
                        <div className="mb-6 flex items-start gap-3 rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-4 text-zinc-900">
                            <XCircle
                                className="mt-0.5 size-5 shrink-0 text-zinc-500"
                                aria-hidden="true"
                            />
                            <div>
                                <p className="font-semibold">
                                    {payment.status === 'EXPIRED'
                                        ? 'Phiên thanh toán đã hết hạn'
                                        : 'Giao dịch đã được hủy'}
                                </p>
                                <p className="mt-1 text-sm leading-6 text-zinc-600">
                                    Trạng thái đơn hàng đã được cập nhật. Mở chi
                                    tiết đơn để xem thông tin mới nhất.
                                </p>
                            </div>
                        </div>
                    ) : null}

                    {isRetryable ? (
                        <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-amber-200 bg-amber-50 p-5 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <p className="font-semibold text-amber-950">
                                    Phiên thanh toán trước không hoàn tất
                                </p>
                                <p className="mt-1 text-sm leading-6 text-amber-900/75">
                                    {secondsLeft === 0
                                        ? 'Đơn hàng đã hết hạn. Hệ thống đang đồng bộ trạng thái mới nhất.'
                                        : 'Tạo lại QR trong thời hạn còn lại của đơn hàng.'}
                                </p>
                            </div>
                            <Button
                                type="button"
                                onClick={() => retryMutation.mutate(undefined)}
                                disabled={
                                    retryMutation.isPending ||
                                    cancelMutation.isPending ||
                                    secondsLeft === 0
                                }
                                className="h-11 rounded-xl px-5"
                            >
                                {retryMutation.isPending ? (
                                    <LoaderCircle
                                        className="mr-2 size-4 animate-spin"
                                        aria-hidden="true"
                                    />
                                ) : (
                                    <RefreshCw
                                        className="mr-2 size-4"
                                        aria-hidden="true"
                                    />
                                )}
                                Tạo lại mã QR
                            </Button>
                        </div>
                    ) : null}

                    {/* QR chỉ thuộc attempt PENDING; attempt thất bại không còn là hướng dẫn thanh toán hợp lệ. */}
                    {canDisplayPayment ? (
                        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.25fr)_minmax(300px,0.75fr)]">
                            <section className="rounded-3xl border border-zinc-200 bg-white p-5 sm:p-6">
                                <div className="flex items-center gap-3">
                                    <span className="flex size-10 items-center justify-center rounded-xl bg-zinc-100 text-zinc-700">
                                        <Building2
                                            className="size-5"
                                            aria-hidden="true"
                                        />
                                    </span>
                                    <div>
                                        <h2 className="font-semibold text-zinc-950">
                                            Thông tin chuyển khoản
                                        </h2>
                                        <p className="text-xs text-zinc-500">
                                            Quét QR hoặc nhập chính xác nội dung
                                            bên dưới
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-6 space-y-3">
                                    <div className="flex items-center justify-between gap-4 rounded-2xl bg-zinc-50 px-4 py-3">
                                        <div className="min-w-0">
                                            <p className="text-xs text-zinc-500">
                                                Ngân hàng
                                            </p>
                                            <p className="mt-1 truncate font-semibold text-zinc-900">
                                                {payment.bankName ?? 'Pay2S'}
                                            </p>
                                        </div>
                                        <ShieldCheck
                                            className="size-5 shrink-0 text-emerald-600"
                                            aria-label="Thông tin do Pay2S cung cấp"
                                        />
                                    </div>
                                    <div className="flex items-center justify-between gap-3 rounded-2xl bg-zinc-50 px-4 py-3">
                                        <div className="min-w-0">
                                            <p className="text-xs text-zinc-500">
                                                Chủ tài khoản
                                            </p>
                                            <p className="mt-1 truncate font-semibold text-zinc-900">
                                                {payment.accountHolder ??
                                                    'Tài khoản nhận Pay2S'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between gap-3 rounded-2xl bg-zinc-50 px-4 py-3">
                                        <div className="min-w-0">
                                            <p className="text-xs text-zinc-500">
                                                Số tài khoản
                                            </p>
                                            <p className="mt-1 break-all font-semibold tracking-wide text-zinc-900">
                                                {payment.accountNumber ??
                                                    'Xem thông tin trong mã QR'}
                                            </p>
                                        </div>
                                        {payment.accountNumber ? (
                                            <Button
                                                type="button"
                                                size="icon"
                                                variant="outline"
                                                aria-label="Sao chép số tài khoản"
                                                onClick={() =>
                                                    void copyPaymentValue(
                                                        payment.accountNumber,
                                                        'số tài khoản',
                                                    )
                                                }
                                            >
                                                <Copy aria-hidden="true" />
                                            </Button>
                                        ) : null}
                                    </div>
                                    <div className="flex items-center justify-between gap-3 rounded-2xl border border-indigo-100 bg-indigo-50/70 px-4 py-3">
                                        <div className="min-w-0">
                                            <p className="text-xs font-medium text-indigo-700">
                                                Nội dung chuyển khoản
                                            </p>
                                            <p className="mt-1 break-all font-bold text-zinc-950">
                                                {payment.orderInfo ??
                                                    'Thông tin sẽ có trong mã QR'}
                                            </p>
                                        </div>
                                        {payment.orderInfo ? (
                                            <Button
                                                type="button"
                                                size="icon"
                                                variant="outline"
                                                aria-label="Sao chép nội dung chuyển khoản"
                                                onClick={() =>
                                                    void copyPaymentValue(
                                                        payment.orderInfo,
                                                        'nội dung chuyển khoản',
                                                    )
                                                }
                                            >
                                                <Copy aria-hidden="true" />
                                            </Button>
                                        ) : null}
                                    </div>
                                </div>

                                <div className="mt-5 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-950">
                                    <ShieldCheck
                                        className="mt-0.5 size-4 shrink-0 text-amber-700"
                                        aria-hidden="true"
                                    />
                                    <p>
                                        Kiểm tra đúng người nhận, số tiền và nội
                                        dung trước khi xác nhận trong ứng dụng
                                        ngân hàng. Không chuyển khoản lần thứ
                                        hai nếu app đã báo thành công.
                                    </p>
                                </div>
                            </section>

                            <section className="flex flex-col items-center justify-center rounded-3xl border border-indigo-100 bg-gradient-to-br from-indigo-50 via-white to-slate-50 p-5 text-center sm:p-6">
                                <p className="text-sm font-semibold text-zinc-900">
                                    Quét mã QR để thanh toán
                                </p>
                                {qrValue ? (
                                    <div className="mt-5 rounded-3xl border border-zinc-200 bg-white p-4 shadow-sm">
                                        <QRCodeSVG
                                            value={qrValue}
                                            size={232}
                                            level="M"
                                            marginSize={2}
                                            aria-label="Mã QR thanh toán Pay2S"
                                        />
                                    </div>
                                ) : (
                                    <div className="mt-5 flex size-64 flex-col items-center justify-center rounded-3xl border border-dashed border-zinc-300 bg-white px-6 text-zinc-500">
                                        <QrCode
                                            className="size-10"
                                            aria-hidden="true"
                                        />
                                        <p className="mt-3 text-sm">
                                            Chưa nhận được mã QR
                                        </p>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            className="mt-4"
                                            onClick={() =>
                                                void paymentQuery.refetch()
                                            }
                                        >
                                            Tải lại thông tin
                                        </Button>
                                    </div>
                                )}
                                <p className="mt-4 max-w-xs text-xs leading-5 text-zinc-500">
                                    Mã QR đã điền sẵn người nhận, số tiền và nội
                                    dung chuyển khoản của đơn hàng này.
                                </p>
                                {payment.paymentUrl ? (
                                    <Button
                                        type="button"
                                        variant="link"
                                        className="mt-2 text-zinc-700"
                                        onClick={() =>
                                            window.open(
                                                payment.paymentUrl!,
                                                '_blank',
                                                'noopener,noreferrer',
                                            )
                                        }
                                    >
                                        Mở trang Pay2S{' '}
                                        <ExternalLink
                                            className="ml-1 size-3.5"
                                            aria-hidden="true"
                                        />
                                    </Button>
                                ) : null}
                            </section>
                        </div>
                    ) : null}

                    {hasOpenOrder ? (
                        <div className="mt-6 flex flex-col gap-5 rounded-2xl border border-zinc-200 bg-zinc-50 px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-start gap-3">
                                <Clock3
                                    className="mt-0.5 size-5 shrink-0 text-zinc-500"
                                    aria-hidden="true"
                                />
                                <div>
                                    <p className="text-sm font-semibold text-zinc-900">
                                        Thời gian thanh toán còn lại
                                    </p>
                                    <p className="mt-1 text-xs text-zinc-500">
                                        Hạn được lưu trên hệ thống và không thay
                                        đổi khi tải lại trang.
                                    </p>
                                </div>
                            </div>
                            <p
                                className={`font-mono text-3xl font-bold tabular-nums ${secondsLeft !== null && secondsLeft < 120 ? 'text-red-600' : 'text-zinc-950'}`}
                            >
                                {secondsLeft === null
                                    ? '--:--'
                                    : formatCountdown(secondsLeft)}
                            </p>
                        </div>
                    ) : null}

                    <footer className="mt-6 flex flex-col-reverse gap-3 border-t border-zinc-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-xs leading-5 text-zinc-500">
                            {isPending
                                ? 'Sau khi thanh toán, trạng thái đơn sẽ tự cập nhật.'
                                : 'Trạng thái đơn đã được đồng bộ từ hệ thống.'}
                        </p>
                        <div className="flex flex-wrap justify-end gap-3">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() =>
                                    router.push(`/profile/orders/${orderId}`)
                                }
                            >
                                <PackageCheck
                                    className="mr-2 size-4"
                                    aria-hidden="true"
                                />
                                Xem đơn hàng
                            </Button>
                            {hasOpenOrder ? (
                                <AlertDialog
                                    open={cancelDialogOpen}
                                    onOpenChange={setCancelDialogOpen}
                                >
                                    <AlertDialogTrigger asChild>
                                        <Button
                                            type="button"
                                            variant="destructive"
                                            disabled={
                                                cancelMutation.isPending ||
                                                retryMutation.isPending
                                            }
                                        >
                                            <XCircle
                                                className="mr-2 size-4"
                                                aria-hidden="true"
                                            />
                                            Hủy giao dịch
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>
                                                Hủy thanh toán đơn hàng?
                                            </AlertDialogTitle>
                                            <AlertDialogDescription>
                                                Hệ thống sẽ gửi yêu cầu hủy giao
                                                dịch lên Pay2S. Khi được xác
                                                nhận, đơn chuyển sang Đã hủy và
                                                số lượng giữ cho đơn được trả
                                                lại. Hủy không thu hồi được
                                                khoản chuyển khoản đã gửi; tiền
                                                về sau khi đơn đóng sẽ chờ xử lý
                                                hoàn.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel asChild>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                >
                                                    Tiếp tục thanh toán
                                                </Button>
                                            </AlertDialogCancel>
                                            <AlertDialogAction
                                                className="bg-red-600 text-white hover:bg-red-700"
                                                onClick={confirmCancelPayment}
                                                disabled={
                                                    cancelMutation.isPending
                                                }
                                            >
                                                {cancelMutation.isPending ? (
                                                    <LoaderCircle
                                                        className="mr-2 size-4 animate-spin"
                                                        aria-hidden="true"
                                                    />
                                                ) : null}
                                                Xác nhận hủy
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            ) : null}
                        </div>
                    </footer>
                </div>
            </section>
        </main>
    );
}

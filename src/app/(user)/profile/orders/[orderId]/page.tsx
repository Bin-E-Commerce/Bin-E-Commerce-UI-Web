'use client';

// File này dựng trang chi tiết đơn hàng Customer, chỉ trình bày snapshot order và điều khiển hủy COD.

import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
    ArrowLeft,
    CalendarDays,
    Check,
    CircleAlert,
    Clock3,
    MapPin,
    Package,
    Phone,
    ReceiptText,
    ShieldCheck,
    Store,
    XCircle,
} from 'lucide-react';

import { Skeleton } from '@/components/ui/skeleton';
import type { CustomerOrderStatus } from '@/services/order/order.api';
import {
    useCancelCustomerOrder,
    useCustomerOrder,
    useMissingProductImages,
} from '../hooks/use-customer-orders';
import { CancelOrderDialog } from '../components/cancel-order-dialog';

// Format tiền snapshot theo locale Việt Nam, không thay đổi giá trị server đã chốt.
function formatMoney(value: string): string {
    return `${Number(value).toLocaleString('vi-VN')} ₫`;
}

// Format thời gian thống nhất cho phần đầu trang, timeline và lịch sử hủy đơn.
function formatDate(value: string): string {
    return new Intl.DateTimeFormat('vi-VN', {
        dateStyle: 'medium',
        timeStyle: 'short',
    }).format(new Date(value));
}

// Ghép các phần địa chỉ có dữ liệu để snapshot cũ thiếu quận/huyện vẫn hiển thị tự nhiên.
function formatShippingAddress(address: Record<string, string>): string {
    return [address.street, address.ward, address.district, address.province]
        .filter(
            (value) => Boolean(value) && value !== 'Không áp dụng',
        )
        .join(', ');
}

// Chuyển enum trạng thái thành nhãn người dùng đọc được trong timeline.
function getStatusTitle(status: CustomerOrderStatus): string {
    if (status === 'CONFIRMED') return 'Đặt hàng thành công';
    if (status === 'CANCELLED') return 'Đơn hàng đã hủy';
    if (status === 'FAILED') return 'Đặt hàng thất bại';
    return 'Đang xử lý';
}

// Mô tả ngắn giúp timeline có ngữ cảnh mà không lặp lại toàn bộ lý do kỹ thuật.
function getStatusDescription(status: CustomerOrderStatus): string {
    if (status === 'CONFIRMED') return 'Đơn hàng đã được xác nhận';
    if (status === 'CANCELLED') return 'Đơn hàng không tiếp tục xử lý';
    if (status === 'FAILED') return 'Đơn hàng chưa được tạo thành công';
    return 'Hệ thống đang xử lý đơn hàng';
}

// Chọn icon theo trạng thái để timeline phân biệt nhanh thành công, đang xử lý và lỗi.
function StatusIcon({ status }: { status: CustomerOrderStatus }) {
    if (status === 'CANCELLED' || status === 'FAILED') {
        return <XCircle className="size-5" aria-hidden="true" />;
    }
    if (status === 'PENDING') {
        return <Clock3 className="size-5" aria-hidden="true" />;
    }
    return <Check className="size-5" aria-hidden="true" />;
}

// Trang detail đọc order theo id trên URL, vì vậy refresh vẫn giữ đúng phạm vi order của Customer.
export default function ProfileOrderDetailPage() {
    const params = useParams<{ orderId: string }>();
    const orderId = params.orderId;
    const orderQuery = useCustomerOrder(orderId);
    const cancelMutation = useCancelCustomerOrder(orderId);
    const legacyItemImages = useMissingProductImages(
        orderQuery.data?.items ?? [],
    );

    if (orderQuery.isPending) return <OrderDetailSkeleton />;

    if (orderQuery.isError || !orderQuery.data) {
        return (
            <div className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6">
                <CircleAlert
                    className="mx-auto size-10 text-red-500"
                    aria-hidden="true"
                />
                <h1 className="mt-4 text-xl font-bold text-zinc-950">
                    Không thể tải đơn hàng
                </h1>
                <p className="mt-2 text-sm text-zinc-500">
                    Đơn hàng không tồn tại hoặc không thuộc tài khoản của bạn.
                </p>
                <Link
                    href="/profile/orders"
                    className="mt-6 inline-flex h-10 items-center rounded-xl bg-zinc-950 px-4 text-sm font-semibold text-white transition hover:bg-zinc-800"
                >
                    Quay lại đơn hàng
                </Link>
            </div>
        );
    }

    const order = orderQuery.data;

    return (
        <div className="min-h-full bg-zinc-50/60">
            <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 md:px-0">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <Link
                        href="/profile/orders"
                        className="inline-flex items-center gap-2 text-sm font-medium text-zinc-500 transition hover:text-zinc-950"
                    >
                        <ArrowLeft className="size-4" aria-hidden="true" />
                        Quay lại đơn hàng
                    </Link>
                    <div className="flex items-center gap-2 text-xs text-zinc-500 sm:text-sm">
                        <span>Mã đơn hàng</span>
                        <span className="font-semibold text-zinc-950">
                            #{order.orderNumber}
                        </span>
                    </div>
                </div>

                <header className="mt-5 rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
                    <div className="flex flex-col justify-between gap-4 border-b border-zinc-100 pb-5 sm:flex-row sm:items-start">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-400">
                                Chi tiết đơn hàng
                            </p>
                            <div className="mt-2 flex flex-wrap items-center gap-3">
                                <h1 className="text-2xl font-bold tracking-tight text-zinc-950 sm:text-3xl">
                                    #{order.orderNumber}
                                </h1>
                            </div>
                            <p className="mt-2 flex items-center gap-2 text-sm text-zinc-500">
                                <CalendarDays
                                    className="size-4"
                                    aria-hidden="true"
                                />
                                Đặt ngày {formatDate(order.createdAt)}
                            </p>
                        </div>
                        {order.status === 'CONFIRMED' ? (
                            <CancelOrderDialog
                                loading={cancelMutation.isPending}
                                onConfirm={async (reason) => {
                                    await cancelMutation.mutateAsync(reason);
                                }}
                            />
                        ) : null}
                    </div>

                    <section
                        aria-labelledby="order-status-title"
                        className="pt-5"
                    >
                        <div className="flex items-center justify-between gap-3">
                            <h2
                                id="order-status-title"
                                className="text-sm font-semibold text-zinc-950"
                            >
                                Trạng thái đơn hàng
                            </h2>
                            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-500">
                                <ShieldCheck
                                    className="size-4 text-emerald-600"
                                    aria-hidden="true"
                                />
                                Thanh toán COD
                            </span>
                        </div>
                        <div className="mt-5 flex flex-col gap-5 md:flex-row md:gap-0">
                            {order.statusHistory.map((history, index) => (
                                <div
                                    key={history.id}
                                    className="relative flex min-w-0 flex-1 items-start gap-3 md:block md:text-center"
                                >
                                    {index < order.statusHistory.length - 1 ? (
                                        <div className="absolute left-3.5 top-8 h-[calc(100%+1.25rem)] w-px bg-zinc-200 md:left-[calc(50%+1.25rem)] md:right-[calc(-50%+1.25rem)] md:top-5 md:h-px md:w-auto" />
                                    ) : null}
                                    <div
                                        className={`relative z-10 flex size-10 shrink-0 items-center justify-center rounded-full ring-4 ring-white md:mx-auto ${history.toStatus === 'CONFIRMED' ? 'bg-emerald-500 text-white' : history.toStatus === 'CANCELLED' || history.toStatus === 'FAILED' ? 'bg-red-50 text-red-600 ring-1 ring-red-100' : 'bg-amber-50 text-amber-600 ring-1 ring-amber-100'}`}
                                    >
                                        <StatusIcon status={history.toStatus} />
                                    </div>
                                    <div className="min-w-0 md:mt-3">
                                        <p className="text-sm font-semibold text-zinc-900">
                                            {getStatusTitle(history.toStatus)}
                                        </p>
                                        <p className="mt-1 text-xs leading-5 text-zinc-500">
                                            {getStatusDescription(
                                                history.toStatus,
                                            )}
                                        </p>
                                        <p className="mt-1 text-[11px] text-zinc-400">
                                            {formatDate(history.createdAt)}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                </header>

                <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
                    <div className="space-y-5">
                        <section className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm">
                            <div className="flex items-center justify-between gap-4 border-b border-zinc-100 px-5 py-4 sm:px-6">
                                <div className="flex items-center gap-3">
                                    <div className="flex size-9 items-center justify-center rounded-xl bg-zinc-950 text-white">
                                        <Store
                                            className="size-4"
                                            aria-hidden="true"
                                        />
                                    </div>
                                    <div>
                                        <h2 className="font-semibold text-zinc-950">
                                            Sản phẩm đã đặt
                                        </h2>
                                        <p className="text-xs text-zinc-500">
                                            Bin E-Commerce
                                        </p>
                                    </div>
                                </div>
                                <span className="hidden text-xs text-zinc-400 sm:block">
                                    {order.items.length} mặt hàng
                                </span>
                            </div>
                            <div className="divide-y divide-zinc-100 px-5 sm:px-6">
                                {order.items.map((item) => (
                                    <div
                                        key={item.id}
                                        className="flex gap-4 py-5 first:pt-5 sm:gap-5"
                                    >
                                        <div className="size-24 shrink-0 overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-100 sm:size-28">
                                            {item.imageUrl ||
                                            legacyItemImages.get(
                                                item.productId,
                                            ) ? (
                                                <img
                                                    src={
                                                        item.imageUrl ??
                                                        legacyItemImages.get(
                                                            item.productId,
                                                        ) ??
                                                        undefined
                                                    }
                                                    alt={item.productName}
                                                    className="size-full object-cover"
                                                />
                                            ) : (
                                                <div className="flex size-full items-center justify-center text-zinc-400">
                                                    <Package
                                                        className="size-7"
                                                        aria-hidden="true"
                                                    />
                                                </div>
                                            )}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="font-semibold leading-6 text-zinc-950">
                                                {item.productName}
                                            </p>
                                            <p className="mt-1 text-sm text-zinc-500">
                                                {item.variantName !==
                                                item.productName
                                                    ? item.variantName
                                                    : 'Sản phẩm tiêu chuẩn'}
                                            </p>
                                            <p className="mt-2 text-sm text-zinc-500">
                                                {formatMoney(item.unitPrice)} ×{' '}
                                                {item.quantity}
                                            </p>
                                        </div>
                                        <p className="shrink-0 pt-1 text-right font-semibold text-zinc-950">
                                            {formatMoney(item.lineTotal)}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </section>

                        <section className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
                            <div className="flex items-center gap-3">
                                <div className="flex size-9 items-center justify-center rounded-xl bg-zinc-950 text-white">
                                    <MapPin
                                        className="size-4"
                                        aria-hidden="true"
                                    />
                                </div>
                                <div>
                                    <h2 className="font-semibold text-zinc-950">
                                        Địa chỉ nhận hàng
                                    </h2>
                                    <p className="text-xs text-zinc-500">
                                        Thông tin tại thời điểm đặt hàng
                                    </p>
                                </div>
                            </div>
                            <div className="mt-5 grid gap-4 rounded-2xl bg-zinc-50 p-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)] sm:p-5">
                                <div>
                                    <p className="font-semibold text-zinc-950">
                                        {order.shippingAddress.fullName}
                                    </p>
                                    <p className="mt-2 flex items-center gap-2 text-sm text-zinc-600">
                                        <Phone
                                            className="size-4"
                                            aria-hidden="true"
                                        />
                                        {order.shippingAddress.phone}
                                    </p>
                                </div>
                                <p className="text-sm leading-6 text-zinc-600">
                                    {formatShippingAddress(
                                        order.shippingAddress,
                                    )}
                                </p>
                            </div>
                        </section>
                    </div>

                    <aside className="h-fit rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6 lg:sticky lg:top-6">
                        <div className="flex items-center gap-3">
                            <div className="flex size-9 items-center justify-center rounded-xl bg-zinc-950 text-white">
                                <ReceiptText
                                    className="size-4"
                                    aria-hidden="true"
                                />
                            </div>
                            <h2 className="font-semibold text-zinc-950">
                                Tổng thanh toán
                            </h2>
                        </div>
                        <div className="mt-5 space-y-4 text-sm">
                            <div className="flex justify-between gap-4 text-zinc-500">
                                <span>Tạm tính</span>
                                <span>{formatMoney(order.subtotal)}</span>
                            </div>
                            <div className="flex justify-between gap-4 text-zinc-500">
                                <span>Phí vận chuyển</span>
                                <span>
                                    {Number(order.shippingFee) === 0
                                        ? 'Miễn phí'
                                        : formatMoney(order.shippingFee)}
                                </span>
                            </div>
                            <div className="border-t border-zinc-100 pt-4">
                                <div className="flex items-end justify-between gap-4">
                                    <span className="font-semibold text-zinc-950">
                                        Thành tiền
                                    </span>
                                    <span className="text-xl font-bold text-zinc-950">
                                        {formatMoney(order.totalAmount)}
                                    </span>
                                </div>
                            </div>
                            <div className="flex items-center justify-between rounded-2xl bg-zinc-50 px-4 py-3">
                                <span className="text-zinc-500">
                                    Phương thức
                                </span>
                                <span className="font-semibold text-zinc-900">
                                    COD
                                </span>
                            </div>
                        </div>
                        {order.cancelledAt ? (
                            <div className="mt-5 rounded-2xl bg-red-50 p-3 text-xs leading-5 text-red-700">
                                <p className="font-semibold">Đơn hàng đã hủy</p>
                                <p className="mt-1">
                                    {formatDate(order.cancelledAt)}
                                    {order.cancelReason
                                        ? ` · ${order.cancelReason}`
                                        : ''}
                                </p>
                            </div>
                        ) : null}
                    </aside>
                </div>
            </div>
        </div>
    );
}

// Skeleton giữ đúng nhịp bố cục mới để lúc refresh không xuất hiện khoảng trống hoặc layout nhảy mạnh.
function OrderDetailSkeleton() {
    return (
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 md:px-0">
            <Skeleton className="h-5 w-36" />
            <div className="mt-5 rounded-3xl border border-zinc-200 bg-white p-6">
                <Skeleton className="h-9 w-72" />
                <Skeleton className="mt-3 h-5 w-48" />
                <div className="mt-8 grid gap-5 md:grid-cols-3">
                    <Skeleton className="h-24 rounded-2xl" />
                    <Skeleton className="h-24 rounded-2xl" />
                    <Skeleton className="h-24 rounded-2xl" />
                </div>
            </div>
            <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
                <Skeleton className="h-[360px] rounded-3xl" />
                <Skeleton className="h-72 rounded-3xl" />
            </div>
        </div>
    );
}

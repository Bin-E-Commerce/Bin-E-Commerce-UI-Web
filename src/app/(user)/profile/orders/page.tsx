//
// Trang lịch sử mua hàng của Customer.
// Page giữ query/filter và dữ liệu server; các chi tiết tab và card được tách thành component để dễ bảo trì.
//

'use client';

import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
    AlertCircle,
    CalendarDays,
    ChevronRight,
    ClipboardList,
    PackageSearch,
} from 'lucide-react';

import { ProfileSidebar } from '@/components/layout/user/profile-sidebar';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import type {
    CustomerOrderFilter,
    CustomerOrderStage,
    CustomerOrderStatus,
} from '@/services/order/order.api';
import {
    useCustomerOrders,
    useLegacyOrderPreviewImages,
} from './hooks/use-customer-orders';
import { CustomerOrderActions } from './components/customer-order-actions';
import { CustomerOrderTabs } from './components/customer-order-tabs';

// Định dạng thời gian tại UI, dữ liệu ISO vẫn giữ nguyên từ API.
function formatDate(value: string): string {
    return new Intl.DateTimeFormat('vi-VN', {
        dateStyle: 'medium',
        timeStyle: 'short',
    }).format(new Date(value));
}

// Định dạng tiền mà không làm thay đổi số tiền authoritative từ server.
function formatPrice(value: string): string {
    return `${Number(value).toLocaleString('vi-VN')} ₫`;
}

// Đọc stage hợp lệ từ URL để backend không nhận các trạng thái tự do.
function readFilter(params: URLSearchParams): CustomerOrderFilter {
    const status = params.get('status');
    const stage = params.get('stage');

    return {
        ...(status &&
        ['PENDING', 'CONFIRMED', 'FAILED', 'CANCELLED'].includes(status)
            ? { status: status as CustomerOrderStatus }
            : {}),
        ...(stage &&
        [
            'TO_SHIP',
            'SHIPPING',
            'DELIVERED',
            'COMPLETED',
            'CANCELLED',
            'DELIVERY_FAILED',
            'RETURN_REFUND',
        ].includes(stage)
            ? { stage: stage as CustomerOrderStage }
            : {}),
    };
}

// Render danh sách order Customer với loading/error/empty state và ảnh snapshot.
export default function ProfileOrdersPage() {
    const router = useRouter();
    const pathname = usePathname();
    const params = useSearchParams();
    const filter = readFilter(params);
    const page = Math.max(1, Number(params.get('page') ?? 1) || 1);
    const ordersQuery = useCustomerOrders(filter, page);
    const images = useLegacyOrderPreviewImages(ordersQuery.data?.items ?? []);
    const isOrdersLoading = ordersQuery.isPending || ordersQuery.isPlaceholderData;

    // Đổi tab hoặc trang qua URL để browser back/refresh giữ đúng ngữ cảnh.
    function navigate(
        nextFilter: CustomerOrderFilter,
        nextPage = 1,
    ): void {
        const next = new URLSearchParams();
        if (nextFilter.status) next.set('status', nextFilter.status);
        if (nextFilter.stage) next.set('stage', nextFilter.stage);
        if (nextPage > 1) next.set('page', String(nextPage));
        router.push(`${pathname}${next.toString() ? `?${next}` : ''}`);
    }

    return (
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
            <div className="flex flex-col gap-6 md:flex-row md:gap-8">
                <ProfileSidebar />
                <main className="min-w-0 flex-1">
                    <header className="mb-6 flex items-end justify-between">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-400">
                                Lịch sử mua sắm
                            </p>
                            <h1 className="mt-2 text-3xl font-bold tracking-tight text-zinc-950">
                                Đơn hàng của tôi
                            </h1>
                            <p className="mt-2 text-sm text-zinc-500">
                                Theo dõi đơn hàng từ lúc xác nhận đến khi hoàn tất.
                            </p>
                        </div>
                        <div className="hidden size-12 items-center justify-center rounded-2xl bg-zinc-950 text-white sm:flex">
                            <ClipboardList className="size-5" aria-hidden="true" />
                        </div>
                    </header>

                    <CustomerOrderTabs
                        activeFilter={filter}
                        onChange={(nextFilter) => navigate(nextFilter)}
                        counts={ordersQuery.data?.counts}
                    />

                    {isOrdersLoading ? (
                        <div className="space-y-3">
                            {Array.from({ length: 3 }).map((_, index) => (
                                <Skeleton
                                    key={index}
                                    className="h-40 rounded-2xl"
                                />
                            ))}
                        </div>
                    ) : ordersQuery.isError ? (
                        <section className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
                            <AlertCircle
                                className="mx-auto size-8 text-red-600"
                                aria-hidden="true"
                            />
                            <h2 className="mt-3 font-semibold text-red-950">
                                Không thể tải đơn hàng
                            </h2>
                            <p className="mt-2 text-sm text-red-700">
                                Vui lòng thử lại sau giây lát.
                            </p>
                            <Button
                                className="mt-5 cursor-pointer"
                                onClick={() => void ordersQuery.refetch()}
                            >
                                Thử lại
                            </Button>
                        </section>
                    ) : !ordersQuery.data?.items.length ? (
                        <section className="rounded-2xl border border-dashed border-zinc-300 bg-white px-6 py-16 text-center">
                            <PackageSearch
                                className="mx-auto size-10 text-zinc-300"
                                aria-hidden="true"
                            />
                            <h2 className="mt-4 font-semibold text-zinc-950">
                                Chưa có đơn trong khu vực này
                            </h2>
                            <p className="mt-2 text-sm text-zinc-500">
                                Các đơn hàng phù hợp sẽ xuất hiện tại đây.
                            </p>
                        </section>
                    ) : (
                        <div className="space-y-3">
                            {ordersQuery.data.items.map((order) => {
                                const item = order.previewItems[0];
                                const image =
                                    item?.imageUrl ??
                                    images.get(item?.productId ?? '');
                                // Đơn đã giao đang chờ khách xác nhận; CTA đưa thẳng đến detail để hoàn tất xác nhận và đánh giá.
                                const needsCustomerConfirmation = order.fulfillmentStatus === 'DELIVERED';
                                const orderDetailHref = `/profile/orders/${order.id}`;

                                return (
                                    <article
                                        key={order.id}
                                        className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-zinc-300 hover:shadow-md"
                                    >
                                        <Link
                                            href={orderDetailHref}
                                            className="group block p-5"
                                        >
                                            <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
                                            <div className="flex items-center gap-3">
                                                <span className="flex size-9 items-center justify-center rounded-xl bg-zinc-950 text-white">
                                                    <PackageSearch
                                                        className="size-4"
                                                        aria-hidden="true"
                                                    />
                                                </span>
                                                <div>
                                                    <p className="text-xs font-semibold uppercase tracking-[0.15em] text-zinc-400">
                                                        Đơn hàng
                                                    </p>
                                                    <p className="font-bold text-zinc-950">
                                                        {order.orderNumber}
                                                    </p>
                                                </div>
                                            </div>
                                            <span className="text-sm text-zinc-500">COD</span>
                                            </div>

                                            <div className="flex items-center gap-4 py-5">
                                            <div className="size-20 shrink-0 overflow-hidden rounded-2xl bg-zinc-100">
                                                {image ? (
                                                    <img
                                                        src={image}
                                                        alt={item?.productName ?? ''}
                                                        className="size-full object-cover"
                                                    />
                                                ) : (
                                                    <PackageSearch className="m-6 size-8 text-zinc-300" />
                                                )}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <h2 className="truncate font-semibold text-zinc-950">
                                                    {item?.productName ?? 'Sản phẩm trong đơn hàng'}
                                                </h2>
                                                <p className="mt-1 truncate text-sm text-zinc-500">
                                                    {item?.variantName ?? 'Sản phẩm chính hãng từ Bin E-Commerce'}
                                                </p>
                                                <p className="mt-2 text-xs text-zinc-400">
                                                    {order.itemCount} sản phẩm · Số lượng {item?.quantity ?? order.itemCount}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xs text-zinc-400">Tổng thanh toán</p>
                                                <p className="mt-1 font-bold text-zinc-950">
                                                    {formatPrice(order.totalAmount)}
                                                </p>
                                            </div>
                                            </div>

                                            <div className="flex items-center justify-between border-t border-zinc-100 pt-4 text-xs text-zinc-500">
                                            <span className="inline-flex items-center gap-2">
                                                <CalendarDays className="size-3.5" aria-hidden="true" />
                                                {formatDate(order.createdAt)}
                                            </span>
                                            <span className="inline-flex shrink-0 items-center gap-1 whitespace-nowrap font-semibold text-zinc-950">
                                                Xem chi tiết
                                                <ChevronRight className="size-4 transition group-hover:translate-x-0.5" aria-hidden="true" />
                                            </span>
                                            </div>
                                        </Link>
                                        {needsCustomerConfirmation ? (
                                            <CustomerOrderActions
                                                orderId={order.id}
                                                orderDetailHref={orderDetailHref}
                                            />
                                        ) : null}
                                    </article>
                                );
                            })}

                            <div className="flex items-center justify-between rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm">
                                <span className="text-zinc-500">
                                    Trang {ordersQuery.data.page} / {ordersQuery.data.totalPages || 1}
                                </span>
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="cursor-pointer"
                                        disabled={page <= 1}
                                        onClick={() => navigate(filter, page - 1)}
                                    >
                                        Trước
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="cursor-pointer"
                                        disabled={page >= ordersQuery.data.totalPages}
                                        onClick={() => navigate(filter, page + 1)}
                                    >
                                        Sau
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}

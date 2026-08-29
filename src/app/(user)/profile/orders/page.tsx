'use client';

// File này dựng trang lịch sử đơn hàng Customer; dữ liệu và fallback ảnh nằm ở service hook riêng.

import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
    AlertCircle,
    ChevronRight,
    ClipboardList,
    PackageSearch,
} from 'lucide-react';

import { ProfileSidebar } from '@/components/layout/user/profile-sidebar';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
    useCustomerOrders,
    useLegacyOrderPreviewImages,
} from './hooks/use-customer-orders';
import type { CustomerOrderStatus } from '@/services/order/order.api';

const tabs: Array<{ label: string; status?: CustomerOrderStatus }> = [
    { label: 'Tất cả' },
    { label: 'Đã xác nhận', status: 'CONFIRMED' },
    { label: 'Đã hủy', status: 'CANCELLED' },
    { label: 'Thất bại', status: 'FAILED' },
];

// Format ngày theo locale Việt Nam mà không phụ thuộc dữ liệu hiển thị từ server.
function formatOrderDate(value: string): string {
    return new Intl.DateTimeFormat('vi-VN', {
        dateStyle: 'medium',
        timeStyle: 'short',
    }).format(new Date(value));
}

// Trang lịch sử order Customer dùng query URL để refresh vẫn giữ filter và trang hiện tại.
export default function ProfileOrdersPage() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const rawStatus = searchParams.get('status');
    const status = ['CONFIRMED', 'CANCELLED', 'FAILED'].includes(
        rawStatus ?? '',
    )
        ? (rawStatus as CustomerOrderStatus)
        : undefined;
    const page = Math.max(1, Number(searchParams.get('page') ?? '1') || 1);
    const ordersQuery = useCustomerOrders(status, page);
    const legacyPreviewImages = useLegacyOrderPreviewImages(
        ordersQuery.data?.items ?? [],
    );

    // Điều hướng một lần cho cả tab và pagination để không phát sinh request thừa.
    function navigate(
        nextStatus: CustomerOrderStatus | undefined,
        nextPage: number,
    ) {
        const params = new URLSearchParams();
        if (nextStatus) params.set('status', nextStatus);
        if (nextPage > 1) params.set('page', String(nextPage));
        const query = params.toString();
        router.push(`${pathname}${query ? `?${query}` : ''}`);
    }

    return (
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 md:px-0 lg:px-0">
            <div className="flex flex-col gap-6 md:flex-row md:gap-8">
                <ProfileSidebar />
                <main className="min-w-0 flex-1">
                    <div className="mb-6 flex items-end justify-between gap-4">
                        <div>
                            <h1 className="mt-2 text-2xl font-bold tracking-tight text-zinc-950 sm:text-3xl">
                                Đơn hàng của tôi
                            </h1>
                            <p className="mt-2 text-sm text-zinc-500">
                                Theo dõi những đơn hàng bạn đã đặt.
                            </p>
                        </div>
                        <div className="hidden size-12 items-center justify-center rounded-2xl bg-zinc-950 text-white sm:flex">
                            <ClipboardList
                                className="size-5"
                                aria-hidden="true"
                            />
                        </div>
                    </div>
                    <nav
                        className="mb-5 flex gap-1 overflow-x-auto rounded-2xl border border-zinc-200 bg-white p-1 shadow-sm"
                        aria-label="Lọc đơn hàng"
                    >
                        {tabs.map((tab) => {
                            const active =
                                tab.status === status ||
                                (!tab.status && !status);
                            return (
                                <button
                                    key={tab.label}
                                    type="button"
                                    onClick={() => navigate(tab.status, 1)}
                                    className={`whitespace-nowrap rounded-xl px-4 py-2.5 text-sm font-medium transition ${active ? 'bg-zinc-950 text-white shadow-sm' : 'text-zinc-600 hover:bg-zinc-100'}`}
                                >
                                    {tab.label}
                                </button>
                            );
                        })}
                    </nav>
                    {ordersQuery.isPending ? <OrderListSkeleton /> : null}
                    {ordersQuery.isError ? (
                        <section className="rounded-3xl border border-red-100 bg-red-50 p-8 text-center">
                            <AlertCircle
                                className="mx-auto size-8 text-red-500"
                                aria-hidden="true"
                            />
                            <h2 className="mt-3 font-semibold text-red-950">
                                Không thể tải đơn hàng
                            </h2>
                            <p className="mt-1 text-sm text-red-700">
                                Vui lòng thử lại sau giây lát.
                            </p>
                            <Button
                                className="mt-5"
                                onClick={() => void ordersQuery.refetch()}
                            >
                                Thử lại
                            </Button>
                        </section>
                    ) : null}
                    {ordersQuery.isSuccess &&
                    ordersQuery.data.items.length === 0 ? (
                        <OrderEmptyState filtered={Boolean(status)} />
                    ) : null}
                    {ordersQuery.isSuccess &&
                    ordersQuery.data.items.length > 0 ? (
                        <div className="space-y-3">
                            {ordersQuery.data.items.map((order) => {
                                const previewItems = order.previewItems ?? [];

                                return (
                                    <Link
                                        key={order.id}
                                        href={`/profile/orders/${order.id}`}
                                        className="group block rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-zinc-300 hover:shadow-md sm:p-5"
                                    >
                                        <div className="flex items-center justify-between gap-3 border-b border-zinc-100 pb-3">
                                            <div className="flex min-w-0 items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-zinc-500">
                                                <span className="flex size-7 items-center justify-center rounded-lg bg-zinc-950 text-white">
                                                    <PackageSearch
                                                        className="size-3.5"
                                                        aria-hidden="true"
                                                    />
                                                </span>
                                                <span className="truncate">
                                                    Đơn hàng của bạn
                                                </span>
                                            </div>
                                            <span className="shrink-0 text-xs font-medium text-zinc-400">
                                                Thanh toán COD
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-4 py-4">
                                            <div className="flex shrink-0 -space-x-2">
                                                {previewItems
                                                    .slice(0, 2)
                                                    .map((item, index) => (
                                                        <div
                                                            key={`${order.id}-${item.productName}-${index}`}
                                                            className="flex size-20 items-center justify-center overflow-hidden rounded-2xl border-2 border-white bg-zinc-100 text-zinc-400 ring-1 ring-zinc-200"
                                                        >
                                                            {item.imageUrl ||
                                                            legacyPreviewImages.get(
                                                                item.productId,
                                                            ) ? (
                                                                <img
                                                                    src={
                                                                        item.imageUrl ??
                                                                        legacyPreviewImages.get(
                                                                            item.productId,
                                                                        ) ??
                                                                        undefined
                                                                    }
                                                                    alt=""
                                                                    className="size-full object-cover"
                                                                />
                                                            ) : (
                                                                <PackageSearch
                                                                    className="size-5"
                                                                    aria-hidden="true"
                                                                />
                                                            )}
                                                        </div>
                                                    ))}
                                                {previewItems.length === 0 ? (
                                                    <div className="flex size-20 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-400 ring-1 ring-zinc-200">
                                                        <PackageSearch
                                                            className="size-5"
                                                            aria-hidden="true"
                                                        />
                                                    </div>
                                                ) : null}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <h2 className="truncate font-semibold text-zinc-950">
                                                    {previewItems[0]
                                                        ?.productName ??
                                                        'Sản phẩm trong đơn hàng'}
                                                </h2>
                                                <p className="mt-1 truncate text-sm text-zinc-500">
                                                    {previewItems[0]
                                                        ?.variantName ||
                                                        'Sản phẩm chính hãng từ Bin E-Commerce'}
                                                </p>
                                                {previewItems.length > 1 ? (
                                                    <p className="mt-1 text-xs text-zinc-400">
                                                        +{' '}
                                                        {order.itemCount -
                                                            previewItems[0]
                                                                .quantity}{' '}
                                                        sản phẩm khác
                                                    </p>
                                                ) : (
                                                    <p className="mt-1 text-xs text-zinc-400">
                                                        Số lượng:{' '}
                                                        {previewItems[0]
                                                            ?.quantity ??
                                                            order.itemCount}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="shrink-0 text-right">
                                                <p className="text-xs text-zinc-400">
                                                    Thành tiền
                                                </p>
                                                <p className="mt-1 font-bold text-zinc-950">
                                                    {Number(
                                                        order.totalAmount,
                                                    ).toLocaleString(
                                                        'vi-VN',
                                                    )}{' '}
                                                    ₫
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between gap-3 border-t border-zinc-100 pt-3 text-xs">
                                            <div className="flex min-w-0 items-center gap-2 text-zinc-500">
                                                <span>
                                                    {order.itemCount} sản phẩm
                                                </span>
                                                <span className="text-zinc-300">
                                                    ·
                                                </span>
                                                <span className="truncate">
                                                    {formatOrderDate(
                                                        order.createdAt,
                                                    )}
                                                </span>
                                                {order.status !==
                                                'CONFIRMED' ? (
                                                    <>
                                                        <span className="text-zinc-300">
                                                            ·
                                                        </span>
                                                        <span className="font-medium text-zinc-700">
                                                            {order.status ===
                                                            'CANCELLED'
                                                                ? 'Đã hủy'
                                                                : order.status ===
                                                                    'FAILED'
                                                                  ? 'Thất bại'
                                                                  : 'Đang xử lý'}
                                                        </span>
                                                    </>
                                                ) : null}
                                            </div>
                                            <span className="inline-flex shrink-0 items-center gap-1 font-semibold text-zinc-950">
                                                Xem chi tiết{' '}
                                                <ChevronRight
                                                    className="size-3.5 transition group-hover:translate-x-0.5"
                                                    aria-hidden="true"
                                                />
                                            </span>
                                        </div>
                                    </Link>
                                );
                            })}
                            <OrderPagination
                                page={ordersQuery.data.page}
                                totalPages={ordersQuery.data.totalPages}
                                onChange={(nextPage) =>
                                    navigate(status, nextPage)
                                }
                            />
                        </div>
                    ) : null}
                </main>
            </div>
        </div>
    );
}

// Skeleton giữ đúng nhịp layout khi API danh sách đang tải.
function OrderListSkeleton() {
    return (
        <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} className="h-24 rounded-2xl" />
            ))}
        </div>
    );
}

// Empty state phân biệt danh sách thật sự trống với filter không có kết quả.
function OrderEmptyState({ filtered }: { filtered: boolean }) {
    return (
        <section className="rounded-3xl border border-dashed border-zinc-300 bg-white px-6 py-14 text-center">
            <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-500">
                <PackageSearch className="size-6" aria-hidden="true" />
            </div>
            <h2 className="mt-4 font-semibold text-zinc-950">
                {filtered ? 'Chưa có đơn phù hợp' : 'Bạn chưa có đơn hàng'}
            </h2>
            <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-zinc-500">
                {filtered
                    ? 'Thử chọn một trạng thái khác để xem lịch sử đơn hàng.'
                    : 'Đơn hàng bạn đặt sẽ xuất hiện tại đây.'}
            </p>
            {!filtered ? (
                <Link
                    href="/products"
                    className="mt-5 inline-flex h-10 items-center rounded-xl bg-zinc-950 px-4 text-sm font-semibold text-white hover:bg-zinc-800"
                >
                    Khám phá sản phẩm
                </Link>
            ) : null}
        </section>
    );
}

// Pagination tối giản, disable biên để người dùng không tạo route không hợp lệ.
function OrderPagination({
    page,
    totalPages,
    onChange,
}: {
    page: number;
    totalPages: number;
    onChange: (page: number) => void;
}) {
    if (totalPages <= 1) return null;
    return (
        <div className="flex items-center justify-between rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm shadow-sm">
            <span className="text-zinc-500">
                Trang {page} / {totalPages}
            </span>
            <div className="flex gap-2">
                <Button
                    variant="outline"
                    size="sm"
                    disabled={page <= 1}
                    onClick={() => onChange(page - 1)}
                >
                    Trước
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= totalPages}
                    onClick={() => onChange(page + 1)}
                >
                    Sau
                </Button>
            </div>
        </div>
    );
}

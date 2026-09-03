// Card này trình bày một order theo góc nhìn shop: ảnh, item, số lượng và tổng tiền riêng shop.

import Link from 'next/link';
import { ArrowRight, CalendarDays, Package } from 'lucide-react';

import type { SellerOrderListItem } from '@/services/order';
import { SellerOrderProductImage } from './seller-order-product-image';
import {
    formatSellerMoney,
    formatSellerOrderDate,
} from '../utils/seller-order-format';
import { cn } from '@/lib/utils';
import { SellerOrderStatusBadge } from './seller-order-status-badge';

interface SellerOrderCardProps {
    order: SellerOrderListItem;
    legacyImages: ReadonlyMap<string, string | null>;
}

// Tạo card có vùng click rõ ràng, đồng thời giữ CTA detail để desktop và mobile đều dễ thao tác.
export function SellerOrderCard({ order, legacyImages }: SellerOrderCardProps) {
    // Ưu tiên fulfillment stage vì đây là trạng thái vận hành mà Seller cần xử lý.
    const lifecycleStatus = order.fulfillmentStatus ?? order.status;
    const isCancelled = lifecycleStatus === 'CANCELLED';

    return (
        <Link
            href={`/seller/orders/${order.id}`}
            className={cn(
                'group block rounded-xl border border-zinc-200 bg-white p-4 transition hover:border-zinc-300 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950/20 sm:p-5',
                isCancelled && 'bg-zinc-50/40',
            )}
        >
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 pb-4">
                <div className="flex min-w-0 items-center gap-2">
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-zinc-950 text-white">
                        <Package className="size-4" />
                    </div>
                    <div className="min-w-0">
                        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-zinc-500">
                            Đơn hàng
                        </p>
                        <p className="truncate text-sm font-semibold text-zinc-950">
                            #{order.orderNumber}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <SellerOrderStatusBadge status={lifecycleStatus} />
                    <span className="text-xs font-medium text-zinc-500">
                        COD
                    </span>
                </div>
            </div>

            <div className="flex flex-col gap-4 py-4 sm:flex-row sm:items-center">
                <div className="flex min-w-0 flex-1 items-center gap-3">
                    <div className="flex shrink-0 -space-x-2">
                        {order.previewItems.length > 0 ? (
                            order.previewItems.map((item, index) => (
                                <SellerOrderProductImage
                                    key={`${order.id}-${item.productName}-${index}`}
                                    src={
                                        item.imageUrl ??
                                        legacyImages.get(item.productId) ??
                                        null
                                    }
                                    alt={item.productName}
                                />
                            ))
                        ) : (
                            <SellerOrderProductImage
                                src={null}
                                alt="Sản phẩm trong đơn hàng"
                            />
                        )}
                    </div>
                    <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-zinc-950">
                            {order.previewItems[0]?.productName ??
                                'Sản phẩm trong đơn hàng'}
                        </p>
                        <p className="mt-1 truncate text-sm text-zinc-500">
                            {order.previewItems[0]?.variantName ||
                                'Sản phẩm của shop'}
                        </p>
                        {order.previewItems.length < order.itemCount ? (
                            <p className="mt-1 text-xs text-zinc-400">
                                Và {order.itemCount - order.previewItems.length}{' '}
                                sản phẩm khác
                            </p>
                        ) : null}
                    </div>
                </div>

                <div className="flex shrink-0 items-center justify-between gap-8 sm:justify-end">
                    <div className="text-left sm:text-right">
                        <p className="text-xs text-zinc-500">Doanh thu shop</p>
                        <p className="mt-1 text-base font-bold tabular-nums text-zinc-950">
                            {formatSellerMoney(order.shopItemTotal)}
                        </p>
                    </div>
                    <ArrowRight className="size-4 text-zinc-400 transition-transform group-hover:translate-x-1 group-hover:text-zinc-950" />
                </div>
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-zinc-100 pt-3 text-xs text-zinc-500">
                <span className="inline-flex items-center gap-1.5">
                    <Package className="size-3.5" />
                    {order.itemCount} sản phẩm của shop
                </span>
                <span className="inline-flex items-center gap-1.5">
                    <CalendarDays className="size-3.5" />
                    {formatSellerOrderDate(order.createdAt)}
                </span>
                <span className="ml-auto font-semibold text-zinc-950 group-hover:underline">
                    Xem chi tiết
                </span>
            </div>
        </Link>
    );
}

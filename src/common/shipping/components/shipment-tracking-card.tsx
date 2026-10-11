// UI theo dõi đơn dùng chung Customer/Seller; component chỉ trình bày trạng thái, timeline và vị trí.

'use client';

import dynamic from 'next/dynamic';
import {
    Check,
    CircleAlert,
    Clock3,
    MapPin,
    PackageCheck,
    Truck,
} from 'lucide-react';

import type { ShipmentStatus } from '@/services/shipping';
import { cn } from '@/lib/utils';
import type { ShipmentTrackingCardProps } from '../types/seller-shipment';

const ShipmentMap = dynamic(() => import('./shipment-map'), {
    ssr: false,
    loading: () => (
        <div className="h-[280px] animate-pulse rounded-2xl bg-zinc-100 sm:h-[340px]" />
    ),
});

const STATUS_ORDER: ShipmentStatus[] = [
    'READY_TO_SHIP',
    'PICKUP_ASSIGNED',
    'PICKED_UP',
    'IN_TRANSIT',
    'DELIVERED',
];

// Định dạng thời gian theo timezone người dùng; GHN có thể chưa trả ETA nên hiển thị trạng thái chờ.
function formatShipmentDate(value: string | null): string {
    if (!value) return 'Đang cập nhật';
    return new Intl.DateTimeFormat('vi-VN', {
        dateStyle: 'medium',
        timeStyle: 'short',
    }).format(new Date(value));
}

// Chọn icon trung tính cho trạng thái giao nhận thay vì phụ thuộc badge nhiều màu.
function ShipmentStatusIcon({ status }: { status: ShipmentStatus }) {
    if (status === 'DELIVERED' || status === 'RETURNED')
        return <Check className="size-4" aria-hidden="true" />;
    if (status === 'FAILED' || status === 'CANCELLED')
        return <CircleAlert className="size-4" aria-hidden="true" />;
    if (status === 'IN_TRANSIT' || status === 'RETURNING')
        return <Truck className="size-4" aria-hidden="true" />;
    return <Clock3 className="size-4" aria-hidden="true" />;
}

// Trình bày timeline rõ ràng và cho phép Seller nhận biết shop đã sẵn sàng bàn giao.
export function ShipmentTrackingCard({
    shipment,
    sellerActions,
    viewer = 'customer',
}: ShipmentTrackingCardProps) {
    const activeIndex = STATUS_ORDER.indexOf(shipment.status);
    const isError =
        shipment.status === 'FAILED' || shipment.status === 'CANCELLED';
    const currentLabel =
        viewer === 'seller' && shipment.status === 'READY_TO_SHIP'
            ? 'Shop đã chuẩn bị hàng'
            : shipment.statusLabel;

    return (
        <section className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
            <div className="flex flex-col gap-4 bg-zinc-50/60 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5 sm:py-4">
                <div className="flex min-w-0 items-center gap-3">
                    <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-zinc-950 text-white shadow-sm">
                        <Truck className="size-5" aria-hidden="true" />
                    </div>
                    <div className="min-w-0">
                        <h2 className="truncate text-base font-bold text-zinc-950">
                            {currentLabel}
                        </h2>
                        <p className="mt-1 truncate text-xs text-zinc-500 sm:text-sm">
                            Mã vận đơn{' '}
                            <span className="font-medium text-zinc-700">
                                {shipment.trackingCode}
                            </span>
                        </p>
                    </div>
                </div>
                <div className="flex items-center justify-between gap-3 sm:shrink-0 sm:justify-end">
                    <div className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-left shadow-sm sm:text-right">
                        <p className="text-[10px] font-medium uppercase tracking-wide text-zinc-500">
                            Dự kiến giao
                        </p>
                        <p className="mt-0.5 text-xs font-semibold text-zinc-950 sm:text-sm">
                            {formatShipmentDate(shipment.estimatedDeliveryAt)}
                        </p>
                    </div>
                    {sellerActions}
                </div>
            </div>

            <div className="border-t border-zinc-100 p-4 sm:p-5">
                <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(360px,0.9fr)]">
                    <div>
                        <div className="flex items-center gap-2 text-sm font-semibold text-zinc-950">
                            <PackageCheck
                                className="size-4 text-zinc-700"
                                aria-hidden="true"
                            />
                            Hành trình đơn hàng
                        </div>
                        <div className="mt-5 space-y-4">
                            {shipment.history.map((event, index) => {
                                const completed =
                                    !isError &&
                                    (activeIndex < 0 ||
                                        STATUS_ORDER.indexOf(event.toStatus) <=
                                            activeIndex);
                                return (
                                    <div
                                        key={event.id}
                                        className="relative flex gap-3"
                                    >
                                        {index < shipment.history.length - 1 ? (
                                            <div className="absolute left-4 top-8 h-[calc(100%+1rem)] w-px bg-zinc-200" />
                                        ) : null}
                                        <div
                                            className={cn(
                                                'relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full border-4 border-white',
                                                completed
                                                    ? 'bg-zinc-950 text-white'
                                                    : 'bg-zinc-100 text-zinc-500',
                                            )}
                                        >
                                            <ShipmentStatusIcon
                                                status={event.toStatus}
                                            />
                                        </div>
                                        <div className="min-w-0 pb-1">
                                            <p className="text-sm font-semibold text-zinc-950">
                                                {statusLabel(
                                                    event.toStatus,
                                                    viewer,
                                                )}
                                            </p>
                                            <p className="mt-1 text-xs leading-5 text-zinc-500">
                                                {formatEventReason(
                                                    event.reason,
                                                    event.toStatus,
                                                    viewer,
                                                    event.locationLabel,
                                                )}
                                            </p>
                                            <p className="mt-1 text-[11px] text-zinc-400">
                                                {formatShipmentDate(
                                                    event.occurredAt,
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div>
                        <div className="mb-3 flex items-center justify-between gap-3 text-sm">
                            <span className="flex items-center gap-2 font-semibold text-zinc-950">
                                <MapPin
                                    className="size-4 text-zinc-700"
                                    aria-hidden="true"
                                />
                                Vị trí hiện tại
                            </span>
                            <span className="text-xs text-zinc-500">
                                {shipment.currentLocation.label}
                            </span>
                        </div>
                        <ShipmentMap
                            routePoints={shipment.routePoints}
                            currentLocation={shipment.currentLocation}
                        />
                    </div>
                </div>
            </div>
        </section>
    );
}

// Làm sạch dấu vết tên môi trường khỏi ghi chú provider trước khi hiển thị và dùng nội dung an toàn làm fallback.
function formatEventReason(
    reason: string | null,
    status: ShipmentStatus,
    viewer: 'seller' | 'customer',
    locationLabel: string | null,
): string {
    const providerReasonLabels: Record<string, string> = {
        ready_to_pick: 'Shop đã chuẩn bị hàng, sẵn sàng bàn giao.',
        picking: 'Shipper đang được điều phối đến lấy hàng.',
        picked: 'Đơn vị vận chuyển đã nhận hàng từ shop.',
        transporting: 'Đơn hàng đang được vận chuyển đến bạn.',
        delivered: 'Đơn hàng đã được giao thành công.',
        returning: 'Đơn hàng đang được hoàn về shop.',
        returned: 'Đơn hàng đã được hoàn về shop.',
        cancel: 'Vận đơn đã được hủy.',
    };
    const normalizedReason = reason?.trim().toLowerCase();
    // Provider có thể nhúng tên môi trường vào ghi chú; bỏ marker và dấu phân cách thừa trước khi dùng fallback.
    const displayReason = reason
        ?.trim()
        .replace(/\bGHN\s*Test\b/gi, '')
        .replace(/\s{2,}/g, ' ')
        .replace(/\s+([.,])/g, '$1')
        .replace(/\s*[·|]\s*(?=[.,]|$)/g, '')
        .trim();
    return (
        (normalizedReason && providerReasonLabels[normalizedReason]) ||
        displayReason ||
        locationLabel ||
        statusLabel(status, viewer)
    );
}

// Dùng label tiếng Việt ở timeline thay vì hiển thị enum kỹ thuật từ backend.
function statusLabel(
    status: ShipmentStatus,
    viewer: 'seller' | 'customer' = 'customer',
): string {
    return {
        READY_TO_SHIP:
            viewer === 'seller'
                ? 'Shop đã chuẩn bị hàng'
                : 'Shop đang chuẩn bị hàng',
        PICKUP_ASSIGNED: 'Đã phân công lấy hàng',
        PICKED_UP: 'Đơn vị vận chuyển đã lấy hàng',
        IN_TRANSIT: 'Đang trên đường giao',
        DELIVERED: 'Giao hàng thành công',
        FAILED: 'Giao hàng thất bại',
        CANCELLED: 'Vận đơn đã hủy',
        RETURNING: 'Đang hoàn hàng',
        RETURNED: 'Đã hoàn hàng',
    }[status];
}

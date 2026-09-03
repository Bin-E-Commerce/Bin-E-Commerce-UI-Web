// UI tracking dùng chung Customer/Seller: timeline, trạng thái provider và bản đồ trình bày nội bộ.

'use client';

import dynamic from 'next/dynamic';
import type { ReactNode } from 'react';
import { Check, CircleAlert, Clock3, MapPin, PackageCheck, Truck } from 'lucide-react';

import type { ShipmentResponse, ShipmentStatus } from '@/services/shipping';
import { cn } from '@/lib/utils';

const ShipmentMap = dynamic(() => import('./shipment-map'), {
    ssr: false,
    loading: () => <div className="h-[280px] animate-pulse rounded-2xl bg-zinc-100 sm:h-[340px]" />,
});

const STATUS_ORDER: ShipmentStatus[] = ['READY_TO_SHIP', 'PICKUP_ASSIGNED', 'PICKED_UP', 'IN_TRANSIT', 'DELIVERED'];

interface ShipmentTrackingCardProps {
    shipment: ShipmentResponse;
    sellerActions?: ReactNode;
    viewer?: 'seller' | 'customer';
}

// Định dạng thời gian theo timezone người dùng; GHN có thể chưa trả ETA nên hiển thị trạng thái chờ.
function formatShipmentDate(value: string | null): string {
    if (!value) return 'Đang cập nhật';
    return new Intl.DateTimeFormat('vi-VN', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
}

// Chọn icon trung tính cho trạng thái giao nhận thay vì phụ thuộc badge nhiều màu.
function ShipmentStatusIcon({ status }: { status: ShipmentStatus }) {
    if (status === 'DELIVERED' || status === 'RETURNED') return <Check className="size-4" aria-hidden="true" />;
    if (status === 'FAILED' || status === 'CANCELLED') return <CircleAlert className="size-4" aria-hidden="true" />;
    if (status === 'IN_TRANSIT' || status === 'RETURNING') return <Truck className="size-4" aria-hidden="true" />;
    return <Clock3 className="size-4" aria-hidden="true" />;
}

// Trình bày timeline rõ ràng và cho phép Seller nhận biết shop đã sẵn sàng bàn giao.
export function ShipmentTrackingCard({ shipment, sellerActions, viewer = 'customer' }: ShipmentTrackingCardProps) {
    const activeIndex = STATUS_ORDER.indexOf(shipment.status);
    const isError = shipment.status === 'FAILED' || shipment.status === 'CANCELLED';
    const currentLabel = viewer === 'seller' && shipment.status === 'READY_TO_SHIP'
        ? 'Shop đã chuẩn bị hàng'
        : shipment.statusLabel;

    return (
        <section className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm">
            <div className="flex flex-col gap-4 border-b border-zinc-100 p-5 sm:flex-row sm:items-start sm:justify-between sm:p-6">
                <div className="flex items-start gap-3">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-zinc-950 text-white">
                        <Truck className="size-5" aria-hidden="true" />
                    </div>
                    <div>
                        <p className="text-xs font-bold uppercase tracking-[0.16em] text-zinc-400">Vận chuyển</p>
                        <h2 className="mt-1 text-base font-bold text-zinc-950">{currentLabel}</h2>
                        <p className="mt-1 text-sm text-zinc-500">Mã vận đơn {shipment.trackingCode} · GHN Test</p>
                    </div>
                </div>
                <div className="flex flex-wrap items-center gap-3 sm:justify-end">
                    <div className="rounded-2xl bg-zinc-50 px-3 py-2 text-right">
                        <p className="text-[11px] text-zinc-500">Dự kiến giao</p>
                        <p className="mt-0.5 text-sm font-semibold text-zinc-950">{formatShipmentDate(shipment.estimatedDeliveryAt)}</p>
                    </div>
                    {sellerActions}
                </div>
            </div>

            <div className="p-5 sm:p-6">
                <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(360px,0.9fr)]">
                    <div>
                        <div className="flex items-center gap-2 text-sm font-semibold text-zinc-950">
                            <PackageCheck className="size-4 text-zinc-700" aria-hidden="true" />
                            Hành trình đơn hàng
                        </div>
                        <div className="mt-5 space-y-4">
                            {shipment.history.map((event, index) => {
                                const completed = !isError && (activeIndex < 0 || STATUS_ORDER.indexOf(event.toStatus) <= activeIndex);
                                return (
                                    <div key={event.id} className="relative flex gap-3">
                                        {index < shipment.history.length - 1 ? <div className="absolute left-4 top-8 h-[calc(100%+1rem)] w-px bg-zinc-200" /> : null}
                                        <div className={cn('relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full border-4 border-white', completed ? 'bg-zinc-950 text-white' : 'bg-zinc-100 text-zinc-500')}>
                                            <ShipmentStatusIcon status={event.toStatus} />
                                        </div>
                                        <div className="min-w-0 pb-1">
                                            <p className="text-sm font-semibold text-zinc-950">{statusLabel(event.toStatus, viewer)}</p>
                                            <p className="mt-1 text-xs leading-5 text-zinc-500">{formatEventReason(event.reason, event.toStatus, viewer, event.locationLabel)}</p>
                                            <p className="mt-1 text-[11px] text-zinc-400">{formatShipmentDate(event.occurredAt)}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div>
                        <div className="mb-3 flex items-center justify-between gap-3 text-sm">
                            <span className="flex items-center gap-2 font-semibold text-zinc-950">
                                <MapPin className="size-4 text-zinc-700" aria-hidden="true" />
                                Vị trí hiện tại
                            </span>
                            <span className="text-xs text-zinc-500">{shipment.currentLocation.label}</span>
                        </div>
                        <ShipmentMap routePoints={shipment.routePoints} currentLocation={shipment.currentLocation} demoMode={shipment.demoMode} />
                        <p className="mt-2 text-xs text-zinc-500">Lộ trình minh họa nội bộ · {shipment.demoMode ? 'Đang chạy chế độ demo.' : 'Trạng thái được đồng bộ từ GHN Test.'}</p>
                    </div>
                </div>
            </div>
        </section>
    );
}

// Chuyển mã reason từ GHN Test thành câu tiếng Việt dễ hiểu; UI không để lộ enum hoặc provider code cho khách hàng.
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
    return (normalizedReason && providerReasonLabels[normalizedReason]) || reason?.trim() || locationLabel || statusLabel(status, viewer);
}

// Dùng label tiếng Việt ở timeline thay vì hiển thị enum kỹ thuật từ backend.
function statusLabel(status: ShipmentStatus, viewer: 'seller' | 'customer' = 'customer'): string {
    return {
        READY_TO_SHIP: viewer === 'seller' ? 'Shop đã chuẩn bị hàng' : 'Shop đang chuẩn bị hàng',
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

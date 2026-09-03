//
// File này là feature container tracking cho Customer.
// Query tự polling khi shipment active và hiển thị nhiều shipment độc lập cho order nhiều shop.
//

'use client';

import { CircleAlert, RefreshCw, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCustomerTracking } from '@/hooks/shipping/use-shipment';
import { ShipmentTrackingCard } from './shipment-tracking-card';

interface CustomerShipmentPanelProps {
    orderId: string;
    orderStage?: string | null;
}

// Render trạng thái tracking độc lập với order detail để Shipping Service lỗi không che mất thông tin đơn hàng.
export function CustomerShipmentPanel({ orderId, orderStage }: CustomerShipmentPanelProps) {
    const isTerminalOrder = ['CANCELLED', 'DELIVERY_FAILED', 'RETURN_REFUND'].includes(orderStage ?? '');
    const trackingQuery = useCustomerTracking(orderId, !isTerminalOrder);

    // Đơn đã kết thúc không có hành trình mới; stepper phía trên đã hiển thị thông tin kết thúc và lý do.
    if (isTerminalOrder) return null;

    if (trackingQuery.isPending) return <div className="h-48 animate-pulse rounded-3xl bg-zinc-100" />;

    if (trackingQuery.isError) {
        return (
            <section className="rounded-3xl border border-red-200 bg-red-50 p-5 sm:p-6">
                <div className="flex items-start gap-3">
                    <CircleAlert className="mt-0.5 size-5 shrink-0 text-red-600" aria-hidden="true" />
                    <div>
                        <h2 className="font-semibold text-red-950">Tracking đang tạm thời gián đoạn</h2>
                        <p className="mt-1 text-sm leading-6 text-red-800">Chi tiết đơn vẫn an toàn. Hãy thử tải lại hành trình sau ít phút.</p>
                        <Button type="button" variant="outline" className="mt-4 gap-2 bg-white" onClick={() => void trackingQuery.refetch()}>
                            <RefreshCw className="size-4" aria-hidden="true" /> Thử lại
                        </Button>
                    </div>
                </div>
            </section>
        );
    }

    const shipments = trackingQuery.data?.shipments ?? [];
    if (shipments.length === 0) {
        return (
            <section className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
                <div className="flex items-start gap-3">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-zinc-950 text-white"><Truck className="size-5" aria-hidden="true" /></div>
                    <div>
                        <h2 className="font-semibold text-zinc-950">Shop đang chuẩn bị vận chuyển</h2>
                        <p className="mt-1 text-sm leading-6 text-zinc-500">Thông tin mã vận đơn và bản đồ sẽ xuất hiện ngay khi shop tạo vận đơn.</p>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <div className="space-y-5">
            {shipments.map((shipment) => <ShipmentTrackingCard key={shipment.id} shipment={shipment} />)}
        </div>
    );
}

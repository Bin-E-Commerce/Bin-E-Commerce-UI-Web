// Feature Seller shipment: hiển thị tracking, làm mới trạng thái, hủy đủ điều kiện và in nhãn.

'use client';

import { CircleAlert, FileDown, RefreshCw, SkipForward } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { ShipmentTrackingCard } from './shipment-tracking-card';
import { SellerCancelShipmentDialog } from './seller-cancel-shipment-dialog';
import {
    useAdvanceDemoSellerShipment,
    useCancelSellerShipment,
    usePrintSellerShipmentLabel,
    useRefreshSellerShipment,
    useSellerShipment,
} from '@/hooks/shipping/use-shipment';

interface SellerShipmentPanelProps {
    orderId: string;
    orderStage?: string | null;
}

// Render shipment state của Seller với action rõ theo từng bước nghiệp vụ GHN.
export function SellerShipmentPanel({
    orderId,
    orderStage,
}: SellerShipmentPanelProps) {
    const isTerminalOrder = ['CANCELLED', 'DELIVERY_FAILED'].includes(
        orderStage ?? '',
    );
    const shipmentQuery = useSellerShipment(orderId, !isTerminalOrder);
    const refreshMutation = useRefreshSellerShipment(orderId);
    const cancelMutation = useCancelSellerShipment(orderId);
    const advanceDemoMutation = useAdvanceDemoSellerShipment(orderId);
    const printMutation = usePrintSellerShipmentLabel(orderId);

    if (isTerminalOrder) return null;
    if (shipmentQuery.isPending)
        return <div className="h-48 animate-pulse rounded-3xl bg-zinc-100" />;

    if (shipmentQuery.isError) {
        return (
            <section className="rounded-3xl border border-red-200 bg-red-50 p-5 sm:p-6">
                <div className="flex items-start gap-3">
                    <CircleAlert
                        className="mt-0.5 size-5 shrink-0 text-red-600"
                        aria-hidden="true"
                    />
                    <div>
                        <h2 className="font-semibold text-red-950">
                            Không thể tải thông tin vận chuyển
                        </h2>
                        <p className="mt-1 text-sm leading-6 text-red-800">
                            Dữ liệu GHN Test đang tạm thời gián đoạn.
                        </p>
                        <Button
                            type="button"
                            variant="outline"
                            className="mt-4 gap-2 bg-white"
                            onClick={() => void shipmentQuery.refetch()}
                        >
                            <RefreshCw className="size-4" aria-hidden="true" />
                            Thử lại
                        </Button>
                    </div>
                </div>
            </section>
        );
    }

    if (!shipmentQuery.data) {
        return null;
    }

    const shipment = shipmentQuery.data;
    const isCancellable = ['READY_TO_SHIP', 'PICKUP_ASSIGNED'].includes(
        shipment.status,
    );
    const isBusy =
        refreshMutation.isPending ||
        cancelMutation.isPending ||
        advanceDemoMutation.isPending ||
        printMutation.isPending;
    const canAdvanceDemo =
        shipment.trackingSource === 'GHN_TEST' &&
        [
            'READY_TO_SHIP',
            'PICKUP_ASSIGNED',
            'PICKED_UP',
            'IN_TRANSIT',
        ].includes(shipment.status);

    return (
        <ShipmentTrackingCard
            shipment={shipment}
            viewer="seller"
            sellerActions={
                <div className="flex flex-wrap items-center gap-2">
                    <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="gap-1.5"
                        disabled={isBusy}
                        onClick={() => refreshMutation.mutate()}
                    >
                        <RefreshCw
                            className={`size-3.5 ${refreshMutation.isPending ? 'animate-spin' : ''}`}
                            aria-hidden="true"
                        />
                        Làm mới
                    </Button>
                    {isCancellable ? (
                        <SellerCancelShipmentDialog
                            loading={isBusy}
                            onConfirm={(reason) =>
                                cancelMutation
                                    .mutateAsync(reason)
                                    .then(() => undefined)
                            }
                        />
                    ) : null}
                    {canAdvanceDemo ? (
                        <Button
                            type="button"
                            size="sm"
                            variant="secondary"
                            className="gap-1.5"
                            disabled={isBusy}
                            onClick={() => advanceDemoMutation.mutate()}
                            title="Chỉ dùng để trình diễn trạng thái GHN Test"
                        >
                            <SkipForward
                                className={`size-3.5 ${advanceDemoMutation.isPending ? 'animate-pulse' : ''}`}
                                aria-hidden="true"
                            />
                            Bỏ qua bước demo
                        </Button>
                    ) : null}
                    <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="gap-1.5"
                        disabled={isBusy}
                        onClick={() => printMutation.mutate()}
                    >
                        <FileDown className="size-3.5" aria-hidden="true" />
                        In nhãn
                    </Button>
                </div>
            }
        />
    );
}

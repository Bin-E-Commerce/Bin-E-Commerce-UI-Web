// Feature Seller shipment: hiển thị tracking, làm mới trạng thái, hủy đủ điều kiện và in nhãn.

'use client';

import { useState } from 'react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import {
    CircleAlert,
    FileDown,
    MoreHorizontal,
    RefreshCw,
    SkipForward,
    XCircle,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { ShipmentTrackingCard } from './shipment-tracking-card';
import { SellerCancelShipmentDialog } from './seller-cancel-shipment-dialog';
import type { SellerShipmentPanelProps } from '../types/seller-shipment';
import {
    useAdvanceDemoSellerShipment,
    useCancelSellerShipment,
    usePrintSellerShipmentLabel,
    useRefreshSellerShipment,
    useSellerShipment,
} from '@/hooks/shipping/use-shipment';

// Render trạng thái vận đơn và gom thao tác Seller vào menu; demo chỉ hiện khi backend bật cho GHN Test.
export function SellerShipmentPanel({
    orderId,
    orderStage,
}: SellerShipmentPanelProps) {
    const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
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
                            Dữ liệu theo dõi đơn hàng đang tạm thời gián đoạn.
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
        shipment.demoAdvancementEnabled &&
        shipment.trackingSource === 'GHN_TEST' &&
        [
            'READY_TO_SHIP',
            'PICKUP_ASSIGNED',
            'PICKED_UP',
            'IN_TRANSIT',
        ].includes(shipment.status);

    // Dialog hủy được điều khiển ngoài menu để menu đóng trước khi hộp xác nhận nhận focus.
    return (
        <>
            <ShipmentTrackingCard
                shipment={shipment}
                viewer="seller"
                sellerActions={
                    <DropdownMenu.Root>
                        <DropdownMenu.Trigger asChild>
                            <Button
                                type="button"
                                variant="outline"
                                size="icon-lg"
                                aria-label="Mở tùy chọn"
                                title="Tùy chọn"
                                disabled={isBusy}
                                className="rounded-xl border-zinc-200 bg-white text-zinc-700 shadow-sm hover:border-zinc-400 hover:bg-zinc-50 data-[state=open]:border-zinc-400 data-[state=open]:bg-zinc-50"
                            >
                                <MoreHorizontal
                                    className="size-4"
                                    aria-hidden="true"
                                />
                            </Button>
                        </DropdownMenu.Trigger>
                        <DropdownMenu.Portal>
                            <DropdownMenu.Content
                                align="end"
                                sideOffset={8}
                                className="z-50 min-w-56 overflow-hidden rounded-xl border border-zinc-200 bg-white p-1.5 shadow-xl shadow-zinc-950/10"
                            >
                                <DropdownMenu.Label className="px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-400">
                                    Tùy chọn
                                </DropdownMenu.Label>
                                <DropdownMenu.Item
                                    className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-zinc-700 outline-none transition-colors hover:bg-zinc-100 focus:bg-zinc-100 data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                                    disabled={isBusy}
                                    onSelect={() => refreshMutation.mutate()}
                                >
                                    <RefreshCw
                                        className={`size-4 text-zinc-500 ${refreshMutation.isPending ? 'animate-spin' : ''}`}
                                        aria-hidden="true"
                                    />
                                    Làm mới trạng thái
                                </DropdownMenu.Item>
                                <DropdownMenu.Item
                                    className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-zinc-700 outline-none transition-colors hover:bg-zinc-100 focus:bg-zinc-100 data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                                    disabled={isBusy}
                                    onSelect={() => printMutation.mutate()}
                                >
                                    <FileDown
                                        className="size-4 text-zinc-500"
                                        aria-hidden="true"
                                    />
                                    In nhãn vận đơn
                                </DropdownMenu.Item>
                                {canAdvanceDemo ? (
                                    <DropdownMenu.Item
                                        className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-zinc-700 outline-none transition-colors hover:bg-zinc-100 focus:bg-zinc-100 data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                                        disabled={isBusy}
                                        onSelect={() =>
                                            advanceDemoMutation.mutate()
                                        }
                                    >
                                        <SkipForward
                                            className={`size-4 text-zinc-500 ${advanceDemoMutation.isPending ? 'animate-pulse' : ''}`}
                                            aria-hidden="true"
                                        />
                                        Cập nhật bước tiếp theo
                                    </DropdownMenu.Item>
                                ) : null}
                                {isCancellable ? (
                                    <>
                                        <DropdownMenu.Separator className="my-1 h-px bg-zinc-100" />
                                        <DropdownMenu.Item
                                            className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-zinc-700 outline-none transition-colors hover:bg-zinc-100 focus:bg-zinc-100 data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                                            disabled={isBusy}
                                            onSelect={() =>
                                                setCancelDialogOpen(true)
                                            }
                                        >
                                            <XCircle
                                                className="size-4 text-zinc-500"
                                                aria-hidden="true"
                                            />
                                            Hủy vận đơn
                                        </DropdownMenu.Item>
                                    </>
                                ) : null}
                            </DropdownMenu.Content>
                        </DropdownMenu.Portal>
                    </DropdownMenu.Root>
                }
            />
            {isCancellable ? (
                <SellerCancelShipmentDialog
                    open={cancelDialogOpen}
                    onOpenChange={setCancelDialogOpen}
                    loading={isBusy}
                    onConfirm={(reason) =>
                        cancelMutation.mutateAsync(reason).then(() => undefined)
                    }
                />
            ) : null}
        </>
    );
}

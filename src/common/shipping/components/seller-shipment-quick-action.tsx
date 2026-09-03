// Nút hành động nhanh cho bước chuẩn bị hàng; không tự đổi trạng thái nếu API chưa xác nhận thành công.

'use client';

import { Loader2, Truck } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { useCreateSellerShipment } from '@/hooks/shipping/use-shipment';

interface SellerShipmentQuickActionProps {
    orderId: string;
}

// Tạo vận đơn ngay tại bước đang cần xử lý để seller hoàn tất luồng bằng một lần bấm.
export function SellerShipmentQuickAction({ orderId }: SellerShipmentQuickActionProps) {
    const createMutation = useCreateSellerShipment(orderId);

    return (
        <Button
            type="button"
            className="w-full gap-2 sm:w-auto sm:whitespace-nowrap"
            disabled={createMutation.isPending}
            onClick={() => createMutation.mutate()}
        >
            {createMutation.isPending ? (
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            ) : (
                <Truck className="size-4" aria-hidden="true" />
            )}
            Đã chuẩn bị hàng &amp; tạo vận đơn
        </Button>
    );
}

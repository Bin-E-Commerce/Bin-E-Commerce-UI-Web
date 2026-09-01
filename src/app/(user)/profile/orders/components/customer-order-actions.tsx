// File này chứa các thao tác tiếp theo của Customer với đơn đã giao.
// Component chỉ xử lý CTA và mutation; dữ liệu chi tiết, form báo vấn đề và quyền ownership thuộc trang order detail.

'use client';

import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { useConfirmOrderDelivery } from '../[orderId]/hooks/use-delivery-confirmation';

type CustomerOrderActionsProps = {
    orderId: string;
    orderDetailHref: string;
};

// Hiển thị hai hướng xử lý rõ ràng cho đơn đã giao: xác nhận hoàn tất hoặc đi tới luồng báo vấn đề.
export function CustomerOrderActions({
    orderId,
    orderDetailHref,
}: CustomerOrderActionsProps) {
    const mutation = useConfirmOrderDelivery(orderId);

    // Gửi xác nhận đã nhận hàng trực tiếp từ card để khách không phải mở thêm một màn hình trung gian.
    function handleReceived(): void {
        mutation.mutate({ decision: 'RECEIVED' });
    }

    return (
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-zinc-100 px-5 py-3">
            <p className="text-xs font-medium text-zinc-500">
                Đơn đã giao · Chờ bạn xác nhận
            </p>
            <div className="flex flex-wrap justify-end gap-2">
                <Link
                    href={orderDetailHref}
                    className="inline-flex h-10 items-center justify-center rounded-xl border border-zinc-300 px-4 text-sm font-semibold text-zinc-900 transition-colors hover:border-zinc-950 hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950/20"
                >
                    Chưa nhận / Có vấn đề
                </Link>
                <Button
                    type="button"
                    onClick={handleReceived}
                    disabled={mutation.isPending}
                    className="h-10 rounded-xl bg-zinc-950 px-4 text-sm font-semibold text-white hover:bg-zinc-800"
                >
                    {mutation.isPending ? 'Đang cập nhật...' : 'Đã nhận hàng'}
                </Button>
            </div>
        </div>
    );
}

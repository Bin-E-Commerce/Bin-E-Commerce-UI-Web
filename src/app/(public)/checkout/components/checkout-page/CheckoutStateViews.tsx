// Nhóm các trạng thái bao phủ toàn bộ checkout: khung trang, loading và thành công.
// Các view này chỉ nhận dữ liệu trình bày, không sở hữu query hay mutation của checkout.

import Link from 'next/link';
import { CheckCircle2, Loader2, PackageCheck } from 'lucide-react';

import { cn } from '@/lib/utils';
import type { OrderResponse } from '../../types/checkout.types';

// Định dạng tiền VND ở lớp trình bày; giá trị authoritative vẫn lấy từ server.
function formatPrice(value: string): string {
    const amount = Number(value);
    if (!Number.isFinite(amount)) return '0 ₫';
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
        maximumFractionDigits: 0,
    }).format(amount);
}

// Bọc mọi trạng thái checkout bằng nền và chiều cao nhất quán với layout chính.
export function CheckoutShell({
    children,
    compact = false,
}: {
    children: React.ReactNode;
    compact?: boolean;
}) {
    return (
        <main
            className={cn(
                'bg-zinc-50 px-4 pb-8 sm:px-6 lg:px-8',
                compact
                    ? 'relative flex min-h-[calc(100vh-8rem)] items-center justify-center py-8 lg:py-10'
                    : 'min-h-[calc(100vh-8rem)] pt-4 sm:pt-5 lg:pb-12 lg:pt-6',
            )}
        >
            {children}
        </main>
    );
}

// Hiển thị tiến trình tải chung để người dùng hiểu checkout đang chuẩn bị dữ liệu.
export function LoadingState({ label }: { label: string }) {
    return (
        <section role="status" aria-live="polite" className="flex min-h-[480px] items-center justify-center px-4 py-12">
            <div className="w-full max-w-md rounded-3xl border border-zinc-200 bg-white p-7 text-center shadow-[0_18px_50px_-30px_rgba(24,24,27,0.45)] sm:p-9">
                <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-zinc-950 text-white shadow-lg shadow-zinc-950/15">
                    <PackageCheck className="size-8" strokeWidth={1.7} aria-hidden="true" />
                </div>
                <p className="mt-6 text-[11px] font-semibold uppercase tracking-[0.24em] text-zinc-400">Checkout</p>
                <h1 className="mt-2 text-xl font-bold tracking-tight text-zinc-950 sm:text-2xl">{label}</h1>
                <p className="mx-auto mt-3 max-w-xs text-sm leading-6 text-zinc-500">Đang tải thông tin cần thiết để bạn tiếp tục đặt hàng.</p>
                <div className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-zinc-700">
                    <Loader2 className="size-4 animate-spin text-zinc-500" aria-hidden="true" />
                    Vui lòng chờ một chút...
                </div>
            </div>
        </section>
    );
}

// Hiển thị thông tin đơn đã tạo từ snapshot server để tránh nhầm với dữ liệu giỏ hàng hiện tại.
export function CheckoutSuccess({ order }: { order: OrderResponse }) {
    return (
        <CheckoutShell>
            <section className="mx-auto max-w-2xl rounded-[2rem] border border-zinc-200 bg-white p-7 text-center shadow-sm sm:p-12">
                <div className="mx-auto flex size-16 items-center justify-center rounded-3xl bg-emerald-50 text-emerald-600"><CheckCircle2 className="size-9" aria-hidden="true" /></div>
                <p className="mt-6 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-600">Đặt hàng thành công</p>
                <h1 className="mt-3 text-3xl font-bold tracking-tight text-zinc-950">Cảm ơn bạn đã mua sắm</h1>
                <p className="mt-3 text-sm leading-6 text-zinc-500">Đơn COD của bạn đã được xác nhận và tồn kho đã được giữ.</p>
                <div className="mx-auto mt-8 max-w-md rounded-2xl bg-zinc-50 p-5 text-left">
                    <div className="flex justify-between gap-4 text-sm"><span className="text-zinc-500">Mã đơn hàng</span><strong className="text-zinc-950">{order.orderNumber}</strong></div>
                    <div className="mt-3 flex justify-between gap-4 text-sm"><span className="text-zinc-500">Tổng thanh toán</span><strong className="text-zinc-950">{formatPrice(order.totalAmount)}</strong></div>
                    <div className="mt-4 border-t border-zinc-200 pt-4 text-sm"><p className="font-semibold text-zinc-800">Giao tới {order.shippingAddress.fullName}</p><p className="mt-1 leading-5 text-zinc-500">{order.shippingAddress.street}, {order.shippingAddress.ward}, {order.shippingAddress.district}, {order.shippingAddress.province}</p></div>
                </div>
                {order.warnings.length > 0 ? <p className="mx-auto mt-5 max-w-md rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-left text-xs leading-5 text-amber-800">{order.warnings[0]}</p> : null}
                <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                    <Link href="/" className="inline-flex h-11 items-center justify-center rounded-xl bg-zinc-950 px-5 text-sm font-semibold text-white hover:bg-zinc-800">Tiếp tục mua sắm</Link>
                    <Link href={`/profile/orders/${order.id}`} className="inline-flex h-11 items-center justify-center rounded-xl border border-zinc-200 px-5 text-sm font-semibold text-zinc-700 hover:bg-zinc-50">Xem đơn hàng</Link>
                </div>
            </section>
        </CheckoutShell>
    );
}

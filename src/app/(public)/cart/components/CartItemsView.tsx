// File này hiển thị danh sách item, thao tác quantity và tổng tiền tạm tính của cart.
// Component không tự tính giá hoặc gọi API; mutation và dữ liệu thuộc về Cart feature hooks.

// Component này hiển thị danh sách item, thao tác quantity và tổng tiền tạm tính của cart.
// Component không tự tính hay lưu dữ liệu; mọi mutation được ủy quyền cho Cart Service qua CartItemActions.

'use client';

import { useState } from 'react';
import { ArrowRight, ImageOff, Info, ShoppingBag, ShoppingCart } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import type { Cart } from '../types/cart.types';
import { CartItemActions } from './CartItemActions';

interface CartItemsViewProps {
    cart: Cart;
}

// Định dạng snapshot price thành tiền Việt để UI không phải tự suy luận scale numeric từ API.
function formatCartPrice(value: string): string {
    const amount = Number(value);
    if (!Number.isFinite(amount)) return '0 ₫';

    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
        maximumFractionDigits: 0,
    }).format(amount);
}

// Render danh sách item và subtotal từ response backend, giữ bố cục nhất quán với trang cart hiện tại.
export function CartItemsView({ cart }: CartItemsViewProps) {
    const router = useRouter();
    const [isExternalNoticeOpen, setIsExternalNoticeOpen] = useState(false);
    const externalItemCount = cart.items.filter(
        (item) => item.originType === 'EXTERNAL',
    ).length;
    const hasExternalItems = externalItemCount > 0;

    // Mo popup giai thich ly do chua the checkout va dua nguoi dung ve shop noi bo.
    function handleCheckout() {
        if (hasExternalItems) {
            setIsExternalNoticeOpen(true);
            return;
        }

        router.push('/checkout');
    }

    return (
        <div className="grid gap-5 px-5 py-6 sm:px-6 sm:py-7 lg:grid-cols-[minmax(0,1fr)_300px]">
            <section aria-labelledby="cart-items-title">
                <div className="flex flex-wrap items-end justify-between gap-3">
                    <div>
                        <h2
                            id="cart-items-title"
                            className="mt-1 text-xl font-semibold tracking-tight text-zinc-950"
                        >
                            Giỏ hàng của bạn
                        </h2>
                    </div>
                    <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-semibold text-zinc-600">
                        {cart.totalItems} sản phẩm
                    </span>
                </div>

                <div className="mt-5 hidden grid-cols-[80px_minmax(0,1fr)_120px_150px_130px_120px] gap-6 px-5 text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-400 lg:grid">
                    <span className="col-span-2">Sản phẩm</span>
                    <span className="text-right">Đơn giá</span>
                    <span className="text-center">Số lượng</span>
                    <span className="text-right">Số tiền</span>
                    <span className="text-right">Thao tác</span>
                </div>

                <div className="mt-2 divide-y divide-zinc-100 rounded-2xl border border-zinc-200 bg-white">
                    {cart.items.map((item) => (
                        <article
                            key={item.id}
                            className="grid grid-cols-[64px_minmax(0,1fr)] gap-x-4 gap-y-3 p-4 sm:grid-cols-[80px_minmax(0,1fr)] sm:gap-x-5 sm:p-5 lg:grid-cols-[80px_minmax(0,1fr)_120px_150px_130px_120px] lg:items-center lg:gap-6"
                        >
                            <Link
                                href={`/products/${item.productId}`}
                                aria-label={`Xem chi tiết ${item.productName}`}
                                className="group row-span-5 flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-zinc-100 transition-transform hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2 sm:h-20 sm:w-20 lg:row-span-1"
                            >
                                {item.imageUrl ? (
                                    <img
                                        src={item.imageUrl}
                                        alt={item.productName}
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    <ImageOff
                                        className="h-6 w-6 text-zinc-400"
                                        aria-label="Sản phẩm không có hình ảnh"
                                    />
                                )}
                            </Link>

                            <Link
                                href={`/products/${item.productId}`}
                                aria-label={`Xem chi tiết ${item.productName}`}
                                className="group min-w-0 cursor-pointer lg:col-start-2"
                            >
                                <h3 className="line-clamp-2 text-base font-semibold leading-5 text-zinc-950 transition-colors group-hover:text-zinc-600 group-hover:underline">
                                    {item.productName}
                                </h3>
                                {item.variantName &&
                                item.variantName !== item.productName ? (
                                    <p className="mt-1 line-clamp-1 text-sm text-zinc-500 transition-colors group-hover:text-zinc-600">
                                        {item.variantName}
                                    </p>
                                ) : null}
                                {item.originType === 'EXTERNAL' ? (
                                    <span className="mt-2 inline-flex rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-700">
                                        Sản phẩm tham khảo
                                    </span>
                                ) : null}
                            </Link>

                            <div className="col-start-2 flex items-center justify-between gap-3 text-left lg:col-start-3 lg:block lg:text-right">
                                <span className="text-xs text-zinc-400 lg:hidden">Đơn giá</span>
                                <p className="text-sm font-medium text-zinc-700">
                                    {formatCartPrice(item.unitPrice)}
                                </p>
                            </div>

                            <div className="col-start-2 flex items-center justify-between gap-3 lg:col-start-4 lg:justify-center">
                                <span className="text-xs text-zinc-400 lg:hidden">Số lượng</span>
                                <CartItemActions item={item} mode="quantity" />
                            </div>

                            <div className="col-start-2 flex items-center justify-between gap-3 text-left lg:col-start-5 lg:block lg:text-right">
                                <span className="text-xs text-zinc-400 lg:hidden">Số tiền</span>
                                <p className="text-base font-bold text-red-600">
                                    {formatCartPrice(item.lineTotal)}
                                </p>
                            </div>

                            <div className="col-start-2 flex items-center justify-between gap-3 lg:col-start-6 lg:justify-self-end">
                                <span className="text-xs text-zinc-400 lg:hidden">Thao tác</span>
                                <CartItemActions item={item} mode="remove" />
                            </div>
                        </article>
                    ))}
                </div>
            </section>

            <aside className="h-fit rounded-2xl border border-zinc-200 bg-zinc-50 p-5 sm:p-6">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-950 text-white">
                        <ShoppingBag className="h-5 w-5" aria-hidden="true" />
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-zinc-950">
                            Tóm tắt đơn hàng
                        </p>
                        <p className="mt-1 text-xs text-zinc-500">
                            Giá tạm tính từ lúc thêm sản phẩm
                        </p>
                    </div>
                </div>

                <div className="mt-6 flex items-center justify-between border-t border-zinc-200 pt-5 text-sm">
                    <span className="text-zinc-600">Tạm tính</span>
                    <strong className="text-lg text-zinc-950">
                        {formatCartPrice(cart.subtotal)}
                    </strong>
                </div>

                <p className="mt-4 text-xs leading-5 text-zinc-500">
                    Giá và tồn kho sẽ được kiểm tra lại khi bạn tiến hành đặt
                    hàng.
                </p>

                <button
                    type="button"
                    onClick={handleCheckout}
                    className="mt-6 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-zinc-950 px-5 text-sm font-semibold text-white transition-colors hover:bg-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2"
                >
                    Thanh toán
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </button>
            </aside>

            <AlertDialog
                open={isExternalNoticeOpen}
                onOpenChange={setIsExternalNoticeOpen}
            >
                <AlertDialogContent className="max-w-lg gap-0 overflow-hidden p-0">
                    <AlertDialogHeader className="border-b border-zinc-100 px-6 pb-5 pt-6 sm:px-7">
                        <div className="flex items-center gap-3">
                            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-zinc-100 text-zinc-700">
                                <Info className="size-5" aria-hidden="true" />
                            </div>
                            <AlertDialogTitle className="text-lg leading-7">
                                Sản phẩm dữ liệu tham khảo
                            </AlertDialogTitle>
                        </div>
                        <AlertDialogDescription className="mt-2 max-w-md leading-6">
                            Đây là dữ liệu được crawl để phục vụ{' '}
                            <strong className="font-semibold text-zinc-700">
                                gợi ý sản phẩm
                            </strong>
                            ,{' '}
                            <strong className="font-semibold text-zinc-700">
                                tìm kiếm
                            </strong>{' '}
                            và{' '}
                            <strong className="font-semibold text-zinc-700">
                                phân tích hành vi
                            </strong>{' '}
                            trên hệ thống.
                        </AlertDialogDescription>
                    </AlertDialogHeader>

                    <div className="space-y-3 px-6 py-5 sm:px-7">
                        <div className="rounded-xl border border-zinc-200 bg-white px-4 py-3.5">
                            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
                                Vì sao có dữ liệu từ nguồn khác?
                            </p>
                            <p className="mt-1 text-sm leading-6 text-zinc-700">
                                Hệ thống crawl thêm sản phẩm và shop từ nguồn công khai để có nhiều ngành hàng, mức giá và bối cảnh mua sắm đa dạng hơn. Nhờ đó, các tính năng{' '}
                                <strong className="font-semibold text-zinc-800">
                                    tìm kiếm và gợi ý sản phẩm
                                </strong>{' '}
                                được đánh giá gần với dữ liệu thực tế hơn.
                            </p>
                        </div>

                        <div className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3.5">
                            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
                                Phạm vi dữ liệu
                            </p>
                            <p className="mt-1 text-sm leading-6 text-zinc-700">
                                Đã có{' '}
                                <strong className="font-semibold text-zinc-800">
                                    thông tin sản phẩm và thông tin shop
                                </strong>. Chưa đồng bộ{' '}
                                <strong className="font-semibold text-zinc-800">
                                    tài khoản người bán, tồn kho thực tế, thanh toán
                                </strong>{' '}
                                và{' '}
                                <strong className="font-semibold text-zinc-800">
                                    vận chuyển
                                </strong>.
                            </p>
                        </div>

                        <div className="flex gap-3 rounded-xl border border-zinc-200 bg-white px-4 py-3.5 text-sm leading-6 text-zinc-700">
                            <ShoppingCart className="mt-0.5 size-4 shrink-0 text-zinc-500" aria-hidden="true" />
                            <p>
                                Để thanh toán, hãy{' '}
                                <strong className="font-semibold text-zinc-800">
                                    xóa sản phẩm tham khảo khỏi giỏ hàng
                                </strong>{' '}
                                và chọn sản phẩm thuộc{' '}
                                <strong className="font-semibold text-zinc-800">
                                    shop nội bộ
                                </strong>.
                            </p>
                        </div>
                    </div>

                    <AlertDialogFooter className="border-t border-zinc-100 bg-zinc-50/70 px-6 py-4 sm:px-7">
                        <AlertDialogCancel className="h-10 rounded-xl border-zinc-200 bg-white">
                            Để sau
                        </AlertDialogCancel>
                        <AlertDialogAction
                            asChild
                            className="h-10 rounded-xl bg-zinc-950 hover:bg-zinc-800"
                        >
                            <Link href="/internal-shop">
                                Chọn shop nội bộ
                                <ArrowRight className="ml-2 size-4" aria-hidden="true" />
                            </Link>
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

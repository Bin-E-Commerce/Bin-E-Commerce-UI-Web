// Component này hiển thị danh sách item, thao tác quantity và tổng tiền tạm tính của cart.
// Component không tự tính hay lưu dữ liệu; mọi mutation được ủy quyền cho Cart Service qua CartItemActions.

'use client';

import { ArrowRight, ImageOff, ShoppingBag } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

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
    // Chỉ mở thông báo tại chỗ vì checkout chưa có route xử lý; không giả lập điều hướng
    // hoặc tạo đơn hàng khi backend chưa cung cấp nghiệp vụ thanh toán chính thức.
    const [showCheckoutNotice, setShowCheckoutNotice] = useState(false);

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
                    onClick={() => setShowCheckoutNotice(true)}
                    className="mt-6 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-zinc-950 px-5 text-sm font-semibold text-white transition-colors hover:bg-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2"
                >
                    Thanh toán
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </button>
                {showCheckoutNotice ? (
                    <p
                        className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-center text-xs font-medium leading-5 text-amber-800"
                        role="status"
                    >
                        Tính năng thanh toán đang được phát triển.
                    </p>
                ) : null}
            </aside>
        </div>
    );
}

// Component này hiển thị nhanh các sản phẩm trong giỏ hàng từ active cart.
// Component chỉ phục vụ xem nhanh; các thao tác cập nhật số lượng và xóa item nằm ngoài Phase 2.

'use client';

import Link from 'next/link';

import type { Cart } from '@/features/cart/types/cart.types';
import { CartItemActions } from '@/features/cart/components/CartItemActions';

interface CartPreviewProps {
    cart?: Cart;
    isLoading: boolean;
    isError: boolean;
    onClose: () => void;
    onRetry: () => void;
}

// Định dạng giá theo tiền Việt Nam để mini-cart hiển thị thống nhất với trang cart.
function formatCartPrice(value: string): string {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
        maximumFractionDigits: 0,
    }).format(Number(value));
}

// Hiển thị trạng thái loading, lỗi, rỗng hoặc danh sách item rút gọn của cart.
export function CartPreview({
    cart,
    isLoading,
    isError,
    onClose,
    onRetry,
}: CartPreviewProps) {
    const previewItems = cart?.items.slice(0, 3) ?? [];
    const remainingItemCount = Math.max(
        (cart?.items.length ?? 0) - previewItems.length,
        0,
    );

    return (
        <div
            className="absolute right-0 top-full z-50 mt-3 w-[min(560px,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-zinc-200 bg-white text-zinc-900 shadow-xl shadow-zinc-900/15"
            role="dialog"
            aria-label="Xem nhanh giỏ hàng"
        >
            <div className="flex items-center justify-between border-b border-zinc-100 px-6 py-5">
                <div>
                    <h2 className="text-base font-bold text-zinc-950">Giỏ hàng</h2>
                    {cart && (
                        <p className="mt-1 text-xs text-zinc-500">
                            {cart.totalItems} sản phẩm
                        </p>
                    )}
                </div>
                <Link
                    href="/cart"
                    onClick={onClose}
                    className="text-xs font-semibold text-zinc-950 transition-colors hover:text-zinc-600"
                >
                    Xem tất cả
                </Link>
            </div>

            {isLoading && (
                <div
                    className="space-y-3 px-5 py-5"
                    aria-live="polite"
                    aria-busy="true"
                >
                    {[1, 2].map((item) => (
                        <div
                            key={item}
                            className="flex animate-pulse items-center gap-3"
                        >
                            <div className="h-14 w-14 rounded-xl bg-zinc-100" />
                            <div className="min-w-0 flex-1 space-y-2">
                                <div className="h-3 w-4/5 rounded bg-zinc-100" />
                                <div className="h-3 w-2/5 rounded bg-zinc-100" />
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {!isLoading && isError && (
                <div className="px-5 py-7 text-center">
                    <p className="text-sm font-semibold text-zinc-800">
                        Không thể tải giỏ hàng
                    </p>
                    <p className="mt-1 text-xs text-zinc-500">
                        Vui lòng thử lại sau giây lát.
                    </p>
                    <button
                        type="button"
                        onClick={onRetry}
                        className="mt-4 rounded-lg bg-zinc-950 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-zinc-800"
                    >
                        Thử lại
                    </button>
                </div>
            )}

            {!isLoading && !isError && previewItems.length === 0 && (
                <div className="px-5 py-8 text-center">
                    <p className="text-sm font-semibold text-zinc-800">
                        Giỏ hàng đang trống
                    </p>
                    <p className="mt-1 text-xs text-zinc-500">
                        Thêm sản phẩm để xem chúng ở đây.
                    </p>
                    <Link
                        href="/"
                        onClick={onClose}
                        className="mt-4 inline-flex rounded-lg bg-zinc-950 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-zinc-800"
                    >
                        Khám phá sản phẩm
                    </Link>
                </div>
            )}

            {!isLoading && !isError && previewItems.length > 0 && (
                <>
                    <div className="max-h-96 divide-y divide-zinc-100 overflow-y-auto px-6">
                        {previewItems.map((item) => (
                            <div
                                key={item.id}
                                className="flex gap-4 py-4 first:pt-5 last:pb-5"
                            >
                                <Link
                                    href={`/products/${item.productId}`}
                                    onClick={onClose}
                                    aria-label={`Xem chi tiết ${item.productName}`}
                                    className="group flex h-16 w-16 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-2xl transition-transform hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2"
                                >
                                    {item.imageUrl ? (
                                        <img
                                            src={item.imageUrl}
                                            alt={item.productName}
                                            className="h-full w-full rounded-2xl border border-zinc-100 object-cover"
                                        />
                                    ) : (
                                        <span
                                            className="flex h-full w-full items-center justify-center rounded-2xl bg-zinc-100 text-[10px] font-semibold text-zinc-400"
                                            aria-label="Sản phẩm chưa có ảnh"
                                        >
                                            Không ảnh
                                        </span>
                                    )}
                                </Link>
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-start justify-between gap-4">
                                        <Link
                                            href={`/products/${item.productId}`}
                                            onClick={onClose}
                                            aria-label={`Xem chi tiết ${item.productName}`}
                                            className="group min-w-0 cursor-pointer"
                                        >
                                            <p className="line-clamp-2 text-sm font-semibold leading-5 text-zinc-900 transition-colors group-hover:text-zinc-600 group-hover:underline">
                                                {item.productName}
                                            </p>
                                            {item.variantName && item.variantName !== item.productName ? (
                                                <p className="mt-1 truncate text-xs text-zinc-500 transition-colors group-hover:text-zinc-600">
                                                    {item.variantName}
                                                </p>
                                            ) : null}
                                        </Link>
                                        <span className="shrink-0 text-sm font-bold text-red-600">
                                            {formatCartPrice(item.lineTotal)}
                                        </span>
                                    </div>
                                    <div className="mt-3 flex items-center justify-between gap-3">
                                        <span className="text-xs text-zinc-500">
                                            {formatCartPrice(item.unitPrice)} × {item.quantity}
                                        </span>
                                        <CartItemActions item={item} compact />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="border-t border-zinc-100 px-6 py-5">
                        {remainingItemCount > 0 && (
                            <p className="mb-3 text-xs text-zinc-500">
                                Còn {remainingItemCount} sản phẩm khác trong giỏ hàng.
                            </p>
                        )}
                        <div className="flex items-center justify-between gap-3">
                            <span className="text-sm text-zinc-500">Tạm tính</span>
                            <span className="text-base font-bold text-zinc-950">
                                {formatCartPrice(cart?.subtotal ?? '0')}
                            </span>
                        </div>
                        <Link
                            href="/cart"
                            onClick={onClose}
                            className="mt-4 flex h-11 items-center justify-center rounded-xl bg-zinc-950 text-sm font-bold text-white transition-colors hover:bg-zinc-800"
                        >
                            Xem giỏ hàng
                        </Link>
                    </div>
                </>
            )}
        </div>
    );
}

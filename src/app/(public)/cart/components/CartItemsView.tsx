// File này hiển thị item, checkbox chọn mua, quantity và tạm tính của cart.
// Selection chỉ giới hạn item gửi sang checkout; Cart/Order Service vẫn xác thực lại item, giá và tồn kho.

'use client';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';

import { ArrowRight, ImageOff, ShoppingBag } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

import { MAX_PARTIAL_CHECKOUT_ITEMS } from '../constants/cart-selection.constants';
import type { CartItemsViewProps } from '../types/cart-selection.types';
import { CartItemActions } from './CartItemActions';
import { useCartSelection } from '../hooks/use-cart-selection';

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

// Render cart và điều hướng checkout; selectItemId reactive để Mua ngay chọn đúng dòng.
// Toàn cart bỏ danh sách ID, còn selection một phần tuân theo giới hạn API.
export function CartItemsView({ cart }: CartItemsViewProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const selection = useCartSelection(
        cart.items,
        searchParams.get('selectItemId'),
    );
    const exceedsPartialSelectionLimit =
        !selection.isAllSelected &&
        selection.selectedItemIds.length > MAX_PARTIAL_CHECKOUT_ITEMS;

    // Gửi toàn cart không kèm ID để tránh giới hạn query; selection một phần gửi ID đã sắp xếp giống quote và tạo order.
    // Dừng sớm nếu selection rỗng hoặc vượt giới hạn 100 ID mà Cart Service xác minh được.
    function handleCheckout() {
        if (
            selection.selectedItemIds.length === 0 ||
            exceedsPartialSelectionLimit
        ) {
            return;
        }
        if (selection.isAllSelected) {
            router.push('/checkout');
            return;
        }
        const selectedIds = [...selection.selectedItemIds].sort();
        router.push(
            `/checkout?cartItemIds=${encodeURIComponent(selectedIds.join(','))}`,
        );
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

                <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3">
                    <div className="flex items-center gap-2.5 text-sm font-medium text-zinc-700">
                        <Checkbox
                            checked={selection.isAllSelected}
                            indeterminate={selection.isPartiallySelected}
                            aria-label="Chọn tất cả sản phẩm"
                            onCheckedChange={(checked) =>
                                selection.toggleAll(checked === true)
                            }
                        />
                        <span>Chọn tất cả ({cart.items.length})</span>
                    </div>
                    <span className="text-xs text-zinc-500">
                        Đã chọn {selection.selectedQuantity} sản phẩm
                    </span>
                </div>

                <div className="mt-3 hidden grid-cols-[24px_80px_minmax(0,1fr)_120px_150px_130px_120px] gap-5 px-5 text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-400 lg:grid">
                    <span aria-hidden="true" />
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
                            className="grid grid-cols-[20px_64px_minmax(0,1fr)] gap-x-3 gap-y-3 p-4 sm:grid-cols-[24px_80px_minmax(0,1fr)] sm:gap-x-4 sm:p-5 lg:grid-cols-[24px_80px_minmax(0,1fr)_120px_150px_130px_120px] lg:items-center lg:gap-5"
                        >
                            <div className="row-span-5 flex items-start justify-center pt-2 lg:row-span-1 lg:items-center lg:pt-0">
                                <Checkbox
                                    checked={selection.selectedItemIds.includes(
                                        item.id,
                                    )}
                                    aria-label={`Chọn ${item.productName}`}
                                    onCheckedChange={(checked) =>
                                        selection.toggleItem(
                                            item.id,
                                            checked === true,
                                        )
                                    }
                                />
                            </div>
                            <Link
                                href={`/products/${item.productId}`}
                                aria-label={`Xem chi tiết ${item.productName}`}
                                className="group col-start-2 row-span-5 flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-zinc-100 transition-transform hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2 sm:h-20 sm:w-20 lg:row-span-1"
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
                                className="group col-start-3 min-w-0 cursor-pointer"
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

                            <div className="col-start-3 flex items-center justify-between gap-3 text-left lg:col-start-4 lg:block lg:text-right">
                                <span className="text-xs text-zinc-400 lg:hidden">
                                    Đơn giá
                                </span>
                                <p className="text-sm font-medium text-zinc-700">
                                    {formatCartPrice(item.unitPrice)}
                                </p>
                            </div>

                            <div className="col-start-3 flex items-center justify-between gap-3 lg:col-start-5 lg:justify-center">
                                <span className="text-xs text-zinc-400 lg:hidden">
                                    Số lượng
                                </span>
                                <CartItemActions item={item} mode="quantity" />
                            </div>

                            <div className="col-start-3 flex items-center justify-between gap-3 text-left lg:col-start-6 lg:block lg:text-right">
                                <span className="text-xs text-zinc-400 lg:hidden">
                                    Số tiền
                                </span>
                                <p className="text-base font-bold text-red-600">
                                    {formatCartPrice(item.lineTotal)}
                                </p>
                            </div>

                            <div className="col-start-3 flex items-center justify-between gap-3 lg:col-start-7 lg:justify-self-end">
                                <span className="text-xs text-zinc-400 lg:hidden">
                                    Thao tác
                                </span>
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
                    <span className="text-zinc-600">Tạm tính đã chọn</span>
                    <strong className="text-lg text-zinc-950">
                        {formatCartPrice(selection.selectedSubtotal)}
                    </strong>
                </div>

                <p className="mt-2 text-xs text-zinc-500">
                    {selection.selectedQuantity} sản phẩm được chọn để thanh
                    toán.
                </p>
                {exceedsPartialSelectionLimit ? (
                    <p role="alert" className="mt-2 text-xs text-red-600">
                        Khi thanh toán một phần, bạn có thể chọn tối đa{' '}
                        {MAX_PARTIAL_CHECKOUT_ITEMS} mặt hàng. Hãy chọn tất cả
                        hoặc bỏ bớt mặt hàng.
                    </p>
                ) : null}

                <p className="mt-4 text-xs leading-5 text-zinc-500">
                    Giá và tồn kho sẽ được kiểm tra lại khi bạn tiến hành đặt
                    hàng.
                </p>

                <Button
                    type="button"
                    onClick={handleCheckout}
                    disabled={
                        selection.selectedItemIds.length === 0 ||
                        exceedsPartialSelectionLimit
                    }
                    className="mt-6 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-zinc-950 px-5 text-sm font-semibold text-white transition-colors hover:bg-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2"
                >
                    Thanh toán sản phẩm đã chọn
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Button>
            </aside>
        </div>
    );
}

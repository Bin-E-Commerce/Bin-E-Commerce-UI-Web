// Hiển thị sản phẩm, tình trạng tồn kho và tạm tính trong giỏ hàng.
// Giao diện chỉ chọn các dòng gửi sang checkout; Order Service vẫn xác thực lại giá và tồn kho.

'use client';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';

import { ArrowRight, ImageOff, Info, ShoppingBag } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

import { MAX_PARTIAL_CHECKOUT_ITEMS } from '../constants/cart-selection.constants';
import { useCartSelection } from '../hooks/use-cart-selection';
import type { CartItemsViewProps } from '../types/cart-selection.types';
import { isCartItemSelectable } from '../utils/is-cart-item-selectable';
import { CartItemAvailability } from './CartItemAvailability';
import { CartItemActions } from './CartItemActions';

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

// Hiển thị giỏ hàng và đồng bộ lựa chọn Mua ngay qua selectItemId.
// Checkbox tổng chỉ đếm dòng mua được; checkout chỉ bỏ danh sách ID khi mọi dòng trong giỏ đều được chọn.
// Dòng chưa mua được vẫn hiển thị cạnh các dòng còn hàng để khách xem lại hoặc xóa khi cần.
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
    const unavailableItemCount =
        cart.items.length - selection.selectableItemCount;
    const hasSelectableItems = selection.selectableItemCount > 0;
    // Khi giỏ có hàng bị khóa, checkbox tổng vẫn đánh dấu đủ nếu đã chọn hết các dòng mua được.
    const allPurchasableItemsSelected =
        hasSelectableItems &&
        selection.selectedItemIds.length === selection.selectableItemCount;
    // Dùng cùng bộ cột cho tiêu đề và sản phẩm; max-content giữ nguyên tiền dài và không đẩy ký hiệu ₫ xuống dòng.
    const desktopCartGridColumns =
        'lg:grid-cols-[20px_72px_minmax(0,1fr)_minmax(104px,max-content)_112px_minmax(112px,max-content)_64px]';

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
        <div className="grid gap-5 px-4 py-6 sm:px-6 sm:py-7 xl:grid-cols-[minmax(0,1fr)_300px]">
            <section aria-labelledby="cart-items-title" className="min-w-0">
                <div className="flex flex-wrap items-end justify-between gap-3">
                    <div>
                        <h2
                            id="cart-items-title"
                            className="mt-1 text-xl font-semibold tracking-tight text-foreground"
                        >
                            Giỏ hàng của bạn
                        </h2>
                    </div>
                    <span className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-secondary-foreground">
                        {cart.totalItems} sản phẩm
                    </span>
                </div>

                <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-muted/60 px-4 py-3">
                    <div className="flex items-center gap-2.5 text-sm font-medium text-foreground">
                        <Checkbox
                            checked={allPurchasableItemsSelected}
                            indeterminate={
                                selection.isPartiallySelected &&
                                !allPurchasableItemsSelected
                            }
                            aria-label="Chọn tất cả sản phẩm có thể mua"
                            disabled={!hasSelectableItems}
                            onCheckedChange={(checked) =>
                                selection.toggleAll(checked === true)
                            }
                        />
                        <span
                            className={cn(
                                !hasSelectableItems && 'text-muted-foreground',
                            )}
                        >
                            {unavailableItemCount > 0 ? (
                                <>
                                    Chọn tất cả có thể mua (
                                    {selection.selectableItemCount})
                                </>
                            ) : (
                                <>
                                    Chọn tất cả ({selection.selectableItemCount}
                                    )
                                </>
                            )}
                        </span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                        Đã chọn {selection.selectedQuantity} sản phẩm
                    </span>
                </div>

                <div
                    className={cn(
                        'mt-4 hidden gap-x-3 px-5 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground lg:grid',
                        desktopCartGridColumns,
                    )}
                >
                    <span aria-hidden="true" />
                    <span className="col-span-2">Sản phẩm</span>
                    <span className="text-right">Đơn giá</span>
                    <span className="text-center">Số lượng</span>
                    <span className="text-right">Số tiền</span>
                    <span className="text-right">Thao tác</span>
                </div>

                <div className="mt-2 divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
                    {cart.items.map((item) => {
                        // Nền dịu và giá trung tính phân biệt dòng bị khóa mà vẫn giữ nội dung dễ đọc.
                        const isSelectable = isCartItemSelectable(item);
                        return (
                            <article
                                key={item.id}
                                className={cn(
                                    'grid grid-cols-[20px_56px_minmax(0,1fr)] gap-x-3 gap-y-2 p-3.5 sm:grid-cols-[20px_72px_minmax(0,1fr)] sm:p-5 lg:items-center',
                                    desktopCartGridColumns,
                                    !isSelectable && 'bg-muted/55',
                                )}
                            >
                                <div className="row-span-5 flex items-start justify-center pt-2 lg:row-span-1 lg:items-center lg:pt-0">
                                    <Checkbox
                                        checked={selection.selectedItemIds.includes(
                                            item.id,
                                        )}
                                        aria-label={`Chọn ${item.productName}`}
                                        disabled={!isSelectable}
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
                                    className="col-start-2 row-span-5 flex size-14 shrink-0 items-center justify-center self-start overflow-hidden rounded-xl bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:size-[72px] lg:row-span-1 lg:self-center"
                                >
                                    {item.imageUrl ? (
                                        <img
                                            src={item.imageUrl}
                                            alt={item.productName}
                                            className={cn(
                                                'h-full w-full object-cover',
                                                !isSelectable &&
                                                    'grayscale opacity-75',
                                            )}
                                        />
                                    ) : (
                                        <ImageOff
                                            className="size-6 text-muted-foreground"
                                            aria-label="Sản phẩm không có hình ảnh"
                                        />
                                    )}
                                </Link>

                                <div className="col-start-3 min-w-0 space-y-1.5">
                                    <h3 className="line-clamp-2 text-sm font-semibold leading-5 text-foreground sm:text-base">
                                        <Link
                                            href={`/products/${item.productId}`}
                                            className="hover:underline"
                                        >
                                            {item.productName}
                                        </Link>
                                    </h3>
                                    {item.variantName &&
                                    item.variantName !== item.productName ? (
                                        <p className="line-clamp-1 text-xs text-muted-foreground sm:text-sm">
                                            {item.variantName}
                                        </p>
                                    ) : null}
                                    <CartItemAvailability item={item} />
                                </div>

                                <div className="col-start-3 flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-left lg:col-start-4 lg:block lg:text-right">
                                    <span className="text-xs text-muted-foreground lg:hidden">
                                        Đơn giá
                                    </span>
                                    <p className="text-sm font-medium whitespace-nowrap tabular-nums text-muted-foreground">
                                        {formatCartPrice(item.unitPrice)}
                                    </p>
                                </div>

                                <div className="col-start-3 flex flex-wrap items-center justify-between gap-x-3 gap-y-1 lg:col-start-5 lg:justify-center">
                                    <span className="text-xs text-muted-foreground lg:hidden">
                                        Số lượng
                                    </span>
                                    <CartItemActions
                                        item={item}
                                        mode="quantity"
                                    />
                                </div>

                                <div className="col-start-3 flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-left lg:col-start-6 lg:block lg:text-right">
                                    <span className="text-xs text-muted-foreground lg:hidden">
                                        Số tiền
                                    </span>
                                    <p
                                        className={cn(
                                            'text-sm font-semibold whitespace-nowrap tabular-nums sm:text-base',
                                            isSelectable
                                                ? 'text-destructive'
                                                : 'text-muted-foreground',
                                        )}
                                    >
                                        {formatCartPrice(item.lineTotal)}
                                    </p>
                                </div>

                                <div className="col-start-3 flex items-center justify-between gap-3 lg:col-start-7 lg:justify-self-end">
                                    <span className="text-xs text-muted-foreground lg:hidden">
                                        Thao tác
                                    </span>
                                    <CartItemActions
                                        item={item}
                                        mode="remove"
                                    />
                                </div>
                            </article>
                        );
                    })}
                </div>
            </section>

            <aside className="h-fit min-w-0 rounded-2xl border border-border bg-muted/40 p-5 sm:p-6">
                <div className="flex items-center gap-3">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                        <ShoppingBag className="h-5 w-5" aria-hidden="true" />
                    </div>
                    <div>
                        <h2 className="text-sm font-semibold text-foreground">
                            Tóm tắt đơn hàng
                        </h2>
                        <p className="mt-1 text-xs text-muted-foreground">
                            Giá được cập nhật khi tải giỏ hàng
                        </p>
                    </div>
                </div>

                <div className="mt-5 flex flex-wrap items-center justify-between gap-x-3 border-t border-border pt-4 text-sm">
                    <span className="text-muted-foreground">
                        Tạm tính đã chọn
                    </span>
                    <strong className="shrink-0 text-lg whitespace-nowrap tabular-nums text-foreground">
                        {formatCartPrice(selection.selectedSubtotal)}
                    </strong>
                </div>

                <p className="mt-1 text-xs text-muted-foreground">
                    {selection.selectedQuantity} sản phẩm được chọn để thanh
                    toán.
                </p>
                {unavailableItemCount > 0 ? (
                    <div
                        aria-live="polite"
                        className="mt-4 flex items-start gap-2.5 rounded-xl border border-border bg-card px-3 py-2.5 text-xs leading-5"
                    >
                        <Info
                            className="mt-0.5 size-4 shrink-0 text-muted-foreground"
                            aria-hidden="true"
                        />
                        <div>
                            <p className="font-semibold text-foreground">
                                {hasSelectableItems ? (
                                    <>
                                        {unavailableItemCount} mặt hàng chưa thể
                                        thanh toán
                                    </>
                                ) : (
                                    <>Chưa có mặt hàng có thể thanh toán</>
                                )}
                            </p>
                            <p className="mt-0.5 text-muted-foreground">
                                {hasSelectableItems ? (
                                    <>
                                        Các mặt hàng này vẫn được giữ trong giỏ.
                                        Bạn có thể thanh toán những món còn mua
                                        được.
                                    </>
                                ) : (
                                    <>
                                        Sản phẩm vẫn được giữ trong giỏ. Bạn có
                                        thể xem lại hoặc xóa khi cần.
                                    </>
                                )}
                            </p>
                        </div>
                    </div>
                ) : null}
                {exceedsPartialSelectionLimit ? (
                    <p role="alert" className="mt-2 text-xs text-destructive">
                        Khi thanh toán một phần, bạn có thể chọn tối đa{' '}
                        {MAX_PARTIAL_CHECKOUT_ITEMS} mặt hàng. Hãy chọn tất cả
                        hoặc bỏ bớt mặt hàng.
                    </p>
                ) : null}

                {hasSelectableItems && (
                    <p className="mt-4 text-xs leading-5 text-muted-foreground">
                        Giá và tồn kho sẽ được kiểm tra lại khi bạn tiến hành
                        đặt hàng.
                    </p>
                )}

                <Button
                    type="button"
                    onClick={handleCheckout}
                    disabled={
                        selection.selectedItemIds.length === 0 ||
                        exceedsPartialSelectionLimit
                    }
                    className="mt-5 h-auto min-h-11 w-full gap-2 rounded-xl px-3 py-2 text-center leading-5 font-semibold whitespace-normal"
                >
                    {hasSelectableItems ? (
                        <>
                            Thanh toán
                            <ArrowRight className="size-4" aria-hidden="true" />
                        </>
                    ) : (
                        'Chưa thể thanh toán'
                    )}
                </Button>
            </aside>
        </div>
    );
}

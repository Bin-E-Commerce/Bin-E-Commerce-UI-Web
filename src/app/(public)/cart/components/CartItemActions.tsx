// Bộ thao tác số lượng dùng chung cho trang giỏ và giỏ xem trước.
// Hàng hết hoặc ngừng bán khóa tăng/giảm, còn xóa luôn khả dụng để khách dọn giỏ.

'use client';
import { Button } from '@/components/ui/button';

import { Minus, Plus, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

import {
    useRemoveCartItem,
    useUpdateCartItem,
} from '../hooks/use-cart-item-actions';
import type { CartItemActionsProps } from '../types/cart-selection.types';

// Khóa cả hai nút khi hết hàng/ngừng bán; hàng thiếu tồn vẫn cho giảm để có thể mua lại.
// Tăng bị khóa nếu số hiện tại đã chạm tồn được báo; backend vẫn kiểm tra lại lúc cập nhật.
// Xóa vẫn gửi mutation độc lập với tồn kho và trạng thái sản phẩm.
export function CartItemActions({
    item,
    compact = false,
    mode = 'all',
}: CartItemActionsProps) {
    const updateMutation = useUpdateCartItem();
    const removeMutation = useRemoveCartItem();
    const isUpdating = updateMutation.isPending;
    const isRemoving = removeMutation.isPending;
    const isBusy = isUpdating || isRemoving;
    const buttonSize = compact ? 'h-7 w-7' : 'h-9 w-9';
    const removeButtonSize = compact ? buttonSize : 'h-9 rounded-lg px-2.5';
    const showQuantityActions = mode !== 'remove';
    const showRemoveAction = mode !== 'quantity';
    const quantityLocked =
        item.availabilityStatus === 'OUT_OF_STOCK' ||
        item.availabilityStatus === 'UNAVAILABLE';
    const increaseBlockedByStock =
        item.availabilityStatus === 'INSUFFICIENT_STOCK' ||
        (item.availableQuantity != null &&
            item.availableQuantity <= item.quantity);

    // Không gửi giảm cho hàng hết/ngừng bán hoặc số lượng tối thiểu; xóa là thao tác riêng.
    function handleDecrease(): void {
        if (item.quantity <= 1 || isBusy || quantityLocked) return;
        updateMutation.mutate({ itemId: item.id, quantity: item.quantity - 1 });
    }

    // Không gửi tăng khi hết hàng, thiếu tồn hoặc chạm giới hạn 999 của Cart Service.
    function handleIncrease(): void {
        if (
            item.quantity >= 999 ||
            isBusy ||
            quantityLocked ||
            increaseBlockedByStock
        )
            return;
        updateMutation.mutate({ itemId: item.id, quantity: item.quantity + 1 });
    }

    // Xóa item khỏi cart; thao tác này không cần Product Service nên vẫn dọn được sản phẩm đã ngừng bán.
    function handleRemove(): void {
        if (isBusy) return;
        removeMutation.mutate({
            itemId: item.id,
            productId: item.productId,
            variantId: item.variantId,
            quantity: item.quantity,
        });
    }

    return (
        <div className="flex items-center gap-2">
            {showQuantityActions && (
                <div
                    className={cn(
                        'flex items-center overflow-hidden rounded-lg border border-zinc-200 bg-white',
                        quantityLocked && 'bg-muted/60',
                    )}
                >
                    <Button
                        variant="ghost"
                        type="button"
                        onClick={handleDecrease}
                        disabled={
                            item.quantity <= 1 || isBusy || quantityLocked
                        }
                        className={`${buttonSize} flex cursor-pointer items-center justify-center text-zinc-600 transition-colors hover:bg-zinc-950 hover:text-white disabled:cursor-not-allowed disabled:text-zinc-300 disabled:hover:bg-white`}
                        aria-label="Giảm số lượng"
                    >
                        <Minus
                            className={compact ? 'h-3 w-3' : 'h-4 w-4'}
                            aria-hidden="true"
                        />
                    </Button>
                    <span
                        className={`${compact ? 'min-w-8 px-1 text-xs' : 'min-w-10 px-2 text-sm'} text-center font-medium text-zinc-800`}
                        aria-label={`Số lượng ${item.quantity}`}
                    >
                        {item.quantity}
                    </span>
                    <Button
                        variant="ghost"
                        type="button"
                        onClick={handleIncrease}
                        disabled={
                            item.quantity >= 999 ||
                            isBusy ||
                            quantityLocked ||
                            increaseBlockedByStock
                        }
                        className={`${buttonSize} flex cursor-pointer items-center justify-center text-zinc-600 transition-colors hover:bg-zinc-950 hover:text-white disabled:cursor-not-allowed disabled:text-zinc-300 disabled:hover:bg-white`}
                        aria-label="Tăng số lượng"
                    >
                        <Plus
                            className={compact ? 'h-3 w-3' : 'h-4 w-4'}
                            aria-hidden="true"
                        />
                    </Button>
                </div>
            )}
            {showRemoveAction && (
                <Button
                    variant="ghost"
                    type="button"
                    onClick={handleRemove}
                    disabled={isBusy}
                    className={`${removeButtonSize} flex cursor-pointer items-center justify-center gap-1.5 text-zinc-400 transition-colors hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50`}
                    aria-label="Xóa sản phẩm"
                    title="Xóa sản phẩm"
                >
                    <Trash2
                        className={compact ? 'h-3.5 w-3.5' : 'h-4 w-4'}
                        aria-hidden="true"
                    />
                    {!compact && (
                        <span className="text-xs font-semibold">Xóa</span>
                    )}
                </Button>
            )}
        </div>
    );
}

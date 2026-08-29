// Component này cung cấp thao tác tăng, giảm số lượng và xóa một item trong cart.
// Nó dùng chung cho trang cart và mini-cart để mọi nút đều gọi cùng business API, không tự sửa subtotal ở frontend.

'use client';

import { Minus, Plus, Trash2 } from 'lucide-react';

import { useRemoveCartItem, useUpdateCartItem } from '../hooks/use-cart-item-actions';
import type { CartItem } from '../types/cart.types';

interface CartItemActionsProps {
    item: CartItem;
    compact?: boolean;
    mode?: 'all' | 'quantity' | 'remove';
}

// Render bộ điều khiển quantity và xóa item, khóa nút trong lúc request để tránh gửi mutation trùng.
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

    // Giảm một đơn vị nhưng giữ tối thiểu một sản phẩm; muốn bỏ hẳn item thì dùng nút xóa.
    function handleDecrease(): void {
        if (item.quantity <= 1 || isBusy) return;
        updateMutation.mutate({ itemId: item.id, quantity: item.quantity - 1 });
    }

    // Tăng một đơn vị; giới hạn 999 đồng nhất với validation của Cart Service.
    function handleIncrease(): void {
        if (item.quantity >= 999 || isBusy) return;
        updateMutation.mutate({ itemId: item.id, quantity: item.quantity + 1 });
    }

    // Xóa item khỏi cart; thao tác này không cần Product Service nên vẫn dọn được sản phẩm đã ngừng bán.
    function handleRemove(): void {
        if (isBusy) return;
        removeMutation.mutate(item.id);
    }

    return (
        <div className="flex items-center gap-2">
            {showQuantityActions && (
                <div className="flex items-center overflow-hidden rounded-lg border border-zinc-200 bg-white">
                <button
                    type="button"
                    onClick={handleDecrease}
                    disabled={item.quantity <= 1 || isBusy}
                    className={`${buttonSize} flex cursor-pointer items-center justify-center text-zinc-600 transition-colors hover:bg-zinc-950 hover:text-white disabled:cursor-not-allowed disabled:text-zinc-300 disabled:hover:bg-white`}
                    aria-label="Giảm số lượng"
                >
                    <Minus className={compact ? 'h-3 w-3' : 'h-4 w-4'} aria-hidden="true" />
                </button>
                <span
                    className={`${compact ? 'min-w-8 px-1 text-xs' : 'min-w-10 px-2 text-sm'} text-center font-medium text-zinc-800`}
                    aria-label={`Số lượng ${item.quantity}`}
                >
                    {item.quantity}
                </span>
                <button
                    type="button"
                    onClick={handleIncrease}
                    disabled={item.quantity >= 999 || isBusy}
                    className={`${buttonSize} flex cursor-pointer items-center justify-center text-zinc-600 transition-colors hover:bg-zinc-950 hover:text-white disabled:cursor-not-allowed disabled:text-zinc-300 disabled:hover:bg-white`}
                    aria-label="Tăng số lượng"
                >
                    <Plus className={compact ? 'h-3 w-3' : 'h-4 w-4'} aria-hidden="true" />
                </button>
                </div>
            )}
            {showRemoveAction && (
                <button
                type="button"
                onClick={handleRemove}
                disabled={isBusy}
                className={`${removeButtonSize} flex cursor-pointer items-center justify-center gap-1.5 text-zinc-400 transition-colors hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50`}
                aria-label="Xóa sản phẩm"
                title="Xóa sản phẩm"
            >
                <Trash2 className={compact ? 'h-3.5 w-3.5' : 'h-4 w-4'} aria-hidden="true" />
                {!compact && <span className="text-xs font-semibold">Xóa</span>}
                </button>
            )}
        </div>
    );
}

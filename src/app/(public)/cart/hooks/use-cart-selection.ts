// Hook này quản lý checkbox của các dòng hàng và tổng tạm tính theo phần được chọn.
// Nó không sửa cart server-side; checkout nhận ID đã chọn và Order Service xác minh lại ownership cùng snapshot giá.

'use client';

import { useEffect, useRef, useState } from 'react';
import type { CartItem } from '../types/cart.types';
import type { CartSelectionState } from '../types/cart-selection.types';

// Đổi lineTotal thập phân từ Cart Service sang cent nguyên để tổng checkbox không cộng số lẻ nhị phân.
function toCents(value: string): number {
    const match = /^(\d+)(?:\.(\d{1,2}))?$/.exec(value);
    // Giá sai định dạng chỉ ảnh hưởng subtotal trình bày; quote server vẫn là số tiền dùng để đặt hàng.
    if (!match) return 0;
    const cents =
        Number(match[1]) * 100 + Number((match[2] ?? '').padEnd(2, '0'));
    // Bỏ giá trị vượt giới hạn integer an toàn để UI không hiển thị tổng bị sai do overflow.
    if (!Number.isSafeInteger(cents)) return 0;
    return cents;
}

// Khởi tạo mặc định chọn tất cả; luồng Mua ngay có thể chọn riêng item vừa được Cart Service xác nhận.
export function useCartSelection(items: CartItem[]): CartSelectionState {
    const [selectedItemIds, setSelectedItemIds] = useState<string[]>(() =>
        items.map((item) => item.id),
    );
    const initialSelectionApplied = useRef(false);

    useEffect(() => {
        const availableIds = new Set(items.map((item) => item.id));

        // Chỉ đọc selectItemId một lần; các lần đổi quantity/xóa item sau đó giữ lựa chọn còn hợp lệ.
        if (!initialSelectionApplied.current) {
            initialSelectionApplied.current = true;
            const requestedItemId = new URLSearchParams(
                window.location.search,
            ).get('selectItemId');
            if (requestedItemId) {
                setSelectedItemIds(
                    availableIds.has(requestedItemId) ? [requestedItemId] : [],
                );
                return;
            }
            setSelectedItemIds([...availableIds]);
            return;
        }

        // Khi Cart Service trả snapshot mới, bỏ khỏi selection ID đã bị xóa nhưng không tự chọn lại item khác.
        setSelectedItemIds((current) =>
            current.filter((itemId) => availableIds.has(itemId)),
        );
    }, [items]);

    // Bật/tắt tất cả dòng hàng cùng lúc; selection rỗng vẫn hợp lệ và sẽ khóa nút checkout ở component.
    function toggleAll(checked: boolean): void {
        setSelectedItemIds(checked ? items.map((item) => item.id) : []);
    }

    // Cập nhật một ID theo checkbox mà không làm mất lựa chọn của các sản phẩm còn lại.
    function toggleItem(itemId: string, checked: boolean): void {
        setSelectedItemIds((current) => {
            if (checked) {
                // Không thêm trùng ID nếu checkbox gửi lại cùng trạng thái checked.
                return current.includes(itemId)
                    ? current
                    : [...current, itemId];
            }
            // Khi bỏ chọn, chỉ loại đúng ID đó để giữ các sản phẩm đã chọn khác.
            return current.filter((currentId) => currentId !== itemId);
        });
    }

    const selectedIdSet = new Set(selectedItemIds);
    const selectedItems = items.filter((item) => selectedIdSet.has(item.id));
    const selectedQuantity = selectedItems.reduce(
        (total, item) => total + item.quantity,
        0,
    );
    const selectedSubtotalCents = selectedItems.reduce(
        (total, item) => total + toCents(item.lineTotal),
        0,
    );
    const selectedSubtotal = `${Math.floor(selectedSubtotalCents / 100)}.${(
        selectedSubtotalCents % 100
    )
        .toString()
        .padStart(2, '0')}`;
    const isAllSelected =
        items.length > 0 && selectedItems.length === items.length;

    return {
        selectedItemIds,
        selectedItems,
        selectedQuantity,
        selectedSubtotal,
        isAllSelected,
        isPartiallySelected: selectedItems.length > 0 && !isAllSelected,
        toggleAll,
        toggleItem,
    };
}

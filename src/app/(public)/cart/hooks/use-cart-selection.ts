// Hook này quản lý checkbox của các dòng hàng và tổng tạm tính theo phần được chọn.
// Nó không sửa cart server-side; checkout nhận ID đã chọn và Order Service xác minh lại ownership cùng snapshot giá.

'use client';

import { useEffect, useRef, useState } from 'react';
import type { CartItem } from '../types/cart.types';
import type { CartSelectionState } from '../types/cart-selection.types';
import { isCartItemSelectable } from '../utils/is-cart-item-selectable';

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

// Quản lý lựa chọn checkout mặc định, lựa chọn từ Mua ngay và eligibility theo tồn kho hiện tại.
// Hàng hết/thiếu tồn vẫn nằm trong cart nhưng bị loại khỏi selection ngay trong render và sau mỗi snapshot mới.
// Nếu selectItemId chưa có trong snapshot đầu, chờ cart cập nhật; query mới trên cùng trang được áp dụng riêng.
// Sau khi áp dụng, refresh chỉ bỏ ID không còn mua được và giữ thao tác checkbox của khách.
export function useCartSelection(
    items: CartItem[],
    requestedItemId: string | null,
): CartSelectionState {
    const selectableItems = items.filter(isCartItemSelectable);
    const initialSelectableIds = new Set(
        selectableItems.map((item) => item.id),
    );
    const [selectedItemIds, setSelectedItemIds] = useState<string[]>(() => {
        if (!requestedItemId) return [...initialSelectableIds];
        return initialSelectableIds.has(requestedItemId)
            ? [requestedItemId]
            : [];
    });
    const lastRequestedItemId = useRef(requestedItemId);
    const appliedRequestedItemId = useRef(
        requestedItemId && initialSelectableIds.has(requestedItemId)
            ? requestedItemId
            : null,
    );
    const defaultSelectionInitialized = useRef(!requestedItemId);

    useEffect(() => {
        const selectableIds = new Set(
            items.filter(isCartItemSelectable).map((item) => item.id),
        );

        // Query đổi nghĩa là khách yêu cầu dòng khác; reset cờ để thử lại nếu snapshot chưa có item.
        if (requestedItemId !== lastRequestedItemId.current) {
            lastRequestedItemId.current = requestedItemId;
            appliedRequestedItemId.current = null;
        }

        if (requestedItemId) {
            // Nếu snapshot chưa có dòng vừa thêm, không chọn nhầm item khác và đợi lần cập nhật tiếp theo.
            if (!selectableIds.has(requestedItemId)) {
                if (appliedRequestedItemId.current !== requestedItemId)
                    setSelectedItemIds([]);
                return;
            }

            // Chọn một lần cho mỗi query ID để refresh không ghi đè checkbox khách vừa đổi.
            if (appliedRequestedItemId.current !== requestedItemId) {
                appliedRequestedItemId.current = requestedItemId;
                setSelectedItemIds([requestedItemId]);
                return;
            }

            // Cart có thể xóa dòng hàng từ tab khác; bỏ ID đã mất nhưng không tự chọn dòng còn lại.
            setSelectedItemIds((current) =>
                current.filter((itemId) => selectableIds.has(itemId)),
            );
            return;
        }

        // Trang mở trực tiếp không có selectItemId thì mặc định chọn tất cả đúng một lần.
        if (!defaultSelectionInitialized.current) {
            defaultSelectionInitialized.current = true;
            setSelectedItemIds([...selectableIds]);
            return;
        }

        // Khi tồn kho đổi trong lúc cart đang mở, bỏ ID không còn đủ điều kiện nhưng vẫn giữ dòng hàng trên màn hình.
        setSelectedItemIds((current) =>
            current.filter((itemId) => selectableIds.has(itemId)),
        );
    }, [items, requestedItemId]);

    // Bật/tắt tất cả dòng hàng cùng lúc; selection rỗng vẫn hợp lệ và sẽ khóa nút checkout ở component.
    function toggleAll(checked: boolean): void {
        setSelectedItemIds(
            checked ? selectableItems.map((item) => item.id) : [],
        );
    }

    // Cập nhật một ID theo checkbox mà không làm mất lựa chọn của các sản phẩm còn lại.
    function toggleItem(itemId: string, checked: boolean): void {
        // Checkbox bị vô hiệu hóa ở UI, nhưng hook cũng chặn ID không đủ tồn kho để không tạo selection giả.
        if (checked && !selectableItems.some((item) => item.id === itemId)) {
            return;
        }

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

    // Lọc ngay trong render để một dòng vừa hết hàng không thể vào payload trước khi effect đồng bộ state chạy.
    const selectableIds = new Set(selectableItems.map((item) => item.id));
    const effectiveSelectedItemIds = selectedItemIds.filter((itemId) =>
        selectableIds.has(itemId),
    );
    const selectedIdSet = new Set(effectiveSelectedItemIds);
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
        items.length > 0 &&
        selectableItems.length === items.length &&
        selectedItems.length === items.length;

    return {
        selectedItemIds: effectiveSelectedItemIds,
        selectedItems,
        selectedQuantity,
        selectedSubtotal,
        selectableItemCount: selectableItems.length,
        isAllSelected,
        isPartiallySelected: selectedItems.length > 0 && !isAllSelected,
        toggleAll,
        toggleItem,
    };
}

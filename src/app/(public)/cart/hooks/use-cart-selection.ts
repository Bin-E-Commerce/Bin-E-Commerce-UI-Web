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

// Quản lý lựa chọn mặc định và lựa chọn được truyền từ luồng Mua ngay.
// Nếu selectItemId chưa có trong snapshot đầu, chờ cart cập nhật rồi mới áp dụng.
// Theo dõi query mới để trang cart đang mở vẫn chọn đúng sản phẩm lần kế tiếp.
// Sau khi áp dụng, refresh chỉ bỏ ID đã xóa và giữ thao tác checkbox của khách.
export function useCartSelection(
    items: CartItem[],
    requestedItemId: string | null,
): CartSelectionState {
    const initialAvailableIds = new Set(items.map((item) => item.id));
    const [selectedItemIds, setSelectedItemIds] = useState<string[]>(() => {
        if (!requestedItemId) return [...initialAvailableIds];
        return initialAvailableIds.has(requestedItemId)
            ? [requestedItemId]
            : [];
    });
    const lastRequestedItemId = useRef(requestedItemId);
    const appliedRequestedItemId = useRef(
        requestedItemId && initialAvailableIds.has(requestedItemId)
            ? requestedItemId
            : null,
    );
    const defaultSelectionInitialized = useRef(!requestedItemId);

    useEffect(() => {
        const availableIds = new Set(items.map((item) => item.id));

        // Query đổi nghĩa là khách yêu cầu dòng khác; reset cờ để thử lại nếu snapshot chưa có item.
        if (requestedItemId !== lastRequestedItemId.current) {
            lastRequestedItemId.current = requestedItemId;
            appliedRequestedItemId.current = null;
        }

        if (requestedItemId) {
            // Nếu snapshot chưa có dòng vừa thêm, không chọn nhầm item khác và đợi lần cập nhật tiếp theo.
            if (!availableIds.has(requestedItemId)) {
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
                current.filter((itemId) => availableIds.has(itemId)),
            );
            return;
        }

        // Trang mở trực tiếp không có selectItemId thì mặc định chọn tất cả đúng một lần.
        if (!defaultSelectionInitialized.current) {
            defaultSelectionInitialized.current = true;
            setSelectedItemIds([...availableIds]);
            return;
        }

        // Các snapshot mới chỉ loại ID đã xóa; item mới không tự được chọn ngoài luồng Mua ngay.
        setSelectedItemIds((current) =>
            current.filter((itemId) => availableIds.has(itemId)),
        );
    }, [items, requestedItemId]);

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

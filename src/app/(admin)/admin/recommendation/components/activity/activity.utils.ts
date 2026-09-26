// Các hàm thuần chuyển dữ liệu activity thành nhãn dễ đọc; không sửa event hay account gốc.

import {
    Eye,
    MousePointerClick,
    ShoppingCart,
    type LucideIcon,
} from 'lucide-react';

// Định dạng timestamp theo locale Admin và trả dấu gạch ngang nếu event cũ chứa ngày không hợp lệ.
export function formatActivityDate(value: string): string {
    const date = new Date(value);
    return Number.isNaN(date.getTime())
        ? '—'
        : date.toLocaleString('vi-VN', {
              dateStyle: 'short',
              timeStyle: 'short',
          });
}

// Chuyển mã event recommendation sang nhãn và icon để bảng không phải hiển thị enum backend.
export function getInteractionMeta(interactionType: string): {
    label: string;
    icon: LucideIcon;
} {
    if (interactionType === 'PRODUCT_CLICKED') {
        return { label: 'Đã xem chi tiết', icon: MousePointerClick };
    }
    if (interactionType === 'PRODUCT_ADDED_TO_CART') {
        return { label: 'Đã thêm vào giỏ', icon: ShoppingCart };
    }
    return { label: 'Đã hiển thị', icon: Eye };
}

const readableLabels: Record<string, string> = {
    PRODUCT_AFFINITY: 'Sản phẩm phù hợp',
    TRENDING: 'Đang thịnh hành',
    POPULARITY: 'Phổ biến',
    PERSONALIZED: 'Cá nhân hóa',
    HOME: 'Trang chủ',
    PRODUCT_DETAIL: 'Chi tiết sản phẩm',
    SEARCH: 'Kết quả tìm kiếm',
};

// Đổi source/surface thành ngữ cảnh nghiệp vụ và vẫn có fallback cho enum mới từ backend.
export function getReadableValue(
    value: string | null,
    fallback: string,
): string {
    if (!value) return fallback;

    return (
        readableLabels[value] ??
        value
            .replaceAll('_', ' ')
            .toLowerCase()
            .replace(/^./, (char) => char.toUpperCase())
    );
}

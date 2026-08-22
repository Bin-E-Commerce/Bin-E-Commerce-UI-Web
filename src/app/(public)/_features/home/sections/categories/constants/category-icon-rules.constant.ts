import {
    Baby,
    BaggageClaim,
    BriefcaseBusiness,
    Camera,
    Footprints,
    Gamepad2,
    Gem,
    Headphones,
    HeartPulse,
    House,
    NotebookPen,
    Refrigerator,
    Shirt,
    ShoppingBag,
    Smartphone,
    Sparkles,
    Watch,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface CategoryIconRule {
    pattern: RegExp;
    icon: LucideIcon;
}

// Đặt luật cụ thể trước luật tổng quát để một danh mục như "Phụ kiện thời trang" không bị nhận nhầm thành "Thời trang".
export const CATEGORY_ICON_RULES: CategoryIconRule[] = [
    { pattern: /sức khỏe/i, icon: HeartPulse },
    { pattern: /phụ kiện thời trang|trang sức/i, icon: Gem },
    { pattern: /điện gia dụng|thiết bị gia dụng/i, icon: Refrigerator },
    { pattern: /giày|dép/i, icon: Footprints },
    { pattern: /điện thoại|mobile/i, icon: Smartphone },
    { pattern: /du lịch|hành lý|vali|balo/i, icon: BaggageClaim },
    { pattern: /túi ví nữ|túi xách nữ/i, icon: ShoppingBag },
    { pattern: /túi ví nam|cặp nam/i, icon: BriefcaseBusiness },
    { pattern: /đồng hồ/i, icon: Watch },
    { pattern: /âm thanh|tai nghe|loa/i, icon: Headphones },
    { pattern: /sắc đẹp|làm đẹp|mỹ phẩm/i, icon: Sparkles },
    { pattern: /mẹ\s*&\s*bé|trẻ sơ sinh/i, icon: Baby },
    { pattern: /gaming|console|trò chơi/i, icon: Gamepad2 },
    { pattern: /camera|máy ảnh|flycam/i, icon: Camera },
    { pattern: /nhà cửa|đời sống|nội thất/i, icon: House },
    { pattern: /văn phòng|sách/i, icon: NotebookPen },
    { pattern: /thời trang|quần|áo/i, icon: Shirt },
];

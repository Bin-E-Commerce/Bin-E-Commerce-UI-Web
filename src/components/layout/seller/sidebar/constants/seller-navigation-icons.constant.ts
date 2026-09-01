//
// Ánh xạ icon cho sidebar seller, bao gồm icon AI thương hiệu dùng thống nhất trong ứng dụng.
// File này chỉ ánh xạ tên icon từ access profile sang component hiển thị, không chứa quyền truy cập.
//

import type { ComponentType } from 'react';
import {
    ClipboardList,
    LayoutDashboard,
    PackagePlus,
    PackageSearch,
    Settings2,
    Sparkles,
    ShieldCheck,
    Store,
    Truck,
} from 'lucide-react';
import { AiAssistantIcon } from '@/components/ui/ai-assistant-button';

type SellerNavigationIcon = ComponentType<{ className?: string }>;

// Ánh xạ tên icon do backend trả về sang component đã được bundle tĩnh ở frontend.
export const SELLER_NAVIGATION_ICON_MAP: Record<string, SellerNavigationIcon> = {
    ClipboardList,
    LayoutDashboard,
    PackagePlus,
    PackageSearch,
    Settings2,
    Sparkles,
    Store,
    Truck,
    AiAssistant: AiAssistantIcon,
};

export const SELLER_NAVIGATION_FALLBACK_ICON = ShieldCheck;

import {
    LayoutDashboard,
    PackageSearch,
    ShieldCheck,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

// Ánh xạ tên icon do backend trả về sang component Lucide đã được bundle tĩnh ở frontend.
export const SELLER_NAVIGATION_ICON_MAP: Record<string, LucideIcon> = {
    LayoutDashboard,
    PackageSearch,
};

export const SELLER_NAVIGATION_FALLBACK_ICON = ShieldCheck;

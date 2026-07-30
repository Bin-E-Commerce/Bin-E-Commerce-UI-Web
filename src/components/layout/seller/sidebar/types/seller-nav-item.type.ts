import type { LucideIcon } from 'lucide-react';

export interface SellerNavItem {
    code: string;
    href: string;
    label: string;
    description: string;
    icon: LucideIcon;
    exact?: boolean;
}

export interface SellerNavGroup {
    title: string;
    items: SellerNavItem[];
}

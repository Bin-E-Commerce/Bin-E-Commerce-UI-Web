import type { LucideIcon } from 'lucide-react';

export interface SellerNavItem {
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

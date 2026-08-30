//  Kiểu icon tối giản mà sidebar cần, cho phép dùng cả Lucide và asset thương hiệu AI.
import type { ComponentType } from 'react';

export type SellerNavigationIcon = ComponentType<{ className?: string }>;

export interface SellerNavItem {
    code: string;
    href: string;
    label: string;
    description: string;
    icon: SellerNavigationIcon;
    exact?: boolean;
    badgeCount?: number;
}

export interface SellerNavGroup {
    title: string;
    items: SellerNavItem[];
}

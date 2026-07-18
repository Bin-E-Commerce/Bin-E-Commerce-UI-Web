import type { LucideIcon } from 'lucide-react';

export interface AdminNavItem {
    code: string;
    href: string;
    label: string;
    description: string;
    icon: LucideIcon;
    exact?: boolean;
    badgeCount?: number;
}

export interface AdminNavGroup {
    title: string;
    items: AdminNavItem[];
}

import type { LucideIcon } from 'lucide-react';

export interface AdminNavItem {
    href: string;
    label: string;
    description: string;
    icon: LucideIcon;
    exact?: boolean;
}

export interface AdminNavGroup {
    title: string;
    items: AdminNavItem[];
}

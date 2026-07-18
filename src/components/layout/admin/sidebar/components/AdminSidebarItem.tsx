'use client';

import Link from 'next/link';

import { cn } from '@/lib/utils';
import type { AdminNavItem } from '../types/admin-nav-item.type';

interface AdminSidebarItemProps {
    item: AdminNavItem;
    pathname: string;
    onNavigate?: () => void;
}

// Xác định trạng thái active theo route, ưu tiên exact để menu cha không sáng cùng route con.
function isAdminNavItemActive(item: AdminNavItem, pathname: string): boolean {
    if (item.exact) return pathname === item.href;
    return pathname === item.href || pathname.startsWith(`${item.href}/`);
}

// Hiển thị một dòng menu admin với icon, nhãn và mô tả ngắn cho thao tác backoffice.
export function AdminSidebarItem({
    item,
    pathname,
    onNavigate,
}: AdminSidebarItemProps) {
    const Icon = item.icon;
    const active = isAdminNavItemActive(item, pathname);

    return (
        <Link
            href={item.href}
            onClick={onNavigate}
            className={cn(
                'group flex min-h-12 items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors',
                active
                    ? 'bg-zinc-950 text-white shadow-sm'
                    : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950',
            )}
        >
            <span
                className={cn(
                    'flex size-8 shrink-0 items-center justify-center rounded-md',
                    active ? 'bg-white/10' : 'bg-zinc-100 group-hover:bg-white',
                )}
            >
                <Icon className="size-4" />
            </span>
            <span className="min-w-0 flex-1">
                <span className="block truncate font-medium">{item.label}</span>
                <span
                    className={cn(
                        'block truncate text-xs',
                        active ? 'text-zinc-300' : 'text-zinc-400',
                    )}
                >
                    {item.description}
                </span>
            </span>
            {(item.badgeCount ?? 0) > 0 && (
                <span
                    className={cn(
                        'ml-auto flex min-w-5 shrink-0 items-center justify-center rounded-full px-1.5 text-[11px] font-semibold leading-5',
                        active
                            ? 'bg-white text-zinc-950'
                            : 'bg-red-500 text-white',
                    )}
                    aria-label={`${item.badgeCount} thông báo chưa đọc`}
                >
                    {(item.badgeCount ?? 0) > 99 ? '99+' : item.badgeCount}
                </span>
            )}
        </Link>
    );
}

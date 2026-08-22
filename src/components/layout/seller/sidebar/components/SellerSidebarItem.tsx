'use client';

import Link from 'next/link';

import { cn } from '@/lib/utils';
import type { SellerNavItem } from '../types/seller-nav-item.type';

interface SellerSidebarItemProps {
    item: SellerNavItem;
    pathname: string;
    search: string;
    onNavigate?: () => void;
}

// Xác định active theo pathname để các link có query như trạng thái đơn vẫn bám đúng section chính.
function isSellerNavItemActive(
    item: SellerNavItem,
    pathname: string,
    search: string,
): boolean {
    const [hrefPath, hrefQuery = ''] = item.href.split('?');

    if (hrefQuery) {
        return pathname === hrefPath && search === hrefQuery;
    }

    if (item.exact) {
        return pathname === hrefPath && !search;
    }

    if (search && pathname === hrefPath) {
        return false;
    }

    return pathname === hrefPath || pathname.startsWith(`${hrefPath}/`);
}

// Hiển thị một dòng menu seller với icon, nhãn và mô tả ngắn phục vụ thao tác lặp lại hằng ngày.
export function SellerSidebarItem({
    item,
    pathname,
    search,
    onNavigate,
}: SellerSidebarItemProps) {
    const Icon = item.icon;
    const active = isSellerNavItemActive(item, pathname, search);

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
            <span className="min-w-0">
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
        </Link>
    );
}

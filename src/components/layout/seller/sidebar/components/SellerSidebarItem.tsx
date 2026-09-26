//
// Một mục điều hướng trong sidebar Seller Center.
// Component chỉ render link và trạng thái active; quyền và thứ tự menu đã được lọc từ access profile.
//

'use client';

import Link from 'next/link';

import { cn } from '@/lib/utils';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import type { SellerNavItem } from '../types/seller-nav-item.type';

interface SellerSidebarItemProps {
    item: SellerNavItem;
    pathname: string;
    search: string;
    onNavigate?: (item: SellerNavItem) => void;
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
        <Tooltip>
            <TooltipTrigger asChild>
                <Link
                    href={item.href}
                    onClick={() => onNavigate?.(item)}
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
                            active
                                ? 'bg-white'
                                : 'bg-zinc-100 group-hover:bg-white',
                        )}
                    >
                        <Icon
                            className={cn('size-4', active && 'text-zinc-950')}
                        />
                    </span>
                    <span className="min-w-0 flex-1">
                        <span className="block truncate font-medium">
                            {item.label}
                        </span>
                        <span
                            className={cn(
                                'block truncate text-xs',
                                active ? 'text-zinc-300' : 'text-zinc-400',
                            )}
                        >
                            {item.description}
                        </span>
                    </span>
                    {(item.badgeCount ?? 0) > 0 ? (
                        <span
                            className="ml-auto flex min-w-5 shrink-0 items-center justify-center rounded-full bg-red-500 px-1.5 text-[11px] font-semibold leading-5 text-white"
                            aria-label={`${item.badgeCount} thông báo chưa đọc`}
                        >
                            {(item.badgeCount ?? 0) > 99
                                ? '99+'
                                : item.badgeCount}
                        </span>
                    ) : null}
                </Link>
            </TooltipTrigger>
            {/* Tooltip hiển thị toàn bộ mô tả khi subtitle trong sidebar bị rút gọn. */}
            <TooltipContent
                side="right"
                className="border border-zinc-200 bg-white text-zinc-950 shadow-md"
                arrowClassName="fill-white stroke-zinc-200"
            >
                {item.description}
            </TooltipContent>
        </Tooltip>
    );
}

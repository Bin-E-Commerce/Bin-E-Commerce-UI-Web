// File này render một nhóm navigation Seller và truyền item hiện tại cho callback đọc notification theo menu.

'use client';

import type { SellerNavItem } from '../types/seller-nav-item.type';
import type { SellerNavGroup } from '../types/seller-nav-item.type';
import { SellerSidebarItem } from './SellerSidebarItem';

interface SellerSidebarGroupProps {
    group: SellerNavGroup;
    pathname: string;
    search: string;
    onNavigate?: (item: SellerNavItem) => void;
}

// Gom các menu theo nhóm nghiệp vụ để sidebar không biến thành danh sách dài khó quét.
export function SellerSidebarGroup({
    group,
    pathname,
    search,
    onNavigate,
}: SellerSidebarGroupProps) {
    return (
        <section className="space-y-2">
            <h2 className="px-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-400">
                {group.title}
            </h2>
            <div className="space-y-1">
                {group.items.map((item) => (
                    <SellerSidebarItem
                        key={item.href}
                        item={item}
                        pathname={pathname}
                        search={search}
                        onNavigate={onNavigate}
                    />
                ))}
            </div>
        </section>
    );
}

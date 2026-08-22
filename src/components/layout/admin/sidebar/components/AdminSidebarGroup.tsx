'use client';

import { AdminSidebarItem } from './AdminSidebarItem';
import type { AdminNavGroup } from '../types/admin-nav-item.type';

interface AdminSidebarGroupProps {
    group: AdminNavGroup;
    pathname: string;
    onNavigate?: (item: AdminNavGroup['items'][number]) => void;
}

// Render một nhóm nghiệp vụ trong sidebar để menu admin không bị thành danh sách phẳng khó quét.
export function AdminSidebarGroup({
    group,
    pathname,
    onNavigate,
}: AdminSidebarGroupProps) {
    return (
        <section className="space-y-2">
            <p className="px-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-400">
                {group.title}
            </p>
            <div className="space-y-1">
                {group.items.map((item) => (
                    <AdminSidebarItem
                        key={item.href}
                        item={item}
                        pathname={pathname}
                        onNavigate={onNavigate}
                    />
                ))}
            </div>
        </section>
    );
}

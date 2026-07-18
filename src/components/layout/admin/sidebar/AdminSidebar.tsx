'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSelector } from 'react-redux';
import { ClipboardCheck, LayoutDashboard, ShieldCheck } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import type { RootState } from '@/store';
import { getDefaultAdminPath } from '@/services/auth/access';
import { AdminSidebarGroup } from './components/AdminSidebarGroup';
import type { AdminNavGroup, AdminNavItem } from './types/admin-nav-item.type';
import { useNotificationCounts } from '@/features/notifications';

interface AdminSidebarProps {
    onNavigate?: () => void;
}

const ADMIN_ICON_MAP: Record<string, LucideIcon> = {
    ClipboardCheck,
    LayoutDashboard,
};

// Chuyển navigation backend trả về thành các group sidebar đúng theo groupCode/groupLabel backend seed.
// Nếu backend thêm icon chưa có trong map, fallback ShieldCheck để menu không bị crash.
function mapBackendAdminNavigation(user: RootState['auth']['user']): AdminNavGroup[] {
    const navigation = user?.accessProfile?.areas.admin.navigation ?? [];
    if (navigation.length === 0) return [];

    const groupMap = new Map<
        string,
        { title: string; order: number; items: AdminNavItem[] }
    >();

    for (const item of navigation) {
        const group = groupMap.get(item.groupCode) ?? {
            title: item.groupLabel,
            order: item.groupOrder,
            items: [],
        };

        group.items.push({
            code: item.code,
            href: item.href,
            label: item.label,
            description: item.description,
            icon: ADMIN_ICON_MAP[item.icon] ?? ShieldCheck,
            exact: true,
        });

        groupMap.set(item.groupCode, group);
    }

    return [...groupMap.values()]
        .toSorted((a, b) => a.order - b.order)
        .map((group) => ({
            title: group.title,
            items: group.items,
        }));
}

// Sidebar chính của Admin Center chỉ hiển thị menu mà user thật sự có permission.
// SUPPORT_AGENT chỉ thấy hồ sơ seller, còn dashboard và module chưa làm sẽ không xuất hiện.
export function AdminSidebar({ onNavigate }: AdminSidebarProps) {
    const pathname = usePathname();
    const { user } = useSelector((state: RootState) => state.auth);
    const defaultAdminPath = getDefaultAdminPath(user);
    const notificationCounts = useNotificationCounts();

    // Sidebar chỉ render navigation backend đã lọc theo permission, FE không giữ fallback permission cứng nữa.
    const visibleGroups = mapBackendAdminNavigation(user).map((group) => ({
        ...group,
        items: group.items.map((item) => ({
            ...item,
            badgeCount:
                notificationCounts.data?.byBadgeKey[item.code] ?? 0,
        })),
    }));

    return (
        <aside className="flex h-full w-80 shrink-0 flex-col border-r border-zinc-200 bg-white">
            <Link
                href={defaultAdminPath}
                className="flex h-16 items-center gap-3 border-b border-zinc-200 px-5"
                onClick={onNavigate}
            >
                <div className="flex size-10 items-center justify-center rounded-lg bg-zinc-950 text-white">
                    <ShieldCheck className="size-5" />
                </div>
                <div className="min-w-0">
                    <p className="text-sm font-semibold text-zinc-950">
                        Bin Admin Center
                    </p>
                    <p className="truncate text-xs text-zinc-500">
                        Vận hành nền tảng thương mại
                    </p>
                </div>
            </Link>

            <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-5">
                {visibleGroups.map((group) => (
                    <AdminSidebarGroup
                        key={group.title}
                        group={group}
                        pathname={pathname}
                        onNavigate={onNavigate}
                    />
                ))}
            </nav>
        </aside>
    );
}

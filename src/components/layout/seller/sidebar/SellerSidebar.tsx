'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { Store } from 'lucide-react';

import { SELLER_NAV_GROUPS } from './constants/seller-nav-items.constant';
import { SellerSidebarGroup } from './components/SellerSidebarGroup';

interface SellerSidebarProps {
    onNavigate?: () => void;
}

// Sidebar chính của Seller Center, tự nhận pathname hiện tại để giữ trạng thái active nhất quán.
export function SellerSidebar({ onNavigate }: SellerSidebarProps) {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const search = searchParams.toString();

    return (
        <aside className="flex h-full w-72 shrink-0 flex-col border-r border-zinc-200 bg-white">
            <div className="flex h-16 items-center gap-3 border-b border-zinc-200 px-5">
                <div className="flex size-10 items-center justify-center rounded-lg bg-zinc-950 text-white">
                    <Store className="size-5" />
                </div>
                <div className="min-w-0">
                    <p className="text-sm font-semibold text-zinc-950">Bin Seller Center</p>
                    <p className="truncate text-xs text-zinc-500">Vận hành shop chuyên nghiệp</p>
                </div>
            </div>

            <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-5">
                {SELLER_NAV_GROUPS.map((group) => (
                    <SellerSidebarGroup
                        key={group.title}
                        group={group}
                        pathname={pathname}
                        search={search}
                        onNavigate={onNavigate}
                    />
                ))}
            </nav>
        </aside>
    );
}

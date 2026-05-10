'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { NAV_ITEMS } from './constants/nav-items.constant';

export function ProfileSidebar() {
    const pathname = usePathname();

    return (
        <aside className="w-full md:w-60 shrink-0">
            <nav className="space-y-1">
                {NAV_ITEMS.map((item) => {
                    const Icon = item.icon;
                    const active = item.exact
                        ? pathname === item.href
                        : pathname.startsWith(item.href);
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                'flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                                active
                                    ? 'bg-zinc-900 text-white'
                                    : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900',
                            )}
                        >
                            <Icon className="h-4 w-4 shrink-0" />
                            {item.label}
                        </Link>
                    );
                })}
            </nav>
        </aside>
    );
}

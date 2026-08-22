'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { NAV_LINKS } from '../../constants/nav-links.constant';

// Hiển thị điều hướng với icon tùy chọn để các mục nổi bật không phải dùng emoji trong nhãn.
export function NavLinks() {
    const pathname = usePathname();

    return (
        <nav className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((item) => {
                const active = item.exact
                    ? pathname === item.href
                    : pathname.startsWith(item.href);
                return (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                            'relative inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-all duration-200',
                            item.highlight
                                ? 'rounded-full border border-red-200 bg-gradient-to-r from-red-50 via-orange-50 to-amber-50 font-bold text-red-600 shadow-sm shadow-red-100/80 hover:-translate-y-0.5 hover:border-red-300 hover:from-red-100 hover:via-orange-100 hover:to-amber-100 hover:shadow-md hover:shadow-red-100'
                                : active
                                  ? 'text-zinc-900 bg-zinc-100'
                                  : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50',
                        )}
                    >
                        {item.icon ? (
                            <item.icon
                                aria-hidden="true"
                                className={cn(
                                    'size-4 shrink-0',
                                    item.highlight
                                        ? 'fill-amber-400 text-orange-500'
                                        : 'text-zinc-500',
                                )}
                            />
                        ) : null}
                        {item.label}
                        {active && !item.highlight && (
                            <span className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full bg-zinc-900" />
                        )}
                    </Link>
                );
            })}
        </nav>
    );
}

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { NAV_LINKS } from '../../constants/nav-links.constant';

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
                            'relative px-3 py-2 text-sm font-medium rounded-md transition-colors cursor-pointer',
                            item.highlight
                                ? 'text-red-600 hover:bg-red-50'
                                : active
                                  ? 'text-zinc-900 bg-zinc-100'
                                  : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50',
                        )}
                    >
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

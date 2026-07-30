'use client';

import { cn } from '@/lib/utils';
import { useHeaderScroll } from './hooks/useHeaderScroll';
import { AnnouncementBar } from './components/AnnouncementBar';
import { HeaderLogo } from './components/HeaderLogo';
import { NavLinks } from './components/NavLinks';
import { SearchBar } from './components/SearchBar';
import { WishlistIcon } from './components/WishlistIcon';
import { CartIcon } from './components/CartIcon';
import { UserMenu } from './components/UserMenu';

// Ghép thanh thông báo và điều hướng chính, đồng thời giữ vùng thao tác co được trên màn hình nhỏ.
export function Header() {
    const scrolled = useHeaderScroll();

    return (
        <div className="sticky top-0 z-40">
            <AnnouncementBar />
            <header
                className={cn(
                    'bg-white transition-shadow duration-200',
                    scrolled ? 'shadow-sm' : '',
                )}
            >
                <div className="mx-auto flex h-16 w-full min-w-0 max-w-7xl items-center gap-1 px-3 sm:gap-4 sm:px-6 lg:px-8">
                    <HeaderLogo />
                    <NavLinks />
                    <div className="flex min-w-0 flex-1 items-center justify-end gap-0 sm:gap-1">
                        <SearchBar />
                        <WishlistIcon />
                        <CartIcon />
                        <UserMenu />
                    </div>
                </div>
            </header>
        </div>
    );
}

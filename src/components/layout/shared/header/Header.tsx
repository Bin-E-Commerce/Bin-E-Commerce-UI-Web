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
                <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
                    <HeaderLogo />
                    <NavLinks />
                    <div className="flex flex-1 items-center justify-end gap-1">
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

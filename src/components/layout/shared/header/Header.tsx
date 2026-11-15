// File này kết hợp logo và các thao tác chính của storefront Customer.
// Header không hiển thị các tab điều hướng phụ; tìm kiếm, giỏ hàng và tài khoản giữ trách nhiệm riêng.

'use client';

import { cn } from '@/lib/utils';
import { useHeaderScroll } from './hooks/useHeaderScroll';
import { HeaderLogo } from './components/HeaderLogo';
import { SearchBar } from './components/SearchBar';
import { CartIcon } from './components/CartIcon';
import { UserMenu } from './components/UserMenu';

// Hiển thị logo, tìm kiếm và thao tác tài khoản trong một container responsive dùng chung mọi trang.
// Các tab phụ được bỏ toàn cục để header không đổi cấu trúc khi người dùng chuyển route.
export function Header() {
    const scrolled = useHeaderScroll();

    return (
        <div className="sticky top-0 z-40">
            <header
                className={cn(
                    'bg-white transition-shadow duration-200',
                    scrolled ? 'shadow-sm' : '',
                )}
            >
                <div className="mx-auto flex h-16 w-full min-w-0 max-w-7xl items-center justify-between gap-0 sm:px-6 md:px-0 lg:px-0">
                    <HeaderLogo />
                    <div className="flex min-w-0 flex-1 items-center justify-end gap-0">
                        <SearchBar />
                        <div className="mx-4 shrink-0">
                            <CartIcon />
                        </div>
                        <UserMenu />
                    </div>
                </div>
            </header>
        </div>
    );
}

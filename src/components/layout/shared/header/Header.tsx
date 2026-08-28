// File này kết hợp header điều hướng chính cho storefront Customer.
// Thanh khuyến mãi phụ được tách khỏi layout chính để header giữ chiều cao ổn định và không che nội dung.

'use client';

import { cn } from '@/lib/utils';
import { useHeaderScroll } from './hooks/useHeaderScroll';
import { HeaderLogo } from './components/HeaderLogo';
import { NavLinks } from './components/NavLinks';
import { SearchBar } from './components/SearchBar';
import { WishlistIcon } from './components/WishlistIcon';
import { CartIcon } from './components/CartIcon';
import { UserMenu } from './components/UserMenu';

// Hiển thị điều hướng và các thao tác chính theo cùng một container responsive với nội dung storefront.
// Component không tự quản lý dữ liệu trang; các nút tìm kiếm, yêu thích, giỏ hàng và tài khoản giữ trách nhiệm riêng.
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
                    <NavLinks />
                    <div className="flex min-w-0 flex-1 items-center justify-end gap-0">
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

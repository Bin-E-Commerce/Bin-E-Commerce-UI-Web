// Component này hiển thị icon Giỏ hàng và chặn Guest trước khi mở route cart.
// Component không gọi API cart; việc lấy dữ liệu chỉ thực hiện sau khi Customer đăng nhập.

'use client';

import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';

import { useCartAuthRedirect } from '@/features/cart/hooks/use-cart-auth-redirect';

interface CartIconProps {
    count?: number;
}

// Render link cart theo auth state, chuyển Guest tới login và giữ Customer ở route cart.
export function CartIcon({ count = 0 }: CartIconProps) {
    const { getProtectedHref } = useCartAuthRedirect();

    return (
        <Link
            href={getProtectedHref('/cart')}
            className="relative cursor-pointer rounded-md p-2 text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900"
            aria-label={`Giỏ hàng (${count})`}
        >
            <ShoppingCart className="h-5 w-5" />
            {count > 0 && (
                <span className="absolute right-0.5 top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white">
                    {count > 99 ? '99+' : count}
                </span>
            )}
        </Link>
    );
}

'use client';

import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';

interface CartIconProps {
    count?: number;
}

export function CartIcon({ count = 0 }: CartIconProps) {
    return (
        <Link
            href="/cart"
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

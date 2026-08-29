// Component này hiển thị icon Giỏ hàng, badge số lượng và mini-cart cho user đã đăng nhập.
// Guest vẫn được chuyển tới trang đăng nhập trước khi truy cập các nghiệp vụ cart.

'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';

import { useCart } from '@/features/cart/hooks/use-cart';
import { useCartAuthRedirect } from '@/features/cart/hooks/use-cart-auth-redirect';
import { CartPreview } from './CartPreview';

interface CartIconProps {
    count?: number;
}

// Render icon cart theo auth state và mở preview sản phẩm mà không điều hướng khỏi trang hiện tại.
export function CartIcon({ count = 0 }: CartIconProps) {
    const { isAuthenticated, getProtectedHref } = useCartAuthRedirect();
    const cartQuery = useCart();
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const cartCount = cartQuery.data?.totalItems ?? count;

    // Đóng mini-cart khi người dùng bấm ra ngoài hoặc nhấn Escape để thao tác header tự nhiên hơn.
    useEffect(() => {
        if (!isOpen) {
            return undefined;
        }

        // Kiểm tra pointer event có nằm ngoài vùng icon và preview hay không.
        function handlePointerDown(event: PointerEvent): void {
            if (!containerRef.current?.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }

        // Cho phép đóng preview bằng phím Escape theo hành vi chuẩn của menu nổi.
        function handleKeyDown(event: KeyboardEvent): void {
            if (event.key === 'Escape') {
                setIsOpen(false);
            }
        }

        document.addEventListener('pointerdown', handlePointerDown);
        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('pointerdown', handlePointerDown);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen]);

    // Đóng preview nếu auth state chuyển thành Guest trong lúc header đang hiển thị.
    useEffect(() => {
        if (!isAuthenticated && isOpen) {
            setIsOpen(false);
        }
    }, [isAuthenticated, isOpen]);

    // Toggle preview cho user đã đăng nhập; Guest giữ nguyên luồng chuyển tới login.
    function handleTogglePreview(): void {
        if (isAuthenticated) {
            setIsOpen((current) => !current);
        }
    }

    // Đóng preview sau khi người dùng chọn một đường dẫn bên trong mini-cart.
    function handleClosePreview(): void {
        setIsOpen(false);
    }

    if (!isAuthenticated) {
        return (
            <Link
                href={getProtectedHref('/cart')}
                className="relative cursor-pointer rounded-md p-2 text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900"
                aria-label={`Giỏ hàng (${cartCount})`}
            >
                <ShoppingCart className="h-5 w-5" />
                {cartCount > 0 && (
                    <span className="absolute right-0.5 top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white">
                        {cartCount > 99 ? '99+' : cartCount}
                    </span>
                )}
            </Link>
        );
    }

    return (
        <div ref={containerRef} className="relative">
            <button
                type="button"
                onClick={handleTogglePreview}
                className="relative cursor-pointer rounded-md p-2 text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900/20"
                aria-label={`Giỏ hàng (${cartCount})`}
                aria-haspopup="dialog"
                aria-expanded={isOpen}
            >
                <ShoppingCart className="h-5 w-5" />
                {cartCount > 0 && (
                    <span className="absolute right-0.5 top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white">
                        {cartCount > 99 ? '99+' : cartCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <CartPreview
                    cart={cartQuery.data}
                    isLoading={cartQuery.isLoading}
                    isError={cartQuery.isError}
                    onClose={handleClosePreview}
                    onRetry={() => void cartQuery.refetch()}
                />
            )}
        </div>
    );
}

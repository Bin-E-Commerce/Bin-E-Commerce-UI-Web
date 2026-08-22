'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { useSelector } from 'react-redux';
import { ArrowLeft, LayoutDashboard, LogIn, ShieldAlert, Store } from 'lucide-react';

import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { canAccessSellerCenter } from '@/services/auth/access';
import type { AppDispatch, RootState } from '@/store';
import { logoutUser } from '@/store/slices/authSlice';

// Hiển thị đúng nguyên nhân bị chặn: thiếu quyền vào Seller Center hoặc thiếu quyền của riêng chức năng vừa mở.
export function SellerAccessDeniedCard() {
    const dispatch = useDispatch<AppDispatch>();
    const router = useRouter();
    const user = useSelector((state: RootState) => state.auth.user);
    const canEnterSellerCenter = canAccessSellerCenter(user);

    // Đăng xuất session hiện tại để người dùng có thể đăng nhập bằng tài khoản seller đã được duyệt.
    async function handleSwitchAccount() {
        await dispatch(logoutUser());
        router.replace('/login?redirect=/seller');
    }

    return (
        <main className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 py-10 text-zinc-950">
            <section className="w-full max-w-lg rounded-xl border border-zinc-200 bg-white p-8 text-center shadow-sm">
                <div className="mx-auto flex size-14 items-center justify-center rounded-xl bg-zinc-950 text-white">
                    {canEnterSellerCenter ? (
                        <ShieldAlert className="size-6" />
                    ) : (
                        <Store className="size-6" />
                    )}
                </div>
                <p className="mt-6 text-xs font-semibold uppercase tracking-[0.18em] text-zinc-400">
                    Seller Center
                </p>
                <h1 className="mt-3 text-2xl font-semibold tracking-tight text-zinc-950">
                    {canEnterSellerCenter
                        ? 'Bạn chưa được cấp quyền cho chức năng này'
                        : 'Tài khoản chưa có quyền bán hàng'}
                </h1>
                <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-zinc-500">
                    {canEnterSellerCenter
                        ? 'Quyền truy cập trang vừa mở đã bị giới hạn. Bạn vẫn có thể sử dụng các chức năng Seller Center đang được cấp.'
                        : 'Khu vực này chỉ dành cho shop đã được duyệt. Hãy dùng tài khoản seller hoặc đăng ký hồ sơ bán hàng mới.'}
                </p>

                <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
                    {canEnterSellerCenter ? (
                        <>
                            <Link
                                href="/seller"
                                className={cn(
                                    buttonVariants(),
                                    'h-10 rounded-full px-4',
                                )}
                            >
                                <LayoutDashboard className="size-4" />
                                Về bảng điều khiển
                            </Link>
                            <Link
                                href="/"
                                className={cn(
                                    buttonVariants({ variant: 'outline' }),
                                    'h-10 rounded-full px-4',
                                )}
                            >
                                <ArrowLeft className="size-4" />
                                Về trang mua sắm
                            </Link>
                        </>
                    ) : (
                        <>
                            <Button
                                type="button"
                                className="h-10 rounded-full px-4"
                                onClick={handleSwitchAccount}
                            >
                                <LogIn className="size-4" />
                                Đăng nhập tài khoản seller
                            </Button>
                            <Link
                                href="/seller/register"
                                className={cn(
                                    buttonVariants({ variant: 'outline' }),
                                    'h-10 rounded-full px-4',
                                )}
                            >
                                <ArrowLeft className="size-4" />
                                Đăng ký bán hàng
                            </Link>
                        </>
                    )}
                </div>
            </section>
        </main>
    );
}

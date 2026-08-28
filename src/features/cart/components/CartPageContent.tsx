// File này hiển thị trang giỏ hàng cho Customer sau khi active cart đã được hydrate.
// Component chỉ chịu trách nhiệm trình bày các trạng thái UI; việc xác thực, gọi API và cache nằm ở hook cart.
// Không hiển thị cart ID hoặc owner ID vì đây là dữ liệu kỹ thuật không có giá trị với người mua.

'use client';

import Link from 'next/link';
import {
    ArrowLeft,
    RefreshCw,
    ShieldCheck,
    ShoppingBag,
    Truck,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { useCart } from '../hooks/use-cart';
import { useCartAuthRedirect } from '../hooks/use-cart-auth-redirect';

// Điều phối trạng thái chuyển hướng, tải dữ liệu, lỗi và giỏ hàng rỗng thành một trải nghiệm liền mạch.
// Redirect vẫn được giữ ở client để không làm thay đổi contract route hiện tại; khi API thành công,
// người mua chỉ thấy thông tin hữu ích và lời mời tiếp tục mua sắm.
export function CartPageContent() {
    const router = useRouter();
    const { isAuthenticated } = useCartAuthRedirect();
    const cartQuery = useCart();

    // Direct URL /cart vẫn yêu cầu đăng nhập để đồng nhất với hành vi khi người dùng bấm biểu tượng giỏ hàng.
    useEffect(() => {
        if (!isAuthenticated) {
            router.replace('/login?redirect=%2Fcart');
        }
    }, [isAuthenticated, router]);

    if (!isAuthenticated) {
        return (
            <main className="flex min-h-[520px] items-center justify-center bg-zinc-50 px-4 py-12">
                <p className="text-sm text-zinc-500" aria-live="polite">
                    Đang chuyển tới trang đăng nhập...
                </p>
            </main>
        );
    }

    if (cartQuery.isLoading) {
        return (
            <main className="min-h-[520px] bg-zinc-50 px-4 py-8 sm:px-6 lg:px-8">
                <div
                    className="mx-auto w-full max-w-7xl animate-pulse space-y-4"
                    aria-live="polite"
                >
                    <div className="h-5 w-32 rounded bg-zinc-200" />
                    <div className="h-10 w-64 rounded bg-zinc-200" />
                    <div className="h-[360px] rounded-2xl border border-zinc-200 bg-white" />
                </div>
            </main>
        );
    }

    if (cartQuery.isError) {
        return (
            <main className="flex min-h-[520px] items-center justify-center bg-zinc-50 px-4 py-12">
                <section className="w-full max-w-sm rounded-2xl border border-zinc-200 bg-white p-7 text-center shadow-sm">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-zinc-950 text-white shadow-lg shadow-zinc-950/10">
                        <ShoppingBag className="h-6 w-6" aria-hidden="true" />
                    </div>
                    <h1 className="mt-5 text-xl font-semibold tracking-tight text-zinc-950">
                        Chưa thể tải giỏ hàng
                    </h1>
                    <p className="mt-3 text-sm leading-6 text-zinc-600">
                        Có lỗi kết nối tạm thời. Vui lòng thử lại để tiếp tục
                        mua sắm.
                    </p>
                    <button
                        type="button"
                        onClick={() => void cartQuery.refetch()}
                        className="mt-6 inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-zinc-950 px-5 text-sm font-semibold text-white transition-colors hover:bg-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2"
                    >
                        <RefreshCw className="h-4 w-4" aria-hidden="true" />
                        Thử lại
                    </button>
                </section>
            </main>
        );
    }

    return (
        <main className="min-h-[520px] bg-zinc-50 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
            <div className="mx-auto w-full max-w-7xl">
                <section className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-[0_12px_40px_-24px_rgba(24,24,27,0.35)]">
                    <header className="relative overflow-hidden border-b border-zinc-100 bg-gradient-to-br from-white via-white to-zinc-50 px-6 py-6 sm:px-8 sm:py-8">
                        <div className="pointer-events-none absolute -right-24 -top-24 h-56 w-56 rounded-full bg-zinc-100/70 blur-3xl" />
                        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex min-w-0 items-center gap-4">
                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-zinc-950 text-white shadow-lg shadow-zinc-950/15">
                                    <ShoppingBag
                                        className="h-6 w-6"
                                        strokeWidth={1.7}
                                        aria-hidden="true"
                                    />
                                </div>
                                <div className="min-w-0">
                                    <h1 className="mt-2 text-xl font-semibold tracking-tight text-zinc-950 sm:text-2xl">
                                        Giỏ hàng của bạn
                                    </h1>
                                    <p className="mt-2 max-w-xl text-sm leading-6 text-zinc-600">
                                        Xem lại sản phẩm đã chọn và tiếp tục đặt
                                        hàng bất cứ khi nào bạn sẵn sàng.
                                    </p>
                                </div>
                            </div>
                            <Link
                                href="/"
                                className="inline-flex h-11 w-full shrink-0 items-center justify-center gap-2 rounded-xl bg-zinc-950 px-5 text-sm font-semibold text-white shadow-md shadow-zinc-950/10 transition-all hover:-translate-y-0.5 hover:bg-zinc-800 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2 sm:w-fit"
                            >
                                <ArrowLeft
                                    className="h-4 w-4"
                                    aria-hidden="true"
                                />
                                Tiếp tục mua sắm
                            </Link>
                        </div>
                    </header>

                    <div className="px-6 py-9 sm:px-8 sm:py-11">
                        <div className="mx-auto flex max-w-xl flex-col items-center text-center">
                            <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-zinc-100 ring-4 ring-zinc-50">
                                <div className="absolute inset-2 rounded-full border border-zinc-200 bg-white" />
                                <ShoppingBag
                                    className="relative h-8 w-8 text-zinc-950"
                                    strokeWidth={1.5}
                                    aria-hidden="true"
                                />
                            </div>
                            <p className="mt-6 text-[11px] font-semibold uppercase tracking-[0.22em] text-zinc-500">
                                Chưa có sản phẩm
                            </p>
                            <h2 className="mt-2 text-xl font-semibold tracking-tight text-zinc-950 sm:text-2xl">
                                Giỏ hàng đang trống
                            </h2>
                            <p className="mt-2 max-w-md text-sm leading-6 text-zinc-600">
                                Hãy khám phá các sản phẩm phù hợp với bạn. Những
                                sản phẩm được thêm vào sẽ xuất hiện ở đây.
                            </p>
                            <Link
                                href="/"
                                className="mt-6 inline-flex h-11 items-center justify-center rounded-xl bg-zinc-950 px-6 text-sm font-semibold text-white shadow-lg shadow-zinc-950/15 transition-all hover:-translate-y-0.5 hover:bg-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2"
                            >
                                Khám phá sản phẩm
                            </Link>
                        </div>

                        <div className="mx-auto mt-10 grid max-w-5xl gap-3 border-t border-zinc-100 pt-7 sm:grid-cols-3 sm:gap-4">
                            <div className="group relative min-h-[142px] overflow-hidden rounded-2xl border border-zinc-200 bg-white p-4 transition-[transform,box-shadow,border-color] duration-200 hover:-translate-y-0.5 hover:border-zinc-300 hover:shadow-[0_12px_28px_-18px_rgba(24,24,27,0.55)] sm:p-5">
                                <div className="absolute inset-x-0 top-0 h-0.5 bg-zinc-950 opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-950 text-white shadow-sm shadow-zinc-950/20">
                                        <ShieldCheck
                                            className="h-5 w-5"
                                            aria-hidden="true"
                                        />
                                    </div>
                                    <span className="text-[10px] font-semibold tracking-[0.2em] text-zinc-400">
                                        01
                                    </span>
                                </div>
                                <p className="mt-4 text-sm font-semibold text-zinc-950">
                                    Mua sắm an tâm
                                </p>
                                <p className="mt-1 text-xs leading-5 text-zinc-500">
                                    Thông tin đơn hàng được bảo vệ.
                                </p>
                            </div>
                            <div className="group relative min-h-[142px] overflow-hidden rounded-2xl border border-zinc-200 bg-white p-4 transition-[transform,box-shadow,border-color] duration-200 hover:-translate-y-0.5 hover:border-zinc-300 hover:shadow-[0_12px_28px_-18px_rgba(24,24,27,0.55)] sm:p-5">
                                <div className="absolute inset-x-0 top-0 h-0.5 bg-zinc-950 opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-950 text-white shadow-sm shadow-zinc-950/20">
                                        <Truck
                                            className="h-5 w-5"
                                            aria-hidden="true"
                                        />
                                    </div>
                                    <span className="text-[10px] font-semibold tracking-[0.2em] text-zinc-400">
                                        02
                                    </span>
                                </div>
                                <p className="mt-4 text-sm font-semibold text-zinc-950">
                                    Giao hàng thuận tiện
                                </p>
                                <p className="mt-1 text-xs leading-5 text-zinc-500">
                                    Theo dõi hành trình đơn hàng.
                                </p>
                            </div>
                            <div className="group relative min-h-[142px] overflow-hidden rounded-2xl border border-zinc-200 bg-white p-4 transition-[transform,box-shadow,border-color] duration-200 hover:-translate-y-0.5 hover:border-zinc-300 hover:shadow-[0_12px_28px_-18px_rgba(24,24,27,0.55)] sm:p-5">
                                <div className="absolute inset-x-0 top-0 h-0.5 bg-zinc-950 opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-950 text-white shadow-sm shadow-zinc-950/20">
                                        <ShoppingBag
                                            className="h-5 w-5"
                                            aria-hidden="true"
                                        />
                                    </div>
                                    <span className="text-[10px] font-semibold tracking-[0.2em] text-zinc-400">
                                        03
                                    </span>
                                </div>
                                <p className="mt-4 text-sm font-semibold text-zinc-950">
                                    Lưu lựa chọn
                                </p>
                                <p className="mt-1 text-xs leading-5 text-zinc-500">
                                    Quay lại mua sắm bất cứ lúc nào.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </main>
    );
}

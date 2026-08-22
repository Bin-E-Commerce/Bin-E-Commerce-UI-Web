import Link from 'next/link';
import { ArrowLeft, Home, SearchX } from 'lucide-react';

import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// Hiển thị trạng thái 404 rõ ràng để người dùng không bị kẹt ở một màn hình trắng khi truy cập URL không tồn tại.
export default function NotFound() {
    return (
        <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-white px-6 py-16 text-zinc-950">
            <div
                aria-hidden="true"
                className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(24,24,27,0.06),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(120,113,108,0.08),transparent_30%)]"
            />

            <section className="relative w-full max-w-xl rounded-3xl border border-zinc-200 bg-white p-8 text-center shadow-xl sm:p-12">
                <span className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-zinc-950 text-white shadow-lg">
                    <SearchX className="size-8" aria-hidden="true" />
                </span>
                <p className="mt-7 text-sm font-semibold uppercase tracking-[0.24em] text-zinc-500">
                    Lỗi 404
                </p>
                <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                    Không tìm thấy trang
                </h1>
                <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-zinc-600 sm:text-base">
                    Đường dẫn này không tồn tại hoặc nội dung đã được chuyển sang vị trí khác.
                </p>

                <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                    <Link
                        href="/"
                        className={cn(
                            buttonVariants({ variant: 'secondary', size: 'lg' }),
                            'gap-2 rounded-full px-5',
                        )}
                    >
                        <Home className="size-4" aria-hidden="true" />
                        Về trang chủ
                    </Link>
                    <Link
                        href="/seller/products"
                        className={cn(
                            buttonVariants({ variant: 'outline', size: 'lg' }),
                            'gap-2 rounded-full border-zinc-300 bg-transparent px-5 text-zinc-950 hover:bg-zinc-100 hover:text-zinc-950',
                        )}
                    >
                        <ArrowLeft className="size-4" aria-hidden="true" />
                        Quản lý sản phẩm
                    </Link>
                </div>
            </section>
        </main>
    );
}

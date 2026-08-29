'use client';

import Link from 'next/link';
import { ArrowLeft, PackageX, RefreshCw } from 'lucide-react';

import { Button, buttonVariants } from '@/components/ui/button';

interface ProductDetailErrorStateProps {
    onRetry: () => void;
}

// Cung cấp đường quay lại và thao tác thử lại khi ID không tồn tại hoặc Product Service tạm gián đoạn.
export function ProductDetailErrorState({
    onRetry,
}: ProductDetailErrorStateProps) {
    return (
        <section className="flex min-h-[560px] items-center justify-center bg-zinc-100 px-4 py-16">
            <div className="w-full max-w-lg border border-zinc-200 bg-white p-8 text-center shadow-sm">
                <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-lg bg-zinc-950 text-white">
                    <PackageX className="h-6 w-6" />
                </span>
                <h1 className="mt-5 text-2xl font-bold text-zinc-950">
                    Chưa tải được sản phẩm
                </h1>
                <p className="mt-2 text-sm leading-6 text-zinc-500">
                    Sản phẩm có thể không còn tồn tại hoặc dữ liệu đang tạm thời gián đoạn.
                </p>
                <div className="mt-6 flex flex-col justify-center gap-2 sm:flex-row">
                    <Link
                        href="/"
                        className={buttonVariants({ variant: 'outline', size: 'lg' })}
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Về trang chủ
                    </Link>
                    <Button onClick={onRetry} size="lg">
                        <RefreshCw className="h-4 w-4" />
                        Thử lại
                    </Button>
                </div>
            </div>
        </section>
    );
}

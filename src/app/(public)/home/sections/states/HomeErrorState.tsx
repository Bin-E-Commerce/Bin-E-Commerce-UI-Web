'use client';

import { RefreshCw, WifiOff } from 'lucide-react';

import { Button } from '@/components/ui/button';

interface HomeErrorStateProps {
    onRetry: () => void;
}

// Cho người dùng biết dữ liệu đang gián đoạn và cung cấp thao tác thử lại ngay tại chỗ.
export function HomeErrorState({ onRetry }: HomeErrorStateProps) {
    return (
        <section className="flex min-h-[520px] items-center justify-center bg-zinc-50 px-4 py-16">
            <div className="w-full max-w-md rounded-lg border border-zinc-200 bg-white p-8 text-center shadow-sm">
                <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-zinc-950 text-white">
                    <WifiOff className="h-5 w-5" />
                </span>
                <h1 className="mt-5 text-xl font-bold text-zinc-950">
                    Chưa tải được sản phẩm
                </h1>
                <p className="mt-2 text-sm leading-6 text-zinc-500">
                    Product Service có thể chưa được khởi động. Hãy thử tải lại
                    sau khi dịch vụ sẵn sàng.
                </p>
                <Button onClick={onRetry} size="lg" className="mt-6 px-5">
                    <RefreshCw className="h-4 w-4" />
                    Thử lại
                </Button>
            </div>
        </section>
    );
}

import { AlertCircle, RefreshCw } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

interface ShopProfileErrorStateProps {
    onRetry: () => void;
}

// Giữ khung trang ổn định trong lúc tải để tránh layout nhảy khi dữ liệu hồ sơ xuất hiện.
export function ShopProfileSkeleton() {
    return (
        <div className="overflow-hidden rounded-md border border-zinc-200 bg-white shadow-sm">
            <div className="flex items-center gap-4 p-7">
                <Skeleton className="size-11" />
                <div className="flex-1 space-y-3">
                    <Skeleton className="h-5 w-44" />
                    <Skeleton className="h-4 w-full max-w-lg" />
                </div>
            </div>
            <div className="border-y border-zinc-200 px-7 py-4">
                <Skeleton className="h-5 w-72" />
            </div>
            <div className="grid gap-8 p-7 lg:grid-cols-[260px_minmax(0,1fr)]">
                <Skeleton className="aspect-square w-full max-w-52" />
                <div className="space-y-5">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-28 w-full" />
                </div>
            </div>
        </div>
    );
}

// Cung cấp lỗi có hành động thử lại ngay trong ngữ cảnh trang thay vì để lại màn hình trắng.
export function ShopProfileErrorState({ onRetry }: ShopProfileErrorStateProps) {
    return (
        <div className="flex min-h-80 flex-col items-center justify-center rounded-md border border-zinc-200 bg-white px-5 py-12 text-center shadow-sm">
            <span className="flex size-12 items-center justify-center rounded-md bg-red-50 text-red-600">
                <AlertCircle className="size-6" />
            </span>
            <h1 className="mt-4 text-lg font-semibold text-zinc-950">
                Không tải được hồ sơ shop
            </h1>
            <p className="mt-2 max-w-md text-sm leading-6 text-zinc-500">
                Vui lòng kiểm tra quyền truy cập hoặc thử tải lại sau ít phút.
            </p>
            <Button
                type="button"
                variant="outline"
                className="mt-5"
                onClick={onRetry}
            >
                <RefreshCw className="size-4" />
                Thử lại
            </Button>
        </div>
    );
}

import { Skeleton } from '@/components/ui/skeleton';

// Giữ kích thước khu vực gallery và mua hàng ổn định trong lúc tải để hạn chế layout shift.
export function ProductDetailSkeleton() {
    return (
        <div className="bg-zinc-100 pb-12">
            <div className="mx-auto max-w-7xl px-3 py-4 sm:px-6 lg:px-8">
                <Skeleton className="mb-3 h-4 w-2/3" />
                <div className="grid overflow-hidden border border-zinc-200 bg-white lg:grid-cols-[1fr_1.15fr]">
                    <div className="p-5">
                        <Skeleton className="aspect-square w-full rounded-lg" />
                        <div className="mt-3 flex gap-2">
                            {Array.from({ length: 5 }).map((_, index) => (
                                <Skeleton key={index} className="h-16 w-16 rounded" />
                            ))}
                        </div>
                    </div>
                    <div className="space-y-5 border-t border-zinc-200 p-6 lg:border-l lg:border-t-0">
                        <Skeleton className="h-6 w-32" />
                        <Skeleton className="h-16 w-full" />
                        <Skeleton className="h-6 w-52" />
                        <Skeleton className="h-28 w-full rounded-lg" />
                        <Skeleton className="h-12 w-full" />
                        <div className="grid grid-cols-2 gap-3">
                            <Skeleton className="h-12" />
                            <Skeleton className="h-12" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

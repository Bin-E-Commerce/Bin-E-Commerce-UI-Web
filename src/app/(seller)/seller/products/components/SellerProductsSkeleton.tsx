import { Skeleton } from '@/components/ui/skeleton';

// Giữ kích thước bảng ổn định trong lúc tải để nội dung không nhảy khi API phản hồi.
export function SellerProductsSkeleton() {
    return (
        <div className="space-y-3 p-4 sm:p-6">
            {Array.from({ length: 6 }, (_, index) => (
                <div
                    key={index}
                    className="flex min-h-20 items-center gap-4 border-b border-zinc-100 pb-3"
                >
                    <Skeleton className="size-14 shrink-0 rounded-md" />
                    <div className="min-w-0 flex-1 space-y-2">
                        <Skeleton className="h-4 w-2/3" />
                        <Skeleton className="h-3 w-1/3" />
                    </div>
                    <Skeleton className="hidden h-8 w-24 sm:block" />
                    <Skeleton className="hidden h-8 w-20 lg:block" />
                </div>
            ))}
        </div>
    );
}

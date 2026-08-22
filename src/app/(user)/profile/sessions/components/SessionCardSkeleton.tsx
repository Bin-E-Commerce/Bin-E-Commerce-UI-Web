import { Skeleton } from '@/components/ui/skeleton';

// Giữ bố cục card ổn định trong lúc danh sách phiên đang tải.
export function SessionCardSkeleton() {
    return (
        <div className="flex items-start gap-4 rounded-xl border border-zinc-200 bg-white p-5">
            <Skeleton className="h-11 w-11 shrink-0 rounded-xl" />
            <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-3 w-56" />
                <Skeleton className="h-3 w-32" />
            </div>
            <Skeleton className="h-8 w-28 rounded-lg" />
        </div>
    );
}

import { Skeleton } from '@/components/ui/skeleton';

export function UserMenuSkeleton() {
    return (
        <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="hidden lg:block h-3.5 w-20" />
            <Skeleton className="h-3 w-3" />
        </div>
    );
}

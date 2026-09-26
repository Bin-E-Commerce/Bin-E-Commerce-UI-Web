// Skeleton giữ bố cục dashboard ổn định trong lúc snapshot đầu tiên đang tải.

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function SellerDashboardLoading() {
    return (
        <div className="space-y-4" aria-label="Đang tải dashboard seller">
            <div className="flex flex-wrap items-end justify-between gap-3">
                <div className="space-y-2">
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-9 w-72" />
                    <Skeleton className="h-4 w-96 max-w-full" />
                </div>
                <Skeleton className="h-9 w-36" />
            </div>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {Array.from({ length: 4 }).map((_, index) => (
                    <Card
                        key={index}
                        size="sm"
                        className="border-zinc-200 shadow-sm"
                    >
                        <CardContent className="space-y-2 p-4">
                            <Skeleton className="size-9 rounded-lg" />
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-8 w-24" />
                        </CardContent>
                    </Card>
                ))}
            </div>
            <div className="grid gap-3 xl:grid-cols-[1.35fr_0.65fr]">
                <Card size="sm" className="border-zinc-200 shadow-sm">
                    <CardHeader className="space-y-3">
                        <Skeleton className="h-6 w-48" />
                        <Skeleton className="h-4 w-72" />
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-[220px] w-full" />
                    </CardContent>
                </Card>
                <Card size="sm" className="border-zinc-200 shadow-sm">
                    <CardHeader className="space-y-3">
                        <Skeleton className="h-6 w-40" />
                        <Skeleton className="h-4 w-64" />
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {Array.from({ length: 4 }).map((_, index) => (
                            <Skeleton key={index} className="h-12 w-full" />
                        ))}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

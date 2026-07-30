import { Skeleton } from '@/components/ui/skeleton';

// Giữ ổn định chiều cao homepage trong lúc tải để header và nội dung không bị nhảy bố cục.
export function HomePageSkeleton() {
    return (
        <div className="bg-zinc-100 pb-10">
            <section className="px-3 pb-3 pt-4 sm:px-6 lg:px-8">
                <div className="mx-auto grid max-w-7xl gap-2 lg:grid-cols-[2fr_1fr]">
                    <Skeleton className="h-[340px] rounded-lg" />
                    <div className="grid grid-cols-2 gap-2 lg:grid-cols-1">
                        <Skeleton className="h-40 rounded-lg" />
                        <Skeleton className="h-40 rounded-lg" />
                    </div>
                </div>
            </section>

            <section className="mt-3 border-y bg-white">
                <div className="mx-auto max-w-7xl p-4">
                    <Skeleton className="mb-4 h-8 w-56" />
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
                    {Array.from({ length: 6 }).map((_, index) => (
                        <div key={index} className="space-y-3 rounded-lg border p-3">
                            <Skeleton className="aspect-square w-full" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-2/3" />
                            <Skeleton className="h-6 w-1/2" />
                        </div>
                    ))}
                    </div>
                </div>
            </section>
        </div>
    );
}

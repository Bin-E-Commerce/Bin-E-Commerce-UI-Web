// Skeleton giữ bố cục tìm kiếm ổn định trong lúc Next.js mở route hoặc catalog đang tải.
import { Skeleton } from '@/components/ui/skeleton';

// Dựng trước toolbar và lưới sản phẩm để trạng thái chờ không làm nội dung nhảy đột ngột.
export function ProductSearchSkeleton() {
    return (
        <main className="min-h-[70vh] bg-white px-3 py-8 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-7xl">
                <Skeleton className="h-8 w-56" />
                <Skeleton className="mt-3 h-5 w-80 max-w-full" />
                <Skeleton className="mt-6 h-12 w-full rounded-xl" />
                <div className="mt-5 flex flex-wrap gap-2">
                    <Skeleton className="h-10 w-44 rounded-lg" />
                    <Skeleton className="h-10 w-36 rounded-lg" />
                    <Skeleton className="h-10 w-28 rounded-lg" />
                </div>
                <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                    {Array.from({ length: 8 }, (_, index) => (
                        <div
                            key={index}
                            className="overflow-hidden rounded-xl border border-neutral-200 bg-white p-3"
                        >
                            <Skeleton className="aspect-square w-full rounded-lg" />
                            <Skeleton className="mt-3 h-4 w-full" />
                            <Skeleton className="mt-2 h-4 w-2/3" />
                            <Skeleton className="mt-4 h-6 w-1/2" />
                        </div>
                    ))}
                </div>
            </div>
        </main>
    );
}

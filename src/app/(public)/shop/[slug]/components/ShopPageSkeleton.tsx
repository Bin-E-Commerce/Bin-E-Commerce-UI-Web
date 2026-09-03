//Skeleton chia theo vùng của trang shop để header và catalog không chặn nhau khi tải dữ liệu.
// Render skeleton phần nhận diện shop trong thời gian profile public đang được tải.
export function ShopHeaderSkeleton() {
    return (
        <div className="animate-pulse rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
                <div className="h-24 w-24 shrink-0 rounded-full bg-zinc-200" />
                <div className="flex-1 space-y-3">
                    <div className="h-7 w-2/3 rounded bg-zinc-200" />
                    <div className="h-4 w-1/2 rounded bg-zinc-200" />
                    <div className="h-4 w-4/5 rounded bg-zinc-200" />
                </div>
            </div>
            <div className="mt-8 grid grid-cols-2 gap-3 border-t border-zinc-100 pt-6 sm:grid-cols-4">
                {[1, 2, 3, 4].map((item) => (
                    <div key={item} className="h-12 rounded-lg bg-zinc-100" />
                ))}
            </div>
        </div>
    );
}

// Skeleton catalog chỉ thay phần lưới, giữ header không bị nhấp nháy khi đổi filter.
export function ShopCatalogSkeleton() {
    return (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
                <div
                    key={item}
                    className="animate-pulse overflow-hidden rounded-xl border border-zinc-200 bg-white"
                >
                    <div className="aspect-square bg-zinc-200" />
                    <div className="space-y-3 p-4">
                        <div className="h-4 rounded bg-zinc-200" />
                        <div className="h-4 w-2/3 rounded bg-zinc-200" />
                        <div className="h-5 w-1/2 rounded bg-zinc-200" />
                    </div>
                </div>
            ))}
        </div>
    );
}

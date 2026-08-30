// Skeleton Seller order giữ đúng nhịp chiều cao của list để loading không làm trang giật.

// Render các placeholder cố định thay vì spinner đơn lẻ để seller vẫn nhận biết cấu trúc dữ liệu sắp xuất hiện.
export function SellerOrdersSkeleton() {
    return (
        <div className="space-y-3 p-4 sm:p-6">
            {[1, 2, 3].map((item) => (
                <div
                    key={item}
                    className="flex animate-pulse items-center gap-4 rounded-lg border border-zinc-100 p-4"
                >
                    <div className="size-16 shrink-0 rounded-lg bg-zinc-100" />
                    <div className="min-w-0 flex-1 space-y-3">
                        <div className="h-4 w-2/5 rounded bg-zinc-100" />
                        <div className="h-3 w-3/5 rounded bg-zinc-100" />
                        <div className="h-3 w-1/4 rounded bg-zinc-100" />
                    </div>
                    <div className="hidden w-28 space-y-2 sm:block">
                        <div className="h-3 rounded bg-zinc-100" />
                        <div className="h-4 rounded bg-zinc-100" />
                    </div>
                </div>
            ))}
        </div>
    );
}

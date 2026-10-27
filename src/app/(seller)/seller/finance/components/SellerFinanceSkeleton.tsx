// Skeleton giữ bố cục ví seller trong lúc chờ API, không hiển thị dữ liệu giả.
import { Skeleton } from '@/components/ui/skeleton';

// Giữ chiều cao các vùng chính để nội dung không nhảy sau khi tải dữ liệu.
export function SellerFinanceSkeleton() {
    return (
        <div
            className="space-y-5 pb-8"
            role="status"
            aria-label="Đang tải tài chính shop"
            aria-busy="true"
        >
            <span className="sr-only">Đang tải số dư và giao dịch ví...</span>

            <section className="grid gap-3 xl:grid-cols-3" aria-hidden="true">
                <article className="space-y-4 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                            <Skeleton className="size-9 rounded-xl" />
                            <Skeleton className="h-4 w-36" />
                        </div>
                        <Skeleton className="h-6 w-24 rounded-full" />
                    </div>
                    <Skeleton className="h-9 w-40" />
                    <Skeleton className="h-3 w-full max-w-lg" />
                </article>

                <article className="space-y-4 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                            <Skeleton className="size-9 rounded-xl" />
                            <Skeleton className="h-4 w-32" />
                        </div>
                        <Skeleton className="h-6 w-28 rounded-full" />
                    </div>
                    <Skeleton className="h-9 w-40" />
                    <Skeleton className="h-3 w-full max-w-md" />
                </article>

                <article className="space-y-4 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
                    <div className="flex items-center gap-3">
                        <Skeleton className="size-9 rounded-xl" />
                        <div className="space-y-2">
                            <Skeleton className="h-3 w-36" />
                            <Skeleton className="h-4 w-28" />
                        </div>
                    </div>
                    <div className="space-y-2 border-t border-zinc-100 pt-3">
                        <Skeleton className="h-3 w-32" />
                        <Skeleton className="h-3 w-40" />
                    </div>
                </article>
            </section>

            <section
                className="flex flex-col gap-4 rounded-2xl border border-zinc-200 bg-zinc-900 p-5 sm:flex-row sm:items-center sm:justify-between"
                aria-hidden="true"
            >
                <div className="space-y-2">
                    <Skeleton className="h-4 w-28 bg-white/20" />
                    <Skeleton className="h-3 w-64 max-w-full bg-white/15" />
                </div>
                <div className="flex gap-2">
                    <Skeleton className="h-10 w-28 rounded-xl bg-white/20" />
                    <Skeleton className="h-10 w-28 rounded-xl bg-white/30" />
                </div>
            </section>

            <section
                className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm"
                aria-hidden="true"
            >
                <div className="flex items-center justify-between gap-4 border-b border-zinc-100 px-5 py-5 sm:px-6">
                    <div className="flex items-center gap-3">
                        <Skeleton className="size-10 rounded-xl" />
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-36" />
                            <Skeleton className="h-3 w-56 max-w-full" />
                        </div>
                    </div>
                    <Skeleton className="h-7 w-24 rounded-full" />
                </div>
                <div className="divide-y divide-zinc-100">
                    {[1, 2, 3].map((row) => (
                        <div
                            key={row}
                            className="flex items-center justify-between gap-4 px-5 py-4 sm:px-6"
                        >
                            <div className="flex min-w-0 items-center gap-3">
                                <Skeleton className="size-10 shrink-0 rounded-xl" />
                                <div className="min-w-0 space-y-2">
                                    <Skeleton className="h-4 w-40 max-w-full" />
                                    <Skeleton className="h-3 w-28" />
                                    <Skeleton className="h-3 w-32" />
                                </div>
                            </div>
                            <Skeleton className="h-5 w-24 shrink-0" />
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}

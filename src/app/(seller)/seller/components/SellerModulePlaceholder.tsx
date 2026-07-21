import { ArrowRight, CheckCircle2 } from 'lucide-react';

import { Button } from '@/components/ui/button';

interface SellerModulePlaceholderProps {
    eyebrow: string;
    title: string;
    description: string;
    primaryAction: string;
    secondaryAction: string;
}

// Dùng cho module seller chưa có nghiệp vụ thật, đồng thời giữ bố cục ổn định trên mobile, tablet và desktop.
export function SellerModulePlaceholder({
    eyebrow,
    title,
    description,
    primaryAction,
    secondaryAction,
}: SellerModulePlaceholderProps) {
    return (
        <div className="min-w-0 space-y-4 sm:space-y-6">
            <section className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm sm:p-6">
                <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
                    <div className="min-w-0 max-w-3xl">
                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">
                            {eyebrow}
                        </p>
                        <h1 className="mt-2 text-xl font-semibold text-zinc-950 sm:text-2xl">
                            {title}
                        </h1>
                        <p className="mt-2 text-sm leading-6 text-zinc-600">{description}</p>
                    </div>
                    <div className="grid w-full grid-cols-1 gap-2 sm:flex sm:w-auto sm:flex-wrap">
                        <Button type="button" variant="outline" className="w-full sm:w-auto">
                            {secondaryAction}
                        </Button>
                        <Button type="button" className="w-full sm:w-auto">
                            {primaryAction}
                            <ArrowRight className="size-4" />
                        </Button>
                    </div>
                </div>
            </section>

            <section className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2 xl:grid-cols-3">
                <div className="min-w-0 rounded-lg border border-zinc-200 bg-white p-4 shadow-sm sm:p-5">
                    <CheckCircle2 className="size-5 text-zinc-900" aria-hidden="true" />
                    <h2 className="mt-4 font-semibold text-zinc-950">Luồng xử lý rõ ràng</h2>
                    <p className="mt-2 text-sm leading-6 text-zinc-600">
                        Trạng thái công việc sẽ được sắp xếp theo mức độ ưu tiên để bạn biết việc nào cần xử lý trước.
                    </p>
                </div>
                <div className="min-w-0 rounded-lg border border-zinc-200 bg-white p-4 shadow-sm sm:p-5">
                    <CheckCircle2 className="size-5 text-zinc-900" aria-hidden="true" />
                    <h2 className="mt-4 font-semibold text-zinc-950">Thao tác thuận tiện</h2>
                    <p className="mt-2 text-sm leading-6 text-zinc-600">
                        Bộ lọc, bảng dữ liệu và hành động thường dùng sẽ được bố trí ngay trong màn hình này.
                    </p>
                </div>
                <div className="min-w-0 rounded-lg border border-zinc-200 bg-white p-4 shadow-sm md:col-span-2 sm:p-5 xl:col-span-1">
                    <CheckCircle2 className="size-5 text-zinc-900" aria-hidden="true" />
                    <h2 className="mt-4 font-semibold text-zinc-950">Hiển thị trên mọi thiết bị</h2>
                    <p className="mt-2 text-sm leading-6 text-zinc-600">
                        Bố cục tự thích ứng để bạn có thể theo dõi và xử lý công việc trên máy tính bảng hoặc điện thoại.
                    </p>
                </div>
            </section>
        </div>
    );
}

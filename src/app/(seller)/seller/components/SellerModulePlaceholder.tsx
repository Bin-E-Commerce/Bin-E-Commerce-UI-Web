import { ArrowRight, CheckCircle2 } from 'lucide-react';

import { Button } from '@/components/ui/button';

interface SellerModulePlaceholderProps {
    eyebrow: string;
    title: string;
    description: string;
    primaryAction: string;
    secondaryAction: string;
}

// Dùng cho các module seller chưa gắn nghiệp vụ thật nhưng vẫn giữ giao diện nhất quán và dễ mở rộng.
export function SellerModulePlaceholder({
    eyebrow,
    title,
    description,
    primaryAction,
    secondaryAction,
}: SellerModulePlaceholderProps) {
    return (
        <div className="space-y-6">
            <section className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
                <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                    <div className="max-w-3xl">
                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">
                            {eyebrow}
                        </p>
                        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-zinc-950">
                            {title}
                        </h1>
                        <p className="mt-2 text-sm leading-6 text-zinc-600">{description}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <Button type="button" variant="outline">
                            {secondaryAction}
                        </Button>
                        <Button type="button">
                            {primaryAction}
                            <ArrowRight className="size-4" />
                        </Button>
                    </div>
                </div>
            </section>

            <section className="grid gap-4 lg:grid-cols-3">
                <div className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
                    <CheckCircle2 className="size-5 text-zinc-900" />
                    <h2 className="mt-4 font-semibold text-zinc-950">Luồng xử lý rõ ràng</h2>
                    <p className="mt-2 text-sm leading-6 text-zinc-600">
                        Module sẽ được nối API theo từng trạng thái để seller biết việc nào cần xử lý trước.
                    </p>
                </div>
                <div className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
                    <CheckCircle2 className="size-5 text-zinc-900" />
                    <h2 className="mt-4 font-semibold text-zinc-950">Tối ưu thao tác lặp lại</h2>
                    <p className="mt-2 text-sm leading-6 text-zinc-600">
                        Bảng dữ liệu, bộ lọc và hành động hàng loạt sẽ được đặt ngay trong màn hình này.
                    </p>
                </div>
                <div className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
                    <CheckCircle2 className="size-5 text-zinc-900" />
                    <h2 className="mt-4 font-semibold text-zinc-950">Sẵn sàng mở rộng</h2>
                    <p className="mt-2 text-sm leading-6 text-zinc-600">
                        Bố cục đã tách theo module để sau này thêm form, bảng và biểu đồ không làm rối page.
                    </p>
                </div>
            </section>
        </div>
    );
}

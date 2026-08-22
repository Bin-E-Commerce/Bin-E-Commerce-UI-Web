import { Clock3, type LucideIcon } from 'lucide-react';

interface AdminModulePlaceholderProps {
    title: string;
    description: string;
    icon: LucideIcon;
}

// Hiển thị trạng thái nhất quán cho các module admin chưa triển khai trên mọi kích thước màn hình.
export function AdminModulePlaceholder({
    title,
    description,
    icon: Icon,
}: AdminModulePlaceholderProps) {
    return (
        <section className="min-w-0 overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-sm">
            <div className="flex flex-col gap-5 p-4 sm:p-6 md:flex-row md:items-start md:justify-between lg:p-8">
                <div className="min-w-0 max-w-3xl">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-zinc-950 text-white sm:size-11">
                        <Icon className="size-5" aria-hidden="true" />
                    </div>
                    <h1 className="mt-4 text-xl font-semibold text-zinc-950 sm:mt-5 sm:text-2xl">
                        {title}
                    </h1>
                    <p className="mt-2 text-sm leading-6 text-zinc-600 sm:text-base">
                        {description}
                    </p>
                </div>

                <div className="flex w-full shrink-0 items-start gap-3 rounded-lg border border-zinc-200 bg-zinc-50 p-4 md:w-64">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-white text-zinc-700 shadow-sm ring-1 ring-zinc-200">
                        <Clock3 className="size-4" aria-hidden="true" />
                    </span>
                    <div className="min-w-0">
                        <p className="text-sm font-semibold text-zinc-900">Đang hoàn thiện</p>
                        <p className="mt-1 text-xs leading-5 text-zinc-500">
                            Chức năng sẽ được cập nhật trong giai đoạn tiếp theo.
                        </p>
                    </div>
                </div>
            </div>

            <div className="border-t border-zinc-100 bg-zinc-50/70 px-4 py-3 sm:px-6 lg:px-8">
                <p className="text-xs leading-5 text-zinc-500 sm:text-sm">
                    Dữ liệu và thao tác của module sẽ xuất hiện tại đây khi chức năng sẵn sàng.
                </p>
            </div>
        </section>
    );
}

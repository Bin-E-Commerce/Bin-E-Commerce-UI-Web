import type { LucideIcon } from 'lucide-react';

interface AdminModulePlaceholderProps {
    title: string;
    description: string;
    icon: LucideIcon;
}

// Placeholder ngắn cho các module admin chưa triển khai, giúp route không trắng trang trong lúc phát triển từng phần.
export function AdminModulePlaceholder({
    title,
    description,
    icon: Icon,
}: AdminModulePlaceholderProps) {
    return (
        <section className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
            <div className="flex size-11 items-center justify-center rounded-xl bg-zinc-950 text-white">
                <Icon className="size-5" />
            </div>
            <h1 className="mt-5 text-2xl font-semibold text-zinc-950">{title}</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-500">{description}</p>
            <div className="mt-6 rounded-lg border border-dashed border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-500">
                Module này sẽ được triển khai theo từng nghiệp vụ riêng sau khi hoàn tất
                danh sách hồ sơ người bán.
            </div>
        </section>
    );
}

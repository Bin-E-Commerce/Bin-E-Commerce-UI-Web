import { CheckCircle2 } from 'lucide-react';

interface ReviewBlockProps {
    title: string;
    items: string[];
}

// Khối review gom checklist theo nhóm để người bán phát hiện thiếu sót trước khi gửi hồ sơ.
export function ReviewBlock({ title, items }: ReviewBlockProps) {
    return (
        <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-5">
            <p className="font-semibold text-zinc-950">{title}</p>
            <ul className="mt-3 space-y-2">
                {items.map((item) => (
                    <li
                        key={item}
                        className="flex items-start gap-2 text-sm text-zinc-600"
                    >
                        <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-zinc-900" />
                        <span>{item}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
}


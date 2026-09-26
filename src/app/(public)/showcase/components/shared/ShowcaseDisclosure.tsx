// Khung disclosure dùng chung cho tài liệu showcase; giữ đúng nhịp số, title, mô tả và đường phân cách của Recommendation.
import type { ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';

interface ShowcaseDisclosureProps {
    id: string;
    number: string;
    title: string;
    description: string;
    children: ReactNode;
}

// Giữ các chương có cùng nhịp đọc với Recommendation: badge số đủ rộng, summary có thể thu gọn, nội dung nằm trong vùng anchor ổn định.
export function ShowcaseDisclosure({
    id,
    number,
    title,
    description,
    children,
}: ShowcaseDisclosureProps) {
    return (
        <details
            open
            id={id}
            tabIndex={-1}
            className="group scroll-mt-24 focus-visible:ring-2 focus-visible:ring-zinc-300 [&[open]>summary_.disclosure-chevron]:rotate-180"
        >
            <summary className="relative grid cursor-pointer list-none grid-cols-[max-content_minmax(0,1fr)_max-content] items-start gap-3.5 py-4 [&::-webkit-details-marker]:hidden after:absolute after:inset-x-4 after:bottom-0 after:h-px after:bg-zinc-200 after:content-[''] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-400 sm:gap-4 sm:py-5">
                <span className="inline-flex min-h-9 min-w-10 items-center justify-center rounded-xl border border-zinc-200 bg-white px-2.5 py-1 font-mono text-sm font-semibold leading-none tabular-nums tracking-tight text-zinc-950 sm:min-h-10 sm:px-3">
                    {number}
                </span>
                <span className="min-w-0 pt-0.5">
                    <span className="block text-lg font-semibold leading-snug tracking-tight text-zinc-950">
                        {title}
                    </span>
                    <span className="mt-1.5 block text-sm leading-6 text-zinc-800">
                        {description}
                    </span>
                </span>
                <ChevronDown
                    aria-hidden="true"
                    className="disclosure-chevron mt-1 size-4 shrink-0 text-zinc-500 transition-transform duration-200"
                />
            </summary>
            <div className="pt-4 sm:pt-5">{children}</div>
        </details>
    );
}

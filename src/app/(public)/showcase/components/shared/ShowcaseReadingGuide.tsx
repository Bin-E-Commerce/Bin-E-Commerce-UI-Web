// Hướng dẫn lộ trình đọc dùng chung cho các trang showcase; component chỉ sở hữu layout điều hướng, không sở hữu nội dung feature.
'use client';

import { ArrowRight } from 'lucide-react';
import { handleShowcaseAnchorNavigation } from '../../utils/handleShowcaseAnchorNavigation';

interface ShowcaseReadingGuideItem {
    href: string;
    title: string;
    summary: string;
}

interface ShowcaseReadingGuideProps {
    ariaLabel: string;
    items: ShowcaseReadingGuideItem[];
}

// Render lộ trình 3 phần với anchor thật để người đọc hiểu thứ tự tài liệu và nhảy tới đúng chương.
export function ShowcaseReadingGuide({
    ariaLabel,
    items,
}: ShowcaseReadingGuideProps) {
    return (
        <nav aria-label={ariaLabel}>
            <div className="flex items-center justify-between gap-3">
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-500">
                    Lộ trình đọc
                </p>
                <span className="text-[10px] text-zinc-400">
                    {items.length} phần · theo thứ tự xử lý
                </span>
            </div>
            <ol className="mt-2 divide-y divide-zinc-100 border-t border-zinc-200">
                {items.map((item, index) => (
                    <li key={item.href}>
                        <a
                            href={item.href}
                            aria-controls={item.href.slice(1)}
                            onClick={handleShowcaseAnchorNavigation}
                            className="group flex items-center gap-3 rounded-lg px-2 py-2.5 transition-colors hover:bg-zinc-50 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-zinc-500"
                        >
                            <span className="grid size-7 shrink-0 place-items-center rounded-lg border border-zinc-200 bg-white font-mono text-[10px] text-zinc-500">
                                {String(index + 1).padStart(2, '0')}
                            </span>
                            <span className="min-w-0 flex-1">
                                <span className="block text-xs font-semibold text-zinc-900">
                                    {item.title}
                                </span>
                                <span className="mt-0.5 block text-[10px] leading-4 text-zinc-500">
                                    {item.summary}
                                </span>
                            </span>
                            <ArrowRight
                                aria-hidden="true"
                                className="size-3.5 shrink-0 text-zinc-400 transition-transform group-hover:translate-x-0.5"
                            />
                        </a>
                    </li>
                ))}
            </ol>
        </nav>
    );
}

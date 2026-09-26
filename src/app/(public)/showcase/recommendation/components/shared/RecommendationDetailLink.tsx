// Liên kết từ phần tóm tắt tới đúng mục giải thích kỹ thuật trong tài liệu.
'use client';

import { ArrowDownRight } from 'lucide-react';
import { handleShowcaseAnchorNavigation } from '../../../utils/handleShowcaseAnchorNavigation';

interface RecommendationDetailLinkProps {
    href: string;
    children: string;
    ariaLabel?: string;
    compact?: boolean;
}

// Liên kết chi tiết dùng kiểu pill cho hành động chính và kiểu chữ gọn cho các nguồn lặp lại trong lưới.
export function RecommendationDetailLink({
    href,
    children,
    ariaLabel,
    compact = false,
}: RecommendationDetailLinkProps) {
    return (
        <a
            href={href}
            aria-label={ariaLabel}
            aria-controls={href.replace('#', '')}
            onClick={handleShowcaseAnchorNavigation}
            className={
                compact
                    ? 'group inline-flex min-h-6 w-fit shrink-0 items-center gap-1 text-[10px] font-medium text-zinc-600 underline decoration-zinc-300 underline-offset-4 transition-colors hover:text-zinc-950 hover:decoration-zinc-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500 focus-visible:ring-offset-2'
                    : 'group inline-flex min-h-9 w-fit shrink-0 items-center gap-2 rounded-full border border-zinc-200 bg-white py-1 pl-3 pr-1 text-[11px] font-semibold text-zinc-800 shadow-sm shadow-zinc-950/5 transition duration-200 hover:border-zinc-400 hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-800 focus-visible:ring-offset-2 active:scale-[0.98]'
            }
        >
            <span>{children}</span>
            {compact ? (
                <ArrowDownRight
                    aria-hidden="true"
                    className="size-3 transition-transform group-hover:translate-x-0.5 group-hover:translate-y-0.5"
                />
            ) : (
                <span className="grid size-7 place-items-center rounded-full bg-zinc-950 text-white transition-colors group-hover:bg-zinc-700">
                    <ArrowDownRight
                        aria-hidden="true"
                        className="size-3.5 transition-transform group-hover:translate-x-0.5 group-hover:translate-y-0.5"
                    />
                </span>
            )}
        </a>
    );
}

// Thành phần tiêu đề có số dùng chung cho tài liệu Recommendation.
// Component giữ cách trình bày số và ngữ nghĩa heading; chế độ summary dành cho các mục có thể thu gọn.
import { ChevronDown } from 'lucide-react';
import type { ReactNode } from 'react';

type RecommendationNumberedHeadingProps = {
    number: string;
    title: string;
    description?: string;
    children?: ReactNode;
    headingId?: string;
    tabIndex?: number;
    level?: 2 | 3 | 4 | 5;
    variant?: 'section' | 'flow' | 'topic';
    className?: string;
    asSummary?: boolean;
    disclosureContentId?: string;
    compact?: boolean;
    summaryAside?: ReactNode;
};

// Chọn cấp heading từ dữ liệu tài liệu; summary giữ phần tóm tắt luôn hiện và để details quản lý nội dung mở rộng.
// compact giảm mật độ; summaryAside đặt thông tin phụ ở cột phải mà không làm thay đổi thứ tự đọc hay đích neo.
export function RecommendationNumberedHeading({
    number,
    title,
    description,
    children,
    headingId,
    tabIndex,
    level = 3,
    variant = 'topic',
    className = '',
    asSummary = false,
    disclosureContentId,
    compact = false,
    summaryAside,
}: RecommendationNumberedHeadingProps) {
    const Heading =
        level === 2 ? 'h2' : level === 3 ? 'h3' : level === 4 ? 'h4' : 'h5';
    const descriptionSize = compact
        ? 'text-[11px] leading-4'
        : variant === 'section'
          ? 'text-sm leading-6'
          : variant === 'flow'
            ? 'text-xs leading-5 sm:text-sm'
            : 'text-xs leading-5';
    const numberBadgeSize = compact
        ? 'min-h-8 min-w-9 rounded-lg px-2 text-xs'
        : 'min-h-9 min-w-10 rounded-xl px-2.5 text-sm sm:min-h-10 sm:px-3';
    const summaryGridColumns =
        compact && summaryAside
            ? 'grid-cols-[max-content_minmax(0,1fr)_max-content] md:grid-cols-[max-content_minmax(0,1fr)_minmax(16rem,18rem)_max-content]'
            : 'grid-cols-[max-content_minmax(0,1fr)_max-content]';

    if (asSummary) {
        return (
            <summary
                aria-controls={disclosureContentId}
                className={`grid cursor-pointer list-none ${summaryGridColumns} items-start ${compact ? 'gap-2.5 md:gap-3' : 'gap-3.5 sm:gap-4'} marker:hidden focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-400 ${className}`}
            >
                <span
                    className={`inline-flex items-center justify-center border border-zinc-200 bg-white py-1 font-mono font-semibold leading-none tabular-nums tracking-tight text-zinc-950 ${numberBadgeSize}`}
                >
                    {number}
                </span>
                <span className={`min-w-0 ${compact ? '' : 'pt-0.5'}`}>
                    <span
                        id={headingId}
                        role="heading"
                        aria-level={level}
                        tabIndex={tabIndex}
                        className={`scroll-mt-24 font-semibold leading-snug tracking-tight text-zinc-950`}
                    >
                        {title}
                    </span>
                    {description ? (
                        <span
                            className={`${descriptionSize} ${compact ? 'mt-1' : 'mt-1.5'} block text-zinc-800`}
                        >
                            {description}
                        </span>
                    ) : null}
                    {children}
                </span>
                {summaryAside ? (
                    <span className="col-start-2 col-span-2 row-start-2 min-w-0 justify-self-stretch md:col-start-3 md:col-span-1 md:row-start-1 md:justify-self-end">
                        {summaryAside}
                    </span>
                ) : null}
                <ChevronDown
                    aria-hidden="true"
                    className={`disclosure-chevron mt-1 size-4 shrink-0 text-zinc-500 transition-transform duration-200 ${compact && summaryAside ? 'col-start-3 row-start-1 md:col-start-4' : ''}`}
                />
            </summary>
        );
    }

    return (
        <div
            className={`grid grid-cols-[max-content_minmax(0,1fr)] items-start gap-3.5 sm:gap-4 ${className}`}
        >
            <span
                className={`inline-flex items-center justify-center border border-zinc-200 bg-white py-1 font-mono font-semibold leading-none tabular-nums tracking-tight text-zinc-950 ${numberBadgeSize}`}
            >
                {number}
            </span>
            <div className="min-w-0 pt-0.5">
                <Heading
                    id={headingId}
                    tabIndex={tabIndex}
                    className={`scroll-mt-24 font-semibold leading-snug tracking-tight text-zinc-950 outline-none focus-visible:ring-2 focus-visible:ring-zinc-300`}
                >
                    {title}
                </Heading>
                {description ? (
                    <p className={`${descriptionSize} mt-1.5 text-zinc-800`}>
                        {description}
                    </p>
                ) : null}
                {children}
            </div>
        </div>
    );
}

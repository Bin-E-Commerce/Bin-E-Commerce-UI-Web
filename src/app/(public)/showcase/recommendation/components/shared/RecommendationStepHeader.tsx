// Header dùng chung cho các bước trong tài liệu Recommendation, giữ số thứ tự, tiêu đề và thông tin phụ cùng một trục.
import type { ReactNode } from 'react';
import { RecommendationStepBadge } from './RecommendationStepBadge';

type RecommendationStepHeaderProps = {
    number: string;
    title: string;
    description?: string;
    eyebrow?: string;
    asideContent?: ReactNode;
    className?: string;
    titleLevel?: 4 | 5;
    showDivider?: boolean;
};

// Chuẩn hóa header bước; nội dung phụ và metadata là tùy chọn, còn huy hiệu và tiêu đề luôn giữ chung bố cục.
export function RecommendationStepHeader({
    number,
    title,
    description,
    eyebrow,
    asideContent,
    className = '',
    titleLevel = 4,
    showDivider = true,
}: RecommendationStepHeaderProps) {
    const Heading = titleLevel === 5 ? 'h5' : 'h4';

    return (
        <header
            className={`relative flex min-w-0 flex-col gap-3 ${showDivider ? "pb-4 after:absolute after:inset-x-4 after:bottom-0 after:h-px after:bg-zinc-200 after:content-['']" : 'pb-0'} sm:flex-row sm:items-center sm:justify-between ${className}`}
        >
            <div className="flex min-w-0 items-center gap-3">
                <RecommendationStepBadge number={number} />
                <div className="min-w-0">
                    {eyebrow ? (
                        <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-zinc-500">
                            {eyebrow}
                        </p>
                    ) : null}
                    <Heading className="text-sm font-semibold leading-5 text-zinc-950">
                        {title}
                    </Heading>
                    {description ? (
                        <p className="mt-1 max-w-4xl text-xs leading-5 text-zinc-600">
                            {description}
                        </p>
                    ) : null}
                </div>
            </div>
            {asideContent ? (
                <div className="shrink-0 sm:ml-auto">{asideContent}</div>
            ) : null}
        </header>
    );
}

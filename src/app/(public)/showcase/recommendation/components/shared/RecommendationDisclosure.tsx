// Khung trình bày mục tài liệu Recommendation theo cấp section, topic hoặc flow.
// Component giữ cấu trúc tiêu đề, mô tả, neo trang và vùng nội dung; nội dung cụ thể do component con sở hữu.
import type { ReactNode } from 'react';
import { RecommendationNumberedHeading } from './RecommendationNumberedHeading';

interface RecommendationDisclosureProps {
    id?: string;
    number: string;
    title: string;
    description?: string;
    children: ReactNode;
    eyebrow?: string;
    level?: 2 | 3 | 4 | 5;
    variant?: 'section' | 'topic' | 'flow';
}

// Mỗi mục là một disclosure độc lập, mở sẵn để tài liệu vẫn đọc liền mạch cho tới khi người dùng chủ động thu gọn.
// Giữ nhịp dọc gọn và đường phân cách dưới summary; icon chỉ theo trạng thái của details sở hữu nó.
export function RecommendationDisclosure({
    id,
    number,
    title,
    description,
    children,
    level = 3,
    variant = 'topic',
}: RecommendationDisclosureProps) {
    const sectionVariant = variant === 'section';
    const flowVariant = variant === 'flow';
    const headingId = id ? `${id}-title` : undefined;
    const contentId = id ? `${id}-content` : undefined;

    return (
        <details
            open
            id={id}
            aria-labelledby={headingId}
            tabIndex={-1}
            className={`group scroll-mt-24 [&[open]>summary_.disclosure-chevron]:rotate-180 ${sectionVariant || flowVariant ? '' : 'overflow-hidden rounded-2xl border border-zinc-200 bg-white'}`}
        >
            <RecommendationNumberedHeading
                number={number}
                title={title}
                description={description}
                headingId={headingId}
                level={level}
                variant={variant}
                asSummary
                disclosureContentId={contentId}
                className={`relative border-b-0 after:absolute after:inset-x-4 after:bottom-0 after:h-px after:bg-zinc-200 after:content-[''] ${sectionVariant || flowVariant ? 'py-4 sm:py-5' : 'p-4'}`}
            />

            <div
                id={contentId}
                className={
                    flowVariant
                        ? 'pt-4 sm:pt-5'
                        : sectionVariant
                          ? 'pt-4 sm:pt-5'
                          : 'p-4 sm:p-5'
                }
            >
                {children}
            </div>
        </details>
    );
}

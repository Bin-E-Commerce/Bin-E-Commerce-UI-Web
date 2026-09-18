// Card giới thiệu một capability của AI Studio.
// Component chỉ hiển thị nội dung marketing nội bộ, không sở hữu trạng thái chọn sản phẩm hay request.

import { AiAssistantIcon } from '@/components/ui/ai-assistant-button';

interface AiFeatureCardProps {
    eyebrow: string;
    title: string;
    description: string;
    imageSrc: string;
    imageAlt: string;
}

// Hiển thị ảnh minh họa và mô tả ngắn để seller hiểu đầu ra trước khi tạo job.
export function AiFeatureCard({
    eyebrow,
    title,
    description,
    imageSrc,
    imageAlt,
}: AiFeatureCardProps) {
    return (
        <article className="group relative overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm transition-[transform,box-shadow] duration-300 motion-safe:hover:-translate-y-1 motion-safe:hover:shadow-lg">
            <div className="flex items-start justify-between gap-3 border-b border-zinc-100 px-4 pb-3 pt-4">
                <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-500">
                        {eyebrow}
                    </p>
                    <h2 className="mt-1 text-base font-semibold tracking-tight text-zinc-950">
                        {title}
                    </h2>
                </div>
                <span className="flex size-9 shrink-0 items-center justify-center text-zinc-950">
                    <AiAssistantIcon size={22} />
                </span>
            </div>
            <div className="relative mx-4 mt-4 overflow-hidden rounded-lg border border-zinc-200 bg-zinc-100 shadow-inner">
                <img
                    src={imageSrc}
                    alt={imageAlt}
                    loading="lazy"
                    decoding="async"
                    className="aspect-[4/1] h-full w-full bg-white object-contain transition-transform duration-500 motion-safe:group-hover:scale-[1.03]"
                />
            </div>
            <p className="px-4 pb-4 pt-3 text-xs leading-5 text-zinc-600">
                {description}
            </p>
        </article>
    );
}

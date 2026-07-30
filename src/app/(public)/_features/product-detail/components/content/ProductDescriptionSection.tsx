'use client';

import DOMPurify from 'dompurify';
import { useMemo } from 'react';

interface ProductDescriptionSectionProps {
    description?: string | null;
    shortDescription?: string | null;
}

// Lọc HTML từ nguồn crawl bằng allowlist trước khi render để giữ nội dung phong phú mà không đưa script nguy hiểm vào trang.
export function ProductDescriptionSection({
    description,
    shortDescription,
}: ProductDescriptionSectionProps) {
    const sanitizedDescription = useMemo(
        () =>
            DOMPurify.sanitize(description ?? '', {
                ALLOWED_TAGS: [
                    'p',
                    'h1',
                    'h2',
                    'h3',
                    'ul',
                    'ol',
                    'li',
                    'strong',
                    'em',
                    'br',
                    'img',
                    'a',
                ],
                ALLOWED_ATTR: [
                    'src',
                    'alt',
                    'width',
                    'height',
                    'href',
                    'title',
                    'target',
                    'rel',
                ],
            }),
        [description],
    );

    return (
        <section className="border border-zinc-200 bg-white">
            <div className="border-b border-zinc-200 px-5 py-4 sm:px-7">
                <p className="text-xs font-semibold uppercase text-zinc-500">
                    Nội dung sản phẩm
                </p>
                <h2 className="mt-1 text-xl font-bold text-zinc-950">
                    Mô tả chi tiết
                </h2>
            </div>
            <div className="px-5 py-6 sm:px-7">
                {sanitizedDescription ? (
                    <div
                        className="product-description break-words text-sm leading-7 text-zinc-700 [&_h1]:my-5 [&_h1]:text-2xl [&_h1]:font-bold [&_h2]:mb-2 [&_h2]:mt-7 [&_h2]:text-lg [&_h2]:font-bold [&_h3]:mb-2 [&_h3]:mt-5 [&_h3]:font-semibold [&_img]:mx-auto [&_img]:my-5 [&_img]:h-auto [&_img]:max-w-full [&_li]:my-1 [&_p]:my-3 [&_strong]:font-semibold [&_ul]:my-3 [&_ul]:list-disc [&_ul]:pl-5"
                        dangerouslySetInnerHTML={{ __html: sanitizedDescription }}
                    />
                ) : (
                    <p className="text-sm leading-7 text-zinc-600">
                        {shortDescription || 'Sản phẩm chưa có mô tả chi tiết.'}
                    </p>
                )}
            </div>
        </section>
    );
}

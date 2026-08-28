'use client';

//
// Thành phần dùng chung để trình bày phần tóm tắt và nội dung chi tiết của sản phẩm.
// Component chỉ chịu trách nhiệm lọc HTML an toàn và dựng giao diện; dữ liệu vẫn do
// trang chi tiết seller/customer cung cấp và việc lưu sản phẩm vẫn thuộc về form riêng.
//
import DOMPurify from 'dompurify';
import { useMemo } from 'react';
import { ClipboardList, FileText } from 'lucide-react';

import { formatProductDescriptionHtml } from '../../utils/product-detail-presentation';

interface ProductDescriptionBlocksProps {
    description?: string | null;
    shortDescription?: string | null;
}

// Hiển thị hai nội dung ở cùng cấp thị giác, đồng thời giữ HTML mô tả trong allowlist để không tạo lỗ hổng XSS.
export function ProductDescriptionBlocks({
    description,
    shortDescription,
}: ProductDescriptionBlocksProps) {
    const sanitizedDescription = useMemo(
        () =>
            DOMPurify.sanitize(formatProductDescriptionHtml(description), {
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
        <div className="divide-y divide-zinc-200">
            <div className="pb-6">
                <div className="flex items-start gap-3">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-white text-zinc-700 shadow-sm ring-1 ring-zinc-200">
                        <ClipboardList className="size-4" aria-hidden="true" />
                    </span>
                    <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-500">
                            Tóm tắt
                        </p>
                        <h3 className="mt-1 text-base font-bold text-zinc-950">
                            Mô tả ngắn
                        </h3>
                    </div>
                </div>
                <p className="mt-4 whitespace-pre-line break-words text-sm leading-7 text-zinc-700">
                    {shortDescription || 'Chưa có mô tả ngắn.'}
                </p>
            </div>

            <div className="pt-6">
                <div className="flex items-start gap-3">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-zinc-950 text-white shadow-sm">
                        <FileText className="size-4" aria-hidden="true" />
                    </span>
                    <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-500">
                            Nội dung
                        </p>
                        <h3 className="mt-1 text-base font-bold text-zinc-950">
                            Mô tả chi tiết
                        </h3>
                    </div>
                </div>
                {sanitizedDescription ? (
                    <div
                        className="product-description mt-4 break-words text-sm leading-7 text-zinc-700 [&_a]:font-medium [&_a]:text-zinc-950 [&_a]:underline [&_h1]:my-5 [&_h1]:text-2xl [&_h1]:font-bold [&_h2]:mb-2 [&_h2]:mt-7 [&_h2]:text-lg [&_h2]:font-bold [&_h3]:mb-2 [&_h3]:mt-5 [&_h3]:font-semibold [&_img]:mx-auto [&_img]:my-5 [&_img]:h-auto [&_img]:max-w-full [&_li]:my-1 [&_ol]:my-3 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:my-3 [&_strong]:font-semibold [&_ul]:my-3 [&_ul]:list-disc [&_ul]:pl-5"
                        dangerouslySetInnerHTML={{ __html: sanitizedDescription }}
                    />
                ) : (
                    <p className="mt-4 rounded-xl border border-dashed border-zinc-300 bg-zinc-50 p-4 text-sm leading-6 text-zinc-500">
                        Chưa có mô tả chi tiết.
                    </p>
                )}
            </div>
        </div>
    );
}

// Dựng Markdown của tài liệu bằng cùng parser GFM với editor; không sửa nội dung nguồn hoặc dữ liệu lưu.

'use client';

import dynamic from 'next/dynamic';
import type { KnowledgeMarkdownPreviewProps } from '../types/documents/document.types';

const MarkdownPreview = dynamic(
    async () => {
        const { default: MarkdownEditor } =
            await import('@uiw/react-md-editor');
        return MarkdownEditor.Markdown;
    },
    {
        ssr: false,
        loading: () => (
            <p className="text-sm text-muted-foreground">
                Đang tải định dạng nội dung…
            </p>
        ),
    },
);

// Hiển thị heading, danh sách, in đậm và bảng GFM thành nội dung dễ đọc trong card.
export function KnowledgeMarkdownPreview({
    source,
}: KnowledgeMarkdownPreviewProps) {
    return (
        <div className="min-w-0 overflow-x-auto text-sm">
            <MarkdownPreview
                source={source}
                wrapperElement={{ 'data-color-mode': 'light' }}
            />
        </div>
    );
}

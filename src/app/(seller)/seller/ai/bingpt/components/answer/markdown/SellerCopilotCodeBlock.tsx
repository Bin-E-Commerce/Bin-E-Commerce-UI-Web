// Hiển thị nội dung mẫu/code trong khung có thể sao chép; nội dung luôn được React render như text.
'use client';

import { Check, Copy } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

interface SellerCopilotCodeBlockProps {
    content: string;
    language: string;
}

// Sao chép nguyên văn khối để seller dùng lại mà không làm thay đổi khoảng trắng hoặc xuống dòng.
export function SellerCopilotCodeBlock({
    content,
    language,
}: SellerCopilotCodeBlockProps) {
    const [copied, setCopied] = useState(false);

    // Clipboard có thể bị chặn bởi trình duyệt; lỗi không làm ảnh hưởng nội dung câu trả lời.
    async function copyContent() {
        try {
            await navigator.clipboard.writeText(content);
            setCopied(true);
        } catch {
            setCopied(false);
        }
    }

    return (
        <div className="my-4 overflow-hidden rounded-xl border border-zinc-200 bg-zinc-50">
            <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-2">
                <span className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                    {language || 'text'}
                </span>
                <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    aria-label={
                        copied ? 'Đã sao chép nội dung' : 'Sao chép nội dung'
                    }
                    onClick={copyContent}
                >
                    {copied ? (
                        <Check aria-hidden="true" />
                    ) : (
                        <Copy aria-hidden="true" />
                    )}
                </Button>
            </div>
            <pre className="overflow-x-auto p-4 text-sm leading-6 text-zinc-800">
                <code>{content}</code>
            </pre>
            <span className="sr-only" aria-live="polite">
                {copied ? 'Đã sao chép nội dung.' : ''}
            </span>
        </div>
    );
}

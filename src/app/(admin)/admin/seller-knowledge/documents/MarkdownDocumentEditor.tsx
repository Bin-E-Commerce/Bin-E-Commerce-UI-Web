// Bộ soạn Markdown dùng chung cho nội dung tài liệu; không sở hữu trạng thái form hay quy tắc lưu revision.

'use client';

import dynamic from 'next/dynamic';
import { useEffect, useMemo, useRef } from 'react';
import type { RefMDEditor } from '@uiw/react-md-editor';
import type { MarkdownDocumentEditorProps } from '../types/documents/document.types';

const MarkdownEditor = dynamic(() => import('@uiw/react-md-editor'), {
    ssr: false,
    loading: () => (
        <div
            role="status"
            className="flex min-h-[420px] items-center justify-center rounded-xl border bg-muted/20 text-sm text-muted-foreground"
        >
            Đang tải công cụ soạn thảo Markdown…
        </div>
    ),
});

// Chuyển giá trị controlled từ React Hook Form sang editor; nội dung lưu vẫn là Markdown thuần để giữ nguyên contract API.
export function MarkdownDocumentEditor({
    value,
    onChange,
    onBlur,
    inputRef,
    invalid,
    describedBy,
}: MarkdownDocumentEditorProps) {
    const editorRef = useRef<RefMDEditor>(null);
    // RHF chỉ cần focus() để đưa con trỏ tới trường lỗi; proxy này truy cập textarea nội bộ sau khi editor tải xong.
    const focusTarget = useMemo(
        () => ({ focus: () => editorRef.current?.textarea?.focus() }),
        [],
    );

    // Đăng ký proxy ngay cả khi chunk editor đang tải để lỗi validation luôn có đích focus hợp lệ.
    useEffect(() => {
        inputRef(focusTarget);
        return () => inputRef(null);
    }, [focusTarget, inputRef]);

    return (
        <div className="min-w-0 overflow-hidden rounded-xl border border-border shadow-sm">
            <MarkdownEditor
                ref={editorRef}
                data-color-mode="light"
                value={value}
                onChange={(nextValue) => onChange(nextValue ?? '')}
                preview="edit"
                height={420}
                minHeight={320}
                maxHeight={720}
                visibleDragbar
                textareaProps={{
                    onBlur,
                    required: true,
                    'aria-label': 'Nội dung Markdown của tài liệu',
                    'aria-invalid': invalid,
                    'aria-describedby': describedBy,
                    placeholder:
                        '# Tiêu đề tài liệu\n\nMô tả quy định bằng ngôn ngữ rõ ràng...',
                }}
            />
        </div>
    );
}

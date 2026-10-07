// Component ghi nguồn tài liệu thành nhãn ngắn và badge tên tài liệu dưới câu trả lời, không dựng card lớn.
// Nguồn mới dùng title có cấu trúc; label cũ được phân tích làm phương án tương thích dữ liệu lịch sử.
'use client';

import type { SellerCopilotSourcesProps } from '../../../../types/chat/seller-copilot-chat.types';
import type { SellerCopilotCitation } from '@/services/seller/types/seller-copilot.types';

// Gom các citation theo tài liệu để nhiều đoạn từ cùng một file chỉ tạo một badge.
// Hàm chỉ chuẩn hóa tên hiển thị; không biến section, excerpt hay nội dung retrieval thành nguồn mới.
function groupCitationSources(citations: SellerCopilotCitation[]) {
    const documents = new Map<string, { title: string }>();

    for (const citation of citations) {
        const title = resolveCitationTitle(citation);
        const documentId = citation.documentId || title;
        const document = documents.get(documentId) ?? {
            title,
        };
        documents.set(documentId, document);
    }

    return [...documents.entries()].map(([id, document]) => ({
        id,
        title: document.title,
    }));
}

// Ưu tiên tên tài liệu có cấu trúc; citation cũ chỉ có label theo dạng `Tên tài liệu · Đường dẫn mục`.
function resolveCitationTitle(citation: SellerCopilotCitation): string {
    const legacyTitle = citation.label.split(' · ')[0]?.trim();
    return citation.title?.trim() || legacyTitle || citation.label.trim();
}

// Hiển thị tên file nguồn dưới câu trả lời; section và excerpt được lược để badge chỉ còn tên tài liệu.
export function SellerCopilotSources({ citations }: SellerCopilotSourcesProps) {
    if (!citations.length) return null;

    const documents = groupCitationSources(citations);

    return (
        <p
            aria-label="Nguồn thông tin"
            className="mt-3 flex flex-wrap items-center gap-2 text-xs leading-5 text-zinc-500"
        >
            <span className="font-medium text-zinc-600">Nguồn:</span>
            {documents.map((document) => (
                <span
                    key={document.id}
                    className="inline-flex max-w-full items-center rounded-md border border-zinc-200 bg-zinc-50 px-2 py-0.5 font-medium text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300"
                >
                    <span className="break-words">{document.title}</span>
                </span>
            ))}
        </p>
    );
}

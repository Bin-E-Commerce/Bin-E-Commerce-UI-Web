// File này hiển thị phase SSE hiện tại trước token đầu tiên; không tham gia gọi API hay điều khiển request.
'use client';

import { LoaderCircle } from 'lucide-react';
import type { SellerCopilotThinkingIndicatorProps } from '../../../types/chat/answer-components.types';

// Hiển thị phase SSE thành một dòng chữ kèm spinner, không tạo badge hoặc gọi API.
// Dấu ba chấm cuối message được bỏ vì spinner đã thể hiện trạng thái đang xử lý.
export function SellerCopilotThinkingIndicator({
    message = 'Đang phân tích',
}: SellerCopilotThinkingIndicatorProps) {
    return (
        <div
            className="inline-flex max-w-full items-center gap-2 text-sm text-zinc-600"
            role="status"
            aria-live="polite"
        >
            <LoaderCircle
                className="size-3.5 shrink-0 animate-spin text-zinc-500"
                aria-hidden="true"
            />
            {/* Backend gửi dấu ba chấm như văn bản; spinner đã thể hiện trạng thái đang xử lý. */}
            <span className="truncate">{message.replace(/[.…]+$/, '')}</span>
        </div>
    );
}

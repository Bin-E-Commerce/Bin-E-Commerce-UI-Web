// Hiển thị event chuyển mode như một mốc timeline, không giả lập message user hoặc assistant.
'use client';

import { BookOpen, Bot, MessageCircle, Store } from 'lucide-react';
import type { SellerCopilotModeChangeDividerProps } from '../../../../types/chat/answer-components.types';

// Chọn icon/nhãn cố định theo enum mode; event cũ hoặc copy từ model không thể tạo UI tùy ý.
export function SellerCopilotModeChangeDivider({
    mode,
}: SellerCopilotModeChangeDividerProps) {
    const content = {
        chat: { label: 'Trò chuyện', icon: MessageCircle },
        shop_data: { label: 'Dữ liệu shop', icon: Store },
        knowledge: { label: 'Tài liệu', icon: BookOpen },
        agent: { label: 'AI Agent', icon: Bot },
    }[mode];
    const Icon = content.icon;

    return (
        <div
            role="separator"
            aria-label={`Bạn đã chuyển sang chế độ ${content.label}`}
            className="flex items-center gap-2 py-2 text-[11px] text-zinc-500 dark:text-zinc-400 sm:gap-3 sm:text-xs"
        >
            <span
                aria-hidden="true"
                className="h-px min-w-3 flex-1 bg-zinc-200 dark:bg-zinc-700"
            />
            <span className="inline-flex max-w-[85%] items-center gap-2 rounded-full border border-zinc-200 bg-white px-2.5 py-1.5 text-center dark:border-zinc-700 dark:bg-zinc-900 sm:px-3">
                <Icon className="size-3.5" aria-hidden="true" />
                Bạn đã chuyển sang chế độ {content.label}
            </span>
            <span
                aria-hidden="true"
                className="h-px min-w-3 flex-1 bg-zinc-200 dark:bg-zinc-700"
            />
        </div>
    );
}

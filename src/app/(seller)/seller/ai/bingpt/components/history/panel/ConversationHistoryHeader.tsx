// Header của sidebar history: tìm kiếm, tạo cuộc trò chuyện và thu gọn panel.
// Component chỉ phát callback, không sở hữu state search hay conversation.
'use client';

import { PanelRightClose, Plus, Search, X } from 'lucide-react';
import type { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import type { ConversationHistoryHeaderProps } from '../../../types/conversation-history.types';

// Render các action header với tooltip thống nhất để sidebar giữ layout gọn trên desktop.
export function ConversationHistoryHeader({
    isSearchOpen,
    searchLabel,
    disabled,
    onToggleSearch,
    onNewConversation,
    onClose,
}: ConversationHistoryHeaderProps) {
    return (
        <div className="shrink-0 border-b border-zinc-200 pb-3">
            <div className="flex items-center justify-between gap-2">
                <h2 className="truncate text-lg font-semibold tracking-tight text-zinc-950">
                    BinGPT
                </h2>
                <div className="flex shrink-0 items-center gap-1">
                    <ConversationHistoryHeaderAction
                        label={searchLabel}
                        onClick={onToggleSearch}
                    >
                        {isSearchOpen ? (
                            <X className="size-4" />
                        ) : (
                            <Search className="size-4" />
                        )}
                    </ConversationHistoryHeaderAction>
                    <ConversationHistoryHeaderAction
                        label="Cuộc trò chuyện mới"
                        disabled={disabled}
                        onClick={onNewConversation}
                    >
                        <Plus className="size-4" />
                    </ConversationHistoryHeaderAction>
                    <ConversationHistoryHeaderAction
                        label="Thu nhỏ lịch sử trò chuyện"
                        onClick={onClose}
                    >
                        <PanelRightClose className="size-4" />
                    </ConversationHistoryHeaderAction>
                </div>
            </div>
        </div>
    );
}

// Gói một action icon để header không lặp lại cấu hình tooltip và accessibility.
function ConversationHistoryHeaderAction({
    label,
    disabled = false,
    onClick,
    children,
}: {
    label: string;
    disabled?: boolean;
    onClick: () => void;
    children: ReactNode;
}) {
    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    disabled={disabled}
                    className="size-8 rounded-lg text-zinc-500 hover:bg-zinc-100 hover:text-zinc-950"
                    aria-label={label}
                    onClick={onClick}
                >
                    {children}
                </Button>
            </TooltipTrigger>
            <TooltipContent
                side="bottom"
                className="border border-zinc-200 bg-white text-zinc-950 shadow-xl"
                arrowClassName="fill-white stroke-zinc-200 stroke-1"
            >
                {label}
            </TooltipContent>
        </Tooltip>
    );
}

// File này render rail khi sidebar history được thu gọn.
// Rail chỉ phát callback thao tác, không tự sở hữu lịch sử hoặc gọi API.
'use client';

import {
    MessageCircle,
    PanelRightOpen,
    Pin,
    Search,
    SquarePen,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import type {
    ConversationHistoryRailActionProps,
    ConversationHistoryRailProps,
} from '../../../types/conversation-history.types';

// Hiển thị rail và giữ các shortcut chính để seller không mất thao tác khi sidebar bị thu gọn.
export function ConversationHistoryRail({
    onOpen,
    onNewConversation,
}: ConversationHistoryRailProps) {
    return (
        <TooltipProvider delayDuration={180}>
            <aside className="hidden w-14 min-w-0 justify-self-center self-start flex-col items-center border-l border-zinc-200 bg-white pt-5 text-zinc-500 xl:fixed xl:right-0 xl:top-16 xl:z-20 xl:h-[calc(100dvh-4rem)] xl:flex">
                <ConversationHistoryRailAction
                    label="Mở BinGPT"
                    onClick={onOpen}
                    className="bg-white hover:bg-zinc-50"
                >
                    <PanelRightOpen className="size-5" />
                </ConversationHistoryRailAction>
                <div className="mt-4 flex flex-col items-center gap-1.5">
                    <ConversationHistoryRailAction
                        label="Cuộc trò chuyện mới"
                        onClick={onNewConversation}
                    >
                        <SquarePen className="size-4" />
                    </ConversationHistoryRailAction>
                    <ConversationHistoryRailAction
                        label="Tìm kiếm cuộc trò chuyện"
                        onClick={onOpen}
                    >
                        <Search className="size-4" />
                    </ConversationHistoryRailAction>
                    <ConversationHistoryRailAction
                        label="Mở phiên đã ghim"
                        onClick={onOpen}
                    >
                        <Pin className="size-4" />
                    </ConversationHistoryRailAction>
                    <ConversationHistoryRailAction
                        label="Mở lịch sử trò chuyện"
                        onClick={onOpen}
                    >
                        <MessageCircle className="size-4" />
                    </ConversationHistoryRailAction>
                </div>
            </aside>
        </TooltipProvider>
    );
}

// Gói icon thành action có tooltip để rail hẹp vẫn dễ hiểu và dùng được bằng bàn phím.
function ConversationHistoryRailAction({
    label,
    onClick,
    children,
    className,
}: ConversationHistoryRailActionProps) {
    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className={`mx-auto size-9 rounded-lg text-zinc-500 hover:text-zinc-950 [&>svg]:size-5 ${className ?? 'hover:bg-zinc-100'}`}
                    aria-label={label}
                    onClick={onClick}
                >
                    {children}
                </Button>
            </TooltipTrigger>
            <TooltipContent
                side="left"
                className="border border-zinc-200 bg-white text-zinc-950 shadow-xl"
                arrowClassName="fill-white stroke-zinc-200 stroke-1"
            >
                {label}
            </TooltipContent>
        </Tooltip>
    );
}

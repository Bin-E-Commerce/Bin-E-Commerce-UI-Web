// Một row conversation trong sidebar history.
// Row sở hữu presentation của rename/menu/pin/delete, còn API action được đẩy lên panel qua callback.
'use client';

import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { MoreHorizontal, Pencil, Pin, PinOff, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import type { ConversationHistoryItemProps } from '../../../types/conversation-history.types';
import { formatConversationTitle } from '../../../utils/conversation-history.utils';

// Render row theo trạng thái active/editing/menu; không tự gọi API để giữ tenant/action boundary ở hook.
export function ConversationHistoryItem({
    conversation,
    active,
    menuOpen,
    editing,
    editingTitle,
    disabled,
    renameInputRef,
    onSelect,
    onEditingTitleChange,
    onSubmitRename,
    onCancelRename,
    onToggleMenu,
    onStartRename,
    onTogglePinned,
    onRequestDelete,
}: ConversationHistoryItemProps) {
    return (
        <div
            className={`group relative flex min-w-0 max-w-full items-center rounded-lg transition-colors ${
                active || menuOpen || editing
                    ? 'bg-zinc-100 text-zinc-950'
                    : 'text-zinc-600 hover:bg-zinc-100'
            }`}
        >
            {editing ? (
                <Input
                    ref={renameInputRef}
                    value={editingTitle}
                    maxLength={32}
                    aria-label="Đổi tên đoạn chat"
                    disabled={disabled}
                    onChange={(event) =>
                        onEditingTitleChange(event.target.value)
                    }
                    onBlur={() => void onSubmitRename()}
                    onKeyDown={(event) => {
                        if (event.key === 'Enter') {
                            event.preventDefault();
                            void onSubmitRename();
                        }
                        if (event.key === 'Escape') {
                            event.preventDefault();
                            onCancelRename();
                        }
                    }}
                    className="h-auto min-w-0 flex-1 rounded-lg border-0 bg-transparent px-2 py-2 text-[13px] font-normal leading-6 text-zinc-800 shadow-none focus-visible:border-0 focus-visible:ring-0"
                />
            ) : (
                <Button
                    type="button"
                    variant="ghost"
                    disabled={disabled}
                    onClick={() => onSelect(conversation.id)}
                    className={`h-auto min-w-0 max-w-full flex-1 justify-start gap-2.5 overflow-hidden rounded-lg px-2 py-2 text-left text-inherit hover:bg-transparent ${menuOpen ? 'pr-14' : 'group-hover:pr-14'}`}
                >
                    <span className="min-w-0 max-w-full flex-1">
                        <span
                            className={`block min-w-0 max-w-full overflow-hidden break-words text-[13px] font-normal leading-6 text-zinc-800 group-hover:truncate group-hover:whitespace-nowrap ${menuOpen ? 'truncate whitespace-nowrap' : ''}`}
                        >
                            {formatConversationTitle(conversation.title)}
                        </span>
                    </span>
                </Button>
            )}

            {!editing ? (
                <div
                    className={`absolute right-1.5 top-1/2 z-10 flex -translate-y-1/2 items-center gap-0.5 transition-opacity ${menuOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0 group-hover:pointer-events-auto group-hover:opacity-100'}`}
                >
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon-xs"
                                disabled={disabled}
                                className={`pointer-events-auto rounded-md text-zinc-400 hover:bg-white hover:text-zinc-950 ${conversation.isPinned ? 'text-zinc-700' : ''}`}
                                aria-label={
                                    conversation.isPinned
                                        ? 'Bỏ ghim đoạn chat'
                                        : 'Ghim đoạn chat'
                                }
                                onClick={(event) => {
                                    event.stopPropagation();
                                    onTogglePinned(conversation);
                                }}
                            >
                                {conversation.isPinned ? (
                                    <PinOff className="size-3.5" />
                                ) : (
                                    <Pin className="size-3.5" />
                                )}
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent
                            side="top"
                            className="border border-zinc-200 bg-white text-zinc-950 shadow-xl"
                            arrowClassName="fill-white stroke-zinc-200 stroke-1"
                        >
                            {conversation.isPinned
                                ? 'Bỏ ghim đoạn chat'
                                : 'Ghim đoạn chat'}
                        </TooltipContent>
                    </Tooltip>
                    <DropdownMenu.Root
                        open={menuOpen}
                        onOpenChange={onToggleMenu}
                    >
                        <DropdownMenu.Trigger asChild>
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon-xs"
                                disabled={disabled}
                                className="pointer-events-auto rounded-md text-zinc-400 hover:bg-white hover:text-zinc-950"
                                aria-label="Tùy chọn đoạn chat"
                                title="Tùy chọn đoạn chat"
                            >
                                <MoreHorizontal className="size-3.5" />
                            </Button>
                        </DropdownMenu.Trigger>
                        <DropdownMenu.Portal>
                            <DropdownMenu.Content
                                side="left"
                                align="start"
                                sideOffset={220}
                                className="z-50 w-56 overflow-hidden rounded-xl border border-zinc-200 bg-white p-2 text-zinc-800 shadow-xl outline-none"
                            >
                                <DropdownMenu.Item
                                    className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm outline-none hover:bg-zinc-50"
                                    onSelect={() => onStartRename(conversation)}
                                >
                                    <Pencil className="size-4 text-zinc-500" />
                                    Đổi tên
                                </DropdownMenu.Item>
                                <DropdownMenu.Separator className="my-1 h-px bg-zinc-200" />
                                <DropdownMenu.Item
                                    className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm outline-none hover:bg-zinc-50"
                                    onSelect={() =>
                                        onTogglePinned(conversation)
                                    }
                                >
                                    {conversation.isPinned ? (
                                        <PinOff className="size-4 text-zinc-500" />
                                    ) : (
                                        <Pin className="size-4 text-zinc-500" />
                                    )}
                                    {conversation.isPinned
                                        ? 'Bỏ ghim đoạn chat'
                                        : 'Ghim đoạn chat'}
                                </DropdownMenu.Item>
                                <DropdownMenu.Item
                                    className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-red-600 outline-none hover:bg-red-50"
                                    onSelect={() =>
                                        onRequestDelete(conversation)
                                    }
                                >
                                    <Trash2 className="size-4" />
                                    Xóa
                                </DropdownMenu.Item>
                            </DropdownMenu.Content>
                        </DropdownMenu.Portal>
                    </DropdownMenu.Root>
                </div>
            ) : null}
        </div>
    );
}

// Danh sách conversation theo group trong sidebar history.
// Component chỉ render trạng thái/list và phát event; state rename/delete vẫn nằm ở panel orchestrator.
'use client';

import { MessageSquare } from 'lucide-react';
import type { ConversationHistoryListProps } from '../../../types/conversation-history.types';
import { ConversationHistoryItem } from './ConversationHistoryItem';

// Render loading, empty, grouped conversations và fade scroll trong một boundary riêng.
export function ConversationHistoryList({
    listRef,
    groups,
    hasConversations,
    activeConversationId,
    isLoading,
    isLoadingMore,
    disabled,
    fade,
    openMenuConversationId,
    editingConversationId,
    editingTitle,
    renameInputRef,
    onScroll,
    onSelect,
    onEditingTitleChange,
    onSubmitRename,
    onCancelRename,
    onToggleMenu,
    onStartRename,
    onTogglePinned,
    onRequestDelete,
}: ConversationHistoryListProps) {
    return (
        <div className="relative min-h-0 min-w-0 flex-1">
            <div
                ref={listRef}
                onScroll={onScroll}
                className="h-full min-w-0 max-w-full overscroll-contain overflow-x-hidden overflow-y-auto pb-3 pt-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
                {isLoading ? (
                    <p className="px-3 py-6 text-center text-xs text-zinc-500">
                        Đang tải lịch sử...
                    </p>
                ) : groups.length === 0 ? (
                    <div className="px-3 py-7 text-center">
                        <MessageSquare className="mx-auto size-5 text-zinc-300" />
                        <p className="mt-2 text-xs leading-5 text-zinc-500">
                            {hasConversations
                                ? 'Không tìm thấy cuộc trò chuyện phù hợp.'
                                : 'Chưa có phiên nào. Hãy bắt đầu bằng một câu hỏi cho shop.'}
                        </p>
                    </div>
                ) : (
                    <>
                        {groups.map((group) => (
                            <section
                                key={group.label}
                                className="mb-4 min-w-0 max-w-full last:mb-0"
                            >
                                <h3 className="px-0 pb-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
                                    {group.label}
                                </h3>
                                <div className="space-y-0.5">
                                    {group.conversations.map((conversation) => (
                                        <ConversationHistoryItem
                                            key={conversation.id}
                                            conversation={conversation}
                                            active={
                                                conversation.id ===
                                                activeConversationId
                                            }
                                            menuOpen={
                                                conversation.id ===
                                                openMenuConversationId
                                            }
                                            editing={
                                                conversation.id ===
                                                editingConversationId
                                            }
                                            editingTitle={editingTitle}
                                            disabled={disabled}
                                            renameInputRef={renameInputRef}
                                            onSelect={onSelect}
                                            onEditingTitleChange={
                                                onEditingTitleChange
                                            }
                                            onSubmitRename={onSubmitRename}
                                            onCancelRename={onCancelRename}
                                            onToggleMenu={(open) =>
                                                onToggleMenu(
                                                    conversation.id,
                                                    open,
                                                )
                                            }
                                            onStartRename={onStartRename}
                                            onTogglePinned={onTogglePinned}
                                            onRequestDelete={onRequestDelete}
                                        />
                                    ))}
                                </div>
                            </section>
                        ))}
                        {isLoadingMore ? (
                            <p className="px-2 py-3 text-center text-xs text-zinc-400">
                                Đang tải thêm...
                            </p>
                        ) : null}
                    </>
                )}
            </div>
            {fade.top ? (
                <div
                    className="pointer-events-none absolute inset-x-0 top-0 z-10 h-8 bg-gradient-to-b from-white via-white/90 to-transparent"
                    aria-hidden="true"
                />
            ) : null}
            {fade.bottom ? (
                <div
                    className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-10 bg-gradient-to-t from-white via-white/90 to-transparent"
                    aria-hidden="true"
                />
            ) : null}
        </div>
    );
}

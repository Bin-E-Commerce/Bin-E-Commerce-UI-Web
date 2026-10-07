// File này chỉ render popup tìm kiếm lịch sử hội thoại.
// Việc debounce, gọi API và chọn conversation vẫn thuộc panel/hook để component này giữ đúng ranh giới trình bày.
'use client';

import { MessageCircle, Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    AlertDialog,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import type { ConversationSearchDialogProps } from '../../../types/history/conversation-history.types';
import {
    formatSearchDate,
    highlightSearchText,
} from '../../../utils/history/conversation-history.utils';

// Popup hiển thị recent conversation khi rỗng và cả title/snippet khi seller nhập query.
export function ConversationSearchDialog({
    open,
    query,
    isLoading,
    results,
    onQueryChange,
    onClose,
    onSelect,
}: ConversationSearchDialogProps) {
    return (
        <AlertDialog
            open={open}
            onOpenChange={(nextOpen) => !nextOpen && onClose()}
        >
            <AlertDialogContent className="max-w-2xl gap-0 overflow-hidden rounded-2xl border-zinc-200 bg-white p-0 shadow-2xl">
                <AlertDialogTitle className="sr-only">
                    Tìm kiếm cuộc trò chuyện
                </AlertDialogTitle>
                <AlertDialogDescription className="sr-only">
                    Tìm trong tên và nội dung các cuộc trò chuyện của shop.
                </AlertDialogDescription>
                <div className="flex items-center gap-3 border-b border-zinc-100 px-5 py-4">
                    <Search className="size-4 shrink-0 text-zinc-400" />
                    <Input
                        autoFocus
                        value={query}
                        onChange={(event) => onQueryChange(event.target.value)}
                        placeholder="Tìm kiếm..."
                        aria-label="Tìm kiếm cuộc trò chuyện"
                        className="h-8 flex-1 border-0 bg-transparent px-0 text-sm shadow-none focus-visible:ring-0"
                    />
                    <AlertDialogCancel asChild>
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="size-8 rounded-lg text-zinc-500 hover:bg-zinc-100 hover:text-zinc-950"
                            aria-label="Đóng tìm kiếm"
                        >
                            <X className="size-4" />
                        </Button>
                    </AlertDialogCancel>
                </div>

                <div className="max-h-[min(60vh,30rem)] overflow-y-auto px-3 pb-4">
                    {!query.trim() ? (
                        <p className="px-2 pb-2 pt-1 text-xs text-zinc-500">
                            Đoạn chat gần đây
                        </p>
                    ) : null}
                    {isLoading ? (
                        <div className="space-y-3 px-2 py-3">
                            {Array.from({ length: 4 }, (_, index) => (
                                <div
                                    key={`search-skeleton-${index}`}
                                    className="space-y-2"
                                >
                                    <div className="h-4 w-2/5 animate-pulse rounded bg-zinc-100" />
                                    <div className="h-3 w-4/5 animate-pulse rounded bg-zinc-100" />
                                </div>
                            ))}
                        </div>
                    ) : results.length > 0 ? (
                        <div className="space-y-1">
                            {results.map((result) => (
                                <Button
                                    key={result.conversationId}
                                    type="button"
                                    variant="ghost"
                                    className="h-auto w-full justify-start gap-3 whitespace-normal rounded-xl px-3 py-3 text-left hover:bg-zinc-50"
                                    onClick={() =>
                                        onSelect(result.conversationId)
                                    }
                                >
                                    <MessageCircle className="mt-0.5 size-4 shrink-0 text-zinc-500" />
                                    <span className="min-w-0 flex-1">
                                        <span className="block truncate text-sm font-medium text-zinc-950">
                                            {highlightSearchText(
                                                result.title,
                                                query,
                                                `${result.conversationId}-title`,
                                            )}
                                        </span>
                                        {result.snippet ? (
                                            <span className="mt-1 block truncate text-xs leading-5 text-zinc-500">
                                                {highlightSearchText(
                                                    result.snippet,
                                                    query,
                                                    `${result.conversationId}-snippet`,
                                                )}
                                            </span>
                                        ) : null}
                                    </span>
                                    {query.trim() ? (
                                        <time className="shrink-0 self-start pt-0.5 text-[11px] text-zinc-400">
                                            {formatSearchDate(result.updatedAt)}
                                        </time>
                                    ) : null}
                                </Button>
                            ))}
                        </div>
                    ) : (
                        <p className="px-2 py-10 text-center text-sm text-zinc-500">
                            Không tìm thấy cuộc trò chuyện phù hợp.
                        </p>
                    )}
                </div>
            </AlertDialogContent>
        </AlertDialog>
    );
}

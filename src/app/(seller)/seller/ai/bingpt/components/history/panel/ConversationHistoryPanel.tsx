// Orchestrator của sidebar history: giữ state tìm kiếm, rename, delete và scroll.
// Các component con chỉ render một vùng UI, còn callback nghiệp vụ vẫn đi qua props.
'use client';

import {
    type UIEvent,
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
import { TooltipProvider } from '@/components/ui/tooltip';
import type {
    SellerCopilotConversation,
    SellerCopilotSearchResult,
} from '@/services/seller/types/seller-copilot.types';
import type { ConversationHistoryPanelProps } from '../../../types/conversation-history.types';
import {
    formatConversationTitle,
    groupConversations,
} from '../../../utils/conversation-history.utils';
import { DeleteConversationDialog } from '../delete/DeleteConversationDialog';
import { ConversationSearchDialog } from '../search/ConversationSearchDialog';
import { ConversationHistoryHeader } from './ConversationHistoryHeader';
import { ConversationHistoryList } from './ConversationHistoryList';

// Điều phối trạng thái của history nhưng không trực tiếp dựng từng row, giúp panel dễ review và thay đổi độc lập.
export function ConversationHistoryPanel({
    conversations,
    activeConversationId,
    isLoading,
    isLoadingMore,
    hasMore,
    disabled,
    onNewConversation,
    onSelectConversation,
    onLoadMore,
    onSetConversationPinned,
    onRenameConversation,
    onDeleteConversation,
    onSearch,
    onClose,
}: ConversationHistoryPanelProps) {
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState<
        SellerCopilotSearchResult[]
    >([]);
    const [isSearching, setIsSearching] = useState(false);
    const [openMenuConversationId, setOpenMenuConversationId] = useState<
        string | null
    >(null);
    const [editingConversationId, setEditingConversationId] = useState<
        string | null
    >(null);
    const [editingTitle, setEditingTitle] = useState('');
    const [conversationToDelete, setConversationToDelete] =
        useState<SellerCopilotConversation | null>(null);
    const [deleteSubmitting, setDeleteSubmitting] = useState(false);
    const [historyFade, setHistoryFade] = useState({
        top: false,
        bottom: false,
    });
    const renameInputRef = useRef<HTMLInputElement>(null);
    const renameSubmittingRef = useRef(false);
    const historyListRef = useRef<HTMLDivElement>(null);

    const recentSearchResults = useMemo(
        () =>
            conversations.slice(0, 8).map((conversation) => ({
                conversationId: conversation.id,
                title: formatConversationTitle(conversation.title),
                snippet: '',
                matchedIn: 'title' as const,
                updatedAt: conversation.updatedAt,
            })),
        [conversations],
    );
    const conversationGroups = useMemo(
        () => groupConversations(conversations),
        [conversations],
    );
    const searchLabel = isSearchOpen
        ? 'Đóng tìm kiếm lịch sử'
        : 'Tìm kiếm lịch sử trò chuyện';

    // Mở inline editor và đóng menu để một conversation chỉ có một trạng thái tương tác tại một thời điểm.
    const startRename = useCallback(
        (conversation: SellerCopilotConversation) => {
            setOpenMenuConversationId(null);
            setEditingConversationId(conversation.id);
            setEditingTitle(conversation.title);
        },
        [],
    );

    // Ghi nhận conversation trước khi mở dialog để dialog luôn hiển thị đúng title đang bị xoá.
    const requestDelete = useCallback(
        (conversation: SellerCopilotConversation) => {
            setOpenMenuConversationId(null);
            setConversationToDelete(conversation);
        },
        [],
    );

    // Optimistic remove search result; nếu request thất bại thì khôi phục snapshot để UI không mất dữ liệu.
    const confirmDelete = useCallback(async () => {
        if (!conversationToDelete || deleteSubmitting) return;
        const previousSearchResults = searchResults;
        const conversationId = conversationToDelete.id;
        setDeleteSubmitting(true);
        setSearchResults((current) =>
            current.filter(
                (result) => result.conversationId !== conversationId,
            ),
        );
        try {
            await onDeleteConversation(conversationId);
            setConversationToDelete(null);
        } catch {
            setSearchResults(previousSearchResults);
        } finally {
            setDeleteSubmitting(false);
        }
    }, [
        conversationToDelete,
        deleteSubmitting,
        onDeleteConversation,
        searchResults,
    ]);

    // Focus toàn bộ title sau render để seller có thể đổi tên ngay mà không cần click thêm lần nữa.
    useEffect(() => {
        if (!editingConversationId) return;
        renameInputRef.current?.focus();
        renameInputRef.current?.select();
    }, [editingConversationId]);

    // Huỷ inline editor mà không gọi API và giữ nguyên title đang có trong danh sách.
    const cancelRename = useCallback(() => {
        if (renameSubmittingRef.current) return;
        setEditingConversationId(null);
        setEditingTitle('');
    }, []);

    // Chuẩn hoá title trước khi lưu; title rỗng chỉ đóng editor để tránh ghi dữ liệu không hợp lệ.
    const submitRename = useCallback(async () => {
        if (!editingConversationId || renameSubmittingRef.current) return;
        const normalizedTitle = editingTitle.trim().replace(/\s+/g, ' ');
        if (!normalizedTitle) {
            cancelRename();
            return;
        }
        renameSubmittingRef.current = true;
        try {
            await onRenameConversation(editingConversationId, normalizedTitle);
            setEditingConversationId(null);
            setEditingTitle('');
        } finally {
            renameSubmittingRef.current = false;
        }
    }, [
        cancelRename,
        editingConversationId,
        editingTitle,
        onRenameConversation,
    ]);

    // Đóng search và xoá kết quả tạm để lần mở sau luôn bắt đầu từ trạng thái sạch.
    const closeSearch = useCallback(() => {
        setSearchTerm('');
        setSearchResults([]);
        setIsSearchOpen(false);
    }, []);

    // Debounce search và huỷ request cũ để kết quả không bị đảo ngược khi seller gõ liên tục.
    useEffect(() => {
        if (!isSearchOpen) return;
        const query = searchTerm.trim();
        if (!query) {
            setSearchResults(recentSearchResults);
            setIsSearching(false);
            return;
        }
        const controller = new AbortController();
        const timeout = window.setTimeout(() => {
            setIsSearching(true);
            void onSearch(query, controller.signal)
                .then((results) => {
                    if (!controller.signal.aborted) setSearchResults(results);
                })
                .catch(() => {
                    if (!controller.signal.aborted) setSearchResults([]);
                })
                .finally(() => {
                    if (!controller.signal.aborted) setIsSearching(false);
                });
        }, 220);
        return () => {
            window.clearTimeout(timeout);
            controller.abort();
        };
    }, [isSearchOpen, onSearch, recentSearchResults, searchTerm]);

    // Chỉ cập nhật fade khi trạng thái thật sự đổi để scroll không gây thêm render liên tục.
    const syncHistoryFade = useCallback((element: HTMLDivElement) => {
        const maxScrollTop = Math.max(
            element.scrollHeight - element.clientHeight,
            0,
        );
        const nextFade = {
            top: element.scrollTop > 4,
            bottom: maxScrollTop - element.scrollTop > 4,
        };
        setHistoryFade((current) =>
            current.top === nextFade.top && current.bottom === nextFade.bottom
                ? current
                : nextFade,
        );
    }, []);

    // Đo lại fade sau khi danh sách đổi để không hiện gradient khi nội dung chưa vượt chiều cao sidebar.
    useEffect(() => {
        const element = historyListRef.current;
        if (!element) return;
        const frameId = window.requestAnimationFrame(() =>
            syncHistoryFade(element),
        );
        return () => window.cancelAnimationFrame(frameId);
    }, [conversations.length, isLoading, isLoadingMore, syncHistoryFade]);

    // Tải thêm trước khi chạm đáy và đồng thời cập nhật hiệu ứng fade của vùng scroll.
    const handleHistoryScroll = (event: UIEvent<HTMLDivElement>) => {
        const element = event.currentTarget;
        syncHistoryFade(element);
        if (!hasMore || isLoadingMore) return;
        const distanceToBottom =
            element.scrollHeight - element.scrollTop - element.clientHeight;
        if (distanceToBottom < 120) onLoadMore();
    };

    return (
        <TooltipProvider delayDuration={180}>
            <aside className="flex h-full min-h-0 min-w-0 flex-col self-stretch overflow-hidden border-l border-zinc-200 bg-white pl-3 pr-3 pt-6 text-zinc-950 xl:z-20 xl:w-[270px]">
                <ConversationHistoryHeader
                    isSearchOpen={isSearchOpen}
                    searchLabel={searchLabel}
                    disabled={disabled}
                    onToggleSearch={() =>
                        isSearchOpen ? closeSearch() : setIsSearchOpen(true)
                    }
                    onNewConversation={onNewConversation}
                    onClose={onClose}
                />
                <ConversationHistoryList
                    listRef={historyListRef}
                    groups={conversationGroups}
                    hasConversations={conversations.length > 0}
                    activeConversationId={activeConversationId}
                    isLoading={isLoading}
                    isLoadingMore={isLoadingMore}
                    disabled={disabled}
                    fade={historyFade}
                    openMenuConversationId={openMenuConversationId}
                    editingConversationId={editingConversationId}
                    editingTitle={editingTitle}
                    renameInputRef={renameInputRef}
                    onScroll={handleHistoryScroll}
                    onSelect={onSelectConversation}
                    onEditingTitleChange={setEditingTitle}
                    onSubmitRename={() => void submitRename()}
                    onCancelRename={cancelRename}
                    onToggleMenu={(conversationId, open) =>
                        setOpenMenuConversationId(open ? conversationId : null)
                    }
                    onStartRename={startRename}
                    onTogglePinned={(conversation) =>
                        onSetConversationPinned(
                            conversation.id,
                            !conversation.isPinned,
                        )
                    }
                    onRequestDelete={requestDelete}
                />
            </aside>
            <ConversationSearchDialog
                open={isSearchOpen}
                query={searchTerm}
                isLoading={isSearching}
                results={searchResults}
                onQueryChange={setSearchTerm}
                onClose={closeSearch}
                onSelect={(conversationId) => {
                    closeSearch();
                    onSelectConversation(conversationId);
                }}
            />
            <DeleteConversationDialog
                open={conversationToDelete !== null}
                loading={deleteSubmitting}
                conversationTitle={formatConversationTitle(
                    conversationToDelete?.title ?? '',
                )}
                onOpenChange={(open) => {
                    if (!open && !deleteSubmitting)
                        setConversationToDelete(null);
                }}
                onConfirm={() => void confirmDelete()}
            />
        </TooltipProvider>
    );
}

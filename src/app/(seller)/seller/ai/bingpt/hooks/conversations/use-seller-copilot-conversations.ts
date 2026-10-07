// Hook quản lý sidebar conversation: danh sách, phân trang, tìm kiếm và các action pin/rename/delete.
// Hook không quản lý message đang render và không tự mở SSE; các boundary đó thuộc messages/streaming hook.
import {
    useCallback,
    useEffect,
    useRef,
    useState,
    type Dispatch,
    type SetStateAction,
} from 'react';
import {
    deleteSellerCopilotConversation,
    listSellerCopilotConversations,
    renameSellerCopilotConversation,
    searchSellerCopilotConversations,
    setSellerCopilotConversationPinned,
} from '@/services/seller/api/seller-copilot.api';
import type {
    SellerCopilotConversation,
    SellerCopilotSearchResult,
} from '@/services/seller/types/seller-copilot.types';
import type { SellerCopilotChatMessage } from '../../types/chat/seller-copilot-chat.types';
import { SELLER_COPILOT_HISTORY_PAGE_SIZE } from '../../constants/seller-copilot-pagination.constants';

interface UseSellerCopilotConversationsOptions {
    accessToken?: string | null;
    isStreaming: boolean;
    messages: SellerCopilotChatMessage[];
    conversationId?: string;
    setMessages: Dispatch<SetStateAction<SellerCopilotChatMessage[]>>;
    setConversationId: Dispatch<SetStateAction<string | undefined>>;
    setError: Dispatch<SetStateAction<string | undefined>>;
}

export interface SellerCopilotConversationsController {
    conversations: SellerCopilotConversation[];
    isLoadingHistory: boolean;
    isLoadingMoreHistory: boolean;
    hasMoreHistory: boolean;
    loadConversations: (showLoading?: boolean) => Promise<void>;
    loadMoreConversations: () => Promise<void>;
    searchConversations: (
        query: string,
        signal?: AbortSignal,
    ) => Promise<SellerCopilotSearchResult[]>;
    setConversationPinned: (
        conversationId: string,
        isPinned: boolean,
    ) => Promise<void>;
    renameConversation: (
        conversationId: string,
        title: string,
    ) => Promise<void>;
    deleteConversation: (conversationId: string) => Promise<void>;
}

// Điều phối dữ liệu sidebar theo owner hiện tại.
// Mỗi request có AbortController riêng; kết quả của request cũ không được phép ghi đè session mới.
// Các action thay đổi danh sách dùng optimistic update nhưng luôn đồng bộ lại từ backend sau khi thành công/thất bại.
export function useSellerCopilotConversations({
    accessToken,
    isStreaming,
    messages,
    conversationId,
    setMessages,
    setConversationId,
    setError,
}: UseSellerCopilotConversationsOptions): SellerCopilotConversationsController {
    const [conversations, setConversations] = useState<
        SellerCopilotConversation[]
    >([]);
    const [isLoadingHistory, setIsLoadingHistory] = useState(false);
    const [isLoadingMoreHistory, setIsLoadingMoreHistory] = useState(false);
    const [hasMoreHistory, setHasMoreHistory] = useState(false);
    const historyAbortRef = useRef<AbortController | null>(null);
    const historyMoreAbortRef = useRef<AbortController | null>(null);
    const historyOffsetRef = useRef(0);
    const hasMoreHistoryRef = useRef(false);
    const isLoadingMoreHistoryRef = useRef(false);

    // Tải lại trang đầu của sidebar và reset cursor pagination.
    // Khi showLoading=false, dữ liệu cũ vẫn được giữ trên màn hình để action nền không làm sidebar nhấp nháy.
    const loadConversations = useCallback(
        async (showLoading = true): Promise<void> => {
            if (!accessToken) return;

            historyAbortRef.current?.abort();
            historyMoreAbortRef.current?.abort();
            historyOffsetRef.current = 0;
            hasMoreHistoryRef.current = false;
            isLoadingMoreHistoryRef.current = false;
            setHasMoreHistory(false);
            setIsLoadingMoreHistory(false);
            const controller = new AbortController();
            historyAbortRef.current = controller;
            if (showLoading) setIsLoadingHistory(true);

            try {
                const result = await listSellerCopilotConversations({
                    accessToken,
                    signal: controller.signal,
                    offset: 0,
                    limit: SELLER_COPILOT_HISTORY_PAGE_SIZE,
                });
                if (!controller.signal.aborted) {
                    setConversations(result.items);
                    historyOffsetRef.current =
                        result.nextOffset ?? result.items.length;
                    hasMoreHistoryRef.current = result.hasMore;
                    setHasMoreHistory(result.hasMore);
                }
            } catch (caught) {
                if (!controller.signal.aborted) {
                    setError(
                        caught instanceof Error
                            ? caught.message
                            : 'Không thể tải lịch sử BinGPT.',
                    );
                }
            } finally {
                if (!controller.signal.aborted && showLoading) {
                    setIsLoadingHistory(false);
                }
            }
        },
        [accessToken, setError],
    );

    // Tải thêm sidebar khi chạm cuối danh sách; ref khóa request chống double-scroll tạo request trùng.
    const loadMoreConversations = useCallback(async (): Promise<void> => {
        if (
            !accessToken ||
            !hasMoreHistoryRef.current ||
            isLoadingMoreHistoryRef.current
        ) {
            return;
        }

        isLoadingMoreHistoryRef.current = true;
        setIsLoadingMoreHistory(true);
        historyMoreAbortRef.current?.abort();
        const controller = new AbortController();
        historyMoreAbortRef.current = controller;

        try {
            const result = await listSellerCopilotConversations({
                accessToken,
                signal: controller.signal,
                offset: historyOffsetRef.current,
                limit: SELLER_COPILOT_HISTORY_PAGE_SIZE,
            });
            if (!controller.signal.aborted) {
                setConversations((current) => {
                    const existingIds = new Set(
                        current.map((conversation) => conversation.id),
                    );
                    return [
                        ...current,
                        ...result.items.filter(
                            (conversation) => !existingIds.has(conversation.id),
                        ),
                    ];
                });
                historyOffsetRef.current =
                    result.nextOffset ??
                    historyOffsetRef.current + result.items.length;
                hasMoreHistoryRef.current = result.hasMore;
                setHasMoreHistory(result.hasMore);
            }
        } catch (caught) {
            if (!controller.signal.aborted) {
                setError(
                    caught instanceof Error
                        ? caught.message
                        : 'Không thể tải thêm lịch sử BinGPT.',
                );
            }
        } finally {
            if (!controller.signal.aborted) {
                isLoadingMoreHistoryRef.current = false;
                setIsLoadingMoreHistory(false);
            }
        }
    }, [accessToken, setError]);

    // Search chỉ chuyển query và AbortSignal xuống API; popup chịu trách nhiệm quyết định lúc nào gọi search.
    const searchConversations = useCallback(
        (
            query: string,
            signal?: AbortSignal,
        ): Promise<SellerCopilotSearchResult[]> =>
            accessToken
                ? searchSellerCopilotConversations(query, {
                      accessToken,
                      signal,
                  })
                : Promise.resolve([]),
        [accessToken],
    );

    // Cập nhật pin trước trên UI để sidebar phản hồi ngay, sau đó đồng bộ lại backend.
    // Nếu API lỗi, load lại danh sách chuẩn để loại bỏ optimistic state không hợp lệ.
    const setConversationPinned = useCallback(
        async (targetConversationId: string, isPinned: boolean) => {
            if (!accessToken) return;

            const nextPinnedAt = isPinned ? new Date().toISOString() : null;
            setConversations((current) =>
                current.map((conversation) =>
                    conversation.id === targetConversationId
                        ? {
                              ...conversation,
                              isPinned,
                              pinnedAt: nextPinnedAt,
                          }
                        : conversation,
                ),
            );
            try {
                await setSellerCopilotConversationPinned(
                    targetConversationId,
                    isPinned,
                    { accessToken },
                );
                await loadConversations(false);
            } catch (caught) {
                setError(
                    caught instanceof Error
                        ? caught.message
                        : 'Không thể cập nhật trạng thái ghim.',
                );
                void loadConversations(false);
            }
        },
        [accessToken, loadConversations, setError],
    );

    // Đổi title optimistic; nếu backend từ chối thì khôi phục title cũ trong state hiện tại.
    const renameConversation = useCallback(
        async (targetConversationId: string, title: string): Promise<void> => {
            if (!accessToken) return;

            const normalizedTitle = title.trim().replace(/s+/g, ' ');
            if (!normalizedTitle) return;

            const previousTitle = conversations.find(
                (conversation) => conversation.id === targetConversationId,
            )?.title;
            setConversations((current) =>
                current.map((conversation) =>
                    conversation.id === targetConversationId
                        ? { ...conversation, title: normalizedTitle }
                        : conversation,
                ),
            );

            try {
                const updatedConversation =
                    await renameSellerCopilotConversation(
                        targetConversationId,
                        normalizedTitle,
                        { accessToken },
                    );
                setConversations((current) =>
                    current.map((conversation) =>
                        conversation.id === targetConversationId
                            ? {
                                  ...conversation,
                                  title: updatedConversation.title,
                              }
                            : conversation,
                    ),
                );
            } catch (caught) {
                if (previousTitle !== undefined) {
                    setConversations((current) =>
                        current.map((conversation) =>
                            conversation.id === targetConversationId
                                ? { ...conversation, title: previousTitle }
                                : conversation,
                        ),
                    );
                }
                setError(
                    caught instanceof Error
                        ? caught.message
                        : 'Không thể đổi tên đoạn chat.',
                );
            }
        },
        [accessToken, conversations, setError],
    );

    // Xóa conversation optimistic và lưu snapshot để rollback đầy đủ cả sidebar, message hiện tại và cursor.
    // Không cho xóa trong lúc stream để tránh assistant message đang ghi bị mất khỏi context.
    const deleteConversation = useCallback(
        async (targetConversationId: string): Promise<void> => {
            if (!accessToken || isStreaming) return;

            const previousConversations = conversations;
            const previousMessages = messages;
            const previousConversationId = conversationId;
            const previousHistoryOffset = historyOffsetRef.current;
            const previousHasMoreHistory = hasMoreHistoryRef.current;
            const wasLoadedInCurrentHistory = conversations.some(
                (conversation) => conversation.id === targetConversationId,
            );

            setConversations((current) =>
                current.filter(
                    (conversation) => conversation.id !== targetConversationId,
                ),
            );
            if (wasLoadedInCurrentHistory) {
                historyOffsetRef.current = Math.max(
                    0,
                    historyOffsetRef.current - 1,
                );
            }
            if (previousConversationId === targetConversationId) {
                setConversationId(undefined);
                setMessages([]);
            }
            setError(undefined);

            try {
                await deleteSellerCopilotConversation(targetConversationId, {
                    accessToken,
                });
            } catch (caught) {
                setConversations(previousConversations);
                historyOffsetRef.current = previousHistoryOffset;
                hasMoreHistoryRef.current = previousHasMoreHistory;
                setHasMoreHistory(previousHasMoreHistory);
                if (previousConversationId === targetConversationId) {
                    setConversationId(previousConversationId);
                    setMessages(previousMessages);
                }
                setError(
                    caught instanceof Error
                        ? caught.message
                        : 'Không thể xóa đoạn chat.',
                );
                throw caught;
            }
        },
        [
            accessToken,
            conversationId,
            conversations,
            isStreaming,
            messages,
            setConversationId,
            setError,
            setMessages,
        ],
    );

    // Khởi tạo và hủy request history theo access token để không hiển thị sidebar của owner trước đó.
    useEffect(() => {
        setConversations([]);
        void loadConversations();
        return () => {
            historyAbortRef.current?.abort();
            historyMoreAbortRef.current?.abort();
        };
    }, [accessToken, loadConversations]);

    return {
        conversations,
        isLoadingHistory,
        isLoadingMoreHistory,
        hasMoreHistory,
        loadConversations,
        loadMoreConversations,
        searchConversations,
        setConversationPinned,
        renameConversation,
        deleteConversation,
    };
}

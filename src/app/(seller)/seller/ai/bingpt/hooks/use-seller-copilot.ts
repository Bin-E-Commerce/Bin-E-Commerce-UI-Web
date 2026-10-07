// Composition root của Seller Copilot; ghép state message, mode hiện tại, stream SSE và conversation actions.
// Mode được giữ qua nhiều lượt trong conversation, đồng bộ lại khi mở lịch sử và reset về Chat cho conversation mới.
'use client';

import { useCallback, useRef, useState } from 'react';
import { useAppSelector } from '@/store/hooks';
import type { SellerCopilotInteractionMode } from '@/services/seller/types/seller-copilot.types';
import { startSellerCopilotModeSession } from '@/services/seller/api/seller-copilot.api';
import type { SellerCopilotChatMessage } from '../types/chat/seller-copilot-chat.types';
import { useSellerCopilotConversations } from './conversations/use-seller-copilot-conversations';
import { useSellerCopilotMessages } from './messages/use-seller-copilot-messages';
import { useSellerCopilotStream } from './streaming/use-seller-copilot-stream';

export type { SellerCopilotChatMessage };

// Chắp nối message/history/stream; khi tạo phiên mới, hủy request và reset mode để không mang nguồn của phiên trước sang phiên mới.
export function useSellerCopilot() {
    const accessToken = useAppSelector((state) => state.auth.accessToken);
    const [interactionMode, setInteractionMode] =
        useState<SellerCopilotInteractionMode>('chat');
    const [isModeChanging, setIsModeChanging] = useState(false);
    const [isStreaming, setIsStreaming] = useState(false);
    const [error, setError] = useState<string>();
    const streamAbortRef = useRef<AbortController | null>(null);
    const modeSessionIdRef = useRef<string | undefined>(undefined);
    const conversationSelectionVersionRef = useRef(0);

    const messagesController = useSellerCopilotMessages({
        accessToken,
        isStreaming,
        setError,
        streamAbortRef,
    });
    const {
        conversationId,
        setMessages,
        loadConversation: loadMessages,
    } = messagesController;
    // Ref luôn phản ánh conversation được render gần nhất để callback async kiểm tra đúng đích sau khi chờ API.
    const activeConversationIdRef = useRef(conversationId);
    activeConversationIdRef.current = conversationId;
    const conversationsController = useSellerCopilotConversations({
        accessToken,
        isStreaming,
        messages: messagesController.messages,
        conversationId,
        setMessages,
        setConversationId: messagesController.setConversationId,
        setError,
    });
    const streamController = useSellerCopilotStream({
        accessToken,
        conversationId,
        modeSessionIdRef,
        interactionMode,
        isStreaming,
        setMessages: messagesController.setMessages,
        setConversationId: messagesController.setConversationId,
        setIsStreaming,
        setError,
        loadConversations: conversationsController.loadConversations,
        streamAbortRef,
    });

    // Bắt đầu conversation mới bằng cách hủy stream, xóa message/cursor và giữ nguyên public contract của page.
    const resetStreaming = streamController.resetStreaming;
    const resetMessages = messagesController.resetMessages;

    // Đổi mode trong conversation có message phải được xác nhận bởi server trước khi phiên mới được dùng.
    // UI cập nhật sớm để phản hồi nhanh, nhưng lỗi persistence sẽ rollback mode và không để request dùng session cũ.
    const changeInteractionMode = useCallback(
        async (nextMode: SellerCopilotInteractionMode): Promise<boolean> => {
            if (nextMode === interactionMode) return true;
            if (isStreaming || isModeChanging) return false;

            const previousMode = interactionMode;
            // Conversation chưa tồn tại thì mode chỉ là state cục bộ; backend sẽ cấp session khi gửi câu đầu tiên.
            if (!conversationId) {
                setInteractionMode(nextMode);
                modeSessionIdRef.current = undefined;
                return true;
            }
            // Conversation đã lưu cần session mới từ server; thiếu token thì không đổi UI nửa chừng.
            if (!accessToken) {
                setError(
                    'Phiên đăng nhập đã hết hạn. Hãy đăng nhập lại để đổi chế độ.',
                );
                return false;
            }

            setInteractionMode(nextMode);
            setIsModeChanging(true);
            setError(undefined);
            try {
                const session = await startSellerCopilotModeSession(
                    conversationId,
                    nextMode,
                    { accessToken },
                );
                modeSessionIdRef.current = session.modeSessionId;
                setMessages((current) => [
                    ...current,
                    {
                        id: crypto.randomUUID(),
                        role: 'system',
                        content: '',
                        interactionMode: session.interactionMode,
                        modeSessionId: session.modeSessionId,
                        timelineEvent: 'mode_changed',
                        citations: [],
                        insights: [],
                        capabilities: [],
                    },
                ]);
                return true;
            } catch (caught) {
                setInteractionMode(previousMode);
                setError(
                    caught instanceof Error
                        ? caught.message
                        : 'Không thể chuyển chế độ lúc này.',
                );
                return false;
            } finally {
                setIsModeChanging(false);
            }
        },
        [
            accessToken,
            interactionMode,
            isModeChanging,
            isStreaming,
            conversationId,
            setMessages,
        ],
    );

    const startNewConversation = useCallback(() => {
        // Vô hiệu hóa kết quả mở lịch sử đang chờ trước khi reset, tránh mode cũ quay lại sau khi bấm chat mới.
        conversationSelectionVersionRef.current += 1;
        resetStreaming();
        resetMessages();
        setInteractionMode('chat');
        modeSessionIdRef.current = undefined;
        setError(undefined);
    }, [resetMessages, resetStreaming]);

    // Khôi phục mode/session từ event hoặc message cuối; không tạo mode-change event khi chỉ mở lịch sử.
    // Version tăng mỗi lần chọn chat để response chậm của lựa chọn cũ không ghi đè mode/session mới hơn.
    const loadConversation = useCallback(
        async (targetConversationId: string) => {
            const selectionVersion = ++conversationSelectionVersionRef.current;
            const loadedSession = await loadMessages(targetConversationId);
            if (selectionVersion !== conversationSelectionVersionRef.current) {
                return undefined;
            }
            if (loadedSession) {
                setInteractionMode(loadedSession.interactionMode);
                modeSessionIdRef.current = loadedSession.modeSessionId;
            } else if (
                activeConversationIdRef.current === targetConversationId
            ) {
                // Chỉ reset mode khi lần tải mới nhất đã thực sự chọn chat đích nhưng chat chưa có mode lưu.
                setInteractionMode('chat');
                modeSessionIdRef.current = undefined;
            }
            return loadedSession;
        },
        [loadMessages],
    );

    return {
        messages: messagesController.messages,
        conversations: conversationsController.conversations,
        conversationId: messagesController.conversationId,
        interactionMode,
        setInteractionMode: changeInteractionMode,
        isModeChanging,
        isStreaming,
        isLoadingHistory: conversationsController.isLoadingHistory,
        isLoadingMoreHistory: conversationsController.isLoadingMoreHistory,
        hasMoreHistory: conversationsController.hasMoreHistory,
        isLoadingMoreMessages: messagesController.isLoadingMoreMessages,
        isLoadingConversation: messagesController.isLoadingConversation,
        hasMoreMessages: messagesController.hasMoreMessages,
        error,
        sendMessage: streamController.sendMessage,
        confirmAction: streamController.confirmAction,
        stop: streamController.stop,
        loadConversation,
        loadMoreConversationMessages:
            messagesController.loadMoreConversationMessages,
        loadMoreConversations: conversationsController.loadMoreConversations,
        searchConversations: conversationsController.searchConversations,
        setConversationPinned: conversationsController.setConversationPinned,
        renameConversation: conversationsController.renameConversation,
        deleteConversation: conversationsController.deleteConversation,
        startNewConversation,
    };
}

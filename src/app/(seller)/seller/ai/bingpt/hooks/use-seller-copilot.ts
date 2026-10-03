// Composition root của Seller Copilot; ghép state message, stream SSE và conversation actions.
// File không chứa chi tiết API từng domain; các hook con chịu trách nhiệm riêng và public return contract vẫn giữ nguyên cho page.
'use client';

import { useCallback, useRef, useState } from 'react';
import { useAppSelector } from '@/store/hooks';
import type { SellerCopilotRange } from '@/services/seller/types/seller-copilot.types';
import type { SellerCopilotChatMessage } from './types/seller-copilot-chat.types';
import { useSellerCopilotConversations } from './conversations/use-seller-copilot-conversations';
import { useSellerCopilotMessages } from './messages/use-seller-copilot-messages';
import { useSellerCopilotStream } from './streaming/use-seller-copilot-stream';

export type { SellerCopilotChatMessage };

// Chắp nối các hook theo dependency: message state trước, stream dùng setter message, conversation dùng cả hai để rollback.
export function useSellerCopilot() {
    const accessToken = useAppSelector((state) => state.auth.accessToken);
    const [range, setRange] = useState<SellerCopilotRange>('30d');
    const [isStreaming, setIsStreaming] = useState(false);
    const [error, setError] = useState<string>();
    const streamAbortRef = useRef<AbortController | null>(null);

    const messagesController = useSellerCopilotMessages({
        accessToken,
        isStreaming,
        setError,
        streamAbortRef,
    });
    const conversationsController = useSellerCopilotConversations({
        accessToken,
        isStreaming,
        messages: messagesController.messages,
        conversationId: messagesController.conversationId,
        setMessages: messagesController.setMessages,
        setConversationId: messagesController.setConversationId,
        setError,
    });
    const streamController = useSellerCopilotStream({
        accessToken,
        conversationId: messagesController.conversationId,
        range,
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
    const startNewConversation = useCallback(() => {
        resetStreaming();
        resetMessages();
        setError(undefined);
    }, [resetMessages, resetStreaming]);

    return {
        messages: messagesController.messages,
        conversations: conversationsController.conversations,
        conversationId: messagesController.conversationId,
        range,
        setRange,
        isStreaming,
        isLoadingHistory: conversationsController.isLoadingHistory,
        isLoadingMoreHistory: conversationsController.isLoadingMoreHistory,
        hasMoreHistory: conversationsController.hasMoreHistory,
        isLoadingMoreMessages: messagesController.isLoadingMoreMessages,
        hasMoreMessages: messagesController.hasMoreMessages,
        error,
        sendMessage: streamController.sendMessage,
        stop: streamController.stop,
        loadConversation: messagesController.loadConversation,
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

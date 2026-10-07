// Hook quản lý message đang mở, mở lại conversation và tải thêm message cũ theo cursor.
// Hook không quản lý sidebar conversation và không tự scroll; page chịu trách nhiệm giữ vị trí đọc khi prepend message.
import {
    useCallback,
    useEffect,
    useRef,
    useState,
    type Dispatch,
    type MutableRefObject,
    type SetStateAction,
} from 'react';
import { getSellerCopilotConversation } from '@/services/seller/api/seller-copilot.api';
import type { SellerCopilotChatMessage } from '../../types/chat/seller-copilot-chat.types';
import type { SellerCopilotLoadedModeSession } from '../../types/chat/seller-copilot-chat.types';
import { SELLER_COPILOT_MESSAGE_PAGE_SIZE } from '../../constants/seller-copilot-pagination.constants';
import { mapPersistedMessage } from '../../utils/messages/map-persisted-message';

interface UseSellerCopilotMessagesOptions {
    accessToken?: string | null;
    isStreaming: boolean;
    setError: Dispatch<SetStateAction<string | undefined>>;
    streamAbortRef: MutableRefObject<AbortController | null>;
}

export interface SellerCopilotMessagesController {
    messages: SellerCopilotChatMessage[];
    setMessages: Dispatch<SetStateAction<SellerCopilotChatMessage[]>>;
    conversationId?: string;
    setConversationId: Dispatch<SetStateAction<string | undefined>>;
    isLoadingMoreMessages: boolean;
    isLoadingConversation: boolean;
    hasMoreMessages: boolean;
    loadConversation: (
        conversationId: string,
    ) => Promise<SellerCopilotLoadedModeSession | undefined>;
    loadMoreConversationMessages: () => Promise<void>;
    resetMessages: () => void;
}

// Quản lý vòng đời message của conversation hiện tại.
// Khi đổi user, hook xóa ngay message cũ trước khi gọi API để không làm lộ dữ liệu giữa hai session.
// Khi tải message cũ, hook giữ cursor và chống request trùng; việc bù scrollTop được page thực hiện sau khi state cập nhật.
export function useSellerCopilotMessages({
    accessToken,
    isStreaming,
    setError,
    streamAbortRef,
}: UseSellerCopilotMessagesOptions): SellerCopilotMessagesController {
    const [messages, setMessages] = useState<SellerCopilotChatMessage[]>([]);
    const [conversationId, setConversationId] = useState<string>();
    const [isLoadingMoreMessages, setIsLoadingMoreMessages] = useState(false);
    const [isLoadingConversation, setIsLoadingConversation] = useState(false);
    const [hasMoreMessages, setHasMoreMessages] = useState(false);
    const conversationAbortRef = useRef<AbortController | null>(null);
    const messageCursorRef = useRef<string | null>(null);
    const hasMoreMessagesRef = useRef(false);
    const isLoadingMoreMessagesRef = useRef(false);

    // Xóa toàn bộ message/cursor khi bắt đầu conversation mới hoặc user đổi session.
    // Abort request cũ trước khi reset để response đến muộn không ghi đè state của conversation mới.
    const resetMessages = useCallback(() => {
        conversationAbortRef.current?.abort();
        conversationAbortRef.current = null;
        messageCursorRef.current = null;
        hasMoreMessagesRef.current = false;
        isLoadingMoreMessagesRef.current = false;
        setConversationId(undefined);
        setMessages([]);
        setIsLoadingConversation(false);
        setHasMoreMessages(false);
        setIsLoadingMoreMessages(false);
    }, []);

    // Khi access token đổi, xóa state cũ trước khi tải dữ liệu của owner mới.
    useEffect(() => {
        resetMessages();
        return () => {
            conversationAbortRef.current?.abort();
        };
    }, [accessToken, resetMessages]);

    // Mở conversation bằng trang message mới nhất và trả mode cuối cùng đã lưu để composer khôi phục đúng nguồn.
    // Đặt ID đích và trạng thái loading trước khi xóa message để UI không hiểu nhầm đây là trang chào của chat mới.
    // Mỗi lượt mở hủy request trước; chỉ response của lượt còn hiệu lực mới được phép ghi message/cursor vào state.
    const loadConversation = useCallback(
        async (
            nextConversationId: string,
        ): Promise<SellerCopilotLoadedModeSession | undefined> => {
            if (!accessToken || isStreaming) return undefined;

            streamAbortRef.current?.abort();
            conversationAbortRef.current?.abort();
            const controller = new AbortController();
            conversationAbortRef.current = controller;
            setConversationId(nextConversationId);
            setIsLoadingConversation(true);
            messageCursorRef.current = null;
            hasMoreMessagesRef.current = false;
            isLoadingMoreMessagesRef.current = false;
            setHasMoreMessages(false);
            setIsLoadingMoreMessages(false);
            setMessages([]);
            setError(undefined);

            try {
                const result = await getSellerCopilotConversation(
                    nextConversationId,
                    { accessToken, signal: controller.signal },
                    { limit: SELLER_COPILOT_MESSAGE_PAGE_SIZE },
                );
                if (
                    controller.signal.aborted ||
                    conversationAbortRef.current !== controller
                ) {
                    return;
                }

                // API phải trả đúng conversation được yêu cầu; không gắn nhầm lịch sử nếu proxy/backend lệch ID.
                if (result.conversation.id !== nextConversationId) {
                    throw new Error(
                        'Không thể xác định đúng cuộc trò chuyện cần mở.',
                    );
                }

                const mappedMessages = result.messages.map(mapPersistedMessage);
                setMessages(mappedMessages);
                messageCursorRef.current = result.nextBefore;
                hasMoreMessagesRef.current = result.hasMoreMessages;
                setHasMoreMessages(result.hasMoreMessages);
                const latestUserMessage = [...mappedMessages]
                    .reverse()
                    .find((message) => message.role === 'user');
                const latestTimelineMessage = mappedMessages.at(-1);
                const activeModeMessage =
                    latestTimelineMessage?.timelineEvent === 'mode_changed'
                        ? latestTimelineMessage
                        : latestUserMessage;
                const latestSessionMessage = [...mappedMessages]
                    .reverse()
                    .find((message) => message.modeSessionId);

                // Lịch sử cũ chưa có session ID dùng ID câu hỏi user gần nhất làm khóa tương thích ổn định.
                return activeModeMessage?.interactionMode
                    ? {
                          interactionMode: activeModeMessage.interactionMode,
                          modeSessionId:
                              latestTimelineMessage?.timelineEvent ===
                              'mode_changed'
                                  ? latestTimelineMessage.modeSessionId
                                  : (latestSessionMessage?.modeSessionId ??
                                    latestUserMessage?.id),
                      }
                    : undefined;
            } catch (caught) {
                if (!controller.signal.aborted) {
                    setError(
                        caught instanceof Error
                            ? caught.message
                            : 'Không thể mở cuộc trò chuyện.',
                    );
                }
                return undefined;
            } finally {
                if (conversationAbortRef.current === controller) {
                    conversationAbortRef.current = null;
                    setIsLoadingConversation(false);
                }
            }
        },
        [accessToken, isStreaming, setError, streamAbortRef],
    );

    // Tải trang message cũ hơn bằng cursor hiện tại và chèn vào đầu danh sách đang hiển thị.
    // Ref khóa request để nhiều scroll event gần nhau không tạo request trùng hoặc đảo thứ tự dữ liệu.
    const loadMoreConversationMessages =
        useCallback(async (): Promise<void> => {
            if (
                !accessToken ||
                !conversationId ||
                !messageCursorRef.current ||
                !hasMoreMessagesRef.current ||
                isLoadingMoreMessagesRef.current
            ) {
                return;
            }

            const requestedConversationId = conversationId;
            const before = messageCursorRef.current;
            conversationAbortRef.current?.abort();
            const controller = new AbortController();
            conversationAbortRef.current = controller;
            isLoadingMoreMessagesRef.current = true;
            setIsLoadingMoreMessages(true);

            try {
                const result = await getSellerCopilotConversation(
                    requestedConversationId,
                    { accessToken, signal: controller.signal },
                    { before, limit: SELLER_COPILOT_MESSAGE_PAGE_SIZE },
                );
                if (
                    controller.signal.aborted ||
                    requestedConversationId !== conversationId
                ) {
                    return;
                }

                const olderMessages = result.messages.map(mapPersistedMessage);
                setMessages((current) => {
                    const existingIds = new Set(
                        current.map((message) => message.id),
                    );
                    return [
                        ...olderMessages.filter(
                            (message) => !existingIds.has(message.id),
                        ),
                        ...current,
                    ];
                });
                messageCursorRef.current = result.nextBefore;
                hasMoreMessagesRef.current = result.hasMoreMessages;
                setHasMoreMessages(result.hasMoreMessages);
            } catch (caught) {
                if (!controller.signal.aborted) {
                    setError(
                        caught instanceof Error
                            ? caught.message
                            : 'Không thể tải thêm message cũ.',
                    );
                }
            } finally {
                isLoadingMoreMessagesRef.current = false;
                setIsLoadingMoreMessages(false);
                if (!controller.signal.aborted) {
                    conversationAbortRef.current = null;
                }
            }
        }, [accessToken, conversationId, setError]);

    return {
        messages,
        setMessages,
        conversationId,
        setConversationId,
        isLoadingMoreMessages,
        isLoadingConversation,
        hasMoreMessages,
        loadConversation,
        loadMoreConversationMessages,
        resetMessages,
    };
}

// Hook điều phối một lượt chat SSE: tạo assistant placeholder, nhận event và append token vào message.
// Hook không tự tải history, không chọn route và không quyết định permission; backend vẫn là source of truth.
import {
    useCallback,
    useEffect,
    useRef,
    type Dispatch,
    type MutableRefObject,
    type SetStateAction,
} from 'react';
import { streamSellerCopilot } from '@/services/seller/api/seller-copilot.api';
import type {
    SellerCopilotRange,
    SellerCopilotStreamEvent,
} from '@/services/seller/types/seller-copilot.types';
import type { SellerCopilotChatMessage } from '../types/seller-copilot-chat.types';

interface UseSellerCopilotStreamOptions {
    accessToken?: string | null;
    conversationId?: string;
    range: SellerCopilotRange;
    isStreaming: boolean;
    setMessages: Dispatch<SetStateAction<SellerCopilotChatMessage[]>>;
    setConversationId: Dispatch<SetStateAction<string | undefined>>;
    setIsStreaming: Dispatch<SetStateAction<boolean>>;
    setError: Dispatch<SetStateAction<string | undefined>>;
    loadConversations: (showLoading?: boolean) => Promise<void>;
    streamAbortRef: MutableRefObject<AbortController | null>;
}

export interface SellerCopilotStreamController {
    sendMessage: (message: string) => Promise<void>;
    stop: () => void;
    resetStreaming: () => void;
}

// Xử lý event SSE theo từng loại và gom token trong 32ms để giảm số lần render.
// Token chỉ được append vào đúng assistant placeholder; metadata như source/insight cập nhật cùng message đó.
// Abort của request được giữ trong ref để Stop, đổi conversation và unmount đều ngắt được network request thật.
export function useSellerCopilotStream({
    accessToken,
    conversationId,
    range,
    isStreaming,
    setMessages,
    setConversationId,
    setIsStreaming,
    setError,
    loadConversations,
    streamAbortRef,
}: UseSellerCopilotStreamOptions): SellerCopilotStreamController {
    const tokenBufferRef = useRef({ assistantId: '', text: '' });
    const tokenFlushTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
        null,
    );

    // Flush token đang chờ vào assistant message bằng functional state update để không mất token khi render liên tiếp.
    const flushTokenBuffer = useCallback(() => {
        if (tokenFlushTimeoutRef.current !== null) {
            clearTimeout(tokenFlushTimeoutRef.current);
        }
        const pending = tokenBufferRef.current;
        tokenBufferRef.current = { assistantId: '', text: '' };
        tokenFlushTimeoutRef.current = null;
        if (!pending.assistantId || !pending.text) return;

        setMessages((current) =>
            current.map((item) =>
                item.id === pending.assistantId
                    ? { ...item, content: item.content + pending.text }
                    : item,
            ),
        );
    }, [setMessages]);

    // Gom các chunk SSE ngắn vào một lần render 32ms; token đầu tiên vẫn flush ngay để câu trả lời xuất hiện sớm.
    const queueToken = useCallback(
        (assistantId: string, text: string) => {
            const pending = tokenBufferRef.current;
            const isFirstToken = pending.text.length === 0;
            pending.assistantId = assistantId;
            pending.text += text;
            // Flush token đầu tiên ngay để placeholder biến mất cùng lúc answer xuất hiện.
            // Chỉ các token tiếp theo mới đi qua buffer 32ms để giảm số lần render khi stream dày.
            if (isFirstToken) {
                flushTokenBuffer();
                return;
            }
            if (tokenFlushTimeoutRef.current !== null) return;
            tokenFlushTimeoutRef.current = setTimeout(flushTokenBuffer, 32);
        },
        [flushTokenBuffer],
    );

    // Dọn request và timer khi hook unmount; không set state sau khi component đã rời khỏi page.
    useEffect(
        () => () => {
            if (tokenFlushTimeoutRef.current !== null) {
                clearTimeout(tokenFlushTimeoutRef.current);
            }
            streamAbortRef.current?.abort();
        },
        [streamAbortRef],
    );

    // Gửi câu hỏi, tạo placeholder trước rồi xử lý event SSE; mọi metadata được gắn vào cùng assistant message.
    // Nếu request lỗi giữa chừng, chỉ giữ phần content đã nhận và không báo lỗi cho trường hợp user chủ động Stop.
    const sendMessage = useCallback(
        async (message: string): Promise<void> => {
            if (!accessToken || !message.trim() || isStreaming) return;

            streamAbortRef.current?.abort();
            const controller = new AbortController();
            streamAbortRef.current = controller;
            const userMessage: SellerCopilotChatMessage = {
                id: crypto.randomUUID(),
                role: 'user',
                content: message.trim(),
                citations: [],
                insights: [],
                capabilities: [],
            };
            const assistantId = crypto.randomUUID();

            setMessages((current) => [
                ...current,
                userMessage,
                {
                    id: assistantId,
                    role: 'assistant',
                    content: '',
                    citations: [],
                    insights: [],
                    capabilities: [],
                },
            ]);
            setIsStreaming(true);
            setError(undefined);

            try {
                await streamSellerCopilot(
                    {
                        accessToken,
                        conversationId,
                        message,
                        range,
                        signal: controller.signal,
                    },
                    (event: SellerCopilotStreamEvent) => {
                        if (event.type === 'started') {
                            setConversationId(event.conversationId);
                        }
                        // Giữ event status trong public SSE contract nhưng không đưa vào React state;
                        // indicator cố định giúp tránh render lại message list theo từng phase backend.
                        if (event.type === 'token') {
                            queueToken(assistantId, event.text);
                        }
                        if (event.type === 'sources') {
                            setMessages((current) =>
                                current.map((item) =>
                                    item.id === assistantId
                                        ? {
                                              ...item,
                                              citations: event.items,
                                          }
                                        : item,
                                ),
                            );
                        }
                        if (event.type === 'insight') {
                            setMessages((current) =>
                                current.map((item) =>
                                    item.id === assistantId
                                        ? { ...item, insights: event.items }
                                        : item,
                                ),
                            );
                        }
                        if (event.type === 'capability') {
                            setMessages((current) =>
                                current.map((item) =>
                                    item.id === assistantId
                                        ? {
                                              ...item,
                                              capabilities: event.items,
                                          }
                                        : item,
                                ),
                            );
                        }
                        if (event.type === 'policy_notice') {
                            setMessages((current) =>
                                current.map((item) =>
                                    item.id === assistantId
                                        ? {
                                              ...item,
                                              content: item.content
                                                  ? `${item.content}\n\n${event.message}`
                                                  : event.message,
                                              answerStatus: event.status,
                                              suggestedPrompts:
                                                  event.suggestedPrompts,
                                          }
                                        : item,
                                ),
                            );
                        }
                        if (
                            event.type === 'out_of_scope' ||
                            event.type === 'clarification'
                        ) {
                            setMessages((current) =>
                                current.map((item) =>
                                    item.id === assistantId
                                        ? {
                                              ...item,
                                              content:
                                                  event.type === 'out_of_scope'
                                                      ? event.message
                                                      : event.question,
                                              suggestedPrompts:
                                                  event.type === 'out_of_scope'
                                                      ? event.suggestedPrompts
                                                      : event.options.map(
                                                            (option) =>
                                                                option.label,
                                                        ),
                                          }
                                        : item,
                                ),
                            );
                        }
                        if (event.type === 'warning') {
                            setMessages((current) =>
                                current.map((item) =>
                                    item.id === assistantId
                                        ? { ...item, warning: event.message }
                                        : item,
                                ),
                            );
                        }
                        if (event.type === 'done') {
                            void loadConversations(false);
                        }
                    },
                );
            } catch (caught) {
                if (!controller.signal.aborted) {
                    setError(
                        caught instanceof Error
                            ? caught.message
                            : 'Không thể kết nối BinGPT.',
                    );
                    setMessages((current) =>
                        current.filter(
                            (item) => item.id !== assistantId || item.content,
                        ),
                    );
                }
            } finally {
                flushTokenBuffer();
                if (!controller.signal.aborted) {
                    setIsStreaming(false);
                }
            }
        },
        [
            accessToken,
            conversationId,
            flushTokenBuffer,
            isStreaming,
            loadConversations,
            queueToken,
            range,
            setConversationId,
            setError,
            setIsStreaming,
            setMessages,
            streamAbortRef,
        ],
    );

    // Dừng stream theo thao tác người dùng và flush phần token đã nhận để không mất nội dung đang hiển thị.
    const stop = useCallback(() => {
        streamAbortRef.current?.abort();
        flushTokenBuffer();
        setIsStreaming(false);
    }, [flushTokenBuffer, setIsStreaming, streamAbortRef]);

    // Reset stream khi bắt đầu conversation mới; root hook sẽ reset message và conversationId riêng.
    const resetStreaming = useCallback(() => {
        streamAbortRef.current?.abort();
        flushTokenBuffer();
        setIsStreaming(false);
    }, [flushTokenBuffer, setIsStreaming, streamAbortRef]);

    return { sendMessage, stop, resetStreaming };
}

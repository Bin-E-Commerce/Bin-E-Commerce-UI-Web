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
import {
    confirmSellerCopilotInventoryAction,
    streamSellerCopilot,
} from '@/services/seller/api/seller-copilot.api';
import type {
    SellerCopilotInteractionMode,
    SellerCopilotStreamEvent,
} from '@/services/seller/types/seller-copilot.types';
import type { SellerCopilotChatMessage } from '../../types/chat/seller-copilot-chat.types';

interface UseSellerCopilotStreamOptions {
    accessToken?: string | null;
    conversationId?: string;
    modeSessionIdRef: MutableRefObject<string | undefined>;
    interactionMode: SellerCopilotInteractionMode;
    isStreaming: boolean;
    setMessages: Dispatch<SetStateAction<SellerCopilotChatMessage[]>>;
    setConversationId: Dispatch<SetStateAction<string | undefined>>;
    setIsStreaming: Dispatch<SetStateAction<boolean>>;
    setError: Dispatch<SetStateAction<string | undefined>>;
    loadConversations: (showLoading?: boolean) => Promise<void>;
    streamAbortRef: MutableRefObject<AbortController | null>;
}

export interface SellerCopilotStreamController {
    sendMessage: (
        message: string,
        interactionMode?: SellerCopilotInteractionMode,
    ) => Promise<void>;
    stop: () => void;
    resetStreaming: () => void;
    confirmAction: (
        assistantMessageId: string,
        proposal: SellerCopilotChatMessage['actionProposal'],
    ) => Promise<void>;
}

// Xử lý event SSE theo từng loại và gom token đến frame trình duyệt kế tiếp để giảm render thừa.
// Token chỉ được append vào đúng assistant placeholder; metadata như source/insight cập nhật cùng message đó.
// Abort của request được giữ trong ref để Stop, đổi conversation và unmount đều ngắt được network request thật.
export function useSellerCopilotStream({
    accessToken,
    conversationId,
    modeSessionIdRef,
    interactionMode: currentInteractionMode,
    isStreaming,
    setMessages,
    setConversationId,
    setIsStreaming,
    setError,
    loadConversations,
    streamAbortRef,
}: UseSellerCopilotStreamOptions): SellerCopilotStreamController {
    const tokenBufferRef = useRef({ assistantId: '', text: '' });
    const tokenFlushFrameRef = useRef<number | null>(null);
    const activeAssistantIdRef = useRef<string | null>(null);
    const confirmingProposalIdRef = useRef<string | null>(null);

    // Flush token đang chờ vào assistant message bằng functional state update để không mất token khi render liên tiếp.
    const flushTokenBuffer = useCallback(() => {
        if (tokenFlushFrameRef.current !== null) {
            cancelAnimationFrame(tokenFlushFrameRef.current);
        }
        const pending = tokenBufferRef.current;
        tokenBufferRef.current = { assistantId: '', text: '' };
        tokenFlushFrameRef.current = null;
        if (!pending.assistantId || !pending.text) return;

        setMessages((current) =>
            current.map((item) =>
                item.id === pending.assistantId
                    ? { ...item, content: item.content + pending.text }
                    : item,
            ),
        );
    }, [setMessages]);

    // Gom các delta trong cùng một frame để giao diện cập nhật theo nhịp vẽ (~16ms), không chờ timer cố định 32ms.
    const queueToken = useCallback(
        (assistantId: string, text: string) => {
            const pending = tokenBufferRef.current;
            const isFirstToken = pending.text.length === 0;
            pending.assistantId = assistantId;
            pending.text += text;
            // Flush token đầu tiên ngay để placeholder biến mất cùng lúc answer xuất hiện.
            // Chỉ các token tiếp theo mới chờ frame kế tiếp; các chunk đến cùng frame được gộp thành một lần render.
            if (isFirstToken) {
                flushTokenBuffer();
                return;
            }
            if (tokenFlushFrameRef.current !== null) return;
            tokenFlushFrameRef.current =
                requestAnimationFrame(flushTokenBuffer);
        },
        [flushTokenBuffer],
    );

    // Dọn request và timer khi hook unmount; không set state sau khi component đã rời khỏi page.
    useEffect(
        () => () => {
            if (tokenFlushFrameRef.current !== null) {
                cancelAnimationFrame(tokenFlushFrameRef.current);
            }
            streamAbortRef.current?.abort();
            activeAssistantIdRef.current = null;
        },
        [streamAbortRef],
    );

    // Tạo user/assistant pair ngay để UI phản hồi tức thì, rồi áp từng SSE event vào đúng assistantId thay vì dựng lại toàn bộ lịch sử.
    // Token được gom ngắn để giảm render; event replace có quyền thay bản nháp nếu server chốt câu khác hoặc phải fail-closed.
    // Abort do Stop không báo lỗi kết nối; nếu lỗi mạng thật giữa stream thì giữ phần đã nhận và đánh dấu nó chưa hoàn tất.
    const sendMessage = useCallback(
        async (
            message: string,
            interactionMode: SellerCopilotInteractionMode = currentInteractionMode,
        ): Promise<void> => {
            if (!accessToken || !message.trim() || isStreaming) return;

            streamAbortRef.current?.abort();
            const controller = new AbortController();
            streamAbortRef.current = controller;
            // Chụp session tại thời điểm gửi để mode change sau đó không retarget request đang chạy.
            const requestModeSessionId = modeSessionIdRef.current;
            const userMessage: SellerCopilotChatMessage = {
                id: crypto.randomUUID(),
                role: 'user',
                content: message.trim(),
                interactionMode,
                modeSessionId: requestModeSessionId,
                citations: [],
                insights: [],
                capabilities: [],
            };
            const assistantId = crypto.randomUUID();
            activeAssistantIdRef.current = assistantId;

            setMessages((current) => [
                ...current,
                userMessage,
                {
                    id: assistantId,
                    role: 'assistant',
                    content: '',
                    interactionMode,
                    modeSessionId: requestModeSessionId,
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
                        interactionMode,
                        modeSessionId: requestModeSessionId,
                        signal: controller.signal,
                    },
                    (event: SellerCopilotStreamEvent) => {
                        // Status chỉ cập nhật nhãn trạng thái, không sửa nội dung; token đầu tiên sẽ bỏ nhãn đang suy nghĩ.
                        if (event.type === 'started') {
                            setConversationId(event.conversationId);
                            if (event.modeSessionId) {
                                modeSessionIdRef.current = event.modeSessionId;
                                setMessages((current) =>
                                    current.map((item) =>
                                        item.id === userMessage.id ||
                                        item.id === assistantId
                                            ? {
                                                  ...item,
                                                  modeSessionId:
                                                      event.modeSessionId,
                                              }
                                            : item,
                                    ),
                                );
                            }
                        }
                        if (event.type === 'status') {
                            setMessages((current) =>
                                current.map((item) =>
                                    item.id === assistantId
                                        ? { ...item, phase: event.message }
                                        : item,
                                ),
                            );
                        }
                        if (event.type === 'token') {
                            queueToken(assistantId, event.text);
                            setMessages((current) =>
                                current.map((item) =>
                                    item.id === assistantId
                                        ? { ...item, phase: undefined }
                                        : item,
                                ),
                            );
                        }
                        // Replace là ranh giới chuẩn hóa/fail-closed: flush buffer trước để token cũ không ghi đè nội dung chốt.
                        if (event.type === 'replace') {
                            flushTokenBuffer();
                            setMessages((current) =>
                                current.map((item) =>
                                    item.id === assistantId
                                        ? {
                                              ...item,
                                              content: event.text,
                                              phase: undefined,
                                          }
                                        : item,
                                ),
                            );
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
                        if (event.type === 'answer_status') {
                            setMessages((current) =>
                                current.map((item) =>
                                    item.id === assistantId
                                        ? {
                                              ...item,
                                              answerStatus: event.status,
                                          }
                                        : item,
                                ),
                            );
                        }
                        if (event.type === 'data_sources') {
                            setMessages((current) =>
                                current.map((item) =>
                                    item.id === assistantId
                                        ? { ...item, dataSources: event.items }
                                        : item,
                                ),
                            );
                        }
                        if (event.type === 'action_proposed') {
                            setMessages((current) =>
                                current.map((item) =>
                                    item.id === assistantId
                                        ? {
                                              ...item,
                                              actionProposal: {
                                                  proposalId: event.proposalId,
                                                  productName:
                                                      event.action.productName,
                                                  variantName:
                                                      event.action.variantName,
                                                  currentAvailable:
                                                      event.action
                                                          .currentAvailable,
                                                  nextAvailable:
                                                      event.action
                                                          .nextAvailable,
                                                  expiresAt: event.expiresAt,
                                                  status: 'pending',
                                              },
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
                        // Done xác nhận backend đã lưu câu trả lời; chỉ lúc này mới bỏ trạng thái chạy và làm mới danh sách hội thoại.
                        if (event.type === 'done') {
                            activeAssistantIdRef.current = null;
                            setMessages((current) =>
                                current.map((item) =>
                                    item.id === assistantId
                                        ? { ...item, phase: undefined }
                                        : item,
                                ),
                            );
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
                        current.flatMap((item) => {
                            if (item.id !== assistantId) return [item];
                            if (!item.content) return [];
                            return [
                                {
                                    ...item,
                                    incomplete: true,
                                    phase: undefined,
                                },
                            ];
                        }),
                    );
                }
            } finally {
                flushTokenBuffer();
                if (!controller.signal.aborted) {
                    setIsStreaming(false);
                    activeAssistantIdRef.current = null;
                }
            }
        },
        [
            accessToken,
            conversationId,
            modeSessionIdRef,
            flushTokenBuffer,
            isStreaming,
            loadConversations,
            queueToken,
            currentInteractionMode,
            setConversationId,
            setError,
            setIsStreaming,
            setMessages,
            streamAbortRef,
        ],
    );

    // Chỉ gửi proposalId sau click chủ động; kiểm tra trạng thái/hạn dùng ở UI để tránh request vô ích, backend vẫn xác minh lại.
    // Ref khóa mọi proposal trong thời gian chờ để double-click từ nhiều card không tạo hai request đồng thời.
    // Response thành công cập nhật đúng assistant message; lỗi hiện chuyển card sang failed, nhưng timeout có thể chưa cho biết write đã commit hay chưa.
    const confirmAction = useCallback(
        async (
            assistantMessageId: string,
            proposal: SellerCopilotChatMessage['actionProposal'],
        ) => {
            if (!accessToken) return;
            if (
                !proposal ||
                proposal.status !== 'pending' ||
                Date.parse(proposal.expiresAt) <= Date.now() ||
                confirmingProposalIdRef.current
            ) {
                if (proposal?.status === 'pending') {
                    setMessages((current) =>
                        current.map((item) =>
                            item.id === assistantMessageId
                                ? {
                                      ...item,
                                      actionProposal: {
                                          ...proposal,
                                          status: 'expired',
                                      },
                                  }
                                : item,
                        ),
                    );
                }
                return;
            }

            confirmingProposalIdRef.current = proposal.proposalId;
            setMessages((current) =>
                current.map((item) =>
                    item.id === assistantMessageId
                        ? {
                              ...item,
                              actionProposal: {
                                  ...proposal,
                                  isConfirming: true,
                              },
                          }
                        : item,
                ),
            );
            try {
                const result = await confirmSellerCopilotInventoryAction(
                    proposal.proposalId,
                    { accessToken },
                );
                setMessages((current) =>
                    current.map((item) =>
                        item.id === assistantMessageId
                            ? {
                                  ...item,
                                  actionProposal: {
                                      ...proposal,
                                      status: result.status,
                                      resultMessage: result.message,
                                  },
                              }
                            : item,
                    ),
                );
            } catch (error) {
                setMessages((current) =>
                    current.map((item) =>
                        item.id === assistantMessageId
                            ? {
                                  ...item,
                                  actionProposal: {
                                      ...proposal,
                                      status: 'failed',
                                      resultMessage:
                                          error instanceof Error
                                              ? error.message
                                              : 'Không thể cập nhật tồn kho.',
                                  },
                              }
                            : item,
                    ),
                );
            } finally {
                confirmingProposalIdRef.current = null;
            }
        },
        [accessToken, setMessages],
    );

    // Dừng stream theo thao tác người dùng và flush phần token đã nhận để không mất nội dung đang hiển thị.
    const stop = useCallback(() => {
        streamAbortRef.current?.abort();
        flushTokenBuffer();
        const assistantId = activeAssistantIdRef.current;
        if (assistantId) {
            setMessages((current) =>
                current.map((item) =>
                    item.id === assistantId
                        ? { ...item, incomplete: true, phase: undefined }
                        : item,
                ),
            );
            activeAssistantIdRef.current = null;
        }
        setIsStreaming(false);
    }, [flushTokenBuffer, setIsStreaming, setMessages, streamAbortRef]);

    // Reset stream khi bắt đầu conversation mới; root hook sẽ reset message và conversationId riêng.
    const resetStreaming = useCallback(() => {
        streamAbortRef.current?.abort();
        flushTokenBuffer();
        activeAssistantIdRef.current = null;
        setIsStreaming(false);
    }, [flushTokenBuffer, setIsStreaming, streamAbortRef]);

    return { sendMessage, stop, resetStreaming, confirmAction };
}

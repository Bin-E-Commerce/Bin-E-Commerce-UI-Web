// File này là composition root của Seller Copilot: ghép chat, composer và history.
// Auth, permission, shop scope và dữ liệu nguồn vẫn thuộc layout, hook và backend.
'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowDown, PanelRightOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ConversationHistoryPanel } from './components/history/panel/ConversationHistoryPanel';
import { ConversationHistoryRail } from './components/history/rail/ConversationHistoryRail';
import { SellerCopilotComposer } from './components/chat/composer/SellerCopilotComposer';
import { SellerCopilotEmptyState } from './components/chat/empty/SellerCopilotEmptyState';
import { SellerCopilotMessageList } from './components/chat/messages/SellerCopilotMessageList';
import { useSellerCopilot } from './hooks/use-seller-copilot';

// Điều phối layout responsive và nối callback giữa hook Seller Copilot với các component trình bày.
export default function SellerCopilotPage() {
    const [isHistoryOpen, setIsHistoryOpen] = useState(true);
    const [isAtLatestMessage, setIsAtLatestMessage] = useState(true);
    const messageScrollRef = useRef<HTMLDivElement>(null);
    const shouldFollowGeneratedContentRef = useRef(true);
    const isProgrammaticScrollRef = useRef(false);
    const {
        messages,
        conversations,
        conversationId,
        range,
        setRange,
        isStreaming,
        isLoadingHistory,
        isLoadingMoreHistory,
        hasMoreHistory,
        isLoadingMoreMessages,
        hasMoreMessages,
        error,
        sendMessage,
        stop,
        loadConversation,
        loadMoreConversationMessages,
        loadMoreConversations,
        searchConversations,
        setConversationPinned,
        renameConversation,
        deleteConversation,
        startNewConversation,
    } = useSellerCopilot();
    const hasMessages = messages.length > 0;

    // Bật lại chế độ bám cuối trước khi gửi câu hỏi mới để seller luôn nhìn thấy prompt,
    // placeholder assistant và token đầu tiên; thao tác cuộn thủ công sau đó vẫn có quyền tắt chế độ này.
    const handleSendMessage = useCallback(
        (message: string) => {
            shouldFollowGeneratedContentRef.current = true;
            setIsAtLatestMessage(true);
            void sendMessage(message);
        },
        [sendMessage],
    );

    // Nạp trang message cũ và bù lại độ cao đã thêm để dòng seller đang đọc giữ nguyên vị trí.
    // Nếu không bù scrollTop, mỗi lần load sẽ đẩy nội dung đang xem xuống và gây cảm giác giật.
    const loadOlderMessages = useCallback(async () => {
        const element = messageScrollRef.current;
        if (!element) return;

        const previousScrollHeight = element.scrollHeight;
        const previousScrollTop = element.scrollTop;
        await loadMoreConversationMessages();
        requestAnimationFrame(() => {
            const currentElement = messageScrollRef.current;
            if (!currentElement) return;
            currentElement.scrollTop =
                currentElement.scrollHeight -
                previousScrollHeight +
                previousScrollTop;
        });
    }, [loadMoreConversationMessages]);

    // Chỉ hiện nút quay xuống cuối khi seller đang xem phần tin nhắn cũ,
    // đồng thời kích hoạt tải thêm khi chạm vùng đầu của conversation.
    const handleMessageScroll = useCallback(
        (
            element: HTMLDivElement,
            shouldLoadOlder = true,
            shouldTrackUserIntent = true,
        ) => {
            const distanceToLatest =
                element.scrollHeight - element.scrollTop - element.clientHeight;
            const isAtLatest = distanceToLatest <= 24;

            // Sự kiện do code tạo ra khi bám token không được xem là người dùng rời đáy;
            // ngược lại, scroll event thật ở phía trên phải ngắt auto-follow để không kéo seller xuống lại.
            if (shouldTrackUserIntent && !isProgrammaticScrollRef.current) {
                shouldFollowGeneratedContentRef.current = isAtLatest;
            }
            setIsAtLatestMessage(isAtLatest);
            if (!shouldLoadOlder) return;
            if (
                element.scrollTop <= 120 &&
                hasMoreMessages &&
                !isLoadingMoreMessages
            ) {
                void loadOlderMessages();
            }
        },
        [hasMoreMessages, isLoadingMoreMessages, loadOlderMessages],
    );

    // Hủy auto-follow ngay khi có thao tác cuộn thật của seller; làm trước onScroll để
    // event này không bị nhầm là scroll do code tạo ra trong lúc token đang cập nhật.
    const cancelGeneratedContentFollow = useCallback(() => {
        shouldFollowGeneratedContentRef.current = false;
        isProgrammaticScrollRef.current = false;
    }, []);

    // Cuộn về tin nhắn mới nhất mà không gọi API; cờ programmatic ngăn event scroll nội bộ
    // vô tình tắt auto-follow trong lúc component đang đưa seller về cuối vùng đọc.
    const scrollToLatestMessage = useCallback(
        (behavior: ScrollBehavior = 'auto') => {
            const element = messageScrollRef.current;
            if (!element) return;
            isProgrammaticScrollRef.current = true;
            shouldFollowGeneratedContentRef.current = true;
            element.scrollTo({
                top: element.scrollHeight,
                behavior,
            });

            // Với behavior auto event thường chạy ngay; requestAnimationFrame vẫn giữ cờ qua một vòng render.
            requestAnimationFrame(() => {
                isProgrammaticScrollRef.current = false;
            });
        },
        [],
    );

    // Mỗi lần token làm message cao thêm, chỉ bám xuống cuối nếu seller chưa chủ động rời vị trí đó.
    // Hiệu ứng chạy theo toàn bộ messages thay vì chỉ messages.length để bắt cả token streaming trong cùng assistant.
    useEffect(() => {
        if (!hasMessages || !shouldFollowGeneratedContentRef.current) return;
        const frameId = requestAnimationFrame(() =>
            scrollToLatestMessage('auto'),
        );
        return () => cancelAnimationFrame(frameId);
    }, [hasMessages, isStreaming, messages, scrollToLatestMessage]);

    // Sau khi click một conversation, đưa vùng đọc về message mới nhất thay vì giữ scrollTop của phiên trước.
    // requestAnimationFrame bảo đảm danh sách message đã được render xong rồi mới đo scrollHeight.
    useEffect(() => {
        if (!conversationId || !hasMessages) return;
        shouldFollowGeneratedContentRef.current = true;
        const frameId = requestAnimationFrame(() =>
            scrollToLatestMessage('auto'),
        );
        return () => cancelAnimationFrame(frameId);
    }, [conversationId, hasMessages, scrollToLatestMessage]);

    // Đồng bộ trạng thái nút sau khi danh sách message thay đổi chiều cao do message mới hoặc streaming.
    useEffect(() => {
        const element = messageScrollRef.current;
        if (!element) return;
        handleMessageScroll(element, false, false);
    }, [handleMessageScroll, messages, isStreaming]);

    return (
        <div
            className={`grid h-full min-h-0 w-full min-w-0 overflow-hidden bg-white pb-0 pl-4 pr-0 sm:pl-6 lg:pl-8 ${
                isHistoryOpen
                    ? 'gap-5 xl:grid-cols-[minmax(0,1fr)_270px]'
                    : 'gap-0 xl:grid-cols-[minmax(0,1fr)_56px]'
            }`}
        >
            <section className="relative flex min-h-0 min-w-0 flex-col bg-white">
                {!isHistoryOpen ? (
                    <div className="absolute right-4 top-3 z-10">
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="size-8 rounded-lg bg-white/95 text-zinc-500 shadow-sm backdrop-blur hover:bg-zinc-100 hover:text-zinc-950 xl:hidden"
                            aria-label="Mở lịch sử trò chuyện"
                            title="Mở lịch sử trò chuyện"
                            onClick={() => setIsHistoryOpen(true)}
                        >
                            <PanelRightOpen className="size-4" />
                        </Button>
                    </div>
                ) : null}

                <div className="relative min-h-0 flex-1">
                    <div
                        ref={messageScrollRef}
                        onWheel={cancelGeneratedContentFollow}
                        onTouchMove={cancelGeneratedContentFollow}
                        onScroll={(event) =>
                            handleMessageScroll(event.currentTarget)
                        }
                        className={`h-full overflow-y-auto overscroll-contain px-4 pr-5 pt-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:px-5 sm:pt-8 ${
                            hasMessages ? 'pb-36 sm:pb-40' : ''
                        }`}
                    >
                        {isLoadingMoreMessages ? (
                            <p className="pb-3 text-center text-xs text-zinc-400">
                                Đang tải thêm tin nhắn cũ...
                            </p>
                        ) : null}
                        {hasMessages ? (
                            <SellerCopilotMessageList
                                messages={messages}
                                isStreaming={isStreaming}
                                onSendMessage={handleSendMessage}
                            />
                        ) : (
                            <SellerCopilotEmptyState
                                onSelectPrompt={(prompt) =>
                                    handleSendMessage(prompt)
                                }
                            />
                        )}
                    </div>

                    {/* Khi auto-follow đang bật, trạng thái scroll tạm thời trong một frame không được làm nháy nút; */}
                    {/* nút chỉ xuất hiện sau khi seller thật sự rời khỏi cuối vùng đọc. */}
                    {hasMessages &&
                    !isAtLatestMessage &&
                    !shouldFollowGeneratedContentRef.current ? (
                        <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="absolute bottom-[7.25rem] left-1/2 z-30 size-9 -translate-x-1/2 rounded-full border-zinc-300 bg-white/95 text-zinc-700 shadow-md backdrop-blur transition-transform hover:-translate-x-1/2 hover:-translate-y-0.5 hover:bg-white"
                            aria-label="Cuộn xuống tin nhắn mới nhất"
                            title="Cuộn xuống tin nhắn mới nhất"
                            onClick={() => scrollToLatestMessage()}
                        >
                            <ArrowDown className="size-4" />
                        </Button>
                    ) : null}

                    {/* Composer nổi trên message layer; vùng nền mờ giữ phần nội dung phía sau vẫn nhận diện được. */}
                    <SellerCopilotComposer
                        range={range}
                        isStreaming={isStreaming}
                        showNotice={hasMessages && isAtLatestMessage}
                        onRangeChange={setRange}
                        onSendMessage={handleSendMessage}
                        onStop={stop}
                    />
                    {error ? (
                        <p className="absolute bottom-1 left-0 right-0 z-30 text-center text-xs text-red-600">
                            {error}
                        </p>
                    ) : null}
                </div>
            </section>

            {isHistoryOpen ? (
                <ConversationHistoryPanel
                    conversations={conversations}
                    activeConversationId={conversationId}
                    isLoading={isLoadingHistory}
                    isLoadingMore={isLoadingMoreHistory}
                    hasMore={hasMoreHistory}
                    disabled={isStreaming}
                    onNewConversation={startNewConversation}
                    onSelectConversation={(id) => void loadConversation(id)}
                    onLoadMore={() => void loadMoreConversations()}
                    onSetConversationPinned={(id, isPinned) =>
                        void setConversationPinned(id, isPinned)
                    }
                    onRenameConversation={renameConversation}
                    onDeleteConversation={deleteConversation}
                    onSearch={searchConversations}
                    onClose={() => setIsHistoryOpen(false)}
                />
            ) : (
                <ConversationHistoryRail
                    onOpen={() => setIsHistoryOpen(true)}
                    onNewConversation={() => {
                        startNewConversation();
                        setIsHistoryOpen(true);
                    }}
                />
            )}
        </div>
    );
}

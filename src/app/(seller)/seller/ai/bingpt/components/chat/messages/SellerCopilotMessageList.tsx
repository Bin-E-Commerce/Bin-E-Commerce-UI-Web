// File này render danh sách message và các dữ liệu phụ trợ của câu trả lời.
// Component không gọi API; mọi thao tác gửi lại prompt đều đi qua callback từ màn hình chính.
'use client';

import { Button } from '@/components/ui/button';
import type { SellerCopilotChatMessage } from '../../../hooks/use-seller-copilot';
import { SellerCopilotInsightCard } from '../../answer/insight/SellerCopilotInsightCard';
import { SellerCopilotMarkdown } from '../../answer/markdown/SellerCopilotMarkdown';
import { SellerCopilotThinkingIndicator } from '../../answer/status/SellerCopilotThinkingIndicator';

interface SellerCopilotMessageListProps {
    messages: SellerCopilotChatMessage[];
    isStreaming: boolean;
    onSendMessage: (message: string) => void;
}

// Render nội dung, insight, warning và prompt gợi ý; citation vẫn nằm trong metadata nhưng không hiện chip hay popup nguồn.
export function SellerCopilotMessageList({
    messages,
    isStreaming,
    onSendMessage,
}: SellerCopilotMessageListProps) {
    return (
        <div className="mx-auto w-full max-w-3xl space-y-4">
            {messages.map((message) => {
                // KPI tổng quan đã nằm trong câu trả lời live và citation Seller Dashboard;
                // không render thêm card để mỗi message giữ flow đọc tự nhiên, còn các insight
                // thao tác như tồn kho thấp hoặc hàng đợi đơn vẫn được hiển thị bình thường.
                const displayInsights = message.insights.filter(
                    (insight) => insight.type !== 'SHOP_KPI',
                );
                return (
                    <div
                        key={message.id}
                        className={
                            message.role === 'user'
                                ? 'ml-auto w-fit max-w-[88%]'
                                : 'w-full'
                        }
                    >
                        <div
                            className={
                                message.role === 'user'
                                    ? 'w-fit max-w-full whitespace-pre-wrap break-words rounded-2xl rounded-br-md bg-zinc-100 px-4 py-3 text-sm leading-6 text-zinc-900'
                                    : 'w-full text-zinc-800'
                            }
                        >
                            {message.role === 'assistant' ? (
                                message.content ? (
                                    <SellerCopilotMarkdown
                                        content={message.content}
                                    />
                                ) : isStreaming ? (
                                    <SellerCopilotThinkingIndicator />
                                ) : null
                            ) : (
                                message.content
                            )}
                        </div>
                        {message.suggestedPrompts?.length ? (
                            <div className="mt-2 flex flex-wrap gap-2">
                                {message.suggestedPrompts.map((prompt) => (
                                    <Button
                                        key={`${message.id}-${prompt}`}
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        className="h-auto whitespace-normal rounded-full border-zinc-200 px-3 py-1.5 text-left text-xs"
                                        disabled={isStreaming}
                                        onClick={() => onSendMessage(prompt)}
                                    >
                                        {prompt}
                                    </Button>
                                ))}
                            </div>
                        ) : null}
                        {displayInsights.length > 0 ? (
                            <div className="mt-3 grid gap-2 sm:grid-cols-2">
                                {displayInsights.map((insight, index) => (
                                    <SellerCopilotInsightCard
                                        key={`${message.id}-${index}`}
                                        insight={insight}
                                    />
                                ))}
                            </div>
                        ) : null}
                        {message.warning ? (
                            <p className="mt-2 text-xs text-amber-700">
                                {message.warning}
                            </p>
                        ) : null}
                    </div>
                );
            })}
        </div>
    );
}

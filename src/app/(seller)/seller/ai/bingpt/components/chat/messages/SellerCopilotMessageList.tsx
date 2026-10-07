// File này render danh sách message và các dữ liệu phụ trợ của câu trả lời.
// Component không gọi API; mọi thao tác gửi lại prompt đều đi qua callback từ màn hình chính.
'use client';

import { Button } from '@/components/ui/button';
import { Info } from 'lucide-react';
import type { SellerCopilotChatMessage } from '../../../types/chat/seller-copilot-chat.types';
import { SellerCopilotInsightCard } from '../../answer/insights/SellerCopilotInsightCard';
import { SellerCopilotMarkdown } from '../../answer/markdown/renderer/SellerCopilotMarkdown';
import { SellerCopilotThinkingIndicator } from '../status/SellerCopilotThinkingIndicator';
import { SellerCopilotInventoryActionCard } from './cards/SellerCopilotInventoryActionCard';
import { SellerCopilotSources } from './sources/SellerCopilotSources';
import { SellerCopilotModeChangeDivider } from './timeline/SellerCopilotModeChangeDivider';

interface SellerCopilotMessageListProps {
    messages: SellerCopilotChatMessage[];
    isStreaming: boolean;
    onSendMessage: (message: string) => void;
    onConfirmAction: (
        messageId: string,
        proposal: NonNullable<SellerCopilotChatMessage['actionProposal']>,
    ) => void;
}

// Render answer và trạng thái phụ theo từng message; câu bị Stop/network lỗi vẫn hiện phần đã nhận kèm nhãn chưa hoàn tất.
// Câu chưa đủ căn cứ dùng lời nhắn riêng có icon, đồng thời không hiển thị citation retrieval không liên quan.
export function SellerCopilotMessageList({
    messages,
    isStreaming,
    onSendMessage,
    onConfirmAction,
}: SellerCopilotMessageListProps) {
    return (
        <div className="mx-auto w-full max-w-3xl space-y-4">
            {messages.map((message) => {
                // System mode event là divider timeline; không đi qua renderer câu trả lời hay action card.
                if (
                    message.role === 'system' &&
                    message.timelineEvent === 'mode_changed' &&
                    message.interactionMode
                ) {
                    return (
                        <SellerCopilotModeChangeDivider
                            key={message.id}
                            mode={message.interactionMode}
                        />
                    );
                }

                // Chỉ render insight backend đã chọn theo ngữ cảnh và dựng từ nguồn xác thực.
                // Bỏ SHOP_KPI cũ để dữ liệu lịch sử từ phiên bản trước không tạo card trùng câu trả lời.
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
                                message.answerStatus === 'unsupported' ? (
                                    <div className="mt-1 flex items-start gap-2.5 text-sm leading-6 text-zinc-600">
                                        <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-rose-50 text-rose-600">
                                            <Info
                                                className="size-4"
                                                aria-hidden="true"
                                            />
                                        </span>
                                        <p className="max-w-2xl pt-0.5">
                                            {message.content}
                                        </p>
                                    </div>
                                ) : message.content ? (
                                    <SellerCopilotMarkdown
                                        content={message.content}
                                    />
                                ) : isStreaming ? (
                                    <SellerCopilotThinkingIndicator
                                        message={message.phase}
                                    />
                                ) : null
                            ) : (
                                message.content
                            )}
                        </div>
                        {message.role === 'assistant' && message.incomplete ? (
                            <p className="mt-2 text-xs text-amber-700">
                                Câu trả lời đã dừng trước khi hoàn tất.
                            </p>
                        ) : null}
                        {message.role === 'assistant' &&
                        message.answerStatus !== 'unsupported' ? (
                            <SellerCopilotSources
                                citations={message.citations}
                            />
                        ) : null}
                        {message.role === 'assistant' &&
                        message.actionProposal ? (
                            <SellerCopilotInventoryActionCard
                                proposal={message.actionProposal}
                                onConfirm={() =>
                                    onConfirmAction(
                                        message.id,
                                        message.actionProposal!,
                                    )
                                }
                            />
                        ) : null}
                        {message.answerStatus !== 'unsupported' &&
                        message.interactionMode !== 'shop_data' &&
                        message.dataSources?.length ? (
                            <p className="mt-2 text-xs text-zinc-400">
                                Nguồn:{' '}
                                {message.dataSources
                                    .map((source) => source.label)
                                    .join(' · ')}
                            </p>
                        ) : null}
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
                                    <div
                                        key={`${message.id}-${index}`}
                                        className={
                                            insight.type === 'REVENUE_TREND' ||
                                            insight.type === 'SELLER_PROFILE' ||
                                            insight.type === 'ORDER_DETAILS' ||
                                            insight.type === 'RETURN_ORDERS' ||
                                            insight.type ===
                                                'ORDER_STATUS_COUNT' ||
                                            insight.type ===
                                                'PRODUCT_CATALOG' ||
                                            insight.type ===
                                                'PRODUCTS_WITHOUT_REVENUE' ||
                                            insight.type ===
                                                'PRODUCT_STOCK_SUMMARY' ||
                                            insight.type ===
                                                'ACTIONABLE_ORDERS' ||
                                            insight.type ===
                                                'CANCELLED_ORDERS' ||
                                            insight.type ===
                                                'DELIVERED_ORDERS' ||
                                            insight.type === 'COMPLETED_ORDERS'
                                                ? 'sm:col-span-2'
                                                : undefined
                                        }
                                    >
                                        <SellerCopilotInsightCard
                                            insight={insight}
                                        />
                                    </div>
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

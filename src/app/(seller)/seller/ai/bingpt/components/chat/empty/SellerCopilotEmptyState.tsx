// File này render trạng thái khởi đầu khi seller chưa có message trong conversation hiện tại.
// Các prompt mẫu chỉ phát callback, không tạo conversation trực tiếp ngoài luồng chat chuẩn.
'use client';

import { Button } from '@/components/ui/button';
import { AiImageLoader } from '@/components/ui/ai-image-loader';
import type { SellerCopilotInteractionMode } from '@/services/seller/types/seller-copilot.types';

interface SellerCopilotEmptyStateProps {
    interactionMode: SellerCopilotInteractionMode;
    onSelectPrompt: (prompt: string) => void;
}

// Chọn câu mẫu theo mode; riêng Agent chỉ gợi ý các tác vụ sản phẩm có preview và xác nhận.
// Prompt vẫn đi qua luồng chat chuẩn, còn backend chịu trách nhiệm kiểm tra quyền và dữ liệu trước mọi thao tác ghi.
export function SellerCopilotEmptyState({
    interactionMode,
    onSelectPrompt,
}: SellerCopilotEmptyStateProps) {
    // Các mode đọc dữ liệu riêng vẫn giữ gợi ý của chúng; Agent chỉ hiển thị tác vụ sản phẩm.
    const prompts =
        interactionMode === 'chat'
            ? [
                  'Chào BinGPT, hôm nay bạn thế nào?',
                  'Kể tôi nghe một câu chuyện vui đi.',
                  'Tôi muốn tâm sự một chút.',
                  'Có gì hay ho để mình tám không?',
              ]
            : interactionMode === 'shop_data'
              ? [
                    'Doanh thu 30 ngày qua của tôi thế nào?',
                    'Sản phẩm nào đang bán chạy nhất?',
                    'Đơn nào cần xử lý trước?',
                    'Sản phẩm nào đang sắp hết hàng?',
                ]
              : interactionMode === 'knowledge'
                ? [
                      'Chính sách đăng bán sản phẩm gồm những gì?',
                      'Phí bán hàng và phí vận chuyển được tính thế nào?',
                      'Quy trình xử lý đơn hàng ra sao?',
                      'Chính sách đổi trả và hoàn tiền thế nào?',
                  ]
                : [];
    const agentPrompts = [
        'Tạo đề xuất bổ sung hàng cho các biến thể sắp hết.',
        'Đặt tồn kho cho một SKU theo số lượng mình muốn.',
        'Đổi giá cho một SKU theo mức giá mình chọn.',
        '@xả-hàng tìm SKU tồn ít nhất 10, bán tối đa 2 trong 30 ngày; giảm 10%, giá sàn 150.000đ.',
        'Cập nhật tên hoặc mô tả của một sản phẩm.',
    ];

    return (
        <div className="flex min-h-[calc(100dvh-13rem)] flex-col items-center justify-center px-4 py-12 text-center">
            <div
                className="relative mb-5 flex size-24 items-center justify-center"
                aria-hidden="true"
            >
                <AiImageLoader size={104} label="" className="relative" />
            </div>
            <h2 className="text-2xl font-semibold tracking-tight text-zinc-950">
                {interactionMode === 'chat'
                    ? 'Mình trò chuyện nhé?'
                    : interactionMode === 'shop_data'
                      ? 'Hỏi nhanh, biết ngay shop nên làm gì tiếp theo'
                      : interactionMode === 'knowledge'
                        ? 'Bạn cần tra cứu hướng dẫn nào?'
                        : 'Tra cứu và vận hành shop cùng AI Agent'}
            </h2>
            <p className="mt-2 max-w-xl text-sm leading-6 text-zinc-500">
                {interactionMode === 'chat'
                    ? 'Bắt đầu bằng một lời chào, câu chuyện vui hoặc điều bạn muốn chia sẻ.'
                    : interactionMode === 'shop_data'
                      ? 'Hỏi về doanh thu, đơn hàng, sản phẩm và tồn kho của shop bạn.'
                      : interactionMode === 'knowledge'
                        ? 'Tra cứu chính sách và hướng dẫn dành cho nhà bán hàng từ tài liệu hệ thống.'
                        : 'Tạo đề xuất bổ sung tồn kho, cập nhật giá hoặc nội dung; mọi thay đổi đều có bản xem trước để bạn xác nhận.'}
            </p>
            {interactionMode === 'agent' ? (
                <div className="mt-6 w-full max-w-3xl space-y-5 text-left">
                    <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">
                        Tác vụ sản phẩm · cần bạn xác nhận
                    </h3>
                    <div className="grid gap-2 sm:grid-cols-2">
                        {agentPrompts.map((prompt) => (
                            <Button
                                key={prompt}
                                type="button"
                                variant="outline"
                                className="h-auto min-h-11 min-w-0 justify-start whitespace-normal border-zinc-200 bg-white p-3 text-left text-sm hover:border-zinc-950 hover:bg-zinc-50"
                                onClick={() => onSelectPrompt(prompt)}
                            >
                                {prompt}
                            </Button>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="mt-6 grid w-full max-w-3xl gap-2 sm:grid-cols-2">
                    {prompts.map((prompt) => (
                        <Button
                            key={prompt}
                            type="button"
                            variant="outline"
                            className="h-auto min-h-11 min-w-0 justify-start whitespace-normal border-zinc-200 bg-white p-3 text-left text-sm hover:border-zinc-950 hover:bg-zinc-50"
                            onClick={() => onSelectPrompt(prompt)}
                        >
                            {prompt}
                        </Button>
                    ))}
                </div>
            )}
        </div>
    );
}

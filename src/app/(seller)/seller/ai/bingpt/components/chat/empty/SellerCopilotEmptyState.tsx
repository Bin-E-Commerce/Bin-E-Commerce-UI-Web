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

// Chọn bộ câu hỏi mẫu theo đúng mode đang hoạt động để prompt không vô tình gọi sai nguồn hoặc sai tác vụ.
// Chat chỉ gợi ý trò chuyện; dữ liệu shop và tài liệu gợi ý câu hỏi đọc; Agent chỉ gợi ý chỉnh tồn kho.
// Prompt được gửi qua callback hiện tại, còn backend vẫn là nơi thực thi kiểm tra quyền và yêu cầu xác nhận tác vụ.
export function SellerCopilotEmptyState({
    interactionMode,
    onSelectPrompt,
}: SellerCopilotEmptyStateProps) {
    // Mỗi mode có ví dụ riêng; các prompt Agent mô tả sản phẩm/biến thể/số lượng rõ ràng để luồng có thể hỏi bù phần thiếu.
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
                : [
                      'Giúp tôi chỉnh tồn kho cho một sản phẩm.',
                      'Đặt tồn kho sản phẩm [tên sản phẩm] thành 20.',
                      'Tăng tồn kho sản phẩm [tên sản phẩm] thêm 10.',
                      'Giảm tồn kho sản phẩm [tên sản phẩm] đi 5.',
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
                        : 'Bạn muốn điều chỉnh tồn kho thế nào?'}
            </h2>
            <p className="mt-2 max-w-xl text-sm leading-6 text-zinc-500">
                {interactionMode === 'chat'
                    ? 'Bắt đầu bằng một lời chào, câu chuyện vui hoặc điều bạn muốn chia sẻ.'
                    : interactionMode === 'shop_data'
                      ? 'Hỏi về doanh thu, đơn hàng, sản phẩm và tồn kho của shop bạn.'
                      : interactionMode === 'knowledge'
                        ? 'Tra cứu chính sách và hướng dẫn dành cho nhà bán hàng từ tài liệu hệ thống.'
                        : 'Mô tả thay đổi tồn kho bạn muốn thực hiện; BinGPT sẽ tạo đề xuất để bạn xem và xác nhận.'}
            </p>
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
        </div>
    );
}

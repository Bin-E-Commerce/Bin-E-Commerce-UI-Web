// File này render trạng thái khởi đầu khi seller chưa có message trong conversation hiện tại.
// Các prompt mẫu chỉ phát callback, không tạo conversation trực tiếp ngoài luồng chat chuẩn.
'use client';

import { Button } from '@/components/ui/button';
import { AiImageLoader } from '@/components/ui/ai-image-loader';

interface SellerCopilotEmptyStateProps {
    onSelectPrompt: (prompt: string) => void;
}

// Hiển thị loader, nội dung hướng dẫn và các prompt mẫu để seller bắt đầu nhanh.
export function SellerCopilotEmptyState({
    onSelectPrompt,
}: SellerCopilotEmptyStateProps) {
    return (
        <div className="flex min-h-[calc(100dvh-13rem)] flex-col items-center justify-center px-4 py-12 text-center">
            <div
                className="relative mb-5 flex size-24 items-center justify-center"
                aria-hidden="true"
            >
                <AiImageLoader size={104} label="" className="relative" />
            </div>
            <h2 className="text-2xl font-semibold tracking-tight text-zinc-950">
                Hỏi nhanh, biết ngay shop nên làm gì tiếp theo
            </h2>
            <p className="mt-2 max-w-xl text-sm leading-6 text-zinc-500">
                BinGPT kết nối dữ liệu vận hành và tài liệu seller để biến mỗi
                câu hỏi thành insight rõ ràng cùng một bước hành động đáng tin
                cậy.
            </p>
            <div className="mt-6 grid w-full max-w-3xl gap-2 sm:grid-cols-2">
                {[
                    'Doanh thu 30 ngày qua của tôi thế nào?',
                    'Sản phẩm nào đang sắp hết hàng?',
                    'Đơn nào cần xử lý trước?',
                    'Tạo kế hoạch tăng doanh thu trong 7 ngày tới.',
                ].map((prompt) => (
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

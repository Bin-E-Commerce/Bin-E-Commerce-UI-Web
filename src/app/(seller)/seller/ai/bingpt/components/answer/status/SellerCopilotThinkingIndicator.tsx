// File này hiển thị trạng thái chờ tối giản trong lúc BinGPT chưa phát token đầu tiên.
// Component không đọc từng phase của SSE để tránh làm UI render lại theo status backend;
// nó chỉ giữ một nhãn cố định và animation ba dấu chấm có fallback accessibility.
'use client';

// Hiển thị ngay nhãn “Đang phân tích” và cho ba dấu chấm nhấp nhô độc lập.
// Không nhận status động vì chi tiết từng bước không giúp seller có kết quả sớm hơn.
export function SellerCopilotThinkingIndicator() {
    return (
        <div
            className="inline-flex items-center text-sm text-zinc-500"
            role="status"
            aria-live="polite"
        >
            <span>Đang phân tích</span>
            <span
                className="ml-1 inline-flex items-end gap-0.5"
                aria-hidden="true"
            >
                <span
                    className="bingpt-thinking-dot size-1 rounded-full bg-zinc-500"
                    style={{ animationDelay: '-0.33s' }}
                />
                <span
                    className="bingpt-thinking-dot size-1 rounded-full bg-zinc-500"
                    style={{ animationDelay: '-0.165s' }}
                />
                <span className="bingpt-thinking-dot size-1 rounded-full bg-zinc-500" />
            </span>
        </div>
    );
}

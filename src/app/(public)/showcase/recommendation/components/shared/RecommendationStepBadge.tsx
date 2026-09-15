// Huy hiệu thứ tự dùng chung cho các card trong pipeline Recommendation, luôn giữ nền sáng và nhãn bước dễ đọc.
// Component chỉ trình bày số thứ tự; không quyết định nội dung, cấp bậc hay hành vi của card chứa nó.

// Giữ cách thể hiện số bước thống nhất và cung cấp nhãn đầy đủ cho trình đọc màn hình.
export function RecommendationStepBadge({ number }: { number: string }) {
    return (
        <span className="flex size-10 shrink-0 flex-col items-center justify-center rounded-xl border border-zinc-200 bg-white text-zinc-800 shadow-sm shadow-zinc-950/5">
            <span
                aria-hidden="true"
                className="text-[7px] font-semibold uppercase tracking-[0.12em] text-zinc-500"
            >
                Bước
            </span>
            <span
                aria-hidden="true"
                className="text-xs font-semibold leading-4 tabular-nums"
            >
                {number}
            </span>
            <span className="sr-only">Bước {number}</span>
        </span>
    );
}

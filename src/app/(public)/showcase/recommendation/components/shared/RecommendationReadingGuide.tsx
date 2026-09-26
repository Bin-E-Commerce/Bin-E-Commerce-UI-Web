// Điều hướng người đọc qua request, kiến trúc rồi logic xếp hạng; không sao chép nội dung của các phần tài liệu.
'use client';

import { ArrowRight } from 'lucide-react';
import { handleShowcaseAnchorNavigation } from '../../../utils/handleShowcaseAnchorNavigation';

// Hiển thị lộ trình ba bước theo đúng thứ tự dữ liệu được giải thích trong trang Recommendation.
export function RecommendationReadingGuide() {
    return (
        <nav aria-label="Lộ trình đọc tài liệu Recommendation">
            <div className="flex items-center justify-between gap-3">
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-500">
                    Lộ trình đọc
                </p>
                <span className="text-[10px] text-zinc-400">
                    3 phần · theo thứ tự xử lý
                </span>
            </div>

            <ol className="mt-2 divide-y divide-zinc-100 border-t border-zinc-200">
                <li>
                    <a
                        href="#recommendation-request-overview"
                        aria-controls="recommendation-request-overview"
                        onClick={handleShowcaseAnchorNavigation}
                        className="group flex items-center gap-3 rounded-lg px-2 py-2.5 transition-colors hover:bg-zinc-50 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-zinc-500"
                    >
                        <span className="grid size-7 shrink-0 place-items-center rounded-lg border border-zinc-200 bg-white font-mono text-[10px] text-zinc-500">
                            01
                        </span>
                        <span className="min-w-0 flex-1">
                            <span className="block text-xs font-semibold text-zinc-900">
                                Luồng gợi ý
                            </span>
                            <span className="mt-0.5 block text-[10px] leading-4 text-zinc-500">
                                Từ ngữ cảnh đến danh sách kết quả
                            </span>
                        </span>
                        <ArrowRight
                            aria-hidden="true"
                            className="size-3.5 shrink-0 text-zinc-400 transition-transform group-hover:translate-x-0.5"
                        />
                    </a>
                </li>
                <li>
                    <a
                        href="#recommendation-architecture"
                        aria-controls="recommendation-architecture"
                        onClick={handleShowcaseAnchorNavigation}
                        className="group flex items-center gap-3 rounded-lg px-2 py-2.5 transition-colors hover:bg-zinc-50 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-zinc-500"
                    >
                        <span className="grid size-7 shrink-0 place-items-center rounded-lg border border-zinc-200 bg-white font-mono text-[10px] text-zinc-500">
                            02
                        </span>
                        <span className="min-w-0 flex-1">
                            <span className="block text-xs font-semibold text-zinc-900">
                                Kiến trúc hệ thống
                            </span>
                            <span className="mt-0.5 block text-[10px] leading-4 text-zinc-500">
                                Service và event đảm nhiệm bước nào?
                            </span>
                        </span>
                        <ArrowRight
                            aria-hidden="true"
                            className="size-3.5 shrink-0 text-zinc-400 transition-transform group-hover:translate-x-0.5"
                        />
                    </a>
                </li>
                <li>
                    <a
                        href="#recommendation-logic"
                        aria-controls="recommendation-logic"
                        onClick={handleShowcaseAnchorNavigation}
                        className="group flex items-center gap-3 rounded-lg px-2 py-2.5 transition-colors hover:bg-zinc-50 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-zinc-500"
                    >
                        <span className="grid size-7 shrink-0 place-items-center rounded-lg border border-zinc-200 bg-white font-mono text-[10px] text-zinc-500">
                            03
                        </span>
                        <span className="min-w-0 flex-1">
                            <span className="block text-xs font-semibold text-zinc-900">
                                Logic xếp hạng
                            </span>
                            <span className="mt-0.5 block text-[10px] leading-4 text-zinc-500">
                                Nguồn ứng viên, điểm số và dự phòng
                            </span>
                        </span>
                        <ArrowRight
                            aria-hidden="true"
                            className="size-3.5 shrink-0 text-zinc-400 transition-transform group-hover:translate-x-0.5"
                        />
                    </a>
                </li>
            </ol>
        </nav>
    );
}

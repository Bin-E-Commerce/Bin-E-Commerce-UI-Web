// Hiển thị hiệu quả ranking theo mode thực tế từ các event đã được attribution.

import type { RecommendationAdminRankingPerformance } from '@/services/admin';

import { formatPercent } from '../overview.utils';

interface Props {
    rankingPerformance: RecommendationAdminRankingPerformance[];
}

// Hiển thị hiệu quả theo ranking mode thực tế; dữ liệu attribution cũ vẫn được nhóm để không mất lịch sử.
export function RankingPerformance({ rankingPerformance }: Props) {
    return (
        <section className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-end justify-between gap-2">
                <div>
                    <h2 className="text-base font-semibold text-zinc-950">
                        Hiệu quả ranking thực tế
                    </h2>
                    <p className="mt-1 text-sm text-zinc-500">
                        Theo dõi toàn bộ impression, click và add-to-cart theo
                        mode đã phục vụ.
                    </p>
                </div>
                <span className="text-xs text-zinc-400">
                    AI áp dụng 100% request khi được bật.
                </span>
            </div>

            <div className="mt-4 overflow-x-auto">
                <table className="w-full min-w-[680px] text-left text-sm">
                    <thead className="border-b border-zinc-100 text-xs uppercase tracking-wide text-zinc-400">
                        <tr>
                            <th className="px-2 py-3 font-medium">
                                Ranking mode
                            </th>
                            <th className="px-2 py-3 font-medium">
                                Impression
                            </th>
                            <th className="px-2 py-3 font-medium">Click</th>
                            <th className="px-2 py-3 font-medium">CTR</th>
                            <th className="px-2 py-3 font-medium">
                                Click → giỏ
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100">
                        {rankingPerformance.map((item) => (
                            <tr key={item.rankingMode}>
                                <td className="px-2 py-3 font-medium text-zinc-900">
                                    {item.rankingMode === 'HYBRID'
                                        ? 'Standard Ranking / Fallback'
                                        : item.rankingMode === 'ML_HYBRID'
                                          ? 'AI-Enhanced Ranking'
                                          : `${item.rankingMode} (lịch sử)`}
                                </td>
                                <td className="px-2 py-3 text-zinc-600">
                                    {item.impressions.toLocaleString('vi-VN')}
                                </td>
                                <td className="px-2 py-3 text-zinc-600">
                                    {item.clicks.toLocaleString('vi-VN')}
                                </td>
                                <td className="px-2 py-3 text-zinc-600">
                                    {formatPercent(item.clickThroughRate)}
                                </td>
                                <td className="px-2 py-3 text-zinc-600">
                                    {formatPercent(item.clickToCartRate)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {rankingPerformance.length === 0 ? (
                    <p className="py-4 text-sm text-zinc-500">
                        Chưa có dữ liệu ranking trong khoảng thời gian mặc định.
                    </p>
                ) : null}
            </div>
        </section>
    );
}

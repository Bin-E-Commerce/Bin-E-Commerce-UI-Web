// So sánh hiệu quả các variant ranking theo event đã được attribution về recommendation.

import type { RecommendationAdminExperiment } from '@/services/admin';

import { formatPercent } from '../overview.utils';

interface Props {
    experiments: RecommendationAdminExperiment[];
}

// Hiển thị bảng A/B và giữ nhãn Control cũ ở dạng lịch sử, không diễn giải nó thành Standard Ranking.
export function ExperimentComparison({ experiments }: Props) {
    return (
        <section className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-end justify-between gap-2">
                <div>
                    <h2 className="text-base font-semibold text-zinc-950">So sánh A/B ranking</h2>
                    <p className="mt-1 text-sm text-zinc-500">
                        So sánh Standard Ranking với AI-Enhanced Ranking qua event có attribution recommendation.
                    </p>
                </div>
                <span className="text-xs text-zinc-400">
                    Chỉ tăng traffic AI sau khi xác nhận model trả dự đoán thực tế.
                </span>
            </div>

            <div className="mt-4 overflow-x-auto">
                <table className="w-full min-w-[680px] text-left text-sm">
                    <thead className="border-b border-zinc-100 text-xs uppercase tracking-wide text-zinc-400">
                        <tr>
                            <th className="px-2 py-3 font-medium">Experiment</th>
                            <th className="px-2 py-3 font-medium">Variant</th>
                            <th className="px-2 py-3 font-medium">Impression</th>
                            <th className="px-2 py-3 font-medium">Click</th>
                            <th className="px-2 py-3 font-medium">CTR</th>
                            <th className="px-2 py-3 font-medium">Click → giỏ</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100">
                        {experiments.map((item) => (
                            <tr key={`${item.experimentId}-${item.variant}`}>
                                <td className="px-2 py-3 font-mono text-xs text-zinc-600">
                                    {item.experimentId}
                                </td>
                                <td className="px-2 py-3 font-medium text-zinc-900">
                                    {item.variant === 'HYBRID'
                                        ? 'Standard Ranking'
                                        : item.variant === 'ML_HYBRID'
                                          ? 'AI-Enhanced Ranking'
                                          : item.variant === 'CONTROL'
                                            ? 'Control (historical)'
                                            : item.variant}
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
                {experiments.length === 0 ? (
                    <p className="py-4 text-sm text-zinc-500">
                        Chưa có dữ liệu experiment trong khoảng thời gian mặc định.
                    </p>
                ) : null}
            </div>
        </section>
    );
}

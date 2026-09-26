// Ghép các panel tổng quan recommendation; component này không sở hữu logic truy vấn hay tính toán chi tiết.

import type {
    RecommendationAdminRankingPerformance,
    RecommendationAdminOverview as Overview,
} from '@/services/admin';

import { ActivityRhythmCard } from './components/ActivityRhythmCard';
import { RankingPerformance } from './components/RankingPerformance';
import { OverviewMetrics } from './components/OverviewMetrics';
import { ProductInterestSection } from './components/ProductInterestSection';

interface Props {
    overview: Overview | null;
    rankingPerformance: RecommendationAdminRankingPerformance[];
    loading: boolean;
}

// Hiển thị trạng thái tải ban đầu hoặc ghép các panel từ cùng snapshot dữ liệu overview.
export function AdminRecommendationOverview({
    overview,
    rankingPerformance,
    loading,
}: Props) {
    if (loading && !overview) {
        return (
            <div className="rounded-xl border border-zinc-200 bg-white p-8 text-sm text-zinc-500">
                Đang tải dữ liệu recommendation...
            </div>
        );
    }

    return (
        <div className="space-y-5">
            <OverviewMetrics overview={overview} />
            <ActivityRhythmCard overview={overview} />
            <ProductInterestSection products={overview?.topProducts ?? []} />
            <RankingPerformance rankingPerformance={rankingPerformance} />
        </div>
    );
}

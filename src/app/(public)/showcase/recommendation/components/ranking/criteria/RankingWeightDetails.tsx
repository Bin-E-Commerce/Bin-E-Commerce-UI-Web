// Điều phối giải thích công thức feature; phần kết hợp cuối do LambdaRank học, không có trọng số phục vụ cấu hình tay.
import type { RankingWeightDetailsProps } from './RankingWeightDetails.types';
import { RankingWeightCoBehaviorDetails } from './RankingWeightCoBehaviorDetails';
import { RankingWeightExplorationDetails } from './RankingWeightExplorationDetails';
import { RankingWeightFreshnessDetails } from './RankingWeightFreshnessDetails';
import { RankingWeightPopularityDetails } from './RankingWeightPopularityDetails';
import { RankingWeightProfileAffinityDetails } from './RankingWeightProfileAffinityDetails';
import { RankingWeightQualityDetails } from './RankingWeightQualityDetails';
import { RankingWeightSemanticSimilarityDetails } from './RankingWeightSemanticSimilarityDetails';
import { RankingWeightSessionContextDetails } from './RankingWeightSessionContextDetails';

// Hiển thị ý nghĩa miền feature và chọn đúng công thức để reviewer đối chiếu với RankingFeatureService.
export function RankingWeightDetails({
    id,
    signal,
}: RankingWeightDetailsProps) {
    return (
        <div
            id={id}
            className="mx-4 mt-3 mb-3 space-y-4 border-t border-zinc-200 bg-white pt-4 sm:mx-5"
        >
            <div className="space-y-3 rounded-xl border border-zinc-200 bg-white p-3 text-[13px] leading-5 text-zinc-600 sm:p-4">
                <p>
                    Giá trị feature nằm trong khoảng 0–1 để các tín hiệu có
                    miền đầu vào nhất quán. Giá trị này không phải xác suất mua
                    và không phải trọng số cuối cùng.
                </p>
                <p className="border-t border-zinc-200 pt-2.5">
                    <strong className="text-zinc-900">Giới hạn chứng cứ:</strong>{' '}
                    nguồn nghiên cứu hỗ trợ nguyên lý của feature; các ngưỡng
                    và hằng số cụ thể là lựa chọn hiện tại của dự án, cần được
                    kiểm chứng bằng test thuộc tính và đánh giá trên dữ liệu
                    lịch sử thật.
                </p>
            </div>
            <div className="space-y-4 bg-white">
                {signal === 'profileAffinity' ? (
                    <RankingWeightProfileAffinityDetails />
                ) : null}
                {signal === 'sessionContext' ? (
                    <RankingWeightSessionContextDetails />
                ) : null}
                {signal === 'semanticSimilarity' ? (
                    <RankingWeightSemanticSimilarityDetails />
                ) : null}
                {signal === 'coBehavior' ? (
                    <RankingWeightCoBehaviorDetails />
                ) : null}
                {signal === 'popularity' ? (
                    <RankingWeightPopularityDetails />
                ) : null}
                {signal === 'freshness' ? (
                    <RankingWeightFreshnessDetails />
                ) : null}
                {signal === 'quality' ? <RankingWeightQualityDetails /> : null}
                {signal === 'exploration' ? (
                    <RankingWeightExplorationDetails />
                ) : null}
            </div>
        </div>
    );
}

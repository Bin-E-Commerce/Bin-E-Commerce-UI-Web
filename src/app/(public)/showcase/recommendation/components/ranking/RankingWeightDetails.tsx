// Điều phối phần giải thích chi tiết từng trọng số ranking; công thức cụ thể được tách theo từng tín hiệu để dễ bảo trì.
import type { RankingWeightDetailsProps } from './RankingWeightDetails.types';
import { RankingWeightCoBehaviorDetails } from './RankingWeightCoBehaviorDetails';
import { RankingWeightExplorationDetails } from './RankingWeightExplorationDetails';
import { RankingWeightFreshnessDetails } from './RankingWeightFreshnessDetails';
import { RankingWeightPopularityDetails } from './RankingWeightPopularityDetails';
import { RankingWeightProfileAffinityDetails } from './RankingWeightProfileAffinityDetails';
import { RankingWeightQualityDetails } from './RankingWeightQualityDetails';
import { RankingWeightSemanticSimilarityDetails } from './RankingWeightSemanticSimilarityDetails';
import { RankingWeightSessionContextDetails } from './RankingWeightSessionContextDetails';

// Hiển thị phần giải thích chung về tỷ trọng rồi chọn đúng tài liệu theo signal được truyền từ policy hoặc showcase.
export function RankingWeightDetails({ id, signal, weightPercent }: RankingWeightDetailsProps) {
    return (
        <div id={id} className="mx-4 mt-3 mb-3 space-y-4 border-t border-zinc-200 bg-white pt-4 sm:mx-5">
            <div className="space-y-3 rounded-xl border border-zinc-200 bg-white p-3 text-[13px] leading-5 text-zinc-600 sm:p-4">
                <p>
                    <span className="font-semibold text-zinc-900">Tỷ trọng {weightPercent}%</span>{' '}
                    là mức quan trọng bạn dành cho tiêu chí này, không phải điểm sản phẩm đạt được. Điểm riêng của tiêu chí nằm trong khoảng 0–1: 0 là không có dấu hiệu phù hợp, 1 là mức tối đa công thức cho phép. Ví dụ 0.8 tương đương 80/100 điểm riêng; nó không có nghĩa người dùng có 80% khả năng mua.
                </p>
                <p>
                    Khi chấm điểm, hệ thống cộng tất cả tỷ trọng rồi chia tỷ trọng của tiêu chí này cho tổng đó. Ví dụ 25% trên tổng 100% trở thành 0.25; điểm riêng 0.8 × 0.25 = 0.20, tức đóng góp 20/100 điểm tổng. Nếu tổng các ô là 80%, một ô 20% được quy đổi thành 20 ÷ 80 = 25% trước khi tính. Nếu tất cả tỷ trọng đều bằng 0, hệ thống quay về bộ mặc định thay vì chia cho 0.
                </p>
                <p className="border-t border-zinc-200 pt-2.5">
                    <strong className="text-zinc-900">Lưu ý về các con số:</strong>{' '}
                    tỷ trọng trong các ô là thứ bạn đang chỉnh. Còn các số nằm bên trong công thức như 0.6, 7 ngày hay 12 là quy tắc mặc định do dự án đặt để bắt đầu — không phải kết quả hệ thống đã học từ khách hàng thật. Một số có thể đổi trong cấu hình dịch vụ; những số khác hiện cố định trong code. Đây là Standard Ranking, không phải mô hình AI-Enhanced Ranking.
                </p>
            </div>
            <div className="space-y-4 bg-white">
                {signal === 'profileAffinity' ? <RankingWeightProfileAffinityDetails /> : null}
                {signal === 'sessionContext' ? <RankingWeightSessionContextDetails /> : null}
                {signal === 'semanticSimilarity' ? <RankingWeightSemanticSimilarityDetails /> : null}
                {signal === 'coBehavior' ? <RankingWeightCoBehaviorDetails /> : null}
                {signal === 'popularity' ? <RankingWeightPopularityDetails /> : null}
                {signal === 'freshness' ? <RankingWeightFreshnessDetails /> : null}
                {signal === 'quality' ? <RankingWeightQualityDetails /> : null}
                {signal === 'exploration' ? <RankingWeightExplorationDetails /> : null}
            </div>
        </div>
    );
}


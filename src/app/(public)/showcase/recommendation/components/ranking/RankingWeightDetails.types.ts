// Kiểu dữ liệu dùng chung cho phần giải thích trọng số ranking; key phải khớp với tín hiệu mà Recommendation Service chấm điểm.

export type RankingWeightKey =
    | 'profileAffinity'
    | 'sessionContext'
    | 'semanticSimilarity'
    | 'coBehavior'
    | 'popularity'
    | 'freshness'
    | 'quality'
    | 'exploration';

export interface RankingWeightDetailsProps {
    id: string;
    signal: RankingWeightKey;
    weightPercent: number;
}

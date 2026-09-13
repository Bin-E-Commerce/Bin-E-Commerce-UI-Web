// Contract cho bộ lọc thời gian của Recommendation Center; chỉ mô tả input date của UI, không chứa timezone hoặc query API.

export interface RecommendationDateRangeInput {
    from: string;
    to: string;
}

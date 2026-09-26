// Liên kết từ sơ đồ request tới phần giải thích ranking, tái sử dụng kiểu nút pill thống nhất của các mục chi tiết.
'use client';

import { RecommendationDetailLink } from '../shared/RecommendationDetailLink';

// Dùng nút chi tiết dùng chung để giữ cùng kiểu dáng, hành vi cuộn và đích anchor ranking đã có.
export function RecommendationRankingLogicLink() {
    return (
        <RecommendationDetailLink
            href="#recommendation-ranking-logic"
            ariaLabel="Xem logic xếp hạng"
        >
            Xem logic xếp hạng
        </RecommendationDetailLink>
    );
}

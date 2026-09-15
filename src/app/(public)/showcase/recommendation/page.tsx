// Route chi tiết public của Recommendation; không dùng quyền admin và không truy vấn event/runtime metrics.
import type { Metadata } from 'next';
import { RecommendationShowcase } from './components/orchestration/RecommendationShowcase';

export const metadata: Metadata = {
    title: 'Recommendation System | Bin E-Commerce',
    description:
        'Tìm hiểu kiến trúc, dữ liệu, công thức Standard Ranking và lớp AI-Enhanced của hệ thống gợi ý sản phẩm.',
};

// Giữ route mỏng; nội dung và sơ đồ thuộc feature Recommendation trong khu showcase.
export default function RecommendationShowcasePage() {
    return <RecommendationShowcase />;
}

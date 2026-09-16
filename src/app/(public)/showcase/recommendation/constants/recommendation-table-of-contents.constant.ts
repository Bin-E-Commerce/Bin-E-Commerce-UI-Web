// Cấu hình mục lục riêng của Recommendation; component shared chỉ render cây và không biết nghiệp vụ ranking.
import type { ShowcaseTocItem } from '../../types/showcase.types';

// Tập hợp toàn bộ anchor đã có trong Recommendation để sidebar không tạo liên kết tới nội dung không tồn tại.
export const recommendationTableOfContents: ShowcaseTocItem[] = [
    {
        id: 'recommendation-page-start',
        label: 'Tổng quan',
        children: [
            { id: 'recommendation-request-overview', label: 'Luồng request tổng quát' },
            { id: 'recommendation-docs', label: 'Tài liệu chi tiết' },
        ],
    },
    {
        id: 'recommendation-architecture',
        label: '1 · Kiến trúc hệ thống',
        children: [
            {
                id: 'recommendation-architecture-flows',
                label: '1.1 · Hai luồng xử lý',
                children: [
                    { id: 'recommendation-architecture-read-flow', label: '1.1.1 · Luồng đọc' },
                    { id: 'recommendation-architecture-write-flow', label: '1.1.2 · Luồng ghi' },
                ],
            },
            { id: 'recommendation-technology-stack', label: '1.2 · Công nghệ sử dụng' },
            {
                id: 'recommendation-services-overview',
                label: '1.3 · Các service tham gia',
                children: [
                    { id: 'recommendation-sync-services', label: '1.3.1 · Luồng trả gợi ý' },
                    { id: 'recommendation-async-services', label: '1.3.2 · Dữ liệu & cập nhật nền' },
                ],
            },
        ],
    },
    {
        id: 'recommendation-logic',
        label: '2 · Logic tạo gợi ý',
        children: [
            {
                id: 'recommendation-signal-logic',
                label: '2.1 · Tín hiệu & ứng viên',
                children: [
                    { id: 'recommendation-signal-context', label: '2.1.1 · Hai lớp tín hiệu' },
                    { id: 'recommendation-event-weights', label: '2.1.2 · Cách tính điểm hành vi' },
                    {
                        id: 'recommendation-candidate-sources',
                        label: '2.1.3 · Các nguồn tạo ứng viên',
                        children: [
                            { id: 'recommendation-affinity-flow-title', label: '2.1.3.1 · Tìm theo sở thích Catalog' },
                            { id: 'recommendation-cold-start-flow-title', label: '2.1.3.2 · Trending và cold-start' },
                            { id: 'recommendation-semantic-flow-title', label: '2.1.3.3 · Tìm theo ngữ nghĩa' },
                            { id: 'recommendation-cobehavior-flow-title', label: '2.1.3.4 · Tìm theo quan hệ hành vi' },
                        ],
                    },
                    { id: 'recommendation-candidate-union', label: '2.1.4 · Hợp nhất candidate' },
                ],
            },
            {
                id: 'recommendation-ranking-logic',
                label: '2.2 · Xếp hạng sản phẩm',
                children: [
                    { id: 'standard-ranking-formula', label: '2.2.1 · Công thức Standard' },
                    {
                        id: 'ranking-feature-weights',
                        label: '2.2.2 · Tám tiêu chí xếp hạng',
                        children: [
                            { id: 'ranking-feature-profileAffinity', label: '2.2.2.1 · Sở thích trong hồ sơ' },
                            { id: 'ranking-feature-sessionContext', label: '2.2.2.2 · Nhu cầu trong phiên hiện tại' },
                            { id: 'ranking-feature-semanticSimilarity', label: '2.2.2.3 · Sản phẩm tương tự về nội dung' },
                            { id: 'ranking-feature-coBehavior', label: '2.2.2.4 · Sản phẩm thường đi cùng nhau' },
                            { id: 'ranking-feature-popularity', label: '2.2.2.5 · Mức độ phổ biến' },
                            { id: 'ranking-feature-freshness', label: '2.2.2.6 · Độ mới của sản phẩm' },
                            { id: 'ranking-feature-quality', label: '2.2.2.7 · Chất lượng và tồn kho' },
                            { id: 'ranking-feature-exploration', label: '2.2.2.8 · Khám phá sản phẩm mới' },
                        ],
                    },
                    {
                        id: 'ai-enhanced-ranking-formula',
                        label: '2.2.3 · Công thức AI-Enhanced Ranking',
                    },
                ],
            },
            {
                id: 'recommendation-reliability-logic',
                label: '2.3 · Fallback & độ tin cậy',
                children: [
                    { id: 'recommendation-fallback-request-flow', label: '2.3.1 · Dự phòng theo bước' },
                    { id: 'recommendation-feedback-flow', label: '2.3.2 · Ghi nhận tương tác' },
                ],
            },
        ],
    },
];

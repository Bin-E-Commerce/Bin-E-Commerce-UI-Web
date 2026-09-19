// Cấu hình anchor cho tài liệu AI Image Optimization; không chứa trạng thái job hay dữ liệu từ AI service.
import type { ShowcaseTocItem } from '../../types/showcase.types';

// Cây mục lục phản ánh đúng thứ tự đọc: request, kiến trúc, lifecycle job và các guardrail áp dụng sản phẩm.
export const aiOptimizationTableOfContents: ShowcaseTocItem[] = [
    {
        id: 'ai-optimization-page-start',
        label: 'Tổng quan',
        children: [
            {
                id: 'ai-optimization-request-overview',
                label: 'Luồng request tổng quát',
            },
            { id: 'ai-optimization-docs', label: 'Tài liệu chi tiết' },
        ],
    },
    {
        id: 'ai-optimization-architecture',
        label: '1 · Kiến trúc hệ thống',
        children: [
            {
                id: 'ai-optimization-architecture-flow',
                label: '1.1 · Luồng hoạt động',
                children: [
                    {
                        id: 'ai-optimization-preview-flow',
                        label: '1.1.1 · Luồng tạo preview',
                    },
                    {
                        id: 'ai-optimization-approval-flow',
                        label: '1.1.2 · Luồng duyệt và cập nhật',
                    },
                ],
            },
            {
                id: 'ai-optimization-technology-stack',
                label: '1.2 · Công nghệ sử dụng',
            },
            {
                id: 'ai-optimization-services-overview',
                label: '1.3 · Các service tham gia',
                children: [
                    {
                        id: 'ai-optimization-preview-services',
                        label: '1.3.1 · Luồng tạo và xử lý preview',
                    },
                    {
                        id: 'ai-optimization-catalog-services',
                        label: '1.3.2 · Luồng duyệt và cập nhật catalog',
                    },
                    {
                        id: 'ai-optimization-impact-services',
                        label: '1.3.3 · Luồng đo impact sau apply',
                    },
                ],
            },
        ],
    },
    {
        id: 'ai-optimization-logic',
        label: '2 · Logic xử lý ảnh',
        children: [
            {
                id: 'ai-optimization-lifecycle',
                label: '2.1 · Vòng đời batch/job',
            },
            {
                id: 'ai-optimization-permissions',
                label: '2.2 · Quyền và sở hữu sản phẩm',
            },
            {
                id: 'ai-optimization-queue-orchestration',
                label: '2.3 · Queue và điều phối job',
            },
            {
                id: 'ai-optimization-worker-output',
                label: '2.4 · Worker, Media Service và lineage output',
            },
            {
                id: 'ai-optimization-cost',
                label: '2.5 · Kiểm soát token và chi phí AI',
            },
            {
                id: 'ai-optimization-reliability',
                label: '2.6 · Retry, reject và rollback',
            },
            {
                id: 'ai-optimization-impact',
                label: '2.7 · Đo tác động sau tối ưu',
            },
        ],
    },
];

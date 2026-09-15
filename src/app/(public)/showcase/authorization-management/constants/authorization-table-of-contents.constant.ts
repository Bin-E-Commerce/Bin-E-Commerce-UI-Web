// Cấu hình cây mục lục Authorization Management; mỗi anchor đại diện cho một khái niệm bảo mật có thể đọc độc lập.
import type { ShowcaseTocItem } from '../../types/showcase.types';

// Thứ tự đọc đi từ request vào hệ thống, qua policy resolution, đến enforcement và vận hành/audit.
export const authorizationTableOfContents: ShowcaseTocItem[] = [
    {
        id: 'authorization-page-start',
        label: 'Tổng quan',
        children: [
            { id: 'authorization-request-overview', label: 'Luồng request tổng quát' },
            { id: 'authorization-docs', label: 'Tài liệu chi tiết' },
        ],
    },
    {
        id: 'authorization-architecture',
        label: '1 · Kiến trúc hệ thống',
        children: [
            {
                id: 'authorization-architecture-flow',
                label: '1.1 · Luồng hoạt động',
                children: [
                    { id: 'authorization-request-flow', label: '1.1.1 · Luồng kiểm tra request' },
                    { id: 'authorization-policy-change-flow', label: '1.1.2 · Luồng thay đổi policy' },
                ],
            },
            { id: 'authorization-technology-stack', label: '1.2 · Công nghệ sử dụng' },
            {
                id: 'authorization-services-overview',
                label: '1.3 · Các service tham gia',
                children: [
                    { id: 'authorization-request-services', label: '1.3.1 · Luồng kiểm tra request' },
                    { id: 'authorization-policy-services', label: '1.3.2 · Quản lý policy và access profile' },
                ],
            },
        ],
    },
    {
        id: 'authorization-logic',
        label: '2 · Logic xử lý',
        children: [
            { id: 'authorization-logic-route-permission', label: '2.1 · Kiểm tra permission trước khi forward' },
            { id: 'authorization-logic-resource-scope', label: '2.2 · Kiểm tra ownership và scope trên resource' },
            { id: 'authorization-logic-policy-command', label: '2.3 · Ghi thay đổi role-permission có kiểm soát' },
            { id: 'authorization-logic-policy-audit', label: '2.4 · Audit thay đổi và vô hiệu access profile cũ' },
            { id: 'authorization-logic-profile-resolve', label: '2.5 · Tạo bảng quyền hiện tại cho user' },
        ],
    },
];

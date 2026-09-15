// Route public giới thiệu Authorization Management; page chỉ khai báo metadata và lắp component orchestration.
import type { Metadata } from 'next';
import { AuthorizationShowcase } from './components/orchestration/AuthorizationShowcase';

export const metadata: Metadata = {
    title: 'Authorization Management | Bin E-Commerce',
    description: 'Tìm hiểu hệ thống phân quyền RBAC, scope, access profile, audit và navigation backend-driven của Bin E-Commerce.',
};

// Giữ route mỏng để toàn bộ layout và nội dung tài liệu nằm trong các component có boundary rõ ràng.
export default function AuthorizationManagementPage() {
    return <AuthorizationShowcase />;
}

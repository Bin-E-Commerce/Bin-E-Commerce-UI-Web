// Route public giới thiệu quy trình CI/CD và vận hành production; page chỉ sở hữu metadata và composition.
import type { Metadata } from 'next';
import { PlatformOperationsShowcase } from './components/orchestration/PlatformOperationsShowcase';

export const metadata: Metadata = {
    title: 'CI/CD và vận hành production | Bin E-Commerce',
    description:
        'Tìm hiểu cách Bin E-Commerce kiểm tra, build, phát hành và triển khai các service lên K3s, đồng thời theo dõi metrics và logs qua Grafana.',
};

// Giữ route mỏng để toàn bộ nội dung tài liệu được tổ chức theo từng chương trong feature folder.
export default function PlatformOperationsShowcasePage() {
    return <PlatformOperationsShowcase />;
}

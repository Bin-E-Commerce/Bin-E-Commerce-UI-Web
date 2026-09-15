// Route chi tiết public của AI Image Optimization; không thực thi job hoặc tiết lộ dữ liệu seller.
import type { Metadata } from 'next';
import { AiOptimizationShowcase } from './components/orchestration/AiOptimizationShowcase';

export const metadata: Metadata = {
    title: 'AI Image Optimization | Bin E-Commerce',
    description:
        'Tìm hiểu cách seller tạo preview ảnh bằng AI, duyệt kết quả và áp dụng an toàn vào sản phẩm.',
};

// Page chỉ ghép nội dung tĩnh; route Seller Center thật tiếp tục sở hữu thao tác tối ưu ảnh.
export default function AiOptimizationShowcasePage() {
    return <AiOptimizationShowcase />;
}

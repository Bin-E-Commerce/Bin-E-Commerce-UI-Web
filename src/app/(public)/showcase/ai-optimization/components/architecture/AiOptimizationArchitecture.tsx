// Chương kiến trúc AI Image Optimization; tổ chức flow, technology stack và service overview theo cùng cấu trúc Recommendation.
import { ShowcaseDisclosure } from '../../../components/shared/ShowcaseDisclosure';
import { AiOptimizationActivityFlow } from './AiOptimizationActivityFlow';
import { AiOptimizationServicesOverview } from './AiOptimizationServicesOverview';
import { AiOptimizationTechnologyStack } from './AiOptimizationTechnologyStack';

// Đặt flow hoạt động trước stack và service để người đọc hiểu hệ thống chạy thế nào rồi mới xem từng thành phần.
export function AiOptimizationArchitecture() {
    return (
        <section className="space-y-4">
            <ShowcaseDisclosure
                id="ai-optimization-architecture-flow"
                number="1.1"
                title="Luồng hoạt động của hệ thống"
                description="Theo dõi từ lúc seller chọn ảnh, backend xác minh và tạo job, worker sinh preview, đến lúc seller duyệt để cập nhật catalog hoặc quay lại phiên bản an toàn."
            >
                <AiOptimizationActivityFlow />
            </ShowcaseDisclosure>
            <AiOptimizationTechnologyStack />
            <AiOptimizationServicesOverview />
        </section>
    );
}

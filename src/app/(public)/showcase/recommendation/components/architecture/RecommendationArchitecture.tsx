// Gom luồng đọc/ghi, công nghệ và service thành một chương kiến trúc có thứ tự.
// Component chỉ trình bày ranh giới và vai trò; không mô phỏng request hay thay thế tài liệu vận hành chi tiết.
import { RecommendationDisclosure } from '../shared/RecommendationDisclosure';
import { RecommendationFeedbackFlow } from './RecommendationFeedbackFlow';
import { RecommendationReadFlow } from './RecommendationReadFlow';
import { RecommendationServicesOverview } from './RecommendationServicesOverview';
import { RecommendationTechnologyStack } from './RecommendationTechnologyStack';

// Đặt hai luồng xử lý trước stack và service, với nhịp dọc gọn để các mục cùng chương không bị tách rời.
export function RecommendationArchitecture() {
    return (
        <section className="space-y-4">
            <RecommendationDisclosure
                id="recommendation-architecture-flows"
                number="1.1"
                title="Khám phá hai luồng tạo nên gợi ý"
                description="Luồng đọc tạo danh sách trong request; luồng ghi xử lý hành vi ở nền để cập nhật dữ liệu cho lần gợi ý sau."
                level={3}
                variant="flow"
            >
                <div className="space-y-3">
                    <RecommendationDisclosure
                        id="recommendation-architecture-read-flow"
                        variant="flow"
                        number="1.1.1"
                        title="Luồng đọc · Xử lý đồng bộ"
                        description="Recommendation xử lý yêu cầu trong cùng lượt gọi. Redis có thể trả kết quả đã xếp hạng; nếu cache miss, hệ thống mới dựng ngữ cảnh, tìm ứng viên và chạy bước xếp hạng."
                        level={4}
                    >
                        <RecommendationReadFlow />
                    </RecommendationDisclosure>

                    <RecommendationDisclosure
                        id="recommendation-architecture-write-flow"
                        variant="flow"
                        number="1.1.2"
                        title="Luồng ghi · Xử lý bất đồng bộ"
                        description="Web/Order → Kafka → hai consumer cập nhật hồ sơ người mua và quan hệ sản phẩm; request gợi ý không phải chờ các bước này."
                        level={4}
                    >
                        <RecommendationFeedbackFlow />
                    </RecommendationDisclosure>
                </div>
            </RecommendationDisclosure>

            <RecommendationTechnologyStack />
            <RecommendationServicesOverview />
        </section>
    );
}

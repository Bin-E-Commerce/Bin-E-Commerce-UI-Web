import { SellerModulePlaceholder } from '../components/SellerModulePlaceholder';

// Trang dữ liệu tổng quan giúp seller đọc nhanh tăng trưởng và hiệu suất kinh doanh.
export default function SellerAnalyticsPage() {
    return (
        <SellerModulePlaceholder
            eyebrow="Dữ liệu"
            title="Đọc hiệu suất shop bằng dữ liệu vận hành"
            description="Seller sẽ theo dõi doanh thu, đơn hàng, tỷ lệ chuyển đổi và xu hướng tăng trưởng để ra quyết định bán hàng."
            primaryAction="Xem báo cáo"
            secondaryAction="Chọn khoảng thời gian"
        />
    );
}

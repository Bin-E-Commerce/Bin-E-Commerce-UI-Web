import { SellerModulePlaceholder } from '../../components/SellerModulePlaceholder';

// Trang phân tích sản phẩm tập trung vào lượt xem, chuyển đổi và doanh thu theo SKU.
export default function SellerProductAnalyticsPage() {
    return (
        <SellerModulePlaceholder
            eyebrow="Dữ liệu"
            title="Phân tích hiệu quả từng sản phẩm"
            description="Báo cáo sẽ giúp seller nhận ra sản phẩm chủ lực, sản phẩm cần tối ưu nội dung và SKU có tỷ lệ chuyển đổi thấp."
            primaryAction="Xem top sản phẩm"
            secondaryAction="Tải dữ liệu"
        />
    );
}

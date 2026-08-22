import { SellerModulePlaceholder } from '../components/SellerModulePlaceholder';

// Trang quản lý đơn hàng là nơi gom bộ lọc trạng thái và thao tác xử lý đơn.
export default function SellerOrdersPage() {
    return (
        <SellerModulePlaceholder
            eyebrow="Quản lý đơn hàng"
            title="Theo dõi toàn bộ vòng đời đơn hàng"
            description="Màn hình này sẽ gom đơn mới, đơn chờ lấy hàng, đơn đang giao và yêu cầu trả hàng để seller xử lý nhanh theo mức độ ưu tiên."
            primaryAction="Tải danh sách đơn"
            secondaryAction="Xuất báo cáo"
        />
    );
}

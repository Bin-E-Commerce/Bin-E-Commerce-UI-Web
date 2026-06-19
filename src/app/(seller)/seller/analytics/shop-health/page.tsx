import { SellerModulePlaceholder } from '../../components/SellerModulePlaceholder';

// Trang sức khỏe shop cảnh báo sớm các chỉ số có thể ảnh hưởng quyền bán hàng.
export default function SellerShopHealthPage() {
    return (
        <SellerModulePlaceholder
            eyebrow="Dữ liệu"
            title="Theo dõi sức khỏe và tiêu chuẩn vận hành shop"
            description="Seller sẽ thấy điểm phản hồi, tỷ lệ giao đúng hạn, tỷ lệ hủy đơn và các cảnh báo cần xử lý trước khi bị giới hạn hiển thị."
            primaryAction="Xem cảnh báo"
            secondaryAction="Tìm cách cải thiện"
        />
    );
}

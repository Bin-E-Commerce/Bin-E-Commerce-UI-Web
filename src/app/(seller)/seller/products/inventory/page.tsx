import { SellerModulePlaceholder } from '../../components/SellerModulePlaceholder';

// Trang kho hàng tập trung vào tồn khả dụng, tồn giữ chỗ và cảnh báo sắp hết hàng.
export default function SellerInventoryPage() {
    return (
        <SellerModulePlaceholder
            eyebrow="Quản lý sản phẩm"
            title="Theo dõi tồn kho theo từng biến thể"
            description="Khi nối API, bảng kho sẽ hiển thị số lượng khả dụng, đã bán, đang giữ chỗ và ngưỡng cảnh báo để seller nhập hàng kịp thời."
            primaryAction="Cập nhật tồn kho"
            secondaryAction="Tải mẫu nhập kho"
        />
    );
}

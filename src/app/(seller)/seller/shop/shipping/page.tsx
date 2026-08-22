import { SellerModulePlaceholder } from '../../components/SellerModulePlaceholder';

// Trang vận chuyển giúp seller cấu hình địa chỉ lấy hàng và dịch vụ giao nhận.
export default function SellerShopShippingPage() {
    return (
        <SellerModulePlaceholder
            eyebrow="Quản lý shop"
            title="Thiết lập địa chỉ lấy hàng và vận chuyển"
            description="Seller sẽ quản lý địa chỉ kho, người liên hệ, đơn vị vận chuyển hỗ trợ và thời gian chuẩn bị hàng trong cùng một nơi."
            primaryAction="Thêm địa chỉ lấy hàng"
            secondaryAction="Cấu hình vận chuyển"
        />
    );
}

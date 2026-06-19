import { SellerModulePlaceholder } from '../../components/SellerModulePlaceholder';

// Trang thiết lập shop chứa các cấu hình vận hành ít thay đổi nhưng ảnh hưởng toàn shop.
export default function SellerShopSettingsPage() {
    return (
        <SellerModulePlaceholder
            eyebrow="Quản lý shop"
            title="Cấu hình chính sách vận hành shop"
            description="Tại đây seller sẽ thiết lập trạng thái bán hàng, thời gian xử lý, chính sách đổi trả và các thông báo vận hành."
            primaryAction="Lưu thiết lập"
            secondaryAction="Khôi phục mặc định"
        />
    );
}

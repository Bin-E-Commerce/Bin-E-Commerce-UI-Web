import { SellerModulePlaceholder } from '../../components/SellerModulePlaceholder';

// Trang xem trước giúp seller kiểm tra trải nghiệm công khai trước khi publish thay đổi.
export default function SellerShopPublicPreviewPage() {
    return (
        <SellerModulePlaceholder
            eyebrow="Kênh bán hàng"
            title="Xem shop như khách hàng nhìn thấy"
            description="Bản xem trước sẽ hiển thị banner, hồ sơ shop, sản phẩm nổi bật và các khối nội dung đang được công khai."
            primaryAction="Mở trang shop"
            secondaryAction="Chỉnh sửa trang trí"
        />
    );
}

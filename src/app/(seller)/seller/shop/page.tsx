import { SellerModulePlaceholder } from '../components/SellerModulePlaceholder';

// Trang hồ sơ shop quản lý thông tin nhận diện hiển thị công khai cho khách mua hàng.
export default function SellerShopPage() {
    return (
        <SellerModulePlaceholder
            eyebrow="Quản lý shop"
            title="Hoàn thiện hồ sơ và hình ảnh nhận diện shop"
            description="Seller có thể cập nhật tên shop, ảnh đại diện, ảnh bìa, mô tả và ngành hàng chính để tăng độ tin cậy khi khách truy cập."
            primaryAction="Cập nhật hồ sơ"
            secondaryAction="Xem trước shop"
        />
    );
}

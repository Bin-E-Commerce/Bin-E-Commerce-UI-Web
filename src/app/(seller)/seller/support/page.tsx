import { SellerModulePlaceholder } from '../components/SellerModulePlaceholder';

// Trang chăm sóc khách hàng gom tin nhắn và các việc cần phản hồi để giữ chất lượng dịch vụ.
export default function SellerSupportPage() {
    return (
        <SellerModulePlaceholder
            eyebrow="Chăm sóc khách hàng"
            title="Phản hồi khách hàng nhanh và nhất quán"
            description="Tin nhắn, câu hỏi sản phẩm và hội thoại sau bán sẽ được ưu tiên theo thời gian chờ để seller xử lý kịp."
            primaryAction="Mở hộp thư"
            secondaryAction="Xem mẫu phản hồi"
        />
    );
}

import { SellerModulePlaceholder } from '../../components/SellerModulePlaceholder';

// Trang đánh giá sản phẩm hỗ trợ seller theo dõi phản hồi và cải thiện nội dung bán hàng.
export default function SellerReviewsPage() {
    return (
        <SellerModulePlaceholder
            eyebrow="Chăm sóc khách hàng"
            title="Theo dõi và phản hồi đánh giá sản phẩm"
            description="Seller sẽ thấy đánh giá mới, điểm trung bình, hình ảnh khách gửi và các sản phẩm cần cải thiện chất lượng."
            primaryAction="Phản hồi đánh giá"
            secondaryAction="Lọc đánh giá thấp"
        />
    );
}

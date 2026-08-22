import { SellerModulePlaceholder } from '../../components/SellerModulePlaceholder';

// Trang đối soát giúp kiểm tra từng khoản thu, phí và hoàn tiền theo đơn hàng.
export default function SellerReconciliationPage() {
    return (
        <SellerModulePlaceholder
            eyebrow="Tài chính"
            title="Đối soát doanh thu theo từng kỳ thanh toán"
            description="Màn hình sẽ so sánh doanh thu gộp, phí vận hành, phí hoàn tiền và số tiền thực nhận để seller kiểm tra minh bạch."
            primaryAction="Tải bảng đối soát"
            secondaryAction="Lọc theo kỳ"
        />
    );
}

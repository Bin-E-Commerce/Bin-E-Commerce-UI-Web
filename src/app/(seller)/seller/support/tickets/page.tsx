import { SellerModulePlaceholder } from '../../components/SellerModulePlaceholder';

// Trang khiếu nại tập trung các vấn đề cần seller phối hợp xử lý với hệ thống.
export default function SellerTicketsPage() {
    return (
        <SellerModulePlaceholder
            eyebrow="Chăm sóc khách hàng"
            title="Xử lý khiếu nại và yêu cầu hỗ trợ"
            description="Các ticket về giao hàng, hoàn tiền, thiếu hàng hoặc tranh chấp sẽ được phân loại để seller xử lý đúng hạn."
            primaryAction="Xem ticket mở"
            secondaryAction="Tạo phản hồi mẫu"
        />
    );
}

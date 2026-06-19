import { SellerModulePlaceholder } from '../../components/SellerModulePlaceholder';

// Trang tài khoản ngân hàng quản lý nơi nhận tiền của seller sau khi đối soát.
export default function SellerBankAccountsPage() {
    return (
        <SellerModulePlaceholder
            eyebrow="Tài chính"
            title="Quản lý tài khoản nhận thanh toán"
            description="Seller có thể thêm, xác minh và chọn tài khoản ngân hàng mặc định để nhận tiền từ hệ thống."
            primaryAction="Thêm tài khoản"
            secondaryAction="Xem lịch sử xác minh"
        />
    );
}

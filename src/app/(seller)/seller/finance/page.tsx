import { SellerModulePlaceholder } from '../components/SellerModulePlaceholder';

// Trang tài chính tổng hợp số dư, tiền chờ đối soát và các giao dịch liên quan đến shop.
export default function SellerFinancePage() {
    return (
        <SellerModulePlaceholder
            eyebrow="Tài chính"
            title="Quản lý dòng tiền và số dư người bán"
            description="Seller có thể theo dõi doanh thu, phí sàn, tiền hoàn, số dư khả dụng và lịch rút tiền sau mỗi chu kỳ đối soát."
            primaryAction="Yêu cầu rút tiền"
            secondaryAction="Xem giao dịch"
        />
    );
}

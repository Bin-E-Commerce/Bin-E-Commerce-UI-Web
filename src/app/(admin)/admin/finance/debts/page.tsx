// Route công nợ seller chỉ gắn URL với màn hình client; truy vấn và bảng thuộc feature finance.
import { AdminSellerDebtsPageClient } from '../components/debts/AdminSellerDebtsPageClient';

// Giữ route server mỏng để quyền truy cập vẫn do AdminLayoutShell kiểm tra theo navigation backend.
export default function AdminSellerDebtsPage() {
    return <AdminSellerDebtsPageClient />;
}

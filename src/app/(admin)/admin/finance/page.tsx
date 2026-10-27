// Route trang finance admin chỉ gắn URL với component client điều phối dashboard tài chính.
import { AdminFinancePageClient } from './components/dashboard/AdminFinancePageClient';

// Route server component giữ mỏng; dữ liệu và tương tác tài chính nằm ở client feature boundary.
export default function AdminFinancePage() {
    return <AdminFinancePageClient />;
}

import { ShoppingCart } from 'lucide-react';

import { AdminModulePlaceholder } from '../components/AdminModulePlaceholder';

// Trang đơn hàng admin hiện giữ placeholder rõ ràng để không render màn trắng khi module chưa làm nghiệp vụ.
export default function AdminOrdersPage() {
    return (
        <AdminModulePlaceholder
            icon={ShoppingCart}
            title="Quản lý đơn hàng"
            description="Theo dõi đơn hàng, hoàn tiền, sự cố vận chuyển và các hàng chờ vận hành của nền tảng."
        />
    );
}

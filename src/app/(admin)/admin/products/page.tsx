import { PackageSearch } from 'lucide-react';

import { AdminModulePlaceholder } from '../components/AdminModulePlaceholder';

// Trang sản phẩm admin hiện giữ placeholder rõ ràng để module kiểm duyệt sản phẩm được làm sau.
export default function AdminProductsPage() {
    return (
        <AdminModulePlaceholder
            icon={PackageSearch}
            title="Quản lý sản phẩm"
            description="Kiểm duyệt sản phẩm, dữ liệu hiển thị, trạng thái bán và các cảnh báo chất lượng catalog."
        />
    );
}

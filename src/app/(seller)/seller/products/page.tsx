import { SellerModulePlaceholder } from '../components/SellerModulePlaceholder';

// Trang danh sách sản phẩm chuẩn bị cho bảng sản phẩm, bộ lọc và hành động hàng loạt.
export default function SellerProductsPage() {
    return (
        <SellerModulePlaceholder
            eyebrow="Quản lý sản phẩm"
            title="Quản lý sản phẩm, biến thể và trạng thái bán"
            description="Seller có thể kiểm tra sản phẩm đang bán, sản phẩm bị ẩn, tồn kho thấp và chất lượng nội dung trước khi đẩy lên shop."
            primaryAction="Thêm sản phẩm"
            secondaryAction="Nhập hàng loạt"
        />
    );
}

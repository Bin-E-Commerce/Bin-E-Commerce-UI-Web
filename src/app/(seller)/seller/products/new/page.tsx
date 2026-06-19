import { SellerModulePlaceholder } from '../../components/SellerModulePlaceholder';

// Trang thêm sản phẩm sẽ là form nhiều bước cho thông tin cơ bản, ảnh, biến thể và kho.
export default function SellerNewProductPage() {
    return (
        <SellerModulePlaceholder
            eyebrow="Quản lý sản phẩm"
            title="Tạo sản phẩm mới theo luồng nhiều bước"
            description="Form thêm sản phẩm sẽ tách rõ thông tin bán hàng, phân loại, hình ảnh, mô tả, vận chuyển và tồn kho để hạn chế nhập sai."
            primaryAction="Bắt đầu tạo sản phẩm"
            secondaryAction="Lưu nháp"
        />
    );
}

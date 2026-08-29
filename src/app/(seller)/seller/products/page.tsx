import { SellerProductsPageContent } from './product-list/components/SellerProductsPageContent';

// Route chỉ compose feature danh sách sản phẩm để phần data fetching và UI không dồn vào page.
export default function SellerProductsPage() {
    return <SellerProductsPageContent />;
}

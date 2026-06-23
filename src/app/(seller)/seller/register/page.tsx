import { SellerRegisterForm } from './components/registration-flow/SellerRegisterForm';

// Page đăng ký seller chỉ compose UI onboarding; dữ liệu ngành hàng được lấy qua Catalog Service ở component con.
export default function SellerRegisterPage() {
    return <SellerRegisterForm />;
}

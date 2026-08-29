// File này chỉ lắp checkout feature vào public route; toàn bộ UI và state nằm trong feature folder.

import { CheckoutPageContent } from '@/app/(public)/checkout/components/CheckoutPageContent';

// Trang checkout COD Phase 1 dành cho user đã đăng nhập.
export default function CheckoutPage() {
    return <CheckoutPageContent />;
}

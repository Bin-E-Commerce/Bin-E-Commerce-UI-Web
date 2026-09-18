// File này chỉ lắp checkout feature vào public route; toàn bộ UI và state nằm trong feature folder.

import { Suspense } from 'react';
import { CheckoutPageContent } from '@/app/(public)/checkout/components/checkout-page/CheckoutPageContent';

// Trang checkout COD Phase 1 dành cho user đã đăng nhập.
export default function CheckoutPage() {
    // Bao bọc component đọc query string để Next.js có thể prerender route checkout an toàn.
    return (
        <Suspense fallback={null}>
            <CheckoutPageContent />
        </Suspense>
    );
}

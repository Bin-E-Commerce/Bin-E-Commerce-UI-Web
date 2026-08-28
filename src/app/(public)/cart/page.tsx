// Route này chỉ làm nhiệm vụ lắp UI Cart feature vào Public Layout.
// Logic gọi API, identity và trạng thái render nằm trong feature cart.

import { CartPageContent } from "@/features/cart/components/CartPageContent";

// Trang cart Phase 1 cho cả Guest và Customer.
export default function CartPage() {
    return <CartPageContent />;
}

// Route mong cho dashboard toi uu anh AI.
// Page khong chua fetch hay business rule; feature client tu quan ly selection, polling va dialog.

import { AiOptimizationDashboard } from './_features/image-optimization/components/AiOptimizationDashboard';

// Compose feature screen de layout route giu mong va de thay doi nav path sau nay.
export default function SellerAiOptimizationPage() {
    return <AiOptimizationDashboard />;
}

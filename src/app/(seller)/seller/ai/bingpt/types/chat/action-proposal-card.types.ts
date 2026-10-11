// Props của thẻ proposal; giữ UI callback gắn với proposal đã được backend scope theo shop.
import type { SellerCopilotActionProposal } from '@/services/seller/types/seller-copilot.types';

export interface SellerCopilotActionProposalCardProps {
    proposals: SellerCopilotActionProposal[];
    onConfirm: (proposals: SellerCopilotActionProposal[]) => void;
    onRevise: (
        proposal: SellerCopilotActionProposal,
        nextAvailable: number,
    ) => void;
}

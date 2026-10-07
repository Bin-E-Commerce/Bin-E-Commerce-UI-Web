// Contract hiển thị nội bộ của Seller Copilot; hook con dùng type này để trao đổi message đã normalize.
// File không gọi API, không giữ state và không quyết định quyền truy cập hoặc tenant scope.
import type {
    SellerCapabilityStatusItem,
    SellerCopilotAnswerStatus,
    SellerCopilotCitation,
    SellerCopilotInteractionMode,
} from '@/services/seller/types/seller-copilot.types';
import type { SellerCopilotInsight } from '@/services/seller/types/seller-copilot-insight.types';

export interface SellerCopilotLoadedModeSession {
    interactionMode: SellerCopilotInteractionMode;
    modeSessionId?: string;
}

export interface SellerCopilotChatMessage {
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    interactionMode?: SellerCopilotInteractionMode;
    modeSessionId?: string;
    timelineEvent?: 'mode_changed';
    citations: SellerCopilotCitation[];
    insights: SellerCopilotInsight[];
    suggestedPrompts?: string[];
    warning?: string;
    phase?: string;
    incomplete?: boolean;
    capabilities: SellerCapabilityStatusItem[];
    answerStatus?: SellerCopilotAnswerStatus;
    actionProposal?: {
        proposalId: string;
        productName: string;
        variantName: string;
        currentAvailable: number;
        nextAvailable: number;
        expiresAt: string;
        status: 'pending' | 'completed' | 'failed' | 'expired';
        resultMessage?: string;
        isConfirming?: boolean;
    };
    dataSources?: Array<{
        kind: 'shop_data' | 'live_data' | 'seller_profile';
        label: string;
    }>;
}

// Dữ liệu nguồn đã được chuẩn hóa để component trích dẫn không phụ thuộc state hay API call.
export interface SellerCopilotSourcesProps {
    citations: SellerCopilotCitation[];
}

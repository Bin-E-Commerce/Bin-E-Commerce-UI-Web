// Contract hiển thị nội bộ của Seller Copilot; hook con dùng type này để trao đổi message đã normalize.
// File không gọi API, không giữ state và không quyết định quyền truy cập hoặc tenant scope.
import type {
    SellerCapabilityStatusItem,
    SellerCopilotAnswerStatus,
    SellerCopilotCitation,
} from '@/services/seller/types/seller-copilot.types';

export interface SellerCopilotChatMessage {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    citations: SellerCopilotCitation[];
    insights: Array<Record<string, unknown>>;
    suggestedPrompts?: string[];
    warning?: string;
    capabilities: SellerCapabilityStatusItem[];
    answerStatus?: SellerCopilotAnswerStatus;
}

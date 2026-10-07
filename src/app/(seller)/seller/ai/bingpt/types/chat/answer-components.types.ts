import type { SellerCopilotChatMessage } from './seller-copilot-chat.types';
import type { SellerCopilotInteractionMode } from '@/services/seller/types/seller-copilot.types';

// Contract props cho status và timeline tương tác trong chat BinGPT.
// Type message/insight vận chuyển vẫn thuộc các contract riêng, file này không đổi hành vi component.

// Cho phép trạng thái tiến trình tùy biến, đồng thời cung cấp nhãn mặc định ở component.
export interface SellerCopilotThinkingIndicatorProps {
    message?: string;
}

export interface SellerCopilotInventoryActionCardProps {
    proposal: NonNullable<SellerCopilotChatMessage['actionProposal']>;
    onConfirm: () => void;
}

export interface SellerCopilotModeChangeDividerProps {
    mode: SellerCopilotInteractionMode;
}

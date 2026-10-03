// Chuyển message từ API/history sang shape mà message list cần render.
// Hàm chỉ normalize metadata đã lưu, không gọi API và không suy luận lại dữ liệu seller.
import type { SellerCopilotMessage } from '@/services/seller/types/seller-copilot.types';
import type { SellerCopilotChatMessage } from '../types/seller-copilot-chat.types';

// Khôi phục citation, insight và capability từ metadata để mở lại conversation không làm mất thông tin nguồn.
export function mapPersistedMessage(
    message: SellerCopilotMessage,
): SellerCopilotChatMessage {
    return {
        id: message.id,
        role: message.role,
        content: message.content,
        citations: message.metadata?.citations ?? [],
        insights: message.metadata?.insights ?? [],
        capabilities: message.metadata?.capabilities ?? [],
        answerStatus: message.metadata?.answerStatus,
    };
}

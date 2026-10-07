// Chuyển message và mode đã lưu từ API/history sang shape mà message list/composer cần khôi phục.
// Hàm chỉ normalize metadata đã lưu, không gọi API và không suy luận lại dữ liệu seller.
import type { SellerCopilotMessage } from '@/services/seller/types/seller-copilot.types';
import type { SellerCopilotChatMessage } from '../../types/chat/seller-copilot-chat.types';

// Khôi phục citation, insight và capability từ metadata để mở lại conversation không làm mất thông tin nguồn.
export function mapPersistedMessage(
    message: SellerCopilotMessage,
): SellerCopilotChatMessage {
    const actionProposal = message.metadata?.actionProposal;
    const proposalStatus = actionProposal?.status ?? 'pending';
    const isProposalExpired =
        actionProposal &&
        proposalStatus === 'pending' &&
        new Date(actionProposal.expiresAt).getTime() <= Date.now();

    return {
        id: message.id,
        role: message.role,
        content: message.content,
        interactionMode: message.metadata?.interactionMode,
        modeSessionId: message.metadata?.modeSessionId,
        timelineEvent: message.metadata?.timelineEvent,
        citations: message.metadata?.citations ?? [],
        incomplete: message.metadata?.incomplete,
        insights: message.metadata?.insights ?? [],
        capabilities: message.metadata?.capabilities ?? [],
        answerStatus: message.metadata?.answerStatus,
        dataSources: message.metadata?.dataSources,
        // Dù database còn pending, trình duyệt vẫn khóa một proposal đã quá hạn theo thời gian tuyệt đối.
        actionProposal: actionProposal
            ? {
                  proposalId: actionProposal.proposalId,
                  productName: actionProposal.payload.productName,
                  variantName: actionProposal.payload.variantName,
                  currentAvailable: actionProposal.payload.expectedAvailable,
                  nextAvailable: actionProposal.payload.nextAvailable,
                  expiresAt: actionProposal.expiresAt,
                  status: isProposalExpired ? 'expired' : proposalStatus,
                  resultMessage:
                      typeof actionProposal.result?.message === 'string'
                          ? actionProposal.result.message
                          : undefined,
              }
            : undefined,
    };
}

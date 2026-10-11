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
    const legacyActionProposal = actionProposal
        ? [
              {
                  proposalId: actionProposal.proposalId,
                  batchId: actionProposal.batchId ?? actionProposal.proposalId,
                  payload: actionProposal.payload,
                  expiresAt: actionProposal.expiresAt,
                  status: actionProposal.status,
                  result: actionProposal.result,
              },
          ]
        : [];
    const persistedActionProposals = [
        ...(message.metadata?.actionProposals ?? []),
        ...legacyActionProposal,
    ].filter((proposal) => {
        // Bỏ proposal bật bán của luồng rà soát đã gỡ; dữ liệu lịch sử vẫn được giữ nguyên trong DB.
        return String(proposal.payload.kind) !== 'SET_PRODUCT_STATUS';
    });
    const actionProposalsById = new Map(
        persistedActionProposals.map((proposal) => [
            proposal.proposalId,
            proposal,
        ]),
    );

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
        actionProposal:
            actionProposal?.payload.kind === 'SET_INVENTORY'
                ? {
                      proposalId: actionProposal.proposalId,
                      productName: actionProposal.payload.productName,
                      variantName: actionProposal.payload.variantName,
                      currentAvailable:
                          actionProposal.payload.expectedAvailable,
                      nextAvailable: actionProposal.payload.nextAvailable,
                      expiresAt: actionProposal.expiresAt,
                      status: isProposalExpired ? 'expired' : proposalStatus,
                      resultMessage:
                          typeof actionProposal.result?.message === 'string'
                              ? actionProposal.result.message
                              : undefined,
                  }
                : undefined,
        actionProposals: [...actionProposalsById.values()].map((proposal) => {
            const expired =
                (proposal.status ?? 'pending') === 'pending' &&
                Date.parse(proposal.expiresAt) <= Date.now();
            return {
                proposalId: proposal.proposalId,
                batchId: proposal.batchId,
                payload: proposal.payload,
                expiresAt: proposal.expiresAt,
                status: expired ? 'expired' : (proposal.status ?? 'pending'),
                resultMessage:
                    typeof proposal.result?.message === 'string'
                        ? proposal.result.message
                        : undefined,
            };
        }),
    };
}

// Props đầu vào của workspace chung giữa route chat mới và route conversation cụ thể.
// Route chỉ cung cấp ID; trạng thái, history và message tiếp tục thuộc workspace/hook hiện tại.
export interface SellerCopilotWorkspaceProps {
    initialConversationId?: string;
}

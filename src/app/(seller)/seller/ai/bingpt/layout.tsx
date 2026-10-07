// Layout giữ Seller Copilot tồn tại khi URL đổi giữa trang chat mới và từng conversation.
// Danh sách history vì vậy không bị unmount, reset cursor hay gọi lại API trang đầu khi chuyển phiên.
'use client';

import { useParams } from 'next/navigation';
import SellerCopilotWorkspace from './components/workspace/SellerCopilotWorkspace';

// Giữ workspace ở segment chung và chỉ truyền ID route con; page slot đại diện URL mà không sở hữu state chat.
export default function SellerCopilotLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { conversationId } = useParams<{ conversationId?: string }>();

    // useParams cập nhật khi chọn conversation nhưng layout segment này vẫn được giữ nguyên giữa các lần điều hướng.
    return (
        <>
            <SellerCopilotWorkspace initialConversationId={conversationId} />
            {children}
        </>
    );
}

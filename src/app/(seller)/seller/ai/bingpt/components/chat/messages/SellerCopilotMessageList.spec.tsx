// Kiểm tra message chưa đủ căn cứ được trình bày thân thiện và không lộ citation retrieval không liên quan.
import { render, screen } from '@testing-library/react';
import type { SellerCopilotChatMessage } from '../../../types/chat/seller-copilot-chat.types';
import { SellerCopilotMessageList } from './SellerCopilotMessageList';

// Unsupported answer chỉ hiện lời nhắn kèm icon; citation tìm thấy nhưng không chứng minh nội dung phải bị ẩn.
it('renders a friendly unsupported notice without showing irrelevant sources', () => {
    // Arrange
    const message: SellerCopilotChatMessage = {
        id: 'assistant-1',
        role: 'assistant',
        content:
            'Hiện tại mình chưa tìm thấy tài liệu phù hợp để trả lời câu hỏi này. Bạn có thể liên hệ quản trị viên của shop để được hỗ trợ thêm nhé 🙂.',
        interactionMode: 'knowledge',
        citations: [
            {
                id: 'source-1',
                label: 'Phí giao hàng',
                title: 'Phí giao hàng',
                type: 'seller_knowledge',
                documentId: 'document-1',
            },
        ],
        insights: [],
        capabilities: [],
        answerStatus: 'unsupported',
    };

    // Act
    const { container } = render(
        <SellerCopilotMessageList
            messages={[message]}
            isStreaming={false}
            onSendMessage={jest.fn()}
            onConfirmAction={jest.fn()}
        />,
    );

    // Assert
    expect(screen.getByText(message.content)).toBeInTheDocument();
    expect(container.querySelector('.text-rose-600 svg')).toBeInTheDocument();
    expect(screen.queryByLabelText('Nguồn thông tin')).not.toBeInTheDocument();
    expect(screen.queryByText('Phí giao hàng')).not.toBeInTheDocument();
});

// Shop Data không hiện dòng nguồn live/profile; provenance vẫn có thể lưu trong metadata cho vận hành.
it('hides backend source labels for an answered shop-data message', () => {
    const message: SellerCopilotChatMessage = {
        id: 'assistant-shop-data',
        role: 'assistant',
        content: 'Doanh thu hôm nay là 200.000 đồng.',
        interactionMode: 'shop_data',
        citations: [],
        insights: [],
        capabilities: [],
        dataSources: [{ kind: 'live_data', label: 'Dữ liệu live của shop' }],
    };

    render(
        <SellerCopilotMessageList
            messages={[message]}
            isStreaming={false}
            onSendMessage={jest.fn()}
            onConfirmAction={jest.fn()}
        />,
    );

    expect(screen.queryByText(/Nguồn:/)).not.toBeInTheDocument();
    expect(
        screen.queryByLabelText('Tài liệu tham khảo'),
    ).not.toBeInTheDocument();
});

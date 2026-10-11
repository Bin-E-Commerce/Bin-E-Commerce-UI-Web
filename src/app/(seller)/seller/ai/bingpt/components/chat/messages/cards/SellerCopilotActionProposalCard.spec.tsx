// Kiểm thử giao diện proposal tồn kho mục tiêu: một SKU phải có đúng một ô sửa và lưu đúng proposal.
import { fireEvent, render, screen } from '@testing-library/react';
import { SellerCopilotActionProposalCard } from '@/app/(seller)/seller/ai/bingpt/components/chat/messages/cards/SellerCopilotActionProposalCard';
import type { SellerCopilotActionProposal } from '@/services/seller/types/seller-copilot.types';

// JSDOM hiện không cài PointerEvent nhưng Base UI cần constructor này để mô phỏng click checkbox như trình duyệt thật.
if (!window.PointerEvent) {
    Object.defineProperty(window, 'PointerEvent', {
        configurable: true,
        value: class PointerEventShim extends MouseEvent {
            pointerId = 1;
            pointerType = 'mouse';
            isPrimary = true;
        },
    });
}

// Proposal SET_INVENTORY trực tiếp không có LOW_STOCK reason vẫn phải chỉnh được một mình.
it('shows one editable stock target for one selected SKU proposal', () => {
    // Arrange
    const proposal: SellerCopilotActionProposal = {
        proposalId: 'proposal-1',
        batchId: 'batch-1',
        payload: {
            kind: 'SET_INVENTORY',
            productId: 'product-1',
            productName: 'Áo thun thể thao',
            variantId: 'variant-m',
            variantName: 'Đen / M',
            expectedAvailable: 0,
            nextAvailable: 10,
        },
        expiresAt: '2026-10-09T12:00:00.000Z',
        status: 'pending',
    };
    const onConfirm = jest.fn();
    const onRevise = jest.fn();

    // Act
    render(
        <SellerCopilotActionProposalCard
            proposals={[proposal]}
            onConfirm={onConfirm}
            onRevise={onRevise}
        />,
    );

    // Assert: targeted request is not presented as a batch and has one quantity control only.
    const targetInput = screen.getByRole('spinbutton', {
        name: /tồn kho mới cho áo thun thể thao đen \/ m/i,
    });
    expect(screen.getAllByRole('spinbutton')).toHaveLength(1);
    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
    expect(targetInput).toHaveValue(10);

    // Save only revises the selected proposal; confirmation remains a separate explicit action.
    fireEvent.change(targetInput, { target: { value: '20' } });
    fireEvent.click(screen.getByRole('button', { name: 'Lưu mức mới' }));
    expect(onRevise).toHaveBeenCalledWith(proposal, 20);

    fireEvent.click(screen.getByRole('button', { name: 'Xác nhận' }));
    expect(onConfirm).toHaveBeenCalledWith([proposal]);
});

// Giá trị không nguyên hoặc vượt giới hạn DB không được gửi lên để sửa proposal.
it('disables revision for an invalid target quantity', () => {
    const proposal: SellerCopilotActionProposal = {
        proposalId: 'proposal-2',
        batchId: 'batch-2',
        payload: {
            kind: 'SET_INVENTORY',
            productId: 'product-2',
            productName: 'Giày thể thao',
            variantId: 'variant-42',
            variantName: '42',
            expectedAvailable: 4,
            nextAvailable: 8,
        },
        expiresAt: '2026-10-09T12:00:00.000Z',
        status: 'pending',
    };
    const onRevise = jest.fn();

    // Mức tồn là số nguyên không âm; disabled ở UI giúp tránh request sai nhưng backend vẫn validate độc lập.
    render(
        <SellerCopilotActionProposalCard
            proposals={[proposal]}
            onConfirm={jest.fn()}
            onRevise={onRevise}
        />,
    );
    fireEvent.change(screen.getByRole('spinbutton'), {
        target: { value: '2.5' },
    });

    expect(screen.getByRole('button', { name: 'Lưu mức mới' })).toBeDisabled();
    expect(onRevise).not.toHaveBeenCalled();
});

// Đề xuất xả hàng là nhiều SKU có tác động giá; không được chọn sẵn trước hành động tường minh của seller.
it('leaves slow-moving price recommendations unselected until the seller chooses them', () => {
    const proposals: SellerCopilotActionProposal[] = [
        'variant-1',
        'variant-2',
    ].map((variantId, index) => ({
        proposalId: `proposal-${index + 1}`,
        batchId: 'batch-clearance',
        payload: {
            kind: 'SET_VARIANT_PRICE',
            productId: `product-${index + 1}`,
            productName: `Sản phẩm ${index + 1}`,
            variantId,
            variantName: 'Đen / M',
            expectedPrice: 200000,
            nextPrice: 180000,
            minimumPrice: 150000,
            priceRecommendation: {
                kind: 'SLOW_MOVING_CLEARANCE',
                available: 12,
                quantitySold: 2,
                periodDays: 30,
                requestedDiscountPercent: 10,
                effectiveDiscountPercent: 10,
            },
        },
        expiresAt: '2026-10-09T12:00:00.000Z',
        status: 'pending',
    }));
    const onConfirm = jest.fn();
    const onRevise = jest.fn();

    render(
        <SellerCopilotActionProposalCard
            proposals={proposals}
            onConfirm={onConfirm}
            onRevise={onRevise}
        />,
    );

    expect(screen.getAllByText(/bán 2 trong 30 ngày/i)).toHaveLength(2);
    expect(screen.getAllByText(/giá sàn 150\.000đ/i)).toHaveLength(2);
    expect(screen.getByRole('button', { name: 'Xác nhận các dòng đã chọn' })).toBeDisabled();

    const checkboxes = screen.getAllByRole('checkbox');
    fireEvent.click(checkboxes[1]!);
    fireEvent.click(screen.getByRole('button', { name: 'Xác nhận các dòng đã chọn' }));
    expect(onConfirm).toHaveBeenCalledWith([proposals[0]]);
});

// Trạng thái hoàn tất phải có nhãn rõ ràng và phần tóm tắt không còn báo 0 thay đổi chờ xác nhận.
it('shows a success summary and status for an applied proposal', () => {
    const proposal: SellerCopilotActionProposal = {
        proposalId: 'proposal-applied',
        batchId: 'batch-applied',
        payload: {
            kind: 'SET_INVENTORY',
            productId: 'product-applied',
            productName: 'Áo thun thể thao',
            variantId: 'variant-s',
            variantName: 'Đen / S',
            expectedAvailable: 0,
            nextAvailable: 2,
        },
        expiresAt: '2026-10-09T12:00:00.000Z',
        status: 'completed',
        resultMessage: 'Đã cập nhật tồn khả dụng thành 2.',
    };

    render(
        <SellerCopilotActionProposalCard
            proposals={[proposal]}
            onConfirm={jest.fn()}
            onRevise={jest.fn()}
        />,
    );

    expect(
        screen.getByText('1 thay đổi đã được áp dụng thành công.'),
    ).toBeInTheDocument();
    const appliedStatus = screen.getByText('Đã áp dụng').closest('span');
    expect(appliedStatus).toHaveClass(
        'border-zinc-300',
        'bg-zinc-100',
        'text-zinc-800',
    );
    expect(appliedStatus?.className).not.toMatch(/emerald|green/);
    expect(screen.getByText('Đã cập nhật tồn khả dụng thành 2.')).toHaveClass(
        'border-zinc-200',
        'bg-zinc-50',
        'text-zinc-800',
    );
    expect(
        screen.queryByRole('button', { name: 'Xác nhận' }),
    ).not.toBeInTheDocument();
});

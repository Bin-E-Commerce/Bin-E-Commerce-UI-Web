// Kiểm tra dữ liệu nguồn và insight có cấu trúc không mất khi chuyển message API thành lịch sử UI.
import type { SellerCopilotMessage } from '@/services/seller/types/seller-copilot.types';
import { mapPersistedMessage } from './map-persisted-message';

// Khôi phục chart/profile insight cùng đúng provenance để reload hội thoại không đổi cách trình bày.
it('restores persisted shop sources and structured insights', () => {
    const message = {
        id: 'assistant-1',
        role: 'assistant',
        content: 'Doanh thu đã tăng trong kỳ này.',
        metadata: {
            dataSources: [
                { kind: 'live_data', label: 'Dữ liệu live của shop' },
            ],
            insights: [
                {
                    type: 'REVENUE_TREND',
                    range: { from: '2026-10-01', to: '2026-10-02' },
                    points: [
                        { date: '2026-10-01', grossRevenue: 100000 },
                        { date: '2026-10-02', grossRevenue: 200000 },
                    ],
                },
            ],
        },
        createdAt: '2026-10-02T00:00:00.000Z',
    } satisfies SellerCopilotMessage;

    const restored = mapPersistedMessage(message);

    expect(restored.dataSources).toEqual(message.metadata?.dataSources);
    expect(restored.insights).toEqual(message.metadata?.insights);
});

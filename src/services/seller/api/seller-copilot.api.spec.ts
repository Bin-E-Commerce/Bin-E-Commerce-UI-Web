// Kiểm tra parser SSE: chỉ event done mới xác nhận thành công và event error phải nổi lên thành lỗi UI.
import { TextDecoder, TextEncoder } from 'node:util';
import {
    startSellerCopilotModeSession,
    streamSellerCopilot,
} from '@/services/seller/api/seller-copilot.api';
import type { SellerCopilotStreamEvent } from '@/services/seller/types/seller-copilot.types';

describe('streamSellerCopilot', () => {
    let originalFetch: PropertyDescriptor | undefined;
    let originalTextDecoder: PropertyDescriptor | undefined;
    let originalTextEncoder: PropertyDescriptor | undefined;

    // Cài fetch giả mà không phụ thuộc fetch implementation có sẵn trong jsdom.
    beforeEach(() => {
        originalFetch = Object.getOwnPropertyDescriptor(globalThis, 'fetch');
        originalTextDecoder = Object.getOwnPropertyDescriptor(
            globalThis,
            'TextDecoder',
        );
        originalTextEncoder = Object.getOwnPropertyDescriptor(
            globalThis,
            'TextEncoder',
        );
        Object.defineProperty(globalThis, 'TextDecoder', {
            configurable: true,
            value: TextDecoder,
        });
        Object.defineProperty(globalThis, 'TextEncoder', {
            configurable: true,
            value: TextEncoder,
        });
    });

    // Khôi phục global fetch để test khác không bị ảnh hưởng bởi transport giả.
    afterEach(() => {
        if (originalFetch) {
            Object.defineProperty(globalThis, 'fetch', originalFetch);
        } else {
            Reflect.deleteProperty(globalThis, 'fetch');
        }
        if (originalTextDecoder) {
            Object.defineProperty(
                globalThis,
                'TextDecoder',
                originalTextDecoder,
            );
        } else {
            Reflect.deleteProperty(globalThis, 'TextDecoder');
        }
        if (originalTextEncoder) {
            Object.defineProperty(
                globalThis,
                'TextEncoder',
                originalTextEncoder,
            );
        } else {
            Reflect.deleteProperty(globalThis, 'TextEncoder');
        }
    });

    // Mô phỏng reader chia response thành các chunk tùy ý như mạng thật, kể cả khi chunk cắt giữa một event.
    function mockSseResponse(chunks: string[]) {
        let nextChunk = 0;
        const reader = {
            read: jest.fn(async () => {
                if (nextChunk >= chunks.length) return { done: true };
                const value = new TextEncoder().encode(chunks[nextChunk]);
                nextChunk += 1;
                return { done: false, value };
            }),
            cancel: jest.fn().mockResolvedValue(undefined),
            releaseLock: jest.fn(),
        };
        const mockFetch = jest.fn().mockResolvedValue({
            ok: true,
            body: { getReader: () => reader },
        });

        Object.defineProperty(globalThis, 'fetch', {
            configurable: true,
            value: mockFetch,
        });

        return { mockFetch, reader };
    }

    // Event hoàn tất được chấp nhận dù dữ liệu bị chia giữa nhiều chunk.
    it('should parse split SSE chunks and resolve only after done', async () => {
        // Arrange
        const { mockFetch } = mockSseResponse([
            'event: started\ndata: {"type":"started","conversationId":"c-1",',
            '"requestId":"r-1"}\n\nevent: done\ndata: {"type":"done","dataAsOf":"now",',
            '"citations":[],"latencyMs":4}\n\n',
        ]);
        const receivedEvents: SellerCopilotStreamEvent[] = [];
        const onEvent = jest.fn((event: SellerCopilotStreamEvent) =>
            receivedEvents.push(event),
        );

        // Act
        await streamSellerCopilot(
            {
                accessToken: 'token',
                message: 'Câu hỏi',
                signal: new AbortController().signal,
            },
            onEvent,
        );

        // Assert
        expect(mockFetch).toHaveBeenCalledTimes(1);
        expect(JSON.parse(mockFetch.mock.calls[0]?.[1]?.body)).toEqual({
            message: 'Câu hỏi',
            interactionMode: 'chat',
        });
        expect(receivedEvents.map((event) => event.type)).toEqual([
            'started',
            'done',
        ]);
    });

    // Nếu proxy đóng mà chưa phát done, hook phải nhận lỗi thay vì tắt loading như một câu trả lời thành công.
    it('should reject an incomplete stream that ends without done', async () => {
        // Arrange
        mockSseResponse([
            'event: token\ndata: {"type":"token","text":"Đang trả lời"}\n\n',
        ]);
        const receivedEvents: SellerCopilotStreamEvent[] = [];
        const onEvent = jest.fn((event: SellerCopilotStreamEvent) =>
            receivedEvents.push(event),
        );

        // Act & Assert
        await expect(
            streamSellerCopilot(
                {
                    accessToken: 'token',
                    message: 'Câu hỏi',
                    signal: new AbortController().signal,
                },
                onEvent,
            ),
        ).rejects.toThrow('Kết nối BinGPT bị gián đoạn trước khi hoàn tất.');
        expect(receivedEvents).toHaveLength(1);
    });

    // SSE error từ Seller/Gateway được chuyển thành lỗi để hook hiển thị trạng thái retry thay vì nuốt event.
    it('should reject an SSE error event with the server message', async () => {
        // Arrange
        const { reader } = mockSseResponse([
            'event: error\ndata: {"type":"error","code":"STREAM_FAILED",',
            '"retryable":true,"message":"Bạn thử lại nhé."}\n\n',
        ]);
        const receivedEvents: SellerCopilotStreamEvent[] = [];
        const onEvent = jest.fn((event: SellerCopilotStreamEvent) =>
            receivedEvents.push(event),
        );

        // Act & Assert
        await expect(
            streamSellerCopilot(
                {
                    accessToken: 'token',
                    message: 'Câu hỏi',
                    signal: new AbortController().signal,
                },
                onEvent,
            ),
        ).rejects.toThrow('Bạn thử lại nhé.');
        expect(reader.cancel).toHaveBeenCalledTimes(1);
        expect(onEvent).not.toHaveBeenCalled();
    });
});

describe('startSellerCopilotModeSession', () => {
    // Mode switch phải gửi đúng mode tới endpoint Gateway và chỉ tin session trả từ backend.
    it('should persist the selected mode and return the server session', async () => {
        // Arrange
        const originalFetch = globalThis.fetch;
        const mockFetch = jest.fn().mockResolvedValue({
            ok: true,
            status: 200,
            json: jest.fn().mockResolvedValue({
                modeSessionId: 'session-knowledge',
                interactionMode: 'knowledge',
            }),
        });
        globalThis.fetch = mockFetch as unknown as typeof fetch;

        try {
            // Act
            const result = await startSellerCopilotModeSession(
                'conversation-1',
                'knowledge',
                { accessToken: 'token' },
            );

            // Assert
            expect(result).toEqual({
                modeSessionId: 'session-knowledge',
                interactionMode: 'knowledge',
            });
            expect(mockFetch).toHaveBeenCalledWith(
                expect.stringContaining(
                    '/seller/ai/copilot/conversations/conversation-1/mode-sessions',
                ),
                expect.objectContaining({
                    method: 'POST',
                    body: JSON.stringify({ interactionMode: 'knowledge' }),
                }),
            );
        } finally {
            globalThis.fetch = originalFetch;
        }
    });
});

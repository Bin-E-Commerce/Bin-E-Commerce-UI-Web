// File này là transport client cho endpoint SSE của Seller Copilot.
// Nó không lưu token, không chọn shop và không biến response stream thành một JSON response duy nhất.
import { API_BASE_URL, API_VERSION } from '@/config/api.config';
import type {
    SellerCopilotConversation,
    SellerCopilotConversationDetail,
    SellerCopilotConversationPage,
    SellerCopilotInteractionMode,
    SellerCopilotInventoryActionResult,
    SellerCopilotSearchResult,
    SellerCopilotStreamEvent,
} from '@/services/seller/types/seller-copilot.types';

interface StreamInput {
    accessToken: string;
    conversationId?: string;
    message: string;
    interactionMode?: SellerCopilotInteractionMode;
    modeSessionId?: string;
    signal?: AbortSignal;
}

interface AuthenticatedRequestInput {
    accessToken: string;
    signal?: AbortSignal;
    method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
    body?: BodyInit;
}

// Gọi endpoint JSON của Copilot với cùng header auth như stream để history và chat dùng chung một boundary.
// Hàm chỉ đọc response và ném lỗi HTTP có status rõ ràng; nó không tự retry để tránh tạo request lặp ngoài ý muốn.
async function requestSellerCopilotJson<T>(
    path: string,
    input: AuthenticatedRequestInput,
): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${API_VERSION}${path}`, {
        method: input.method ?? 'GET',
        credentials: 'include',
        signal: input.signal,
        headers: {
            Authorization: `Bearer ${input.accessToken}`,
            'X-Requested-With': 'XMLHttpRequest',
            ...(input.body ? { 'Content-Type': 'application/json' } : {}),
        },
        body: input.body,
    });

    if (!response.ok) {
        let message = `Yêu cầu BinGPT thất bại (${response.status}).`;
        try {
            const payload = (await response.json()) as { message?: unknown };
            if (typeof payload.message === 'string' && payload.message.trim()) {
                message = payload.message;
            }
        } catch {
            // Proxy có thể trả body rỗng/không phải JSON; status HTTP vẫn đủ để báo lỗi tổng quát.
        }
        throw new Error(message);
    }

    if (response.status === 204) return undefined as T;
    return (await response.json()) as T;
}

// Đọc tối đa 20 phiên gần nhất; backend đã lọc theo owner và shop nên frontend không truyền scope tenant.
export function listSellerCopilotConversations(
    input: AuthenticatedRequestInput & {
        offset?: number;
        limit?: number;
    },
): Promise<SellerCopilotConversationPage> {
    const params = new URLSearchParams({
        offset: String(input.offset ?? 0),
        limit: String(input.limit ?? 20),
    });
    return requestSellerCopilotJson<SellerCopilotConversationPage>(
        `/seller/ai/copilot/conversations?${params.toString()}`,
        input,
    );
}

// Tìm conversation theo title và nội dung message; server vẫn là nơi áp ownership/shop scope.
export function searchSellerCopilotConversations(
    query: string,
    input: AuthenticatedRequestInput,
): Promise<SellerCopilotSearchResult[]> {
    return requestSellerCopilotJson<SellerCopilotSearchResult[]>(
        `/seller/ai/copilot/conversations/search?q=${encodeURIComponent(query)}`,
        input,
    );
}

// Mở lại một phiên thuộc seller hiện tại và lấy trang message mới nhất hoặc trang cũ hơn cursor.
// Cursor chỉ dùng để đọc ngược lịch sử, không cho client truyền owner/shop scope.
export function getSellerCopilotConversation(
    conversationId: string,
    input: AuthenticatedRequestInput,
    options: { before?: string; limit?: number } = {},
): Promise<SellerCopilotConversationDetail> {
    const params = new URLSearchParams();
    if (options.before) params.set('before', options.before);
    if (options.limit) params.set('limit', String(options.limit));
    const query = params.toString();

    return requestSellerCopilotJson<SellerCopilotConversationDetail>(
        `/seller/ai/copilot/conversations/${conversationId}${query ? `?${query}` : ''}`,
        input,
    );
}

// Set trạng thái ghim cho conversation; backend kiểm tra owner/shop nên frontend không truyền tenant scope.
export function setSellerCopilotConversationPinned(
    conversationId: string,
    isPinned: boolean,
    input: AuthenticatedRequestInput,
): Promise<SellerCopilotConversation> {
    return requestSellerCopilotJson<SellerCopilotConversation>(
        `/seller/ai/copilot/conversations/${conversationId}/pin`,
        {
            ...input,
            method: 'PATCH',
            body: JSON.stringify({ isPinned }),
        },
    );
}

// Đổi title conversation qua API Gateway; backend chuẩn hóa title và kiểm tra owner/shop scope.
export function renameSellerCopilotConversation(
    conversationId: string,
    title: string,
    input: AuthenticatedRequestInput,
): Promise<SellerCopilotConversation> {
    return requestSellerCopilotJson<SellerCopilotConversation>(
        `/seller/ai/copilot/conversations/${conversationId}/title`,
        {
            ...input,
            method: 'PATCH',
            body: JSON.stringify({ title }),
        },
    );
}

// Xóa vĩnh viễn conversation qua Gateway; response 204 không có body nên transport helper tự bỏ qua bước parse JSON.
export function deleteSellerCopilotConversation(
    conversationId: string,
    input: AuthenticatedRequestInput,
): Promise<void> {
    return requestSellerCopilotJson<void>(
        `/seller/ai/copilot/conversations/${conversationId}`,
        {
            ...input,
            method: 'DELETE',
        },
    );
}

// Tạo phiên context mới cho mode đích; server lưu divider và tự xác minh conversation theo user/shop hiện tại.
export async function startSellerCopilotModeSession(
    conversationId: string,
    interactionMode: SellerCopilotInteractionMode,
    input: AuthenticatedRequestInput,
): Promise<{
    modeSessionId: string;
    interactionMode: SellerCopilotInteractionMode;
}> {
    return requestSellerCopilotJson(
        `/seller/ai/copilot/conversations/${conversationId}/mode-sessions`,
        {
            ...input,
            method: 'POST',
            body: JSON.stringify({ interactionMode }),
        },
    );
}

// Xác nhận đề xuất đúng một lần; proposalId là tham chiếu opaque, backend tự ràng buộc user/shop và kiểm tra tồn mới nhất.
export function confirmSellerCopilotInventoryAction(
    proposalId: string,
    input: AuthenticatedRequestInput,
    onEvent?: (event: SellerCopilotStreamEvent) => void,
): Promise<SellerCopilotInventoryActionResult> {
    return (async () => {
        const response = await fetch(
            `${API_BASE_URL}${API_VERSION}/seller/ai/copilot/actions/${proposalId}/confirm`,
            {
                method: 'POST',
                credentials: 'include',
                signal: input.signal,
                headers: {
                    Authorization: `Bearer ${input.accessToken}`,
                    'X-Requested-With': 'XMLHttpRequest',
                },
            },
        );
        if (!response.ok) {
            const body = await response.text();
            let message: string | undefined;
            try {
                const payload = JSON.parse(body) as { message?: unknown };
                if (typeof payload.message === 'string')
                    message = payload.message;
            } catch {
                // Gateway có thể trả body không phải JSON; phía dưới sẽ dùng thông báo HTTP tổng quát.
            }
            throw new Error(
                message ?? `Không thể xác nhận đề xuất (${response.status}).`,
            );
        }
        if (!response.body) {
            throw new Error('BinGPT không mở được luồng xác nhận tồn kho.');
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        let result: SellerCopilotInventoryActionResult | undefined;
        // Phân tích từng khối SSE hoàn chỉnh để status/kết quả tới UI ngay cả khi Product Service đang xử lý lâu.
        const consumeBlock = (block: string) => {
            const dataLine = block
                .split(/\r?\n/u)
                .find((line) => line.startsWith('data:'));
            if (!dataLine) return;
            const event = JSON.parse(
                dataLine.slice(5).trimStart(),
            ) as SellerCopilotStreamEvent;
            onEvent?.(event);
            if (event.type !== 'action_result') return;
            if (event.status !== 'completed') throw new Error(event.message);
            result = {
                proposalId: event.proposalId,
                status: event.status,
                message: event.message,
                availableQuantity: event.availableQuantity ?? 0,
            };
        };

        try {
            while (true) {
                const { done, value } = await reader.read();
                buffer += decoder.decode(value ?? new Uint8Array(), {
                    stream: !done,
                });
                const blocks = buffer.split(/\r?\n\r?\n/u);
                buffer = blocks.pop() ?? '';
                for (const block of blocks) consumeBlock(block);
                if (done) break;
            }
            if (buffer.trim()) consumeBlock(buffer);
        } catch (error) {
            await reader.cancel(error).catch(() => undefined);
            throw error;
        } finally {
            reader.releaseLock();
        }
        if (!result)
            throw new Error('BinGPT chưa nhận được kết quả cập nhật tồn kho.');
        return result;
    })();
}

// Gửi POST và parse SSE theo từng dòng vì EventSource không hỗ trợ request body.
// Buffer giữ lại dòng chưa hoàn chỉnh giữa các network chunk; event/data pairing
// bảo đảm token và metadata chỉ được chuyển tới hook khi payload đã hoàn chỉnh.
// AbortSignal đi xuyên suốt để nút Stop hủy request thật thay vì chỉ dừng render UI.
export async function streamSellerCopilot(
    input: StreamInput,
    onEvent: (event: SellerCopilotStreamEvent) => void,
) {
    const response = await fetch(
        `${API_BASE_URL}${API_VERSION}/seller/ai/copilot/chat/stream`,
        {
            method: 'POST',
            credentials: 'include',
            signal: input.signal,
            headers: {
                Authorization: `Bearer ${input.accessToken}`,
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
            },
            body: JSON.stringify({
                conversationId: input.conversationId,
                message: input.message,
                interactionMode: input.interactionMode ?? 'chat',
                modeSessionId: input.modeSessionId,
            }),
        },
    );

    if (!response.ok || !response.body) {
        throw new Error(`BinGPT request failed: ${response.status}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let eventName = '';
    let dataLines: string[] = [];
    let receivedDoneEvent = false;

    // Chỉ chuyển event hoàn chỉnh; error phải reject request và mọi EOF thiếu done được xem là stream hỏng.
    const dispatchEvent = () => {
        if (dataLines.length === 0) {
            eventName = '';
            return;
        }

        const event = JSON.parse(
            dataLines.join('\n'),
        ) as SellerCopilotStreamEvent;
        dataLines = [];
        const matchesEventName = !eventName || event.type === eventName;
        eventName = '';
        if (!matchesEventName) return;
        if (event.type === 'error') throw new Error(event.message);
        if (event.type === 'done') receivedDoneEvent = true;
        onEvent(event);
    };

    // SSE có thể chia một dòng qua nhiều chunk; chỉ dispatch khi gặp dòng trống phân cách event.
    const processLine = (rawLine: string) => {
        const line = rawLine.trimEnd();
        if (!line) {
            dispatchEvent();
        } else if (line.startsWith('event:')) {
            eventName = line.slice(6).trim();
        } else if (line.startsWith('data:')) {
            dataLines.push(line.slice(5).trimStart());
        }
    };

    try {
        while (true) {
            const { done, value } = await reader.read();
            buffer += decoder.decode(value ?? new Uint8Array(), {
                stream: !done,
            });
            const lines = buffer.split('\n');
            buffer = lines.pop() ?? '';

            for (const line of lines) {
                processLine(line);
            }

            if (done) break;
        }

        // Xử lý dòng cuối nếu server/proxy đóng stream mà chunk cuối không có newline.
        if (buffer) processLine(buffer);
        dispatchEvent();

        if (!receivedDoneEvent && !input.signal?.aborted) {
            throw new Error(
                'Kết nối BinGPT bị gián đoạn trước khi hoàn tất. Bạn thử lại giúp mình nhé.',
            );
        }
    } catch (error) {
        // Hủy phần body còn lại sau lỗi SSE để upstream nhận biết client không cần tiếp tục gửi dữ liệu.
        if (!input.signal?.aborted)
            await reader.cancel(error).catch(() => undefined);
        throw error;
    } finally {
        reader.releaseLock();
    }
}

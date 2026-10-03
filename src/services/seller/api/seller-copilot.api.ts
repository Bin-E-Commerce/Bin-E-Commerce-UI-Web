// File này là transport client cho endpoint SSE của Seller Copilot.
// Nó không lưu token, không chọn shop và không biến response stream thành một JSON response duy nhất.
import { API_BASE_URL, API_VERSION } from '@/config/api.config';
import type {
    SellerCopilotConversation,
    SellerCopilotConversationDetail,
    SellerCopilotConversationPage,
    SellerCopilotRange,
    SellerCopilotSearchResult,
    SellerCopilotStreamEvent,
} from '@/services/seller/types/seller-copilot.types';

interface StreamInput {
    accessToken: string;
    conversationId?: string;
    message: string;
    range: SellerCopilotRange;
    signal?: AbortSignal;
}

interface AuthenticatedRequestInput {
    accessToken: string;
    signal?: AbortSignal;
    method?: 'GET' | 'PATCH' | 'DELETE';
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
        throw new Error(`BinGPT request failed: ${response.status}`);
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
                range: input.range,
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

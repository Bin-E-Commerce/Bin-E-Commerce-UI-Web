// Adapter này gửi behavioral signal theo kiểu fire-and-forget; lỗi tracking không được làm gián đoạn checkout hay browsing.

import { API_VERSION } from '@/config/api.config';
import authorizedAxios from '@/utils/authorizedAxios';
import type {
    RecommendationResponse,
    TrackRecommendationInteractionInput,
} from '../types/recommendation.types';
import {
    clearRecommendationSession,
    getRecommendationSessionId,
    getStoredRecommendationSessionId,
} from '../session';

export { getRecommendationSessionId } from '../session';

// Gửi interaction tới Gateway với session header; caller luôn tự xử lý lỗi để tracking không ảnh hưởng UX.
export async function trackRecommendationInteraction(
    input: TrackRecommendationInteractionInput,
): Promise<void> {
    const sessionId = getRecommendationSessionId();
    await authorizedAxios.post(`${API_VERSION}/recommendation/events`, input, {
        headers: sessionId ? { 'X-Session-Id': sessionId } : undefined,
    });
}

// Gửi nhiều impression trong một request; chỉ dùng cho tín hiệu thụ động đã được queue ở client.
export async function trackRecommendationInteractions(
    inputs: TrackRecommendationInteractionInput[],
    sessionId = getRecommendationSessionId(),
): Promise<void> {
    if (inputs.length === 0) return;
    await authorizedAxios.post(
        API_VERSION + '/recommendation/events/batch',
        { events: inputs },
        { headers: sessionId ? { 'X-Session-Id': sessionId } : undefined },
    );
}

// Đọc recommendation qua Gateway và gửi session header để backend phân biệt guest với user đã đăng nhập.
export async function getRecommendations(input: {
    surface: 'home' | 'product_detail' | 'recommendations_page';
    productId?: string;
    page?: number;
    pageSize?: number;
}): Promise<RecommendationResponse> {
    const sessionId = getRecommendationSessionId();
    return authorizedAxios
        .get<RecommendationResponse>(
            `${API_VERSION}/recommendation/recommendations`,
            {
                params: input,
                headers: sessionId ? { 'X-Session-Id': sessionId } : undefined,
            },
        )
        .then((response) => response.data);
}

// Gộp hành vi guest sau login để user không mất context đã tạo trước khi xác thực.
export async function mergeRecommendationSession(): Promise<void> {
    // Không tạo guest session mới chỉ vì user vừa refresh trang khi chưa từng browse.
    const sessionId = getStoredRecommendationSessionId();
    if (!sessionId) return;
    await authorizedAxios.post(`${API_VERSION}/recommendation/profile/merge`, {
        sessionId,
    });
    // Request đã thành công; dù server trả merged=false, session không được giữ lại
    // vì nó có thể đã được merge với user khác sau một lần response bị mất.
    clearRecommendationSession();
}

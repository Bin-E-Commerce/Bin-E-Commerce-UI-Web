// Adapter này gửi behavioral signal theo kiểu fire-and-forget; lỗi tracking không được làm gián đoạn checkout hay browsing.

import { API_VERSION } from '@/config/api.config';
import authorizedAxios from '@/utils/authorizedAxios';
import type {
    RecommendationResponse,
    TrackRecommendationInteractionInput,
} from '../types/recommendation.types';

const RECOMMENDATION_SESSION_KEY = 'bin-ecommerce:recommendation-session-id';

// Tạo session UUID ổn định cho guest để các event trước login vẫn có thể gom theo một phiên.
// Tạo và giữ session UUID ổn định để guest có profile theo phiên trước khi đăng nhập.
export function getRecommendationSessionId(): string | null {
    if (typeof window === 'undefined') return null;

    const savedSessionId = window.localStorage.getItem(
        RECOMMENDATION_SESSION_KEY,
    );
    if (savedSessionId) return savedSessionId;

    const sessionId = window.crypto.randomUUID();
    window.localStorage.setItem(RECOMMENDATION_SESSION_KEY, sessionId);
    return sessionId;
}

// Gửi interaction tới Gateway với session header; caller luôn tự xử lý lỗi để tracking không ảnh hưởng UX.
export async function trackRecommendationInteraction(
    input: TrackRecommendationInteractionInput,
): Promise<void> {
    const sessionId = getRecommendationSessionId();
    await authorizedAxios.post(`${API_VERSION}/recommendation/events`, input, {
        headers: sessionId ? { 'X-Session-Id': sessionId } : undefined,
    });
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
    const sessionId = getRecommendationSessionId();
    if (!sessionId) return;
    await authorizedAxios.post(`${API_VERSION}/recommendation/profile/merge`, {
        sessionId,
    });
}

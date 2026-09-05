// Adapter này gửi behavioral signal theo kiểu fire-and-forget; lỗi tracking không được làm gián đoạn checkout hay browsing.

import { API_VERSION } from '@/config/api.config';
import authorizedAxios from '@/utils/authorizedAxios';
import type { TrackRecommendationInteractionInput } from '../types/recommendation.types';

const RECOMMENDATION_SESSION_KEY = 'bin-ecommerce:recommendation-session-id';

// Tạo session UUID ổn định cho guest để các event trước login vẫn có thể gom theo một phiên.
function getGuestSessionId(): string | null {
    if (typeof window === 'undefined') return null;

    const savedSessionId = window.localStorage.getItem(RECOMMENDATION_SESSION_KEY);
    if (savedSessionId) return savedSessionId;

    const sessionId = window.crypto.randomUUID();
    window.localStorage.setItem(RECOMMENDATION_SESSION_KEY, sessionId);
    return sessionId;
}

// Gửi interaction tới Gateway với session header; caller luôn tự xử lý lỗi để tracking không ảnh hưởng UX.
export async function trackRecommendationInteraction(
    input: TrackRecommendationInteractionInput,
): Promise<void> {
    const sessionId = getGuestSessionId();
    await authorizedAxios.post(`${API_VERSION}/recommendation/events`, input, {
        headers: sessionId ? { 'X-Session-Id': sessionId } : undefined,
    });
}

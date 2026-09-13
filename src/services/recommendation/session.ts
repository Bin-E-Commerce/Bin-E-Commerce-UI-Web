// Utility quản lý guest recommendation session; file này không gọi HTTP để dùng an toàn từ auth slice.

const RECOMMENDATION_SESSION_KEY = 'bin-ecommerce:recommendation-session-id';
export const RECOMMENDATION_SESSION_CHANGED_EVENT =
    'bin-ecommerce:recommendation-session-changed';
const UUID_V4_PATTERN =
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

// Chỉ đọc session đã được tạo hợp lệ; giá trị localStorage bị sửa sẽ được thay bằng UUID mới.
export function getStoredRecommendationSessionId(): string | null {
    if (typeof window === 'undefined') return null;
    const savedSessionId = window.localStorage.getItem(
        RECOMMENDATION_SESSION_KEY,
    );
    if (!savedSessionId) return null;
    if (UUID_V4_PATTERN.test(savedSessionId)) return savedSessionId;
    window.localStorage.removeItem(RECOMMENDATION_SESSION_KEY);
    return null;
}

// Tạo session ổn định cho guest để các interaction cùng browser được gom thành một intent.
export function getRecommendationSessionId(): string | null {
    if (typeof window === 'undefined') return null;
    const storedSessionId = getStoredRecommendationSessionId();
    if (storedSessionId) return storedSessionId;
    const sessionId = window.crypto.randomUUID();
    window.localStorage.setItem(RECOMMENDATION_SESSION_KEY, sessionId);
    return sessionId;
}

// Xóa session sau login/logout để context đã gắn với user cũ không bị dùng lại cho guest kế tiếp.
export function clearRecommendationSession(): void {
    if (typeof window !== 'undefined') {
        window.localStorage.removeItem(RECOMMENDATION_SESSION_KEY);
        window.dispatchEvent(new Event(RECOMMENDATION_SESSION_CHANGED_EVENT));
    }
}

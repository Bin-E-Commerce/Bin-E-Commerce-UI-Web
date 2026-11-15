// Health check tối giản tới API Gateway để xác nhận server đã hồi phục.
// Request này không đi qua Axios monitor, tránh tự kích hoạt popup hoặc tạo vòng lặp theo dõi.

import { API_BASE_URL, API_VERSION } from '@/config/api.config';

const HEALTH_CHECK_TIMEOUT_MS = 3_000;

// Gọi health endpoint không cache, chỉ nhận payload trạng thái "ok" và tự hủy sau 3 giây.
export async function checkApiGatewayHealth(): Promise<boolean> {
    const controller = new AbortController();
    const timeoutId = window.setTimeout(
        () => controller.abort(),
        HEALTH_CHECK_TIMEOUT_MS,
    );

    try {
        const response = await fetch(`${API_BASE_URL}${API_VERSION}/health`, {
            method: 'GET',
            cache: 'no-store',
            signal: controller.signal,
        });

        if (!response.ok) return false;

        // Endpoint có thể trả HTTP 200 khi trạng thái degraded; không coi response đó là hồi phục.
        const payload: unknown = await response.json();
        if (!payload || typeof payload !== 'object') return false;

        return 'status' in payload && payload.status === 'ok';
    } catch {
        return false;
    } finally {
        window.clearTimeout(timeoutId);
    }
}

// Health check tối giản tới API Gateway để xác nhận server đã hồi phục.
// Request này không đi qua Axios monitor, tránh tự kích hoạt popup hoặc tạo vòng lặp theo dõi.

import { API_BASE_URL, API_VERSION } from '@/config/api.config';

const HEALTH_CHECK_TIMEOUT_MS = 3_000;

// Gọi health endpoint không cache và tự hủy sau 3 giây để popup không giữ request vô hạn.
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

        return response.ok;
    } catch {
        return false;
    } finally {
        window.clearTimeout(timeoutId);
    }
}

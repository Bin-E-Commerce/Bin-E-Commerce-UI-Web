// Health check tối giản tới API Gateway để xác nhận server đã hồi phục.
// Request này không đi qua Axios monitor, tránh tự kích hoạt popup hoặc tạo vòng lặp theo dõi.

import { API_BASE_URL, API_VERSION } from '@/config/api.config';

const HEALTH_CHECK_TIMEOUT_MS = 3_000;

// Gọi health endpoint không cache để xác nhận Gateway còn phản hồi, rồi tự hủy sau 3 giây.
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

        // Trạng thái degraded mô tả route downstream, nhưng HTTP 200 xác nhận Gateway còn sống và popup EC2 không phù hợp.
        const payload: unknown = await response.json();
        if (!payload || typeof payload !== 'object') return false;

        return 'service' in payload && payload.service === 'api-gateway';
    } catch {
        return false;
    } finally {
        window.clearTimeout(timeoutId);
    }
}

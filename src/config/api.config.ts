// Cấu hình API đích và header khi truy cập qua tunnel ngrok.
// Không đặt bí mật vì cấu hình này được đưa vào bundle client.
export const API_VERSION = '/api/v1' as const;
export const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

// Ngrok Free trả HTML cảnh báo nếu browser request thiếu header bỏ qua.
export const API_REQUEST_HEADERS: Record<string, string> =
    API_BASE_URL.includes('.ngrok-free.app')
        ? { 'ngrok-skip-browser-warning': 'true' }
        : {};

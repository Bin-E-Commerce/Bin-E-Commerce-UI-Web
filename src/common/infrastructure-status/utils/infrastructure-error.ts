// Bộ phân loại lỗi hạ tầng ở biên HTTP của trình duyệt.
// Lỗi nghiệp vụ và lỗi quyền không được biến thành cảnh báo EC2 để tránh làm nhiễu người dùng.

const INFRASTRUCTURE_STATUS_CODES = new Set([502, 503, 504]);
const INFRASTRUCTURE_ERROR_CODES = new Set([
    'ECONNABORTED',
    'ETIMEDOUT',
    'ERR_NETWORK',
]);

type ErrorLike = {
    code?: unknown;
    message?: unknown;
    response?: { status?: unknown };
};

// Chỉ nhận diện timeout/network/gateway failure; 4xx vẫn được giao cho feature hiển thị lỗi riêng.
export function isInfrastructureError(error: unknown): boolean {
    if (!error || typeof error !== 'object') return false;

    const candidate = error as ErrorLike;
    const status = candidate.response?.status;
    const code = candidate.code;

    if (typeof status === 'number' && INFRASTRUCTURE_STATUS_CODES.has(status)) {
        return true;
    }

    if (typeof code === 'string' && INFRASTRUCTURE_ERROR_CODES.has(code)) {
        return true;
    }

    return candidate.message === 'Network Error';
}

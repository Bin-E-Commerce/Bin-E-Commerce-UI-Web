// File gửi request public tới API Gateway mà không cần access token.
// Nó cấu hình cookie và các header cần thiết cho request từ trình duyệt.
import axios from 'axios';
import {
    API_BASE_URL,
    API_REQUEST_HEADERS,
    API_VERSION,
} from '@/config/api.config';
import {
    completeAxiosRequest,
    trackAxiosRequest,
} from '@/common/infrastructure-status/monitor/infrastructure-status.monitor';

// Create public axios instance for login/register (no auth header required)
const publicAxios = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true, // Để nhận httpOnly cookies (refresh_token) sau khi đăng ký/đăng nhập
    timeout: 10000,
    headers: {
        ...API_REQUEST_HEADERS,
        'Content-Type': 'application/json',
        // Gửi header này để api-gateway's CsrfGuard chấp nhận state-changing request.
        // Trình duyệt không cho phép trang web khác domain tự gắn header này vào cross-site request.
        'X-Requested-With': 'XMLHttpRequest',
    },
});

// Theo dõi request public để nhận biết API/Gateway pending hoặc không khả dụng.
publicAxios.interceptors.request.use((config) => {
    trackAxiosRequest(config);
    return config;
});

// Response interceptor - Selective error handling
publicAxios.interceptors.response.use(
    (response) => {
        completeAxiosRequest(response.config);
        return response;
    },
    (error) => {
        completeAxiosRequest(error.config, error);
        // Không log error khi /auth/refresh fail (hành vi bình thường khi chưa đăng nhập hoặc service chưa chạy)
        const isRefreshError = error.config?.url?.includes(
            `${API_VERSION}/auth/refresh`,
        );

        if (!isRefreshError) {
            console.error(
                'Public API Error:',
                error.response?.data?.message || error.message,
            );
        }

        return Promise.reject(error);
    },
);

export default publicAxios;

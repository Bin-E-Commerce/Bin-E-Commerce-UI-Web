import axios from 'axios';
import { API_BASE_URL, API_VERSION } from '@/config/api.config';

// Create public axios instance for login/register (no auth header required)
const publicAxios = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true, // Để nhận httpOnly cookies (refresh_token) sau khi đăng ký/đăng nhập
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
        // Gửi header này để api-gateway's CsrfGuard chấp nhận state-changing request.
        // Trình duyệt không cho phép trang web khác domain tự gắn header này vào cross-site request.
        'X-Requested-With': 'XMLHttpRequest',
    },
});

// Response interceptor - Selective error handling
publicAxios.interceptors.response.use(
    (response) => response,
    (error) => {
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

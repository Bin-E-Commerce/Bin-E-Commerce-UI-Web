// Mục đích của file này là tạo ra một instance axios
// có khả năng tự động refresh access token khi nhận được lỗi 401 Unauthorized từ server,
// đồng thời quản lý việc dispatch các action liên quan đến authentication trong Redux store.
// Điều này giúp đảm bảo trải nghiệm người dùng mượt mà hơn, tránh việc bị ngắt quãng khi token hết hạn
// và cần phải đăng nhập lại.
import axios, { AxiosError } from 'axios';
import type { InternalAxiosRequestConfig } from 'axios';
import type { AppStore } from '@/store';
import { API_BASE_URL, API_VERSION } from '@/config/api.config';
import { setAuth, logoutUser } from '@/store/slices/authSlice';

// Mở rộng interface InternalAxiosRequestConfig để thêm thuộc tính _retry,
interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
    _retry?: boolean; // Dùng để đánh dấu rằng request đã được thử lại sau khi refresh token, tránh việc lặp vô hạn nếu refresh token cũng bị lỗi hoặc không hợp lệ
}

// Biến toàn cục để lưu trữ reference đến Redux store,
// cho phép chúng ta truy cập state và dispatch actions từ interceptor của axios
let appStore: AppStore | null = null;

export const setAppStore = (store: AppStore) => {
    appStore = store;
};

// Tạo instance axios với cấu hình cơ bản, bao gồm baseURL và withCredentials để gửi cookie
const authorizedAxios = axios.create({
    baseURL: API_BASE_URL,
    timeout: 1000 * 60 * 10,
    withCredentials: true, // Để gửi httpOnly refresh_token cookie tự động
    headers: {
        // Gửi header này để api-gateway's CsrfGuard chấp nhận state-changing request.
        'X-Requested-With': 'XMLHttpRequest',
    },
});

let refreshTokenPromise: Promise<boolean> | null = null;
let subscribers: ((ok: boolean) => void)[] = []; // Danh sách các callback function đang chờ kết quả của việc refresh token

// Hàm này sẽ được gọi sau khi quá trình refresh token hoàn tất,
// để thông báo cho tất cả các request đang chờ biết kết quả của việc refresh token (thành công hay thất bại)
// và tiếp tục xử lý tương ứng (retry request hoặc logout)
function onRefreshed(success: boolean) {
    subscribers.forEach((cb) => cb(success));
    subscribers = [];
}

// Request interceptor — attach access token vào header Authorization của mỗi request
// nếu token tồn tại trong Redux store
authorizedAxios.interceptors.request.use(
    (config) => {
        const token = appStore?.getState().auth.accessToken;
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        // Gửi sessionId hiện tại để backend/gateway nhận diện request thuộc phiên nào.
        const sessionId = appStore?.getState().auth.sessionId;
        if (sessionId) {
            config.headers['X-Session-Id'] = sessionId;
        }
        return config;
    },
    (error) => Promise.reject(error),
);

// Response interceptor — xử lý lỗi 401 Unauthorized, tự động gọi refresh token và retry request nếu cần thiết
authorizedAxios.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        // Kiểm tra nếu lỗi là 401 Unauthorized và request chưa được thử lại trước đó
        const originalRequest = error.config as CustomAxiosRequestConfig;

        // Nếu lỗi 401 xảy ra trên request refresh token → logout ngay, không retry
        // Nếu lỗi 401 xảy ra trên request khác và chưa retry → thử refresh token
        // Nếu refresh token thành công → retry request gốc với token mới
        // Nếu refresh token thất bại → logout người dùng để đảm bảo an toàn cho hệ thống
        if (error.response?.status === 401 && originalRequest) {
            // Nếu request thất bại là chính request refresh token → logout
            if (originalRequest.url?.includes(`${API_VERSION}/auth/refresh`)) {
                appStore?.dispatch(logoutUser());
                return Promise.reject(error);
            }

            // Nếu request thất bại là chính request logout → không retry, chỉ clear state.
            // Tránh vòng lặp: logout 401 → refresh → dispatch(logoutUser()) → logout 401 → ...
            if (originalRequest.url?.includes(`${API_VERSION}/auth/logout`)) {
                appStore?.dispatch(logoutUser());
                return Promise.reject(error);
            }

            // Nếu request đã được thử lại trước đó mà vẫn nhận được 401 → logout để tránh vòng lặp vô hạn
            if (originalRequest._retry) {
                appStore?.dispatch(logoutUser());
                return Promise.reject(error);
            }

            // Đánh dấu request này đã được thử lại để tránh lặp vô hạn nếu refresh token cũng bị lỗi
            originalRequest._retry = true;

            // Nếu đã có một request refresh token đang chờ xử lý,
            // không tạo thêm request mới mà chỉ thêm callback vào subscribers để chờ kết quả
            if (!refreshTokenPromise) {
                refreshTokenPromise = import('@/services/auth.service')
                    .then(({ authService }) => authService.refresh())
                    .then((res) => {
                        // Nếu refresh token thành công và nhận được access token mới,
                        // cập nhật Redux store và thông báo cho các request đang chờ biết kết quả
                        if (res?.data?.accessToken) {
                            appStore?.dispatch(
                                setAuth({
                                    accessToken: res.data.accessToken,
                                    sessionId: res.data.sessionId,
                                    user: res.data.user,
                                }),
                            );
                            onRefreshed(true); // Thông báo cho các request đang chờ biết rằng refresh token thành công
                            return true;
                        }
                        onRefreshed(false);
                        return false;
                    })
                    .catch(() => {
                        onRefreshed(false);
                        appStore?.dispatch(logoutUser());
                        return false;
                    })
                    .finally(() => {
                        refreshTokenPromise = null;
                    });
            }

            // Trả về một Promise mới cho request gốc,
            // sẽ được resolve hoặc reject sau khi quá trình refresh token hoàn tất
            return new Promise((resolve, reject) => {
                subscribers.push((ok: boolean) => {
                    // Nếu refresh token thành công,
                    // retry request gốc với token mới đã được cập nhật trong header Authorization
                    if (ok) {
                        // Lấy token mới từ Redux store sau khi refresh thành công
                        const token = appStore?.getState().auth.accessToken;

                        // Cập nhật header Authorization của request gốc với token mới
                        if (token)
                            originalRequest.headers.Authorization = `Bearer ${token}`;
                        resolve(authorizedAxios(originalRequest)); // Retry request gốc với token mới
                    } else {
                        reject(error);
                    }
                });
            });
        }

        return Promise.reject(error);
    },
);

export default authorizedAxios;

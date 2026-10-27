// File này sở hữu transport có xác thực cho Axios và Fetch trong trình duyệt.
// Nó đồng bộ access token với Redux, refresh một lần khi gặp 401 và giữ nguyên
// quy tắc không retry request guest hoặc request mang token của phiên cũ.
import axios, { AxiosError } from 'axios';
import type { InternalAxiosRequestConfig } from 'axios';
import type { AppStore } from '@/store';
import {
    API_BASE_URL,
    API_REQUEST_HEADERS,
    API_VERSION,
} from '@/config/api.config';
import { clearAuth, setAuth, syncAuthViewer } from '@/store/slices/authSlice';
import {
    completeAxiosRequest,
    trackAxiosRequest,
} from '@/common/infrastructure-status/monitor/infrastructure-status.monitor';

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
        ...API_REQUEST_HEADERS,
        // Gửi header này để api-gateway's CsrfGuard chấp nhận state-changing request.
        'X-Requested-With': 'XMLHttpRequest',
    },
});

let refreshTokenPromise: Promise<string | null> | null = null;
let accessProfileSyncPromise: Promise<void> | null = null;

// Dùng chung một lần refresh trong tab; auth API sẽ khóa thêm giữa các tab cùng origin.
// Token mới được cập nhật vào Redux trước khi trả về để request retry và React cùng thấy một phiên.
export function refreshAccessToken(): Promise<string | null> {
    if (!refreshTokenPromise) {
        refreshTokenPromise = import('@/services/auth')
            .then(({ authService }) => authService.refresh())
            .then((response) => {
                const accessToken = response?.data?.accessToken;
                if (!accessToken) return null;

                appStore?.dispatch(
                    setAuth({
                        accessToken,
                        sessionId: response.data.sessionId,
                        user: response.data.user,
                    }),
                );
                return accessToken;
            })
            .catch(() => null)
            .finally(() => {
                refreshTokenPromise = null;
            });
    }

    return refreshTokenPromise;
}

// Gọi Fetch bằng token đang mới nhất; nếu gặp 401, thử token vừa được request khác cập nhật hoặc refresh cookie đúng một lần.
// Trả nguyên Response cuối cùng để mỗi caller tự phân tích lỗi/JSON/SSE theo hợp đồng riêng của endpoint.
export async function authorizedFetch(
    input: RequestInfo | URL,
    init: RequestInit = {},
    fallbackAccessToken?: string | null,
): Promise<Response> {
    const send = (accessToken: string) => {
        const headers = new Headers(init.headers);
        // Bỏ qua trang cảnh báo ngrok để fetch nhận JSON API thay vì HTML trung gian.
        for (const [name, value] of Object.entries(API_REQUEST_HEADERS)) {
            headers.set(name, value);
        }
        headers.set('Authorization', `Bearer ${accessToken}`);
        headers.set('X-Requested-With', 'XMLHttpRequest');

        return fetch(input, {
            ...init,
            credentials: init.credentials ?? 'include',
            headers,
        });
    };

    const accessToken =
        appStore?.getState().auth.accessToken ?? fallbackAccessToken;
    if (!accessToken) {
        return fetch(input, {
            ...init,
            credentials: init.credentials ?? 'include',
        });
    }

    const response = await send(accessToken);
    if (response.status !== 401 || init.signal?.aborted) return response;

    // Nếu một request khác đã refresh xong, retry token mới luôn thay vì rotate refresh cookie thêm lần nữa.
    const latestAccessToken = appStore?.getState().auth.accessToken;
    if (latestAccessToken && latestAccessToken !== accessToken) {
        return send(latestAccessToken);
    }

    const refreshedAccessToken = await refreshAccessToken();
    if (!refreshedAccessToken) {
        appStore?.dispatch(clearAuth());
        return response;
    }

    return send(refreshedAccessToken);
}

// Đồng bộ accessProfile tối đa một lần khi nhiều request cùng nhận 403.
// Request bị từ chối vẫn giữ nguyên 403; dữ liệu mới chỉ giúp layout chuyển user sang màn hình deny ngay sau đó.
function synchronizeAccessProfileAfterForbidden(): void {
    if (!appStore || accessProfileSyncPromise) return;

    accessProfileSyncPromise = appStore
        .dispatch(syncAuthViewer())
        .unwrap()
        .then(() => undefined)
        .catch(() => undefined)
        .finally(() => {
            accessProfileSyncPromise = null;
        });
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
        // Giữ session header tường minh của recommendation để guest session trước login không bị auth session ghi đè khi merge.
        if (sessionId && !config.headers['X-Session-Id']) {
            config.headers['X-Session-Id'] = sessionId;
        }

        trackAxiosRequest(config);
        return config;
    },
    (error) => Promise.reject(error),
);

// Response interceptor — xử lý lỗi 401 Unauthorized, tự động gọi refresh token và retry request nếu cần thiết
authorizedAxios.interceptors.response.use(
    (response) => {
        completeAxiosRequest(response.config);
        return response;
    },
    async (error: AxiosError) => {
        completeAxiosRequest(error.config, error);
        // Kiểm tra nếu lỗi là 401 Unauthorized và request chưa được thử lại trước đó
        const originalRequest = error.config as CustomAxiosRequestConfig;

        // Chỉ xử lý request 401 có token; request guest hoặc request thuộc phiên cũ không được phép xóa phiên hiện tại.
        if (error.response?.status === 401 && originalRequest) {
            const currentAccessToken = appStore?.getState().auth.accessToken;
            const authorizationHeader =
                originalRequest.headers?.Authorization ??
                originalRequest.headers?.authorization;
            const requestAccessToken =
                typeof authorizationHeader === 'string'
                    ? authorizationHeader.replace(/^Bearer\s+/i, '')
                    : undefined;

            if (!currentAccessToken || !requestAccessToken) {
                return Promise.reject(error);
            }

            // Các endpoint xác thực đặc biệt không được refresh đệ quy; chỉ xóa state nếu logout bị từ chối.
            if (
                originalRequest.url?.includes(`${API_VERSION}/auth/refresh`) ||
                originalRequest.url?.includes(`${API_VERSION}/auth/logout`)
            ) {
                appStore?.dispatch(clearAuth());
                return Promise.reject(error);
            }

            // Một request đã retry mà vẫn 401 là lỗi xác thực cuối cùng; dừng tại đây để không tạo vòng lặp.
            if (originalRequest._retry) {
                if (requestAccessToken === currentAccessToken) {
                    appStore?.dispatch(clearAuth());
                }
                return Promise.reject(error);
            }

            originalRequest._retry = true;

            // Nếu request cũ tới trễ sau khi một request khác đã refresh, dùng token mới hiện tại để retry.
            if (requestAccessToken !== currentAccessToken) {
                originalRequest.headers.Authorization = `Bearer ${currentAccessToken}`;
                return authorizedAxios(originalRequest);
            }

            const refreshedAccessToken = await refreshAccessToken();
            if (!refreshedAccessToken) {
                appStore?.dispatch(clearAuth());
                return Promise.reject(error);
            }

            originalRequest.headers.Authorization = `Bearer ${refreshedAccessToken}`;
            return authorizedAxios(originalRequest);
        }

        if (
            error.response?.status === 403 &&
            originalRequest &&
            !originalRequest.url?.includes(`${API_VERSION}/auth/me`)
        ) {
            // Permission có thể vừa bị admin thu hồi ở phiên khác; lấy lại viewer để menu và route guard phản ánh ngay.
            synchronizeAccessProfileAfterForbidden();
        }

        return Promise.reject(error);
    },
);

export default authorizedAxios;

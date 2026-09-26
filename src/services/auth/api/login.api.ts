import { API_BASE_URL, API_VERSION } from '@/config/api.config';
import authorizedAxios from '@/utils/authorizedAxios';
import publicAxios from '@/utils/publicAxios';
import type {
    ApiResponse,
    AuthData,
    AuthUser,
    LoginPayload,
} from '../types/auth.types';

const BASE = `${API_BASE_URL}${API_VERSION}/auth`;

// Refresh token được rotate sau mỗi lần dùng nên mọi caller trong cùng một tab
// phải dùng chung một request. Nếu không, StoreProvider và interceptor có thể
// gửi đồng thời hai token giống nhau; request đến sau sẽ bị backend từ chối.
let refreshPromise: ReturnType<
    typeof publicAxios.post<ApiResponse<AuthData>>
> | null = null;

// Gọi API đăng nhập bằng email/password và trả về token cùng thông tin người dùng.
export function login(payload: LoginPayload) {
    return publicAxios
        .post<ApiResponse<AuthData>>(`${BASE}/login`, payload)
        .then((response) => response.data);
}

// Khôi phục phiên bằng httpOnly refresh_token cookie để người dùng không phải đăng nhập lại sau khi reload.
export function refresh() {
    if (!refreshPromise) {
        refreshPromise = publicAxios
            .post<ApiResponse<AuthData>>(`${BASE}/refresh`, {})
            .finally(() => {
                refreshPromise = null;
            });
    }

    return refreshPromise.then((response) => response.data);
}

// Lấy viewer hiện tại từ access token mà không rotate refresh token, phù hợp khi chỉ cần đồng bộ roles/permissions.
export function getViewer() {
    return authorizedAxios
        .get<ApiResponse<AuthUser>>(`${BASE}/me`)
        .then((response) => response.data);
}

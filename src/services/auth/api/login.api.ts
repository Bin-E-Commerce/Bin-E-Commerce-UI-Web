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
type RefreshResponse = Awaited<
    ReturnType<typeof publicAxios.post<ApiResponse<AuthData>>>
>;

// Refresh token được rotate sau mỗi lần dùng nên caller cùng tab phải dùng chung request.
// Web Locks tuần tự hóa thêm giữa các tab cùng origin để tab sau đọc cookie đã được rotate.
let refreshPromise: ReturnType<
    typeof publicAxios.post<ApiResponse<AuthData>>
> | null = null;

// Gọi API đăng nhập bằng email/password và trả về token cùng thông tin người dùng.
export function login(payload: LoginPayload) {
    return publicAxios
        .post<ApiResponse<AuthData>>(`${BASE}/login`, payload)
        .then((response) => response.data);
}

// Khôi phục phiên bằng httpOnly cookie; cùng tab gộp request và các tab dùng Web Lock chung trước khi rotate.
export function refresh() {
    if (!refreshPromise) {
        const requestRefresh = () =>
            publicAxios.post<ApiResponse<AuthData>>(`${BASE}/refresh`, {});
        const lockManager =
            typeof navigator !== 'undefined' ? navigator.locks : undefined;

        // Cookie được chia sẻ giữa các tab; khóa origin đảm bảo mỗi lần refresh đọc cookie mới nhất.
        const refreshRequest: Promise<RefreshResponse> = lockManager
            ? lockManager
                  .request<Promise<RefreshResponse>>(
                      'bin-ecommerce-auth-refresh',
                      requestRefresh,
                  )
                  .then((response) => response)
            : requestRefresh();

        refreshPromise = refreshRequest.finally(() => {
            refreshPromise = null;
        });
    }

    const activeRefresh = refreshPromise!;
    return activeRefresh.then((response) => response.data);
}

// Lấy viewer hiện tại từ access token mà không rotate refresh token, phù hợp khi chỉ cần đồng bộ roles/permissions.
export function getViewer() {
    return authorizedAxios
        .get<ApiResponse<AuthUser>>(`${BASE}/me`)
        .then((response) => response.data);
}

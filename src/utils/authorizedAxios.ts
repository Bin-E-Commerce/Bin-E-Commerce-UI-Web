import axios, { AxiosError } from "axios";
import type { InternalAxiosRequestConfig } from "axios";
import type { AppStore } from "@/store";
import { setAuth, logoutUser } from "@/store/slices/authSlice";

// Extend Axios config để thêm flag `_retry`
interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

// Khai báo biến lưu store (inject sau)
let appStore: AppStore | null = null;

// Hàm để inject store từ bên ngoài
export const setAppStore = (store: AppStore) => {
  appStore = store;
};

// Tạo Axios instance
const authorizedAxios = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3001",
  timeout: 1000 * 60 * 10, // 10 phút
  withCredentials: true,
});

// Biến lưu promise refresh (để tránh gọi nhiều lần)
let refreshTokenPromise: Promise<unknown> | null = null;

// Hàng đợi request chờ refresh
let subscribers: ((ok: boolean) => void)[] = [];

// Khi refresh xong thì gọi toàn bộ request đang chờ
function onRefreshed(success: boolean) {
  subscribers.forEach((cb) => cb(success));
  subscribers = [];
}

// Request interceptor
authorizedAxios.interceptors.request.use(
  (config) => config,
  (error) => Promise.reject(error)
);

// Response interceptor
authorizedAxios.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as CustomAxiosRequestConfig;

    // ===== 401 Unauthorized =====
    if (error.response?.status === 401) {
      // Nếu gọi profile → fail bình thường
      if (originalRequest?.url?.includes("/api/v1/auth/profile")) {
        return Promise.reject(error);
      }

      // Nếu gọi refresh API → logout
      if (originalRequest?.url?.includes("/api/v1/auth/refresh")) {
        appStore?.dispatch(logoutUser()); // dùng thunk logout
        return Promise.reject(error);
      }

      // Nếu đã retry rồi → logout
      if (originalRequest._retry) {
        appStore?.dispatch(logoutUser());
        return Promise.reject(error);
      }

      // Đánh dấu request đã retry
      originalRequest._retry = true;

      // Nếu chưa có refreshPromise → gọi refresh
      if (!refreshTokenPromise) {
        refreshTokenPromise = import("@/services/authServices")
          .then(({ authServices }) => authServices.refreshToken())
          .then((result) => {
            if (result.statusCode === 200 && result.data?.user) {
              appStore?.dispatch(
                setAuth({
                  user: result.data.user,
                  isLoggedIn: true,
                })
              );
              onRefreshed(true); // báo các request chờ retry
            } else {
              throw new Error("Refresh failed");
            }
          })
          .catch((refreshError) => {
            appStore?.dispatch(logoutUser());
            onRefreshed(false);
            return Promise.reject(refreshError);
          })
          .finally(() => {
            refreshTokenPromise = null;
          });
      }

      // Các request khác sẽ chờ refresh xong
      return new Promise((resolve, reject) => {
        subscribers.push((success) => {
          if (success) {
            resolve(authorizedAxios(originalRequest));
          } else {
            reject(error);
          }
        });
      });
    }

    // ===== 410 Gone (token expired hoàn toàn) =====
    if (error.response?.status === 410 && !originalRequest._retry) {
      originalRequest._retry = true;

      if (!refreshTokenPromise) {
        refreshTokenPromise = Promise.resolve()
          .then(() => {
            throw new Error("Token expired completely");
          })
          .catch((refreshError) => {
            appStore?.dispatch(logoutUser());
            return Promise.reject(refreshError);
          })
          .finally(() => {
            refreshTokenPromise = null;
          });
      }

      return refreshTokenPromise.then(() => Promise.reject(error));
    }

    return Promise.reject(error);
  }
);

export default authorizedAxios;

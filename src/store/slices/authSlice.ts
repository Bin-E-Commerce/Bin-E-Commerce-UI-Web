import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { authService, type AuthUser } from '@/services/auth.service';

interface AuthState {
    accessToken: string | null;
    user: AuthUser | null;
    // initialized: true sau khi initAuth chạy xong (dù đăng nhập hay không), để app biết đã check xong session restore và có thể render giao diện phù hợp
    // Ví dụ nếu chưa init xong thì có thể chỉ render loading spinner, tránh việc render giao diện cho guest rồi sau đó lại chuyển sang giao diện cho user đã đăng nhập (hoặc ngược lại) sau khi init
    initialized: boolean; // true sau khi initAuth chạy xong (dù đăng nhập hay không),
}

const initialState: AuthState = {
    accessToken: null,
    user: null,
    initialized: false,
};

// Gọi 1 lần khi app mount — dùng httpOnly cookie để restore session (1 API call duy nhất)
export const initAuth = createAsyncThunk(
    'auth/initAuth',
    async (): Promise<{ accessToken: string; user: AuthUser } | null> => {
        try {
            const res = await authService.refresh();
            if (res?.data?.accessToken) {
                return {
                    accessToken: res.data.accessToken,
                    user: res.data.user,
                };
            }

            // Nếu không có access token mới (ví dụ: refresh token đã hết hạn hoặc không hợp lệ),
            // trả về null để app biết rằng không có session nào được restore
            return null;
        } catch {
            return null; // Chưa đăng nhập — không throw, chỉ trả null
        }
    },
);

export const logoutUser = createAsyncThunk(
    'auth/logoutUser',
    async (_, { rejectWithValue }) => {
        try {
            await authService.logout();
        } catch (error) {
            console.error('Logout API failed:', error);
            // Dù server có lỗi, vẫn dùng rejectWithValue để luồng logout ở client không bị ngắt.
            return rejectWithValue(null);
        }
    },
);

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setAuth(
            state,
            action: PayloadAction<{ accessToken: string; user?: AuthUser }>,
        ) {
            state.accessToken = action.payload.accessToken;
            if (action.payload.user) state.user = action.payload.user;
            state.initialized = true;
        },
        clearAuth(state) {
            state.accessToken = null;
            state.user = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(initAuth.fulfilled, (state, action) => {
                if (action.payload) {
                    state.accessToken = action.payload.accessToken;
                    state.user = action.payload.user;
                }
                state.initialized = true;
            })
            .addCase(initAuth.rejected, (state) => {
                state.initialized = true;
            })
            // Khi logout bắt đầu: set initialized = false → hiện skeleton, tránh flicker
            .addCase(logoutUser.pending, (state) => {
                state.initialized = false;
            })
            // Dù logout thành công hay thất bại, vẫn xóa sạch auth state ở client
            .addCase(logoutUser.fulfilled, (state) => {
                state.accessToken = null;
                state.user = null;
                state.initialized = true;
            })
            .addCase(logoutUser.rejected, (state) => {
                state.accessToken = null;
                state.user = null;
                state.initialized = true;
            });
    },
});

export const { setAuth, clearAuth } = authSlice.actions;
export default authSlice.reducer;

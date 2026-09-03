// Provider khởi tạo Redux store duy nhất cho toàn bộ vòng đời client app.
// Provider không chứa business logic; chỉ kết nối store với React tree và axios interceptor.

'use client';

import { useEffect, useState } from 'react';
import { Provider } from 'react-redux';
import { makeStore } from '@/store';
import type { AppStore } from '@/store';
import { initAuth } from '@/store/slices/authSlice';
import { setAppStore } from '@/utils/authorizedAxios';

// Tạo store một lần bằng lazy state để giá trị truyền vào Provider an toàn với React Compiler.
// Store được giữ ổn định trong suốt vòng đời provider, tránh mất state khi component re-render.
export function StoreProvider({ children }: { children: React.ReactNode }) {
    const [store] = useState<AppStore>(() => makeStore());

    // Khi component được mount, inject store vào authorizedAxios và dispatch initAuth để restore session
    // Mục đích của useEffect này là để đảm bảo rằng khi ứng dụng khởi động,
    // chúng ta sẽ có reference đến Redux store trong authorizedAxios
    // để interceptor của axios có thể truy cập state và dispatch actions (như setAuth sau khi refresh token thành công)
    // Đồng thời, chúng ta dispatch initAuth một lần duy nhất khi app mount để gọi API refresh token và restore session nếu có
    // Nếu refresh token hợp lệ và nhận được access token mới, session sẽ được restore và user sẽ được đăng nhập tự động
    // Nếu refresh token không hợp lệ hoặc đã hết hạn, session sẽ không được restore và user sẽ ở trạng thái chưa đăng nhập,
    // nhưng app vẫn hoạt động bình thường mà không bị lỗi gì cả
    useEffect(() => {
        // Dùng cùng instance store với Provider để interceptor và React đọc/ghi một nguồn state duy nhất.
        setAppStore(store);
        // 1 API call duy nhất để restore session: POST /auth/refresh (dùng httpOnly cookie)
        store.dispatch(initAuth());
    }, [store]);

    return <Provider store={store}>{children}</Provider>;
}

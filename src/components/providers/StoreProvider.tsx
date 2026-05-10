'use client';

import { useRef, useEffect } from 'react';
import { Provider } from 'react-redux';
import { makeStore } from '@/store';
import type { AppStore } from '@/store';
import { initAuth } from '@/store/slices/authSlice';
import { setAppStore } from '@/utils/authorizedAxios';

export function StoreProvider({ children }: { children: React.ReactNode }) {
    // Dùng useRef để tạo một reference đến store,
    // đảm bảo store chỉ được tạo một lần duy nhất trong suốt vòng đời của ứng dụng
    const storeRef = useRef<AppStore | null>(null);

    // Nếu store chưa được tạo, tạo mới và gán vào storeRef.current
    if (storeRef.current === null) {
        storeRef.current = makeStore();
    }

    // Khi component được mount, inject store vào authorizedAxios và dispatch initAuth để restore session
    // Mục đích của useEffect này là để đảm bảo rằng khi ứng dụng khởi động,
    // chúng ta sẽ có reference đến Redux store trong authorizedAxios
    // để interceptor của axios có thể truy cập state và dispatch actions (như setAuth sau khi refresh token thành công)
    // Đồng thời, chúng ta dispatch initAuth một lần duy nhất khi app mount để gọi API refresh token và restore session nếu có
    // Nếu refresh token hợp lệ và nhận được access token mới, session sẽ được restore và user sẽ được đăng nhập tự động
    // Nếu refresh token không hợp lệ hoặc đã hết hạn, session sẽ không được restore và user sẽ ở trạng thái chưa đăng nhập,
    // nhưng app vẫn hoạt động bình thường mà không bị lỗi gì cả
    useEffect(() => {
        // Lấy reference đến store từ storeRef và inject vào authorizedAxios để interceptor có thể truy cập
        const store = storeRef.current!;
        setAppStore(store);
        // 1 API call duy nhất để restore session: POST /auth/refresh (dùng httpOnly cookie)
        store.dispatch(initAuth());
    }, []);

    return <Provider store={storeRef.current}>{children}</Provider>;
}

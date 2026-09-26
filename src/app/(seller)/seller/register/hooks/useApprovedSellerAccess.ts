'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { canAccessSellerCenter } from '@/services/auth/access';
import type { SellerApplicationStatus } from '@/services/seller';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { syncAuthViewer } from '@/store/slices/authSlice';

const SELLER_ACCESS_SYNC_DELAYS_MS = [0, 400, 900, 1600] as const;

// Đồng bộ quyền Seller Center sau khi hồ sơ được duyệt và chỉ điều hướng khi Auth Service đã trả quyền mới.
export function useApprovedSellerAccess(
    applicationStatus: SellerApplicationStatus | null,
) {
    const dispatch = useAppDispatch();
    const router = useRouter();
    const canEnterSellerCenter = useAppSelector((state) =>
        canAccessSellerCenter(state.auth.user),
    );
    const [syncingSellerAccess, setSyncingSellerAccess] = useState(false);
    const [sellerAccessUnavailable, setSellerAccessUnavailable] =
        useState(false);
    const automaticSyncStartedRef = useRef(false);

    // Retry có giới hạn để che khoảng trễ rất ngắn giữa event duyệt hồ sơ và consumer cấp role SELLER.
    const synchronizeSellerAccess = useCallback(async (): Promise<boolean> => {
        for (const delayMs of SELLER_ACCESS_SYNC_DELAYS_MS) {
            if (delayMs > 0) await wait(delayMs);

            const result = await dispatch(syncAuthViewer());
            if (
                syncAuthViewer.fulfilled.match(result) &&
                canAccessSellerCenter(result.payload)
            ) {
                return true;
            }
        }

        return false;
    }, [dispatch]);

    useEffect(() => {
        if (
            applicationStatus !== 'approved' ||
            canEnterSellerCenter ||
            automaticSyncStartedRef.current
        ) {
            return;
        }

        automaticSyncStartedRef.current = true;
        setSyncingSellerAccess(true);

        // Hồ sơ và quyền nằm ở hai service khác nhau; đồng bộ nền giúp người dùng không phải reload hoặc đăng nhập lại.
        void synchronizeSellerAccess()
            .then((synchronized) => {
                setSellerAccessUnavailable(!synchronized);
            })
            .finally(() => setSyncingSellerAccess(false));
    }, [applicationStatus, canEnterSellerCenter, synchronizeSellerAccess]);

    // Nút vào Seller Center kiểm tra lại quyền lần cuối để không điều hướng bằng access profile đã cũ.
    const enterSellerCenter = useCallback(async () => {
        if (canEnterSellerCenter) {
            router.push('/seller');
            return;
        }

        setSyncingSellerAccess(true);
        const synchronized = await synchronizeSellerAccess();
        setSyncingSellerAccess(false);

        if (synchronized) {
            setSellerAccessUnavailable(false);
            router.push('/seller');
            return;
        }

        setSellerAccessUnavailable(true);
        toast.error(
            'Tài khoản hiện không có quyền Seller Center. Quyền có thể đã bị thu hồi hoặc chưa được cấp lại; vui lòng liên hệ quản trị viên.',
        );
    }, [canEnterSellerCenter, router, synchronizeSellerAccess]);

    return {
        canEnterSellerCenter,
        sellerAccessUnavailable,
        syncingSellerAccess,
        enterSellerCenter,
    };
}

// Tạo khoảng chờ giữa các lần hỏi Auth Service mà không chặn giao diện trình duyệt.
function wait(delayMs: number): Promise<void> {
    return new Promise((resolve) => window.setTimeout(resolve, delayMs));
}

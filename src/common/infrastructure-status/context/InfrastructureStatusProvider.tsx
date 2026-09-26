// Provider điều phối popup hạ tầng, health check hồi phục và trạng thái request pending cho toàn bộ web.
// Provider không sửa response API; chỉ tạo lớp thông báo UX khi request cho thấy Gateway/EC2 gặp sự cố.

'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

import {
    subscribeInfrastructureStatus,
    type InfrastructureNoticeReason,
} from '../monitor/infrastructure-status.monitor';
import { InfrastructureStatusContext } from './InfrastructureStatusContext';
import { InfrastructureStatusDialog } from '../components/InfrastructureStatusDialog';
import { checkApiGatewayHealth } from '../services/infrastructure-health.service';
import { isWithinSupportHours } from '../utils/support-hours';

const HEALTH_CHECK_INTERVAL_MS = 15_000;

// Giữ duy nhất một popup ưu tiên, chỉ tự đóng sau khi health endpoint xác nhận Gateway đã hồi phục.
export function InfrastructureStatusProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [hasPendingRequests, setHasPendingRequests] = useState(false);
    const [reason, setReason] = useState<InfrastructureNoticeReason | null>(
        null,
    );
    const [healthCheckRevision, setHealthCheckRevision] = useState(0);

    useEffect(() => {
        // Subscribe một lần ở root để mọi Axios instance dùng chung một trạng thái cảnh báo.
        return subscribeInfrastructureStatus((event) => {
            if (event.type === 'pending-changed') {
                setHasPendingRequests(event.hasPendingRequests);
                return;
            }

            if (!isWithinSupportHours()) return;

            setReason(event.reason);
            setIsOpen(true);
        });
    }, []);

    useEffect(() => {
        if (!isOpen) return;

        let cancelled = false;

        // Health check riêng biệt giúp popup không đóng nhầm ngay sau khi request gốc timeout.
        const verifyRecovery = async () => {
            if (!isWithinSupportHours()) {
                setIsOpen(false);
                setReason(null);
                return;
            }

            const healthy = await checkApiGatewayHealth();
            if (healthy && !cancelled) {
                setIsOpen(false);
                setReason(null);
            }
        };

        void verifyRecovery();
        const intervalId = window.setInterval(
            () => void verifyRecovery(),
            HEALTH_CHECK_INTERVAL_MS,
        );

        return () => {
            cancelled = true;
            window.clearInterval(intervalId);
        };
    }, [healthCheckRevision, isOpen]);

    // Cho phép người dùng kiểm tra hồi phục ngay mà không reload toàn trang hoặc tạo thêm request nghiệp vụ.
    const retryHealthCheck = useCallback(() => {
        setHealthCheckRevision((revision) => revision + 1);
    }, []);

    const contextValue = useMemo(
        () => ({
            isOpen,
            hasPendingRequests,
            reason,
            retryHealthCheck,
        }),
        [hasPendingRequests, isOpen, reason, retryHealthCheck],
    );

    return (
        <InfrastructureStatusContext.Provider value={contextValue}>
            {children}
            <InfrastructureStatusDialog
                open={isOpen}
                reason={reason}
                onRetry={retryHealthCheck}
            />
        </InfrastructureStatusContext.Provider>
    );
}

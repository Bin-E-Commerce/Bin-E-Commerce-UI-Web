// Provider điều phối popup hạ tầng, health check hồi phục và trạng thái request pending cho toàn bộ web.
// Provider không sửa response API; chỉ tạo lớp thông báo UX khi request cho thấy Gateway/EC2 gặp sự cố.

'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import {
    subscribeInfrastructureStatus,
    type InfrastructureNoticeReason,
} from '../monitor/infrastructure-status.monitor';
import { InfrastructureStatusContext } from './InfrastructureStatusContext';
import { InfrastructureStatusDialog } from '../components/InfrastructureStatusDialog';
import { checkApiGatewayHealth } from '../services/infrastructure-health.service';
import { isWithinSupportHours } from '../utils/support-hours';

const HEALTH_CHECK_INTERVAL_MS = 15_000;
const HEALTHY_CHECKS_TO_CLOSE = 2;
const IS_PRODUCTION = process.env.NODE_ENV === 'production';

// Giữ một popup ưu tiên, đóng cảnh báo pending khi request kết thúc bình thường và xác nhận hồi phục qua hai health check.
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
    const retryRequestedRef = useRef(false);

    useEffect(() => {
        // Subscribe một lần ở root để mọi Axios instance dùng chung một trạng thái cảnh báo.
        return subscribeInfrastructureStatus((event) => {
            if (event.type === 'pending-changed') {
                setHasPendingRequests(event.hasPendingRequests);
                return;
            }

            // Next.js thay NODE_ENV theo bundle; chỉ production mới được mở cảnh báo EC2, còn pending vẫn phục vụ popup khác.
            if (!IS_PRODUCTION) return;

            // Request chậm khi chuyển trang chưa chứng minh EC2 lỗi; chỉ lỗi mạng/gateway mới mở cảnh báo gián đoạn.
            if (event.reason === 'request-pending') return;

            // Trong giờ vận hành, lỗi API được xử lý bởi feature tương ứng; popup này chỉ dành cho lúc EC2 ngoài lịch bật.
            if (isWithinSupportHours()) return;

            // Lỗi kết nối có độ ưu tiên cao hơn request chậm để không làm yếu cảnh báo đã được xác nhận.
            setReason((currentReason) =>
                currentReason === 'server-unavailable' &&
                event.reason === 'request-pending'
                    ? currentReason
                    : event.reason,
            );
            setIsOpen(true);
        });
    }, []);

    useEffect(() => {
        if (!isOpen) return;

        let cancelled = false;
        let consecutiveHealthyChecks = 0;

        // Health endpoint có thể phản hồi riêng Gateway; cần hai lần trạng thái ok và không còn request pending mới tự đóng.
        const verifyRecovery = async () => {
            // Khi bước vào giờ vận hành, không giữ lại cảnh báo ngoài giờ dù health check chưa chạy lại.
            if (isWithinSupportHours()) {
                setIsOpen(false);
                setReason(null);
                return;
            }

            // Chờ request đang chạy kết thúc để không dùng health check gateway đóng cảnh báo quá sớm.
            if (hasPendingRequests) {
                consecutiveHealthyChecks = 0;
                return;
            }

            const healthy = await checkApiGatewayHealth();
            if (cancelled) return;

            consecutiveHealthyChecks = healthy
                ? consecutiveHealthyChecks + 1
                : 0;
            if (consecutiveHealthyChecks >= HEALTHY_CHECKS_TO_CLOSE) {
                setIsOpen(false);
                setReason(null);
            }
        };

        const intervalId = window.setInterval(
            () => void verifyRecovery(),
            HEALTH_CHECK_INTERVAL_MS,
        );

        // Chỉ thao tác Thử lại mới kiểm tra ngay; cảnh báo tự động phải ổn định đủ lâu để tránh popup chớp tắt.
        if (retryRequestedRef.current) {
            retryRequestedRef.current = false;
            void verifyRecovery();
        }

        return () => {
            cancelled = true;
            window.clearInterval(intervalId);
        };
    }, [hasPendingRequests, healthCheckRevision, isOpen]);

    // Cho phép người dùng kiểm tra hồi phục ngay mà không reload toàn trang hoặc tạo thêm request nghiệp vụ.
    const retryHealthCheck = useCallback(() => {
        retryRequestedRef.current = true;
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
            {IS_PRODUCTION ? (
                <InfrastructureStatusDialog
                    open={isOpen}
                    reason={reason}
                    onRetry={retryHealthCheck}
                />
            ) : null}
        </InfrastructureStatusContext.Provider>
    );
}

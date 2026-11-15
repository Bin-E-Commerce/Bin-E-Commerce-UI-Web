// Theo dõi vòng đời request API và phát tín hiệu hạ tầng cho provider UI.
// Monitor không render, không gọi health endpoint và chỉ cảnh báo ngoài giờ vận hành.

import { isWithinSupportHours } from '../utils/support-hours';
import { isInfrastructureError } from '../utils/infrastructure-error';

export const INFRASTRUCTURE_PENDING_THRESHOLD_MS = 8_000;

export type InfrastructureNoticeReason =
    'request-pending' | 'server-unavailable';

export interface InfrastructureNoticeState {
    isOpen: boolean;
    hasPendingRequests: boolean;
    reason: InfrastructureNoticeReason | null;
}

type InfrastructureStatusEvent =
    | { type: 'pending-changed'; hasPendingRequests: boolean }
    | { type: 'warning-detected'; reason: InfrastructureNoticeReason };

type InfrastructureStatusListener = (event: InfrastructureStatusEvent) => void;

type TrackedRequest = {
    timer: ReturnType<typeof setTimeout>;
};

const listeners = new Set<InfrastructureStatusListener>();
const trackedRequests = new Map<number, TrackedRequest>();
const axiosRequestStops = new WeakMap<object, (error?: unknown) => void>();

let nextRequestId = 0;
let activeWarningReason: InfrastructureNoticeReason | null = null;

// Gửi event cho provider mà không để một listener lỗi làm hỏng interceptor của Axios.
function emit(event: InfrastructureStatusEvent): void {
    listeners.forEach((listener) => {
        try {
            listener(event);
        } catch {
            // UI listener không được phép làm gián đoạn request nghiệp vụ.
        }
    });
}

// Gộp cảnh báo trong cùng đợt request nhưng vẫn cho phép lỗi thật nâng cảnh báo pending lên mất kết nối.
function emitWarning(reason: InfrastructureNoticeReason): void {
    if (activeWarningReason === 'server-unavailable') return;
    if (activeWarningReason === 'request-pending') {
        if (reason === 'server-unavailable') {
            activeWarningReason = reason;
            emit({ type: 'warning-detected', reason });
        }
        return;
    }

    activeWarningReason = reason;
    emit({ type: 'warning-detected', reason });
}

// Kiểm tra lại request còn treo sau mỗi phút nếu nó bắt đầu trong giờ vận hành.
// Cách này trì hoãn cảnh báo đúng chính sách nhưng vẫn bắt được sự cố kéo dài qua giờ tắt máy chủ.
function checkPendingRequest(requestId: number): void {
    const currentRequest = trackedRequests.get(requestId);
    if (!currentRequest) return;

    if (isWithinSupportHours()) {
        currentRequest.timer = setTimeout(
            () => checkPendingRequest(requestId),
            60_000,
        );
        return;
    }

    emitWarning('request-pending');
}

// Đăng ký listener và trả về hàm cleanup để provider không giữ reference sau khi unmount.
export function subscribeInfrastructureStatus(
    listener: InfrastructureStatusListener,
): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
}

// Theo dõi request Axios để phân biệt request còn chậm với lỗi mạng/gateway đã được xác nhận.
// Timer chỉ giữ metadata trong memory; provider dùng pending cho ưu tiên popup tính năng, không coi chậm là outage.
// Mọi tracker được dọn ngay khi response hoặc error kết thúc.
export function beginInfrastructureRequest(): (error?: unknown) => void {
    const requestId = nextRequestId++;
    const trackedRequest: TrackedRequest = {
        timer: setTimeout(
            () => checkPendingRequest(requestId),
            INFRASTRUCTURE_PENDING_THRESHOLD_MS,
        ),
    };

    trackedRequests.set(requestId, trackedRequest);
    emit({ type: 'pending-changed', hasPendingRequests: true });

    return (error?: unknown) => {
        const currentRequest = trackedRequests.get(requestId);
        if (!currentRequest) return;

        clearTimeout(currentRequest.timer);
        trackedRequests.delete(requestId);

        emit({
            type: 'pending-changed',
            hasPendingRequests: trackedRequests.size > 0,
        });

        const infrastructureFailure =
            Boolean(error) &&
            !isWithinSupportHours() &&
            isInfrastructureError(error);

        if (infrastructureFailure) {
            emitWarning('server-unavailable');
        }

        if (trackedRequests.size === 0) {
            activeWarningReason = null;
        }
    };
}

// Gắn tracker vào config object của Axios mà không thêm field lạ vào request payload hoặc public contract.
export function trackAxiosRequest(config: object): void {
    axiosRequestStops.set(config, beginInfrastructureRequest());
}

// Kết thúc tracker tương ứng với config; WeakMap đảm bảo config đã hoàn tất không bị giữ trong memory.
export function completeAxiosRequest(
    config: object | undefined,
    error?: unknown,
): void {
    if (!config) return;

    const stop = axiosRequestStops.get(config);
    if (!stop) return;

    axiosRequestStops.delete(config);
    stop(error);
}

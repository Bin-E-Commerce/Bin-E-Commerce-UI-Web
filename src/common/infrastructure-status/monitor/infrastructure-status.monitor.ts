// Theo dõi vòng đời request API và phát tín hiệu hạ tầng cho provider UI.
// Monitor không render, không gọi health endpoint và chỉ cảnh báo trong giờ hỗ trợ.

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
let warningNotifiedForActiveRequests = false;

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

// Chỉ phát một cảnh báo cho cùng một đợt request lỗi, dù nhiều API cùng timeout.
function emitWarning(reason: InfrastructureNoticeReason): void {
    if (warningNotifiedForActiveRequests) return;

    warningNotifiedForActiveRequests = true;
    emit({ type: 'warning-detected', reason });
}

// Kiểm tra lại request còn treo sau mỗi phút nếu nó bắt đầu ngoài giờ hỗ trợ.
// Cách này không mở cảnh báo sai giờ nhưng vẫn bắt được sự cố kéo dài qua 09:00.
function checkPendingRequest(requestId: number): void {
    const currentRequest = trackedRequests.get(requestId);
    if (!currentRequest) return;

    if (!isWithinSupportHours()) {
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

// Theo dõi một request từ lúc Axios chuẩn bị gửi cho tới khi response/error kết thúc.
// Timer chỉ giữ metadata trong memory, không tạo request nền và tự cleanup khi request hoàn tất.
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

        if (error && isWithinSupportHours() && isInfrastructureError(error)) {
            emitWarning('server-unavailable');
        }

        if (trackedRequests.size === 0) {
            warningNotifiedForActiveRequests = false;
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

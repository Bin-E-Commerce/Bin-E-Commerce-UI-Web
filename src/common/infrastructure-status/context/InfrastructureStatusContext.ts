// Context contract cho trạng thái cảnh báo hạ tầng và request pending toàn ứng dụng.
// Context không chứa JSX; provider và dialog được tách riêng để giữ boundary rõ ràng.

'use client';

import { createContext } from 'react';

import type { InfrastructureNoticeState } from '../monitor/infrastructure-status.monitor';

export interface InfrastructureStatusContextValue extends InfrastructureNoticeState {
    retryHealthCheck: () => void;
}

export const InfrastructureStatusContext =
    createContext<InfrastructureStatusContextValue | null>(null);

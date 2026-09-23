// Hook dong goi query/mutation cua dashboard.
// Hook giu polling va invalidate o mot noi de component chi tap trung hien thi va thao tac seller.

'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
    createImageOptimizationJobs,
    getImageOptimizationJob,
    getImageOptimizationOverview,
    getImageOptimizationProductImpacts,
    applyImageOptimizationJob,
    rejectImageOptimizationJob,
} from '@/services/ai/api/image-optimization.api';
import type {
    LifestyleBackgroundInput,
    OptimizationMode,
} from '@/services/ai/types/image-optimization.types';
import {
    isImageOptimizationJobPollingActive,
    isImageOptimizationJobPollingExpired,
} from '../utils/optimization-flow.utils';

// Tai metric overview voi key on dinh de cac tab khac co the invalidate cung cache.
export function useAiOptimizationOverview() {
    return useQuery({
        queryKey: ['seller-ai-image-optimization-overview'],
        queryFn: getImageOptimizationOverview,
        staleTime: 30_000,
    });
}

// Chỉ gọi impact khi đã có danh sách product; query key theo chuỗi ID ổn định để tránh request lặp do array mới.
export function useAiOptimizationProductImpacts(productIds: string[]) {
    const normalizedProductIds = [...new Set(productIds)].sort();
    return useQuery({
        queryKey: [
            'seller-ai-image-optimization-product-impacts',
            normalizedProductIds,
        ],
        queryFn: () => getImageOptimizationProductImpacts(normalizedProductIds),
        enabled: normalizedProductIds.length > 0,
        // Impact thay đổi ngay khi có event mới nên không giữ cache một phút như danh sách sản phẩm.
        staleTime: 1_000,
        refetchInterval: 5_000,
        refetchIntervalInBackground: true,
        retry: 1,
    });
}

// Poll job đang chạy với nhịp nhanh ở giai đoạn đầu để seller thấy phản hồi sớm.
// Query dừng ở trạng thái terminal hoặc sau 10 phút để worker lỗi không biến thành vòng gọi API vô hạn.
export function useAiOptimizationJob(jobId: string | null) {
    return useQuery({
        queryKey: ['seller-ai-image-optimization-job', jobId],
        queryFn: () => getImageOptimizationJob(jobId as string),
        enabled: Boolean(jobId),
        staleTime: 1_000,
        // Không kích hoạt lại request khi seller quay lại tab sau khi job đã quá hạn.
        refetchOnWindowFocus: (query) =>
            !query.state.data ||
            !isImageOptimizationJobPollingActive(query.state.data.status) ||
            !isImageOptimizationJobPollingExpired(query.state.data.createdAt),
        refetchOnReconnect: (query) =>
            !query.state.data ||
            !isImageOptimizationJobPollingActive(query.state.data.status) ||
            !isImageOptimizationJobPollingExpired(query.state.data.createdAt),
        refetchOnMount: (query) =>
            !query.state.data ||
            !isImageOptimizationJobPollingActive(query.state.data.status) ||
            !isImageOptimizationJobPollingExpired(query.state.data.createdAt),
        refetchIntervalInBackground: true,
        select: (job) =>
            isImageOptimizationJobPollingActive(job.status) &&
            isImageOptimizationJobPollingExpired(job.createdAt)
                ? {
                      ...job,
                      status: 'FAILED' as const,
                      processingStage: 'FAILED' as const,
                      failureCode: job.failureCode ?? 'CLIENT_POLLING_TIMEOUT',
                  }
                : job,
        refetchInterval: (query) => {
            const job = query.state.data;
            if (
                job &&
                isImageOptimizationJobPollingActive(job.status) &&
                isImageOptimizationJobPollingExpired(job.createdAt)
            ) {
                return false;
            }
            if (job?.status === 'PENDING') return 1_500;
            if (job?.status === 'PROCESSING' || job?.status === 'FINALIZING')
                return 1_000;
            return false;
        },
    });
}

// Tao job khong cho phep click trung va invalidate metric sau khi Gateway accepted.
export function useCreateAiOptimizationJobs() {
    const client = useQueryClient();
    return useMutation({
        mutationFn: ({
            productIds,
            modes,
            background,
            sourceAssetIds,
        }: {
            productIds: string[];
            modes: OptimizationMode[];
            background?: LifestyleBackgroundInput;
            sourceAssetIds?: string[];
        }) =>
            createImageOptimizationJobs(
                productIds,
                modes,
                background,
                false,
                sourceAssetIds,
            ),
        onSuccess: () =>
            client.invalidateQueries({
                queryKey: ['seller-ai-image-optimization-overview'],
            }),
        onError: () =>
            client.invalidateQueries({
                queryKey: ['seller-ai-image-optimization-overview'],
            }),
    });
}

// Tu choi output AI va lam moi job/overview sau khi server xac nhan.
export function useRejectAiOptimizationJob() {
    const client = useQueryClient();
    return useMutation({
        mutationFn: rejectImageOptimizationJob,
        onSuccess: (_data, jobId) => {
            void client.invalidateQueries({
                queryKey: ['seller-ai-image-optimization-job', jobId],
            });
            void client.invalidateQueries({
                queryKey: ['seller-ai-image-optimization-overview'],
            });
            void client.invalidateQueries({
                queryKey: ['seller-ai-image-optimization-impact-overview'],
            });
            void client.invalidateQueries({
                queryKey: ['seller-ai-image-optimization-product-impacts'],
            });
        },
    });
}

// Apply output sau khi seller xem preview; mutation chi thay doi product khi backend check version thanh cong.
export function useApplyAiOptimizationJob() {
    const client = useQueryClient();
    return useMutation({
        mutationFn: ({
            jobId,
            expectedProductUpdatedAt,
        }: {
            jobId: string;
            expectedProductUpdatedAt: string;
        }) => applyImageOptimizationJob(jobId, expectedProductUpdatedAt),
        onSuccess: (data, variables) => {
            // Ghi ngay response 202 vao cache de UI biet job dang FINALIZING, khong doc lai snapshot preview cu.
            client.setQueryData(
                ['seller-ai-image-optimization-job', variables.jobId],
                data,
            );
            void client.invalidateQueries({
                queryKey: ['seller-ai-image-optimization-job', variables.jobId],
            });
            void client.invalidateQueries({
                queryKey: ['seller-ai-image-optimization-overview'],
            });
            void client.invalidateQueries({
                queryKey: ['seller-ai-image-optimization-impact-overview'],
            });
            void client.invalidateQueries({
                queryKey: ['seller-ai-image-optimization-product-impacts'],
            });
            void client.invalidateQueries({
                queryKey: ['seller-ai-image-optimization-products'],
            });
        },
    });
}

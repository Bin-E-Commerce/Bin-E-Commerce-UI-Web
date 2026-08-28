// Hook dong goi query/mutation cua dashboard.
// Hook giu polling va invalidate o mot noi de component chi tap trung hien thi va thao tac seller.

'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
    createImageOptimizationJobs,
    getImageOptimizationJob,
    getImageOptimizationOverview,
    applyImageOptimizationJob,
    rejectImageOptimizationJob,
} from '../services/ai-image-optimization.service';
import type { LifestyleBackgroundInput, OptimizationMode } from '../types/ai-image-optimization.types';

// Tai metric overview voi key on dinh de cac tab khac co the invalidate cung cache.
export function useAiOptimizationOverview() {
    return useQuery({
        queryKey: ['seller-ai-image-optimization-overview'],
        queryFn: getImageOptimizationOverview,
        staleTime: 30_000,
    });
}

// Poll job đang chạy với nhịp nhanh ở giai đoạn đầu để seller thấy phản hồi sớm.
// Query dừng hoàn toàn ở trạng thái terminal, chạy cả khi tab mất focus và không tạo request trùng.
export function useAiOptimizationJob(jobId: string | null) {
    return useQuery({
        queryKey: ['seller-ai-image-optimization-job', jobId],
        queryFn: () => getImageOptimizationJob(jobId as string),
        enabled: Boolean(jobId),
        staleTime: 1_000,
        refetchOnWindowFocus: true,
        refetchIntervalInBackground: true,
        refetchInterval: (query) => {
            const status = query.state.data?.status;
            if (status === 'PENDING') return 1_500;
            if (status === 'PROCESSING' || status === 'FINALIZING') return 1_000;
            return false;
        },
    });
}

// Tao job khong cho phep click trung va invalidate metric sau khi Gateway accepted.
export function useCreateAiOptimizationJobs() {
    const client = useQueryClient();
    return useMutation({
        mutationFn: ({ productIds, modes, background, sourceAssetIds }: { productIds: string[]; modes: OptimizationMode[]; background?: LifestyleBackgroundInput; sourceAssetIds?: string[] }) =>
            createImageOptimizationJobs(productIds, modes, background, false, sourceAssetIds),
        onSuccess: () => client.invalidateQueries({ queryKey: ['seller-ai-image-optimization-overview'] }),
    });
}

// Tu choi output AI va lam moi job/overview sau khi server xac nhan.
export function useRejectAiOptimizationJob() {
    const client = useQueryClient();
    return useMutation({
        mutationFn: rejectImageOptimizationJob,
        onSuccess: (_data, jobId) => {
            void client.invalidateQueries({ queryKey: ['seller-ai-image-optimization-job', jobId] });
            void client.invalidateQueries({ queryKey: ['seller-ai-image-optimization-overview'] });
        },
    });
}

// Apply output sau khi seller xem preview; mutation chi thay doi product khi backend check version thanh cong.
export function useApplyAiOptimizationJob() {
    const client = useQueryClient();
    return useMutation({
        mutationFn: ({ jobId, expectedProductUpdatedAt }: { jobId: string; expectedProductUpdatedAt: string }) =>
            applyImageOptimizationJob(jobId, expectedProductUpdatedAt),
        onSuccess: (data, variables) => {
            // Ghi ngay response 202 vao cache de UI biet job dang FINALIZING, khong doc lai snapshot preview cu.
            client.setQueryData(['seller-ai-image-optimization-job', variables.jobId], data);
            void client.invalidateQueries({ queryKey: ['seller-ai-image-optimization-job', variables.jobId] });
            void client.invalidateQueries({ queryKey: ['seller-ai-image-optimization-overview'] });
            void client.invalidateQueries({ queryKey: ['seller-ai-image-optimization-products'] });
        },
    });
}

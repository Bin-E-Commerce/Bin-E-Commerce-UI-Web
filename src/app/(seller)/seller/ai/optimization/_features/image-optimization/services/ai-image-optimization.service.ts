// HTTP adapter cho image optimization.
// Service khong tu sua form/product; no chi goi Gateway va tra DTO da type-safe cho hook.

import { API_VERSION } from '@/config/api.config';
import authorizedAxios from '@/utils/authorizedAxios';
import type {
    CreateImageOptimizationResponse,
    ImageOptimizationJob,
    ImageOptimizationOverview,
    OptimizationMode,
    LifestyleBackgroundInput,
} from '../types/ai-image-optimization.types';

// Goi overview de UI hien thi metric that, khong fallback thanh so ao.
export async function getImageOptimizationOverview() {
    const response = await authorizedAxios.get<ImageOptimizationOverview>(
        `${API_VERSION}/seller/ai/image-optimization/overview`,
    );
    return response.data;
}

// Tao batch job va gui idempotency key de retry browser khong tao job trung.
// Tạo batch với một idempotency key cho đúng một thao tác click, tránh browser retry tạo job AI trùng và tốn chi phí.
export async function createImageOptimizationJobs(
    productIds: string[],
    modes: OptimizationMode[],
    background?: LifestyleBackgroundInput,
    forceRegenerate = false,
    sourceAssetIds?: string[],
) {
    const response = await authorizedAxios.post<CreateImageOptimizationResponse>(
        `${API_VERSION}/seller/ai/image-optimization/jobs`,
        {
            productIds,
            sourceAssetPolicy: sourceAssetIds?.length ? 'SELECTED_ASSETS' : 'COVER_IMAGE',
            sourceAssetIds,
            modes,
            background,
            forceRegenerate,
        },
        { headers: { 'Idempotency-Key': crypto.randomUUID() } },
    );
    return response.data;
}

// Poll mot job de dialog cap nhat dung trang thai terminal.
export async function getImageOptimizationJob(jobId: string) {
    const response = await authorizedAxios.get<ImageOptimizationJob>(
        `${API_VERSION}/seller/ai/image-optimization/jobs/${jobId}`,
    );
    return response.data;
}

// Apply preview theo action endpoint; output media chi duoc thay sau khi seller xac nhan.
export async function applyImageOptimizationJob(jobId: string, expectedProductUpdatedAt: string) {
    const response = await authorizedAxios.post(
        `${API_VERSION}/seller/ai/image-optimization/jobs/${jobId}/apply`,
        { expectedProductUpdatedAt },
    );
    return response.data;
}

// Reject output de backend len lich cleanup asset AI thay vi xoa anh goc.
export async function rejectImageOptimizationJob(jobId: string) {
    const response = await authorizedAxios.post(
        `${API_VERSION}/seller/ai/image-optimization/jobs/${jobId}/reject`,
    );
    return response.data;
}

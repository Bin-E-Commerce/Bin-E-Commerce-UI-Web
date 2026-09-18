// Adapter HTTP cho image optimization.
// File này chỉ gọi API Gateway bằng authorizedAxios và trả DTO đã type-safe cho hook; không giữ state UI.

import { API_VERSION } from '@/config/api.config';
import authorizedAxios from '@/utils/authorizedAxios';
import type {
    CreateImageOptimizationResponse,
    ImageOptimizationImpactProductsResponse,
    ImageOptimizationJob,
    ImageOptimizationOverview,
    LifestyleBackgroundInput,
    OptimizationMode,
} from '../types/image-optimization.types';

// Lấy overview để UI hiển thị metric thật, không tự tạo fallback dữ liệu.
export async function getImageOptimizationOverview() {
    const response = await authorizedAxios.get<ImageOptimizationOverview>(
        `${API_VERSION}/seller/ai/image-optimization/overview`,
    );
    return response.data;
}

// Lấy impact theo danh sách sản phẩm đang hiển thị để tránh tải toàn bộ lịch sử vào browser.
export async function getImageOptimizationProductImpacts(productIds: string[]) {
    const response =
        await authorizedAxios.get<ImageOptimizationImpactProductsResponse>(
            `${API_VERSION}/seller/ai/image-optimization/impact/products`,
            { params: { productIds: productIds.join(',') } },
        );
    return response.data;
}

// Tạo một batch cho một thao tác click và gửi idempotency key để retry không tạo job trùng.
export async function createImageOptimizationJobs(
    productIds: string[],
    modes: OptimizationMode[],
    background?: LifestyleBackgroundInput,
    forceRegenerate = false,
    sourceAssetIds?: string[],
) {
    const response =
        await authorizedAxios.post<CreateImageOptimizationResponse>(
            `${API_VERSION}/seller/ai/image-optimization/jobs`,
            {
                productIds,
                sourceAssetPolicy: sourceAssetIds?.length
                    ? 'SELECTED_ASSETS'
                    : 'COVER_IMAGE',
                sourceAssetIds,
                modes,
                background,
                forceRegenerate,
            },
            { headers: { 'Idempotency-Key': crypto.randomUUID() } },
        );
    return response.data;
}

// Poll một job để dialog cập nhật đúng trạng thái terminal từ backend.
export async function getImageOptimizationJob(jobId: string) {
    const response = await authorizedAxios.get<ImageOptimizationJob>(
        `${API_VERSION}/seller/ai/image-optimization/jobs/${jobId}`,
    );
    return response.data;
}

// Apply preview theo action endpoint; output media chỉ được thay sau khi seller xác nhận.
export async function applyImageOptimizationJob(
    jobId: string,
    expectedProductUpdatedAt: string,
): Promise<ImageOptimizationJob> {
    const response = await authorizedAxios.post<ImageOptimizationJob>(
        `${API_VERSION}/seller/ai/image-optimization/jobs/${jobId}/apply`,
        { expectedProductUpdatedAt },
    );
    return response.data;
}

// Reject output để backend lên lịch cleanup asset AI thay vì xóa ảnh gốc.
export async function rejectImageOptimizationJob(jobId: string) {
    const response = await authorizedAxios.post(
        `${API_VERSION}/seller/ai/image-optimization/jobs/${jobId}/reject`,
    );
    return response.data;
}

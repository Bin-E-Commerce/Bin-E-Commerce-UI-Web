// Type contract cho dashboard toi uu anh AI.
// Type nay chi mo ta API/UI state, khong chua logic provider hay ownership.

export type OptimizationMode = 'WHITE_BACKGROUND' | 'LIFESTYLE_BACKGROUND';
export type ImageGenerationProfile = 'PREVIEW' | 'FINAL';
export type LifestyleBackgroundPreset = 'MINIMAL_STUDIO' | 'WARM_HOME' | 'NATURAL_OUTDOOR' | 'PREMIUM_DISPLAY';
export type ImageOptimizationProcessingStage = 'QUEUED' | 'FETCHING_SOURCE' | 'PREPARING_IMAGE' | 'GENERATING' | 'UPLOADING' | 'READY' | 'FAILED';
export type OptimizationStatus =
    | 'PENDING'
    | 'PROCESSING'
    | 'REVIEW_REQUIRED'
    | 'FINALIZING'
    | 'SUCCEEDED'
    | 'REJECTED'
    | 'APPLIED'
    | 'ROLLED_BACK'
    | 'FAILED';

export interface ImageOptimizationJob {
    jobId: string;
    productId: string;
    status: OptimizationStatus;
    processingStage: ImageOptimizationProcessingStage;
    generationProfile?: ImageGenerationProfile;
    backgroundPreset?: LifestyleBackgroundPreset | null;
    generatedAssetIds: string[];
    generatedAssets: Array<{ assetId: string; imageUrl: string | null; mode: string; outputId?: string; sourceAssetId?: string | null }>;
    createdAt: string;
    expectedProductUpdatedAt?: string | null;
    failureCode?: string | null;
}

export interface ImageOptimizationOverview {
    optimizedProducts: number | null;
    totalViews: number | null;
    totalSold: number | null;
    pendingJobs: number;
    failedJobs: number;
}

export interface CreateImageOptimizationResponse {
    batchId: string;
    jobs: ImageOptimizationJob[];
}

export interface ImageOptimizationProduct {
    id: string;
    name: string;
    thumbnailUrl: string | null;
    sourceImageUrl?: string | null;
    totalSold: number;
    aiStatus: OptimizationStatus | null;
    updatedAt: string;
}

export interface LifestyleBackgroundInput {
    preset: LifestyleBackgroundPreset | null;
    description?: string;
}

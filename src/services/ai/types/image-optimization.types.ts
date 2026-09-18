// File này định nghĩa contract frontend cho image optimization.
// Chỉ chứa kiểu API và state dùng chung; không chứa logic gọi provider hoặc query lifecycle.

export type OptimizationMode = 'WHITE_BACKGROUND' | 'LIFESTYLE_BACKGROUND';
export type ImageGenerationProfile = 'PREVIEW' | 'FINAL';
export type LifestyleBackgroundPreset =
    | 'MINIMAL_STUDIO'
    | 'WARM_HOME'
    | 'NATURAL_OUTDOOR'
    | 'PREMIUM_DISPLAY';
export type ImageOptimizationProcessingStage =
    | 'QUEUED'
    | 'FETCHING_SOURCE'
    | 'PREPARING_IMAGE'
    | 'GENERATING'
    | 'UPLOADING'
    | 'READY'
    | 'FAILED';
export type OptimizationFlowMode = 'PREVIEW' | 'FINAL';
export type OptimizationFlowStepId =
    | 'SOURCE'
    | 'PREPARE_PREVIEW'
    | 'GENERATE_PREVIEW'
    | 'SAVE_PREVIEW'
    | 'PREVIEW_READY'
    | 'PREVIEW_CONFIRMED'
    | 'GENERATE_FINAL'
    | 'UPDATE_PRODUCT'
    | 'APPLIED';
export type OptimizationFlowStepState =
    | 'PENDING'
    | 'ACTIVE'
    | 'COMPLETED'
    | 'ERROR';

export interface OptimizationFlowStep {
    id: OptimizationFlowStepId;
    state: OptimizationFlowStepState;
}

export interface OptimizationFlowState {
    mode: OptimizationFlowMode;
    steps: OptimizationFlowStep[];
    activeStepId: OptimizationFlowStepId;
    isComplete: boolean;
    isError: boolean;
}

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
    generatedAssets: Array<{
        assetId: string;
        imageUrl: string | null;
        mode: string;
        outputId?: string;
        sourceAssetId?: string | null;
    }>;
    createdAt: string;
    expectedProductUpdatedAt?: string | null;
    failureCode?: string | null;
}

export interface ImageOptimizationUsage {
    enabled: boolean;
    limit: number | null;
    used: number;
    remaining: number | null;
}

export interface ImageOptimizationOverview {
    optimizedProducts: number | null;
    totalViews: number | null;
    totalSold: number | null;
    pendingJobs: number;
    failedJobs: number;
    aiUsage: ImageOptimizationUsage;
}

export type ImageOptimizationImpactStatus =
    | 'COLLECTING'
    | 'READY'
    | 'NO_BASELINE'
    | 'ROLLED_BACK'
    | 'UNAVAILABLE';

export interface ImageOptimizationImpactMetric {
    before: number;
    after: number;
    delta: number;
    changePercent: number | null;
}

export interface ImageOptimizationImpactDaily {
    date: string;
    views: number;
    sales: number;
    hasData: boolean;
    viewsChangePercent: number | null;
    salesChangePercent: number | null;
}

export interface ImageOptimizationProductImpact {
    productId: string;
    jobId: string | null;
    appliedAt: string | null;
    status: ImageOptimizationImpactStatus;
    elapsedSeconds: number;
    daysCollected: number;
    windowDays: number;
    baselineDays: number;
    views: ImageOptimizationImpactMetric | null;
    sales: ImageOptimizationImpactMetric | null;
    daily: ImageOptimizationImpactDaily[];
}

export interface ImageOptimizationImpactProductsResponse {
    items: ImageOptimizationProductImpact[];
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
    impact?: ImageOptimizationProductImpact;
}

export interface LifestyleBackgroundInput {
    preset: LifestyleBackgroundPreset | null;
    description?: string;
}

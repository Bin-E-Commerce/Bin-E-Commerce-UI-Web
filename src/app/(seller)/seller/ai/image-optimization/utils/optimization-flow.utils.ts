// Hàm thuần ánh xạ snapshot job sang các bước UI của quy trình preview/final.
// File này không gọi API, không chứa text giao diện và không sở hữu timer hay state React.

import type {
    ImageGenerationProfile,
    ImageOptimizationProcessingStage,
    OptimizationFlowMode,
    OptimizationFlowState,
    OptimizationFlowStepId,
    OptimizationStatus,
} from '@/services/ai/types/image-optimization.types';

const PREVIEW_STEP_IDS: OptimizationFlowStepId[] = [
    'SOURCE',
    'PREPARE_PREVIEW',
    'GENERATE_PREVIEW',
    'SAVE_PREVIEW',
    'PREVIEW_READY',
];

const FINAL_STEP_IDS: OptimizationFlowStepId[] = [
    'PREVIEW_CONFIRMED',
    'GENERATE_FINAL',
    'UPDATE_PRODUCT',
    'APPLIED',
];

// Chuyển stage kỹ thuật thành bước preview gần nhất để lỗi hoặc trạng thái đang chạy luôn có vị trí hiển thị ổn định.
function getPreviewStepId(
    stage: ImageOptimizationProcessingStage | undefined,
): OptimizationFlowStepId {
    if (stage === 'FETCHING_SOURCE') return 'SOURCE';
    if (stage === 'PREPARING_IMAGE') return 'PREPARE_PREVIEW';
    if (stage === 'GENERATING') return 'GENERATE_PREVIEW';
    if (stage === 'UPLOADING' || stage === 'READY')
        return stage === 'READY' ? 'PREVIEW_READY' : 'SAVE_PREVIEW';
    return 'SOURCE';
}

// Khi worker chỉ lưu stage FAILED, mặc định lỗi provider thuộc bước tạo ảnh thay vì đánh dấu sai bước lấy source.
function getPreviewFailureStepId(
    stage: ImageOptimizationProcessingStage | undefined,
): OptimizationFlowStepId {
    if (stage === 'FETCHING_SOURCE') return 'SOURCE';
    if (stage === 'PREPARING_IMAGE') return 'PREPARE_PREVIEW';
    if (stage === 'UPLOADING' || stage === 'READY') return 'SAVE_PREVIEW';
    return 'GENERATE_PREVIEW';
}

// Tạo trạng thái từng bước theo thứ tự, bảo đảm chỉ có một bước active/error và không cần setState đồng bộ trong effect.
function createFlowState(
    mode: OptimizationFlowMode,
    stepIds: OptimizationFlowStepId[],
    activeStepId: OptimizationFlowStepId,
    isComplete: boolean,
    isError: boolean,
): OptimizationFlowState {
    const activeIndex = stepIds.indexOf(activeStepId);
    return {
        mode,
        activeStepId,
        isComplete,
        isError,
        steps: stepIds.map((id, index) => ({
            id,
            state: isComplete
                ? 'COMPLETED'
                : isError && id === activeStepId
                  ? 'ERROR'
                  : index < activeIndex
                    ? 'COMPLETED'
                    : id === activeStepId
                      ? 'ACTIVE'
                      : 'PENDING',
        })),
    };
}

// Ánh xạ trạng thái preview/final hiện có sang flow dễ hiểu cho seller mà không thay đổi contract backend.
export function getOptimizationFlowState({
    mode,
    status,
    generationProfile,
    processingStage,
}: {
    mode: OptimizationFlowMode;
    status?: OptimizationStatus;
    generationProfile?: ImageGenerationProfile;
    processingStage?: ImageOptimizationProcessingStage;
}): OptimizationFlowState {
    if (mode === 'PREVIEW') {
        const isComplete =
            status === 'REVIEW_REQUIRED' || status === 'SUCCEEDED';
        const isError = status === 'FAILED';
        const activeStepId = isComplete
            ? 'PREVIEW_READY'
            : isError
              ? getPreviewFailureStepId(processingStage)
              : getPreviewStepId(processingStage);
        return createFlowState(
            mode,
            PREVIEW_STEP_IDS,
            activeStepId,
            isComplete,
            isError,
        );
    }

    if (status === 'APPLIED') {
        return createFlowState(mode, FINAL_STEP_IDS, 'APPLIED', true, false);
    }

    const isError = status === 'FAILED';
    const isUpdatingProduct =
        status === 'REVIEW_REQUIRED' && generationProfile === 'FINAL';
    const activeStepId = isUpdatingProduct
        ? 'UPDATE_PRODUCT'
        : isError && processingStage === 'READY'
          ? 'UPDATE_PRODUCT'
          : 'GENERATE_FINAL';

    return createFlowState(mode, FINAL_STEP_IDS, activeStepId, false, isError);
}

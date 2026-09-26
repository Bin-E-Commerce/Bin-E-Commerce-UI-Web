// Quyết định popup tính năng có được phép hiển thị khi hệ thống đang theo dõi hạ tầng.
// Cảnh báo hạ tầng và request pending luôn có quyền ưu tiên cao hơn trải nghiệm giới thiệu.

interface FeaturePopupVisibilityInput {
    hasPendingRequests: boolean;
    isInfrastructureAlertOpen: boolean;
}

export function canShowFeaturePopup({
    hasPendingRequests,
    isInfrastructureAlertOpen,
}: FeaturePopupVisibilityInput): boolean {
    return !hasPendingRequests && !isInfrastructureAlertOpen;
}

import type { SellerApplicationCorrectionTarget } from '@/services/seller';
import type { SellerRegisterFormValues } from '../types/seller-register-form.type';

// Mỗi target thuộc đúng một bước form; map tập trung giúp hook, stepper và nội dung step không tự suy luận khác nhau.
const CORRECTION_TARGET_STEP: Record<SellerApplicationCorrectionTarget, number> = {
    shop_information: 0,
    shop_logo: 0,
    seller_identity: 1,
    verification_documents: 1,
    pickup_address: 2,
    payout_information: 3,
};

export interface VerificationDocumentReplacementProgress {
    replaced: number;
    required: number;
    complete: boolean;
}

// So sánh dữ liệu hiện tại với đúng phiên bản bị admin từ chối thay vì phụ thuộc dirtyFields của React Hook Form.
// Cách này không tính preview tạm là thay đổi và vẫn nhận ra chính xác khi user đổi ảnh sau một lần chuyển bước.
export function getChangedCorrectionTargets(
    currentValues: SellerRegisterFormValues,
    rejectedValues: SellerRegisterFormValues,
): SellerApplicationCorrectionTarget[] {
    const changedTargets: SellerApplicationCorrectionTarget[] = [];

    if (hasShopInformationChanged(currentValues, rejectedValues)) {
        changedTargets.push('shop_information');
    }

    if (currentValues.shop.logoUrl !== rejectedValues.shop.logoUrl) {
        changedTargets.push('shop_logo');
    }
    if (hasSellerIdentityChanged(currentValues, rejectedValues)) {
        changedTargets.push('seller_identity');
    }
    if (
        getVerificationDocumentReplacementProgress(currentValues, rejectedValues)
            .complete
    ) {
        changedTargets.push('verification_documents');
    }
    if (!isSameValue(currentValues.pickupAddress, rejectedValues.pickupAddress)) {
        changedTargets.push('pickup_address');
    }
    if (!isSameValue(currentValues.payout, rejectedValues.payout)) {
        changedTargets.push('payout_information');
    }

    return changedTargets;
}

// Logo có correction target riêng nên nhóm thông tin shop chỉ so sánh các field nội dung còn lại.
function hasShopInformationChanged(
    currentValues: SellerRegisterFormValues,
    rejectedValues: SellerRegisterFormValues,
): boolean {
    const { logoUrl: _currentLogo, ...currentShop } = currentValues.shop;
    const { logoUrl: _rejectedLogo, ...rejectedShop } = rejectedValues.shop;

    return !isSameValue(currentShop, rejectedShop);
}

// Giấy tờ được xử lý độc lập để admin có thể yêu cầu tải lại ảnh mà không buộc seller sửa CCCD hoặc họ tên.
function hasSellerIdentityChanged(
    currentValues: SellerRegisterFormValues,
    rejectedValues: SellerRegisterFormValues,
): boolean {
    const { documents: _currentDocuments, ...currentIdentity } =
        currentValues.seller;
    const { documents: _rejectedDocuments, ...rejectedIdentity } =
        rejectedValues.seller;

    return !isSameValue(currentIdentity, rejectedIdentity);
}

// Đếm chính xác số giấy tờ đã upload thành asset mới để UI giải thích vì sao hồ sơ chưa đủ điều kiện gửi lại.
export function getVerificationDocumentReplacementProgress(
    currentValues: SellerRegisterFormValues,
    rejectedValues: SellerRegisterFormValues,
): VerificationDocumentReplacementProgress {
    const requiredKeys =
        currentValues.seller.profileType === 'business'
            ? ['businessLicense', 'representativeDocument']
            : ['citizenIdFront', 'citizenIdBack'];

    const replaced = requiredKeys.filter((key) => {
        const currentDocument = currentValues.seller.documents[key];
        const rejectedDocument = rejectedValues.seller.documents[key];

        if (!currentDocument?.assetId || !currentDocument.url) return false;

        return (
            currentDocument.assetId !== rejectedDocument?.assetId ||
            currentDocument.url !== rejectedDocument?.url
        );
    }).length;

    return {
        replaced,
        required: requiredKeys.length,
        complete: replaced === requiredKeys.length,
    };
}

// Các object form đều chỉ chứa primitive và object JSON, vì vậy stringify đủ ổn định khi key được khai báo cùng schema.
function isSameValue(left: unknown, right: unknown): boolean {
    return JSON.stringify(left) === JSON.stringify(right);
}

// Hồ sơ chỉ đủ điều kiện gửi lại khi mọi nhóm admin yêu cầu đều khác bản bị từ chối theo rule riêng của từng nhóm.
export function hasCompletedRequiredCorrections(
    requiredTargets: SellerApplicationCorrectionTarget[],
    changedTargets: SellerApplicationCorrectionTarget[],
): boolean {
    return requiredTargets.every((target) => changedTargets.includes(target));
}

// Lấy các yêu cầu thuộc bước hiện tại để chỉ hiển thị hướng dẫn đúng ngữ cảnh ngay cạnh nhóm input cần sửa.
export function getCorrectionTargetsForStep(
    targets: SellerApplicationCorrectionTarget[],
    step: number,
): SellerApplicationCorrectionTarget[] {
    return targets.filter((target) => CORRECTION_TARGET_STEP[target] === step);
}

// Đưa seller đến yêu cầu đầu tiên theo thứ tự form; fallback bước đầu dành cho hồ sơ cũ chưa có correction target.
export function getFirstCorrectionStep(
    targets: SellerApplicationCorrectionTarget[],
): number {
    if (targets.length === 0) return 0;

    return Math.min(...targets.map((target) => CORRECTION_TARGET_STEP[target]));
}

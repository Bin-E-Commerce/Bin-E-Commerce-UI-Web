import type { SellerApplicationDto } from '@/services/seller';
import type { SellerRegisterFormValues } from '../types/seller-register-form.type';

// Chuyển null/undefined từ API về chuỗi rỗng để input luôn là controlled component của React Hook Form.
function text(value: string | null | undefined): string {
    return value ?? '';
}

// Backend không lưu checkbox điều khoản như dữ liệu hồ sơ lâu dài, nên FE tự bật lại khi hồ sơ đã từng được gửi duyệt.
function shouldRestoreAcceptedTerms(application: SellerApplicationDto): boolean {
    return application.status === 'pending_review' || application.status === 'approved';
}

// Map hồ sơ seller đã lưu trong DB về đúng shape form để refresh trang vẫn thấy dữ liệu cũ.
export function toSellerRegisterFormValues(
    application: SellerApplicationDto,
): SellerRegisterFormValues {
    return {
        shop: {
            name: text(application.shop.name),
            slug: text(application.shop.slug),
            mainCategoryId: text(application.shop.mainCategoryId),
            businessModel: text(application.shop.businessModel || 'retail'),
            description: text(application.shop.description),
            logoUrl: text(application.shop.logoUrl),
        },
        seller: {
            profileType: application.seller.profileType ?? 'individual',
            legalName: text(application.seller.legalName),
            citizenId: text(application.seller.citizenId),
            taxCode: text(application.seller.taxCode),
            representativeName: text(application.seller.representativeName),
            representativeRole: text(application.seller.representativeRole),
            phone: text(application.seller.phone),
            email: text(application.seller.email),
            documents: application.seller.documents ?? {},
        },
        pickupAddress: {
            contactName: text(application.pickupAddress.contactName),
            phone: text(application.pickupAddress.phone),
            provinceId: text(application.pickupAddress.provinceId),
            wardId: text(application.pickupAddress.wardId),
            addressLine: text(application.pickupAddress.addressLine),
        },
        payout: {
            bankCode: text(application.payout.bankCode),
            bankName: text(application.payout.bankName),
            accountNumber: text(application.payout.accountNumber),
            accountHolderName: text(application.payout.accountHolderName),
            accountType: application.payout.accountType ?? 'personal',
            branch: text(application.payout.branch),
        },
        acceptedTerms: shouldRestoreAcceptedTerms(application),
    };
}

// Hồ sơ ở các trạng thái này đã rời khỏi luồng nhập liệu, nên refresh phải hiện màn hình trạng thái thay vì form trống.
export function isSubmittedSellerApplication(
    application: SellerApplicationDto,
): boolean {
    return application.status === 'pending_review' || application.status === 'approved';
}

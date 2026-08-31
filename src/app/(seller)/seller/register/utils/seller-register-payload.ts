import type { SellerVerificationDocumentDto } from '@/services/seller';
import type { SellerRegisterFormValues } from '../types/seller-register-form.type';

// Chuẩn hóa chuỗi trước khi gửi backend; chuỗi rỗng thành undefined để DTO @IsOptional bỏ qua khi lưu nháp.
function optionalTrim(value: string): string | undefined {
    const normalized = value.trim();
    return normalized || undefined;
}

// Chỉ gửi đúng nhóm giấy tờ theo loại hồ sơ để backend/admin không phải xử lý tài liệu thừa sau khi user đổi loại seller.
function pickSellerDocuments(values: SellerRegisterFormValues) {
    const documents = values.seller.documents as Record<
        string,
        SellerVerificationDocumentDto | undefined
    >;

    if (values.seller.profileType === 'business') {
        return compactDocuments({
            businessLicense: documents.businessLicense,
            representativeDocument: documents.representativeDocument,
        });
    }

    return compactDocuments({
        citizenIdFront: documents.citizenIdFront,
        citizenIdBack: documents.citizenIdBack,
    });
}

// Loại bỏ key undefined để payload sạch và dễ validate ở backend.
function compactDocuments(
    documents: Record<string, SellerVerificationDocumentDto | undefined>,
) {
    return Object.entries(documents).reduce<Record<string, SellerVerificationDocumentDto>>(
        (result, [key, document]) => {
            if (document) result[key] = document;
            return result;
        },
        {},
    );
}

// Chỉ gửi đúng giấy tờ theo loại hồ sơ để backend không validate nhầm CCCD và mã số thuế cùng lúc.
function buildSellerIdentityPayload(values: SellerRegisterFormValues) {
    const isBusiness = values.seller.profileType === 'business';

    return {
        profileType: values.seller.profileType,
        legalName: optionalTrim(values.seller.legalName),
        citizenId: isBusiness ? undefined : optionalTrim(values.seller.citizenId),
        taxCode: isBusiness ? optionalTrim(values.seller.taxCode) : undefined,
        representativeName: optionalTrim(values.seller.representativeName),
        representativeRole: optionalTrim(values.seller.representativeRole),
        phone: optionalTrim(values.seller.phone),
        email: optionalTrim(values.seller.email),
        documents: pickSellerDocuments(values),
    };
}

// Chuẩn hóa toàn bộ form trước khi gọi seller-service để lưu nháp được partial nhưng submit vẫn bị backend kiểm đủ field.
export function toSellerApplicationPayload(values: SellerRegisterFormValues) {
    return {
        shop: {
            name: optionalTrim(values.shop.name),
            slug: optionalTrim(values.shop.slug),
            mainCategoryId: optionalTrim(values.shop.mainCategoryId),
            businessModel: optionalTrim(values.shop.businessModel),
            description: optionalTrim(values.shop.description),
            logoUrl: optionalTrim(values.shop.logoUrl),
        },
        seller: buildSellerIdentityPayload(values),
        pickupAddress: {
            contactName: optionalTrim(values.pickupAddress.contactName),
            phone: optionalTrim(values.pickupAddress.phone),
            provinceId: values.pickupAddress.provinceId ? Number(values.pickupAddress.provinceId) : undefined,
            provinceName: optionalTrim(values.pickupAddress.provinceName),
            districtId: values.pickupAddress.districtId ? Number(values.pickupAddress.districtId) : undefined,
            districtName: optionalTrim(values.pickupAddress.districtName),
            wardCode: optionalTrim(values.pickupAddress.wardCode),
            wardName: optionalTrim(values.pickupAddress.wardName),
            addressLine: optionalTrim(values.pickupAddress.addressLine),
        },
        payout: {
            bankCode: optionalTrim(values.payout.bankCode),
            bankName: optionalTrim(values.payout.bankName),
            accountNumber: optionalTrim(values.payout.accountNumber),
            accountHolderName: optionalTrim(values.payout.accountHolderName),
            accountType: values.payout.accountType,
            branch: optionalTrim(values.payout.branch),
        },
        acceptedTerms: values.acceptedTerms,
    };
}

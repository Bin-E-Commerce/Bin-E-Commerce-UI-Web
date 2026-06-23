import type { SellerRegisterFormValues } from '../types/seller-register-form.type';

// Chuẩn hóa dữ liệu form trước khi gọi seller-service để backend nhận chuỗi đã trim và đúng cấu trúc payload.
export function toSellerApplicationPayload(values: SellerRegisterFormValues) {
    return {
        shop: {
            name: values.shop.name.trim(),
            slug: values.shop.slug.trim(),
            mainCategoryId: values.shop.mainCategoryId,
            businessModel: values.shop.businessModel,
            description: values.shop.description.trim(),
            logoUrl: values.shop.logoUrl.trim(),
        },
        seller: {
            profileType: values.seller.profileType,
            legalName: values.seller.legalName.trim(),
            citizenId: values.seller.citizenId.trim(),
            taxCode: values.seller.taxCode.trim(),
            representativeName: values.seller.representativeName.trim(),
            representativeRole: values.seller.representativeRole.trim(),
            phone: values.seller.phone.trim(),
            email: values.seller.email.trim(),
            documents: values.seller.documents,
        },
        pickupAddress: {
            contactName: values.pickupAddress.contactName.trim(),
            phone: values.pickupAddress.phone.trim(),
            provinceId: values.pickupAddress.provinceId,
            wardId: values.pickupAddress.wardId,
            addressLine: values.pickupAddress.addressLine.trim(),
        },
        payout: {
            bankCode: values.payout.bankCode,
            bankName: values.payout.bankName.trim(),
            accountNumber: values.payout.accountNumber.trim(),
            accountHolderName: values.payout.accountHolderName.trim(),
            accountType: values.payout.accountType,
            branch: values.payout.branch.trim(),
        },
        acceptedTerms: values.acceptedTerms,
    };
}

export type SellerApplicationStatus =
    'draft' | 'pending_review' | 'approved' | 'rejected';

export type SellerProfileType = 'individual' | 'business';
export type PayoutAccountType = 'personal' | 'business';
export type SellerApplicationCorrectionTarget =
    | 'shop_information'
    | 'shop_logo'
    | 'seller_identity'
    | 'verification_documents'
    | 'pickup_address'
    | 'payout_information';

export interface SellerVerificationDocumentDto {
    assetId: string;
    url: string;
    fileName: string;
    contentType: string;
    uploadedAt: string;
}

export interface SellerApplicationPayload {
    shop?: {
        name?: string;
        slug?: string;
        mainCategoryId?: string;
        businessModel?: string;
        description?: string;
        logoUrl?: string;
    };
    seller?: {
        profileType?: SellerProfileType;
        legalName?: string;
        citizenId?: string;
        taxCode?: string;
        representativeName?: string;
        representativeRole?: string;
        phone?: string;
        email?: string;
        documents?: Record<string, SellerVerificationDocumentDto>;
    };
    pickupAddress?: {
        contactName?: string;
        phone?: string;
        provinceId?: string;
        wardId?: string;
        addressLine?: string;
    };
    payout?: {
        bankCode?: string;
        bankName?: string;
        accountNumber?: string;
        accountHolderName?: string;
        accountType?: PayoutAccountType;
        branch?: string;
    };
    acceptedTerms?: boolean;
}

export interface SellerApplicationDto {
    id: string;
    userId: string;
    userEmail: string;
    status: SellerApplicationStatus;
    submittedAt: string | null;
    reviewedAt: string | null;
    reviewNote: string | null;
    correctionTargets: SellerApplicationCorrectionTarget[];
    submissionRevision: number;
    shop: {
        name: string | null;
        slug: string | null;
        mainCategoryId: string | null;
        businessModel: string | null;
        description: string | null;
        logoUrl: string | null;
    };
    seller: {
        profileType: SellerProfileType;
        legalName: string | null;
        citizenId: string | null;
        taxCode: string | null;
        representativeName: string | null;
        representativeRole: string | null;
        phone: string | null;
        email: string | null;
        documents: Record<string, SellerVerificationDocumentDto>;
    };
    pickupAddress: {
        contactName: string | null;
        phone: string | null;
        provinceId: string | null;
        wardId: string | null;
        addressLine: string | null;
    };
    payout: {
        bankCode: string | null;
        bankName: string | null;
        accountNumber: string | null;
        accountHolderName: string | null;
        accountType: PayoutAccountType;
        branch: string | null;
    };
    createdAt: string;
    updatedAt: string;
}

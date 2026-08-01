export type ShopStatus = 'active' | 'suspended' | 'closed';

export interface ShopProfileDto {
    capabilities: {
        canUpdatePublicProfile: boolean;
    };
    shop: {
        id: string;
        name: string;
        slug: string;
        logoUrl: string;
        description: string | null;
        mainCategoryId: string;
        businessModel: string;
        contactEmail: string;
        contactPhone: string;
        status: ShopStatus;
        verifiedAt: string;
        createdAt: string;
        updatedAt: string;
    };
    tax: {
        profileType: 'individual' | 'business';
        legalName: string | null;
        taxCodeMasked: string | null;
        invoiceEmail: string | null;
        payoutBankName: string | null;
        payoutAccountHolder: string | null;
        payoutAccountNumberMasked: string | null;
        payoutAccountType: 'personal' | 'business';
    };
    identity: {
        verificationStatus: 'verified';
        profileType: 'individual' | 'business';
        legalName: string | null;
        citizenIdMasked: string | null;
        representativeName: string | null;
        representativeRole: string | null;
        contactEmail: string | null;
        contactPhone: string | null;
        documentTypes: string[];
        verifiedAt: string;
    };
}

export interface UpdateShopProfilePayload {
    name?: string;
    description?: string;
    logoUrl?: string;
    contactEmail?: string;
    contactPhone?: string;
}

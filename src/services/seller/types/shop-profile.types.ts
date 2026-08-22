export type ShopStatus = 'active' | 'suspended' | 'closed';
export type ShopProfileChangeRequestStatus =
    'pending_review' | 'approved' | 'rejected' | 'cancelled';
export type ShopProfileChangeSection = 'tax' | 'payout' | 'identity';

export interface ShopProfileRequestedChanges {
    tax?: {
        legalName?: string;
        taxCode?: string | null;
        invoiceEmail?: string;
    };
    payout?: {
        bankCode?: string;
        bankName?: string;
        accountNumber?: string;
        accountHolderName?: string;
        accountType?: 'personal' | 'business';
        branch?: string | null;
    };
    identity?: {
        legalName?: string;
        citizenId?: string | null;
        representativeName?: string;
        representativeRole?: string | null;
        contactEmail?: string;
        contactPhone?: string;
        documents?: Record<string, unknown>;
    };
}

export interface ShopProfileChangeRequestDto {
    id: string;
    shop: {
        id: string;
        name: string;
        slug: string;
        logoUrl: string;
    };
    requesterUserId: string;
    sections: ShopProfileChangeSection[];
    currentSnapshot: ShopProfileRequestedChanges;
    requestedChanges: ShopProfileRequestedChanges;
    requestNote: string;
    status: ShopProfileChangeRequestStatus;
    reviewedBy: string | null;
    reviewNote: string | null;
    submittedAt: string;
    reviewedAt: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface ShopProfileDto {
    capabilities: {
        canUpdatePublicProfile: boolean;
        canRequestSensitiveChange: boolean;
    };
    pendingChangeRequest: ShopProfileChangeRequestDto | null;
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
        payoutBankCode: string | null;
        payoutBankName: string | null;
        payoutAccountHolder: string | null;
        payoutAccountNumberMasked: string | null;
        payoutAccountType: 'personal' | 'business';
        payoutBranch: string | null;
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

export interface CreateShopProfileChangeRequestPayload {
    requestNote: string;
    tax?: ShopProfileRequestedChanges['tax'];
    payout?: ShopProfileRequestedChanges['payout'];
    identity?: ShopProfileRequestedChanges['identity'];
}

export interface UpdateShopProfilePayload {
    name?: string;
    description?: string;
    logoUrl?: string;
    contactEmail?: string;
    contactPhone?: string;
}

export interface SellerKnowledgeDomain {
    code: string;
    label: string;
    description: string;
    examples: string[];
    kind: 'knowledge' | 'live-data' | 'profile';
    status: 'DRAFT' | 'ACTIVE' | 'ARCHIVED';
    source: 'SYSTEM' | 'ADMIN';
}

export interface SellerKnowledgeRevision {
    id: string;
    revisionNumber: number;
    status: 'DRAFT' | 'VALIDATED' | 'PUBLISHED' | 'SUPERSEDED' | 'FAILED';
    contentHash: string;
    contentSize: number;
    documentMetadata: {
        slug: string;
        title: string;
        domainCode: string;
        language: string;
        effectiveFrom: string | null;
        effectiveTo: string | null;
    };
    createdAt: string;
}

export interface SellerKnowledgeDocument {
    id: string;
    slug: string;
    title: string;
    domainCode: string;
    language: string;
    status: 'DRAFT' | 'PUBLISHED' | 'EXPIRED' | 'ARCHIVED';
    effectiveFrom: string | null;
    effectiveTo: string | null;
    publishedRevisionId: string | null;
    updatedAt: string;
}

export interface SellerKnowledgePreview {
    markdown: string;
    chunks: { section: string; content: string }[];
    validation: { valid: boolean; errors: string[] };
}

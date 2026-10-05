// Kiểu giao diện và mutation chỉ thuộc luồng quản lý nhóm nội dung Seller Knowledge.

import type { SellerKnowledgeDomain } from '@/services/admin';
import type { SellerKnowledgeDomainForm } from './domain-form.types';

export interface CreateKnowledgeDomainInput extends SellerKnowledgeDomainForm {
    status: 'DRAFT';
}

export interface SetKnowledgeDomainStatusVariables {
    code: string;
    status: 'ACTIVE' | 'ARCHIVED';
}

export interface KnowledgeDomainStatusError {
    code: string;
    kind: 'published-document-required' | 'request-failed';
}

export interface KnowledgeDomainsPanelProps {
    domains: SellerKnowledgeDomain[];
    isCreating: boolean;
    isUpdating: boolean;
    onOpenDocuments: () => void;
    onAddDocumentForDomain: (code: string) => void;
    onCreate: (domain: CreateKnowledgeDomainInput) => Promise<void>;
    onSetStatus: (code: string, status: 'ACTIVE' | 'ARCHIVED') => Promise<void>;
}

export interface DomainSectionProps {
    title: string;
    description: string;
    domains: SellerKnowledgeDomain[];
    emptyMessage: string;
    scrollable?: boolean;
    isUpdating?: boolean;
    statusError?: KnowledgeDomainStatusError | null;
    onDismissStatusError?: () => void;
    onOpenDocuments?: () => void;
    onAddDocumentForDomain?: (code: string) => void;
    onSetStatus?: (code: string, status: 'ACTIVE' | 'ARCHIVED') => void;
}

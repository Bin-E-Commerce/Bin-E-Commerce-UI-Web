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

export interface KnowledgeDomainsPanelProps {
    domains: SellerKnowledgeDomain[];
    isCreating: boolean;
    isUpdating: boolean;
    onCreate: (domain: CreateKnowledgeDomainInput) => Promise<void>;
    onSetStatus: (code: string, status: 'ACTIVE' | 'ARCHIVED') => void;
}

export interface DomainSectionProps {
    title: string;
    description: string;
    domains: SellerKnowledgeDomain[];
    emptyMessage: string;
    scrollable?: boolean;
    isUpdating?: boolean;
    onSetStatus?: (code: string, status: 'ACTIVE' | 'ARCHIVED') => void;
}

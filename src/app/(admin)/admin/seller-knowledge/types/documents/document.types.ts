// Kiểu giao diện và trạng thái chỉ thuộc luồng quản lý tài liệu Seller Knowledge.

import type {
    SellerKnowledgeDocument,
    SellerKnowledgeDomain,
    SellerKnowledgePreview,
    SellerKnowledgeRevision,
} from '@/services/admin';
import type { UseFormReturn } from 'react-hook-form';
import type { SellerKnowledgeDocumentForm } from './document-form.types';

export type WorkspaceSection = 'overview' | 'content' | 'history';

export type DocumentFilters = {
    search: string;
    domain: string;
    status: string;
};

export interface KnowledgeDocumentsPanelProps {
    documents: SellerKnowledgeDocument[];
    domains: SellerKnowledgeDomain[];
    selectedDocumentId: string | null;
    filters: DocumentFilters;
    isLoading: boolean;
    hasError: boolean;
    onFiltersChange: (filters: DocumentFilters) => void;
    onRetry: () => void;
    onSelectDocument: (id: string) => void;
    onCreateDocument: () => void;
}

export interface StatusSelectProps {
    value: string;
    onValueChange: (value: string) => void;
}

export interface FilterChipProps {
    label: string;
    onRemove: () => void;
}

export interface KnowledgeDocumentWorkspaceProps {
    document: SellerKnowledgeDocument | null;
    revisions: SellerKnowledgeRevision[];
    domains: SellerKnowledgeDomain[];
    selectedRevisionId: string | null;
    formMethods: UseFormReturn<SellerKnowledgeDocumentForm>;
    isCreating: boolean;
    isEditing: boolean;
    isArchiving: boolean;
    isTesting: boolean;
    isRollingBack: boolean;
    preview?: SellerKnowledgePreview;
    testMatches: SellerKnowledgeTestMatch[];
    hasTestResult: boolean;
    testQuestion: string;
    rollbackReason: string;
    onSectionChange: (section: WorkspaceSection) => void;
    onTestQuestionChange: (value: string) => void;
    onRollbackReasonChange: (value: string) => void;
    onStartEditing: () => void;
    onLoadPreview: (revisionId: string) => void;
    onTestDraft: (revisionId: string, question: string) => void;
    onArchive: (documentId: string) => void;
    onRollback: (
        documentId: string,
        revisionId: string,
        reason: string,
    ) => void;
    section: WorkspaceSection;
}

export interface SellerKnowledgeTestMatch {
    section: string;
    content: string;
    score: number;
}

export interface DocumentRevisionHistoryProps {
    document: SellerKnowledgeDocument;
    revisions: SellerKnowledgeRevision[];
    rollbackReason: string;
    isRollingBack: boolean;
    onRollbackReasonChange: (value: string) => void;
    onLoadPreview: (revisionId: string) => void;
    onRollback: (
        documentId: string,
        revisionId: string,
        reason: string,
    ) => void;
}

export interface MarkdownFocusTarget {
    focus: () => void;
}

export interface MarkdownDocumentEditorProps {
    value: string;
    onChange: (value: string) => void;
    onBlur: () => void;
    inputRef: (target: MarkdownFocusTarget | null) => void;
    invalid: boolean;
    describedBy?: string;
}

export interface SaveRevisionVariables {
    id: string;
    payload: Parameters<
        typeof import('@/services/admin').adminSellerKnowledgeService.saveRevision
    >[1];
}

export interface TestDraftVariables {
    revisionId: string;
    question: string;
}

export interface RollbackVariables {
    documentId: string;
    revisionId: string;
    reason: string;
}

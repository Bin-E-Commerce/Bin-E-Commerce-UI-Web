import { API_VERSION } from '@/config/api.config';
import authorizedAxios from '@/utils/authorizedAxios';
import type {
    SellerKnowledgeDocument,
    SellerKnowledgeDomain,
    SellerKnowledgePreview,
    SellerKnowledgeRevision,
} from '../types/seller-knowledge.types';

const baseUrl = `${API_VERSION}/admin/seller-knowledge`;

// Admin knowledge API chỉ gọi Gateway; quyền được kiểm tra ở Gateway và lặp lại tại Seller Service.
export const adminSellerKnowledgeService = {
    listDocuments: (
        params: { search?: string; domain?: string; status?: string } = {},
    ) =>
        authorizedAxios
            .get<SellerKnowledgeDocument[]>(`${baseUrl}/documents`, { params })
            .then((response) => response.data),
    listDomains: () =>
        authorizedAxios
            .get<SellerKnowledgeDomain[]>(`${baseUrl}/domains`)
            .then((response) => response.data),
    createDomain: (payload: {
        code: string;
        label: string;
        description: string;
        examples?: string;
        status: 'DRAFT' | 'ACTIVE';
    }) =>
        authorizedAxios
            .post<SellerKnowledgeDomain>(`${baseUrl}/domains`, payload)
            .then((response) => response.data),
    setDomainStatus: (code: string, status: 'ACTIVE' | 'ARCHIVED') =>
        authorizedAxios
            .patch<SellerKnowledgeDomain>(
                `${baseUrl}/domains/${encodeURIComponent(code)}/${status}`,
            )
            .then((response) => response.data),
    getDocument: (id: string) =>
        authorizedAxios
            .get<{
                document: SellerKnowledgeDocument;
                revisions: SellerKnowledgeRevision[];
            }>(`${baseUrl}/documents/${id}`)
            .then((response) => response.data),
    archiveDocument: (id: string) =>
        authorizedAxios
            .post(`${baseUrl}/documents/${id}/archive`)
            .then((response) => response.data),
    createDocument: (payload: {
        title: string;
        slug: string;
        domainCode: string;
        language: string;
        effectiveFrom?: string;
        effectiveTo?: string;
        markdown: string;
    }) =>
        authorizedAxios
            .post<{
                document: SellerKnowledgeDocument;
                revision: SellerKnowledgeRevision;
            }>(`${baseUrl}/documents`, payload)
            .then((response) => response.data),
    saveRevision: (
        id: string,
        payload: {
            title: string;
            slug: string;
            domainCode: string;
            language: string;
            effectiveFrom?: string;
            effectiveTo?: string;
            markdown: string;
        },
    ) =>
        authorizedAxios
            .post<SellerKnowledgeRevision>(
                `${baseUrl}/documents/${id}/revisions`,
                payload,
            )
            .then((response) => response.data),
    preview: (revisionId: string) =>
        authorizedAxios
            .get<SellerKnowledgePreview>(
                `${baseUrl}/revisions/${revisionId}/preview`,
            )
            .then((response) => response.data),
    testDraft: (revisionId: string, question: string) =>
        authorizedAxios
            .post<{
                matches: { section: string; content: string; score: number }[];
            }>(`${baseUrl}/revisions/${revisionId}/test-query`, { question })
            .then((response) => response.data),
    publish: (revisionId: string) =>
        authorizedAxios
            .post<{ id: string; status: string }>(
                `${baseUrl}/revisions/${revisionId}/publish`,
            )
            .then((response) => response.data),
    rollback: (id: string, revisionId: string, reason: string) =>
        authorizedAxios
            .post<{ id: string; status: string }>(
                `${baseUrl}/documents/${id}/rollback/${revisionId}`,
                { reason },
            )
            .then((response) => response.data),
};

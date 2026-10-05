// File này quản lý truy vấn/cache và mutation của Admin Seller Knowledge; component sở hữu cách trình bày lỗi.
'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { adminSellerKnowledgeService } from '@/services/admin';
import type {
    DocumentFilters,
    SaveRevisionVariables,
    TestDraftVariables,
    RollbackVariables,
} from '../types/documents/document.types';
import type { SetKnowledgeDomainStatusVariables } from '../types/domains/domain.types';

const DOCUMENTS_KEY = ['admin-seller-knowledge-documents'];
const DOMAINS_KEY = ['admin-seller-knowledge-domains'];
const PUBLISH_TOAST_ID = 'admin-seller-knowledge-publish';

// Hook sở hữu truy vấn, cache và mutation của Admin knowledge; component chỉ gọi API qua service adapter.
export function useSellerKnowledgeAdmin() {
    const queryClient = useQueryClient();
    const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(
        null,
    );
    const [selectedRevisionId, selectRevision] = useState<string | null>(null);
    const [documentFilters, setDocumentFilters] = useState<DocumentFilters>({
        search: '',
        domain: '',
        status: '',
    });
    const documentsQuery = useQuery({
        queryKey: [...DOCUMENTS_KEY, documentFilters],
        queryFn: () =>
            adminSellerKnowledgeService.listDocuments({
                search: documentFilters.search || undefined,
                domain: documentFilters.domain || undefined,
                status: documentFilters.status || undefined,
            }),
    });
    const domainsQuery = useQuery({
        queryKey: DOMAINS_KEY,
        queryFn: adminSellerKnowledgeService.listDomains,
    });
    const detailsQuery = useQuery({
        queryKey: [...DOCUMENTS_KEY, selectedDocumentId],
        queryFn: () =>
            adminSellerKnowledgeService.getDocument(selectedDocumentId!),
        enabled: Boolean(selectedDocumentId),
    });
    const previewQuery = useQuery({
        queryKey: ['admin-seller-knowledge-preview', selectedRevisionId],
        queryFn: () => adminSellerKnowledgeService.preview(selectedRevisionId!),
        enabled: Boolean(selectedRevisionId),
    });

    // Đồng bộ lại danh sách và chọn document mới khi lần tạo đầu tiên thành công.
    const createDocument = useMutation({
        mutationFn: adminSellerKnowledgeService.createDocument,
        onSuccess: async ({ document, revision }) => {
            toast.success('Đã lưu tài liệu dưới dạng bản nháp.');
            selectDocument(document.id);
            selectRevision(revision.id);
            await queryClient.invalidateQueries({ queryKey: DOCUMENTS_KEY });
        },
        onError: () =>
            toast.error(
                'Chưa thể lưu tài liệu. Vui lòng kiểm tra nội dung và thử lại.',
            ),
    });

    // Lưu thay đổi thành revision kế tiếp; nội dung revision đã publish không bị ghi đè.
    const saveRevision = useMutation({
        mutationFn: ({ id, payload }: SaveRevisionVariables) =>
            adminSellerKnowledgeService.saveRevision(id, payload),
        onSuccess: async (revision, variables) => {
            toast.success('Đã tạo phiên bản nháp mới.');
            selectRevision(revision.id);
            await Promise.all([
                queryClient.invalidateQueries({ queryKey: DOCUMENTS_KEY }),
                queryClient.invalidateQueries({
                    queryKey: [...DOCUMENTS_KEY, variables.id],
                }),
            ]);
        },
        onError: () => toast.error('Chưa thể lưu phiên bản mới.'),
    });

    // Chỉ xếp hạng draft tại thời điểm thử; không cache câu hỏi hay tài liệu đã gõ trong browser query key.
    const testDraft = useMutation({
        mutationFn: ({ revisionId, question }: TestDraftVariables) =>
            adminSellerKnowledgeService.testDraft(revisionId, question),
        onError: () => toast.error('Không thể chạy thử tìm kiếm cho bản nháp.'),
    });

    // API chỉ trả thành công sau khi lập chỉ mục và cập nhật revision đang dùng hoàn tất.
    // Giữ toast loading cùng một ID để người dùng thấy thao tác đang chạy và được thay bằng kết quả cuối.
    // Sau đó nạp lại document để tiến trình phản ánh đúng nhóm đã sẵn sàng cho BinGPT hay còn cần khôi phục.
    const publish = useMutation({
        mutationFn: adminSellerKnowledgeService.publish,
        onMutate: () => {
            toast.loading('Đang kiểm tra, lập chỉ mục và xuất bản tài liệu…', {
                id: PUBLISH_TOAST_ID,
            });
        },
        onSuccess: async () => {
            toast.success(
                'Đã xuất bản tài liệu. Xem bước “Đang sử dụng” để biết tài liệu đã sẵn sàng cho BinGPT chưa.',
                { id: PUBLISH_TOAST_ID },
            );
            await Promise.all([
                queryClient.invalidateQueries({ queryKey: DOCUMENTS_KEY }),
                queryClient.invalidateQueries({
                    queryKey: [...DOCUMENTS_KEY, selectedDocumentId],
                }),
            ]);
        },
        onError: () =>
            toast.error(
                'Xuất bản chưa thành công; phiên bản đang dùng vẫn được giữ nguyên.',
                { id: PUBLISH_TOAST_ID },
            ),
    });

    // Tạo revision mới từ nội dung cũ rồi refresh lịch sử sau khi backend publish rollback hoàn tất.
    const rollback = useMutation({
        mutationFn: ({ documentId, revisionId, reason }: RollbackVariables) =>
            adminSellerKnowledgeService.rollback(
                documentId,
                revisionId,
                reason,
            ),
        onSuccess: async () => {
            toast.success(
                'Đã khôi phục nội dung bằng một phiên bản phát hành mới.',
            );
            await Promise.all([
                queryClient.invalidateQueries({ queryKey: DOCUMENTS_KEY }),
                queryClient.invalidateQueries({
                    queryKey: [...DOCUMENTS_KEY, selectedDocumentId],
                }),
            ]);
        },
        onError: () => toast.error('Không thể khôi phục phiên bản đã chọn.'),
    });

    // Domain vừa tạo được nạp lại để dùng ngay trong biểu mẫu tạo tài liệu.
    const createDomain = useMutation({
        mutationFn: adminSellerKnowledgeService.createDomain,
        onSuccess: async () => {
            toast.success('Domain tài liệu đã được đăng ký.');
            await queryClient.invalidateQueries({ queryKey: DOMAINS_KEY });
        },
        onError: () =>
            toast.error('Không thể tạo domain. Hãy kiểm tra mã và mô tả.'),
    });

    // Đổi trạng thái domain làm mới catalog hiển thị và planner nhận trạng thái mới ở lần phân loại kế tiếp.
    const setDomainStatus = useMutation({
        mutationFn: ({ code, status }: SetKnowledgeDomainStatusVariables) =>
            adminSellerKnowledgeService.setDomainStatus(code, status),
        onSuccess: async () => {
            toast.success('Đã cập nhật trạng thái domain.');
            await queryClient.invalidateQueries({ queryKey: DOMAINS_KEY });
        },
        onError: async () => {
            // Lỗi mạng có thể xảy ra sau khi server đã ghi dữ liệu; tải lại để UI không giữ nhãn cũ.
            await queryClient.invalidateQueries({ queryKey: DOMAINS_KEY });
        },
    });

    // Đánh dấu tài liệu ngừng sử dụng, nhưng vẫn giữ revision và vector đã lập chỉ mục để kiểm toán/khôi phục.
    const archiveDocument = useMutation({
        mutationFn: adminSellerKnowledgeService.archiveDocument,
        onSuccess: async () => {
            toast.success('Đã chuyển tài liệu sang trạng thái ngừng sử dụng.');
            await Promise.all([
                queryClient.invalidateQueries({ queryKey: DOCUMENTS_KEY }),
                queryClient.invalidateQueries({
                    queryKey: [...DOCUMENTS_KEY, selectedDocumentId],
                }),
            ]);
        },
        onError: () => toast.error('Không thể ngừng sử dụng tài liệu.'),
    });

    // Khôi phục trạng thái tài liệu và nạp lại list/detail để nhãn, revision và khả năng thao tác không bị cũ.
    const restoreDocument = useMutation({
        mutationFn: adminSellerKnowledgeService.restoreDocument,
        onSuccess: async (_, documentId) => {
            toast.success(
                'Đã khôi phục tài liệu. Nếu nhóm vẫn ngừng sử dụng, hãy khôi phục nhóm riêng để BinGPT dùng tài liệu.',
            );
            await Promise.all([
                queryClient.invalidateQueries({ queryKey: DOCUMENTS_KEY }),
                queryClient.invalidateQueries({
                    queryKey: [...DOCUMENTS_KEY, documentId],
                }),
            ]);
        },
        onError: () =>
            toast.error('Không thể khôi phục tài liệu. Hãy thử lại.'),
    });

    // Khi đổi document, bỏ revision đang chọn của tài liệu trước để preview không bị lẫn.
    function selectDocument(id: string | null) {
        setSelectedDocumentId(id);
        selectRevision(null);
    }

    // Trả giao diện các giá trị mặc định an toàn để page không cần phân nhánh riêng giữa loading và data rỗng.
    return {
        documents: documentsQuery.data ?? [],
        domains: domainsQuery.data ?? [],
        details: detailsQuery.data,
        preview: previewQuery.data,
        selectedDocumentId,
        selectedRevisionId,
        selectDocument,
        selectRevision,
        documentFilters,
        setDocumentFilters,
        isDocumentsLoading: documentsQuery.isLoading,
        hasDocumentsError: documentsQuery.isError,
        reloadDocuments: () => documentsQuery.refetch(),
        createDocument,
        saveRevision,
        testDraft,
        publish,
        rollback,
        createDomain,
        setDomainStatus,
        archiveDocument,
        restoreDocument,
        isSaving: createDocument.isPending || saveRevision.isPending,
        loadPreview: async (revisionId: string) => {
            selectRevision(revisionId);
            return queryClient.fetchQuery({
                queryKey: ['admin-seller-knowledge-preview', revisionId],
                queryFn: () => adminSellerKnowledgeService.preview(revisionId),
            });
        },
        notifyError: (message: string) => toast.error(message),
    };
}

// Màn hình Seller Center điều phối chọn sản phẩm, tạo job preview và theo dõi apply ảnh AI.
// Component giữ orchestration/query lifecycle; các vùng UI độc lập nằm trong thư mục components/dashboard.
// Không đưa business rule analytics hoặc API call trực tiếp vào các component presentational.

'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { AlertCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { sellerProductService } from '@/services/product';
import type { SellerProductListItem } from '@/services/product';
import { useAppSelector } from '@/store/hooks';
import { hasPermission } from '@/services/auth/access/session-access';
import { getErrorMessage } from '@/utils/getErrorMessage';
import { AiAssistantIcon } from '@/components/ui/ai-assistant-button';
import { AiFeatureCard } from './cards/AiFeatureCard';
import { AiUsageCard } from './cards/AiUsageCard';
import {
    AiOptimizationActionBar,
    type ProductImageSelectionChange,
} from './product-list/AiOptimizationActionBar';
import { AiOptimizationProductList } from './product-list/AiOptimizationProductList';
import { AiImpactProductCard } from './impact/AiImpactProductCard';
import { AiOptimizationPreviewDialog } from '../preview-dialog/AiOptimizationPreviewDialog';
import {
    useAiOptimizationJob,
    useAiOptimizationProductImpacts,
    useAiOptimizationOverview,
    useApplyAiOptimizationJob,
    useCreateAiOptimizationJobs,
    useRejectAiOptimizationJob,
} from '../../hooks/useAiOptimization';
import type {
    ImageOptimizationProduct,
    LifestyleBackgroundInput,
    OptimizationMode,
} from '@/services/ai/types/image-optimization.types';

// Chuyển item sản phẩm hiện tại sang view model dashboard mà không thay đổi contract của Product Service.
function toOptimizationProduct(
    product: SellerProductListItem,
): ImageOptimizationProduct {
    return {
        id: product.id,
        name: product.name,
        thumbnailUrl: product.thumbnailUrl,
        totalSold: product.totalSold,
        aiStatus:
            (product.aiOptimizationStatus as ImageOptimizationProduct['aiStatus']) ??
            null,
        updatedAt: product.updatedAt,
    };
}

// Dashboard orchestration: selection, tạo job, polling preview và trạng thái permission.
export function AiOptimizationDashboard() {
    const user = useAppSelector((state) => state.auth.user);
    const canView = hasPermission(user, 'seller.ai.image_optimization.view');
    const canGenerate = hasPermission(
        user,
        'seller.ai.image_optimization.generate',
    );
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [selectedAssetIdsByProduct, setSelectedAssetIdsByProduct] = useState<
        Record<string, string[]>
    >({});
    const [
        selectedSourceImageUrlsByProduct,
        setSelectedSourceImageUrlsByProduct,
    ] = useState<Record<string, string | null>>({});
    const [mode, setMode] = useState<OptimizationMode>('WHITE_BACKGROUND');
    const [lifestyleBackground, setLifestyleBackground] =
        useState<LifestyleBackgroundInput>({ preset: 'MINIMAL_STUDIO' });
    const [activeProduct, setActiveProduct] =
        useState<ImageOptimizationProduct | null>(null);
    const [activeJobId, setActiveJobId] = useState<string | null>(null);
    const [finalizationRequested, setFinalizationRequested] = useState(false);
    const [finalizationCompleted, setFinalizationCompleted] = useState(false);
    const finalizationApplyStartedRef = useRef(false);
    const [productSearchInput, setProductSearchInput] = useState('');
    const [productSearch, setProductSearch] = useState('');
    const [productPage, setProductPage] = useState(1);

    const overviewQuery = useAiOptimizationOverview();
    const queryClient = useQueryClient();
    const productsQuery = useQuery({
        queryKey: [
            'seller-ai-image-optimization-products',
            productSearch,
            productPage,
        ],
        queryFn: () =>
            sellerProductService.listOwnedProducts({
                search: productSearch || undefined,
                page: productPage,
                pageSize: 20,
            }),
        enabled: canView,
        staleTime: 30_000,
    });
    const createMutation = useCreateAiOptimizationJobs();
    const rejectMutation = useRejectAiOptimizationJob();
    const applyMutation = useApplyAiOptimizationJob();
    const activeJobQuery = useAiOptimizationJob(activeJobId);
    const finalizationStatus = activeJobQuery.data?.status;
    const finalizationTerminal =
        finalizationStatus === 'FAILED' ||
        finalizationStatus === 'REJECTED' ||
        finalizationStatus === 'APPLIED';
    const finalizationInProgress =
        finalizationRequested && !finalizationTerminal;
    // Trạng thái APPLIED từ polling được suy ra trực tiếp trong render để không cần effect gọi setState đồng bộ.
    const finalizationCompletedFromPolling =
        finalizationRequested && finalizationStatus === 'APPLIED';
    const isFinalizationCompleted =
        finalizationCompleted || finalizationCompletedFromPolling;
    const aiQuotaExhausted =
        overviewQuery.data?.aiUsage?.enabled === true &&
        overviewQuery.data.aiUsage.remaining === 0;
    const customDescription = lifestyleBackground.description?.trim() ?? '';
    const hasInvalidLifestyleDescription =
        mode === 'LIFESTYLE_BACKGROUND' &&
        customDescription.length > 0 &&
        customDescription.length < 10;
    const products = useMemo(
        () => (productsQuery.data?.items ?? []).map(toOptimizationProduct),
        [productsQuery.data?.items],
    );
    const impactProductsQuery = useAiOptimizationProductImpacts(
        products.map((product) => product.id),
    );
    const productsWithImpact = useMemo(() => {
        const impactByProductId = new Map(
            (impactProductsQuery.data?.items ?? []).map((impact) => [
                impact.productId,
                impact,
            ]),
        );

        return products.map((product) => ({
            ...product,
            impact: impactByProductId.get(product.id),
        }));
    }, [impactProductsQuery.data?.items, products]);
    // Radio selection chi giu mot san pham, khong goi API cho den khi seller nhan CTA xac nhan.
    const toggleProduct = (productId: string) => {
        setSelectedIds((current) =>
            current[0] === productId ? [] : [productId],
        );
    };

    // Tìm kiếm dùng query server-side để không chỉ lọc trên 20 sản phẩm đang có trong trang hiện tại.
    const handleProductSearch = (value: string) => {
        setSelectedIds([]);
        setProductPage(1);
        setProductSearch(value.trim());
    };

    // Đổi trang sẽ bỏ lựa chọn cũ vì sản phẩm đang chọn có thể không còn nằm trong trang mới.
    const handleProductPageChange = (page: number) => {
        const totalPages = productsQuery.data?.totalPages ?? 1;
        if (page < 1 || page > totalPages || page === productPage) return;
        setSelectedIds([]);
        setProductPage(page);
    };

    const selectedProductId = selectedIds[0];
    const selectedProductWithImpact = productsWithImpact.find(
        (product) => product.id === selectedProductId,
    );
    const selectedSourceAssetIds = selectedProductId
        ? (selectedAssetIdsByProduct[selectedProductId] ?? [])
        : [];
    const hasValidOptimizationSelection =
        selectedIds.length === 1 && selectedSourceAssetIds.length === 1;

    // Cập nhật lựa chọn ảnh theo đúng product đang mở action card để không trộn state giữa các sản phẩm.
    const handleImageSelectionChange = (
        productId: string,
        selection: ProductImageSelectionChange,
    ) => {
        setSelectedAssetIdsByProduct((current) => ({
            ...current,
            [productId]: selection.assetIds,
        }));
        setSelectedSourceImageUrlsByProduct((current) => ({
            ...current,
            [productId]: selection.primaryImageUrl,
        }));
    };

    // Tao dung mot job cho mot san pham va mot anh, khoa CTA trong luc request va mo preview khi backend accepted.
    const handleCreateJobs = async () => {
        if (
            !canGenerate ||
            !hasValidOptimizationSelection ||
            createMutation.isPending ||
            hasInvalidLifestyleDescription
        )
            return;
        try {
            const result = await createMutation.mutateAsync({
                productIds: selectedIds,
                modes: [mode],
                background:
                    mode === 'LIFESTYLE_BACKGROUND'
                        ? lifestyleBackground
                        : undefined,
                sourceAssetIds: selectedSourceAssetIds,
            });
            const first = result.jobs[0];
            if (first) {
                setFinalizationCompleted(false);
                setActiveJobId(first.jobId);
                const product = products.find(
                    (item) => item.id === first.productId,
                );
                // Truyền ảnh nguồn seller vừa chọn sang dialog để before/after luôn khớp với output đang xử lý.
                setActiveProduct(
                    product
                        ? {
                              ...product,
                              sourceImageUrl:
                                  selectedSourceImageUrlsByProduct[
                                      first.productId
                                  ] ?? product.thumbnailUrl,
                          }
                        : null,
                );
            }
            setSelectedIds([]);
        } catch (error: unknown) {
            // Bắt lỗi mutation ngay trong event handler để Axios 429/5xx không tạo Runtime Error overlay của Next.js.
            toast.error(getErrorMessage(error));
        }
    };

    // Tu choi output va dong preview sau khi AI Service xac nhan cleanup workflow.
    const handleReject = async () => {
        if (!activeJobId) return;
        try {
            await rejectMutation.mutateAsync(activeJobId);
            setActiveJobId(null);
            setActiveProduct(null);
            finalizationApplyStartedRef.current = false;
            setFinalizationRequested(false);
            setFinalizationCompleted(false);
        } catch (error: unknown) {
            // Giữ dialog mở khi cleanup thất bại để seller có thể thử lại thay vì mất context job.
            toast.error(getErrorMessage(error));
        }
    };

    // Apply dung version luc tao job de Product Service chan ghi de thay doi moi cua seller.
    const handleApply = useCallback(async () => {
        if (!activeJobId || !activeProduct || !activeJobQuery.data) return;
        try {
            // Dùng version server trả cùng job để tránh lệch định dạng hoặc timestamp stale từ danh sách sản phẩm.
            const expectedProductUpdatedAt =
                activeJobQuery.data.expectedProductUpdatedAt ??
                activeProduct.updatedAt;
            const result = await applyMutation.mutateAsync({
                jobId: activeJobId,
                expectedProductUpdatedAt,
            });
            if (result.status === 'FINALIZING') {
                finalizationApplyStartedRef.current = false;
                setFinalizationCompleted(false);
                setFinalizationRequested(true);
                toast.success(
                    'Đang hoàn thiện ảnh chất lượng cao trước khi áp dụng.',
                );
                return;
            }
            if (result.status === 'APPLIED') {
                setFinalizationRequested(false);
                setFinalizationCompleted(true);
                return;
            }
            setActiveJobId(null);
            setActiveProduct(null);
            finalizationApplyStartedRef.current = false;
            setFinalizationRequested(false);
            setFinalizationCompleted(false);
        } catch (error: unknown) {
            // Lỗi optimistic-lock hoặc permission phải hiện trong toast và vẫn giữ preview để seller xử lý tiếp.
            finalizationApplyStartedRef.current = false;
            setFinalizationRequested(false);
            setFinalizationCompleted(false);
            toast.error(getErrorMessage(error));
        }
    }, [activeJobId, activeProduct, activeJobQuery.data, applyMutation]);

    // Tự động gửi bước apply lần cuối khi ảnh medium đã sẵn sàng, tránh bắt seller bấm lại.
    useEffect(() => {
        if (
            !finalizationRequested ||
            !activeJobId ||
            !activeProduct ||
            applyMutation.isPending
        )
            return;
        const status = activeJobQuery.data?.status;
        // Trạng thái terminal được suy ra ở render để effect không setState đồng bộ và không tạo cascading render.
        if (finalizationTerminal) return;
        if (status !== 'REVIEW_REQUIRED') return;
        // Chi chay buoc apply cuoi khi query da nhan job FINAL, tranh gui lap luc cache con REVIEW_REQUIRED cua ban preview.
        if (activeJobQuery.data?.generationProfile !== 'FINAL') return;
        if (finalizationApplyStartedRef.current) return;
        finalizationApplyStartedRef.current = true;
        void handleApply();
    }, [
        activeJobId,
        activeJobQuery.data?.generationProfile,
        activeJobQuery.data?.status,
        activeProduct,
        applyMutation.isPending,
        finalizationTerminal,
        finalizationRequested,
        handleApply,
    ]);

    // Giữ trạng thái thành công đủ lâu để seller nhìn thấy bước cuối rồi mới đóng dialog và làm mới danh sách.
    useEffect(() => {
        if (!isFinalizationCompleted) return;
        // Khi worker đã apply xong, gallery phải đọc lại lineage mới để badge Đã tối ưu xuất hiện ngay.
        if (activeProduct) {
            void queryClient.invalidateQueries({
                queryKey: ['seller-ai-product-images', activeProduct.id],
            });
        }
        void queryClient.invalidateQueries({
            queryKey: ['seller-ai-image-optimization-products'],
        });
        const timeout = window.setTimeout(() => {
            setActiveJobId(null);
            setActiveProduct(null);
            setFinalizationRequested(false);
            setFinalizationCompleted(false);
            finalizationApplyStartedRef.current = false;
        }, 1_800);

        return () => window.clearTimeout(timeout);
    }, [activeProduct, isFinalizationCompleted, queryClient]);

    if (!canView) {
        return (
            <Card className="p-8">
                <div className="flex items-start gap-3 text-sm text-zinc-600">
                    <AlertCircle
                        className="mt-0.5 size-5 text-zinc-950"
                        aria-hidden="true"
                    />
                    <p>
                        Bạn chưa được cấp quyền sử dụng công cụ tối ưu ảnh AI.
                    </p>
                </div>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            <section className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm">
                <div className="relative overflow-hidden bg-gradient-to-br from-white via-zinc-50 to-zinc-100 text-zinc-950">
                    <div className="absolute -right-16 -top-20 size-56 rounded-full bg-zinc-200/70 blur-3xl" />
                    <div className="relative mx-4 flex flex-col gap-4 border-b border-zinc-200 px-1 py-4 sm:mx-5 sm:flex-row sm:items-center sm:gap-6 sm:py-5">
                        <div className="min-w-0 flex-1">
                            <div className="flex items-start gap-2.5">
                                <span className="flex size-11 shrink-0 items-center justify-center text-zinc-950">
                                    <AiAssistantIcon size={28} />
                                </span>
                                <div>
                                    <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
                                        Tối ưu hình ảnh sản phẩm
                                    </h1>
                                    <p className="mt-1 text-sm leading-5 text-zinc-600">
                                        Tạo nền trắng chuyên nghiệp hoặc nền
                                        lifestyle bằng AI. Bạn luôn xem trước và
                                        duyệt kết quả trước khi áp dụng.
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="w-full shrink-0 sm:w-64 lg:w-72">
                            <AiUsageCard
                                usage={overviewQuery.data?.aiUsage}
                                className="mt-0"
                            />
                        </div>
                    </div>
                </div>
                <div className="grid gap-3 bg-zinc-50/70 p-4 md:grid-cols-2 md:p-5">
                    <AiFeatureCard
                        eyebrow="Hình ảnh"
                        title="Nền trắng sạch và đồng nhất"
                        description="Tạo ảnh nền trắng sạch, đồng nhất để sản phẩm nổi bật hơn khi đăng bán và giữ chi phí xử lý ở mức tối ưu."
                        imageSrc="/images/ai/product-optimization/product-ai-white-background.png"
                        imageAlt="Minh họa quy trình tạo ảnh nền trắng cho sản phẩm"
                    />
                    <AiFeatureCard
                        eyebrow="Lifestyle"
                        title="Bối cảnh phù hợp để nổi bật"
                        description="Tạo bối cảnh lifestyle phù hợp để gian hàng chuyên nghiệp hơn, đồng thời giữ nguyên sản phẩm và hạn chế nội dung quảng cáo không kiểm chứng."
                        imageSrc="/images/ai/product-optimization/product-ai-content-points.png"
                        imageAlt="Minh họa AI tạo bối cảnh lifestyle cho sản phẩm"
                    />
                </div>
            </section>

            <AiOptimizationProductList
                visibleProducts={productsWithImpact}
                selectedIds={selectedIds}
                searchValue={productSearchInput}
                page={productsQuery.data?.page ?? productPage}
                totalPages={productsQuery.data?.totalPages ?? 1}
                totalItems={productsQuery.data?.totalItems ?? 0}
                isLoading={productsQuery.isLoading}
                isError={productsQuery.isError}
                isFetching={productsQuery.isFetching}
                onSearchChange={setProductSearchInput}
                onSearch={handleProductSearch}
                onPageChange={handleProductPageChange}
                onRefresh={() => void productsQuery.refetch()}
                onToggleProduct={toggleProduct}
            />

            {selectedProductWithImpact?.aiStatus === 'APPLIED' &&
            selectedProductWithImpact.impact ? (
                <AiImpactProductCard
                    product={selectedProductWithImpact}
                    compact
                />
            ) : null}

            {selectedIds.length > 0 ? (
                <AiOptimizationActionBar
                    selectedIds={selectedIds}
                    selectedAssetIdsByProduct={selectedAssetIdsByProduct}
                    mode={mode}
                    lifestyleBackground={lifestyleBackground}
                    canGenerate={canGenerate}
                    createPending={createMutation.isPending}
                    aiQuotaExhausted={aiQuotaExhausted}
                    hasInvalidLifestyleDescription={
                        hasInvalidLifestyleDescription
                    }
                    onModeChange={setMode}
                    onLifestyleBackgroundChange={setLifestyleBackground}
                    onImageSelectionChange={handleImageSelectionChange}
                    onStartOptimization={() => void handleCreateJobs()}
                />
            ) : null}

            <AiOptimizationPreviewDialog
                product={activeProduct}
                job={activeJobQuery.data ?? null}
                open={Boolean(activeJobId)}
                onOpenChange={(open) => {
                    if (
                        !open &&
                        !applyMutation.isPending &&
                        !rejectMutation.isPending &&
                        !finalizationInProgress
                    ) {
                        setActiveJobId(null);
                        setActiveProduct(null);
                        setFinalizationRequested(false);
                        setFinalizationCompleted(false);
                    }
                }}
                onReject={() => void handleReject()}
                rejecting={rejectMutation.isPending}
                onApply={() => void handleApply()}
                applying={applyMutation.isPending || finalizationInProgress}
                completed={isFinalizationCompleted}
            />
        </div>
    );
}

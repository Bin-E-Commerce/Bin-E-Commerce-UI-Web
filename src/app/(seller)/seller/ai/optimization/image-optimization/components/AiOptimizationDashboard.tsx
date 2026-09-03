// Màn hình Seller Center cho quy trình tối ưu ảnh bằng AI.
// Component chỉ ghép layout và điều phối trạng thái; dữ liệu/mutation nằm trong React Query hook.
// Các ảnh minh họa được phục vụ từ assets nội bộ để giao diện ổn định, không phụ thuộc hotlink.

//  Màn hình Seller Center điều phối tối ưu ảnh AI và cho phép seller chạy lại sản phẩm đã từng áp dụng.

'use client';

import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';
import {
    AlertCircle,
    BarChart3,
    CheckCircle2,
    ChevronRight,
    Package,
    RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { sellerProductService } from '@/services/product';
import type { SellerProductListItem } from '@/services/product';
import { useAppSelector } from '@/store/hooks';
import { hasPermission } from '@/services/auth/access/session-access';
import { getErrorMessage } from '@/utils/getErrorMessage';
import { AiAssistantIcon } from '@/components/ui/ai-assistant-button';
import { AiOptimizationPreviewDialog } from './AiOptimizationPreviewDialog';
import { LifestyleBackgroundStudio } from './LifestyleBackgroundStudio';
import { ProductImageSelectionPanel } from './ProductImageSelectionPanel';
import {
    useAiOptimizationJob,
    useAiOptimizationOverview,
    useApplyAiOptimizationJob,
    useCreateAiOptimizationJobs,
    useRejectAiOptimizationJob,
} from '../hooks/useAiOptimization';
import type {
    ImageOptimizationProduct,
    LifestyleBackgroundInput,
    OptimizationMode,
} from '../types/ai-image-optimization.types';

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

// Hiển thị số liệu thật hoặc dấu gạch khi backend chưa có snapshot metric, tránh tạo cảm giác có dữ liệu giả.
function MetricCard({
    label,
    value,
    icon: Icon,
}: {
    label: string;
    value: number | null | undefined;
    icon: typeof Package;
}) {
    return (
        <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between gap-3">
                <span className="flex size-9 items-center justify-center rounded-xl bg-zinc-950 text-white">
                    <Icon className="size-4" aria-hidden="true" />
                </span>
                <span className="text-xs font-medium text-zinc-500">
                    {label}
                </span>
            </div>
            <p className="mt-4 text-2xl font-semibold tabular-nums text-zinc-950">
                {value ?? '—'}
            </p>
        </div>
    );
}

interface AiFeatureCardProps {
    eyebrow: string;
    title: string;
    description: string;
    imageSrc: string;
    imageAlt: string;
}

// Hiển thị một khả năng tối ưu ảnh bằng ảnh minh họa thật và lớp thông tin ngắn.
// Component không chứa logic tạo job; nó chỉ giúp seller hiểu đầu ra trước khi chọn sản phẩm.
function AiFeatureCard({
    eyebrow,
    title,
    description,
    imageSrc,
    imageAlt,
}: AiFeatureCardProps) {
    return (
        <article className="group relative overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition-[transform,box-shadow] duration-300 motion-safe:hover:-translate-y-1 motion-safe:hover:shadow-lg">
            <div className="flex items-start justify-between gap-4 border-b border-zinc-100 px-5 pb-4 pt-5">
                <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-zinc-500">
                        {eyebrow}
                    </p>
                    <h2 className="mt-1 text-lg font-semibold tracking-tight text-zinc-950">
                        {title}
                    </h2>
                </div>
                <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-zinc-950 text-white shadow-sm">
                    <AiAssistantIcon size={18} className="invert" />
                </span>
            </div>
            <div className="relative mx-5 mt-5 overflow-hidden rounded-xl border border-zinc-200 bg-zinc-100 shadow-inner">
                <img
                    src={imageSrc}
                    alt={imageAlt}
                    loading="lazy"
                    decoding="async"
                    className="aspect-[3/1] h-full w-full bg-white object-contain transition-transform duration-500 motion-safe:group-hover:scale-[1.03]"
                />
            </div>
            <p className="px-5 pb-5 pt-4 text-sm leading-6 text-zinc-600">
                {description}
            </p>
        </article>
    );
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
    const [activeTab, setActiveTab] = useState<'pending' | 'optimized'>(
        'pending',
    );

    const overviewQuery = useAiOptimizationOverview();
    const productsQuery = useQuery({
        queryKey: ['seller-ai-image-optimization-products'],
        queryFn: () =>
            sellerProductService.listOwnedProducts({ page: 1, pageSize: 20 }),
        enabled: canView,
        staleTime: 30_000,
    });
    const createMutation = useCreateAiOptimizationJobs();
    const rejectMutation = useRejectAiOptimizationJob();
    const applyMutation = useApplyAiOptimizationJob();
    const activeJobQuery = useAiOptimizationJob(activeJobId);
    const customDescription = lifestyleBackground.description?.trim() ?? '';
    const hasInvalidLifestyleDescription =
        mode === 'LIFESTYLE_BACKGROUND' &&
        customDescription.length > 0 &&
        customDescription.length < 10;
    const products = useMemo(
        () => (productsQuery.data?.items ?? []).map(toOptimizationProduct),
        [productsQuery.data?.items],
    );
    const visibleProducts = useMemo(
        // Sản phẩm đã áp dụng vẫn được giữ ở tab cần tối ưu để seller có thể tạo phiên bản AI mới.
        () =>
            activeTab === 'optimized'
                ? products.filter((product) => product.aiStatus === 'APPLIED')
                : products,
        [activeTab, products],
    );

    // Radio selection chi giu mot san pham, khong goi API cho den khi seller nhan CTA xac nhan.
    const toggleProduct = (productId: string) => {
        setSelectedIds((current) =>
            current[0] === productId ? [] : [productId],
        );
    };

    const selectedProductId = selectedIds[0];
    const selectedSourceAssetIds = selectedProductId
        ? (selectedAssetIdsByProduct[selectedProductId] ?? [])
        : [];
    const hasValidOptimizationSelection =
        selectedIds.length === 1 && selectedSourceAssetIds.length === 1;

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
            setFinalizationRequested(false);
        } catch (error: unknown) {
            // Giữ dialog mở khi cleanup thất bại để seller có thể thử lại thay vì mất context job.
            toast.error(getErrorMessage(error));
        }
    };

    // Apply dung version luc tao job de Product Service chan ghi de thay doi moi cua seller.
    const handleApply = async () => {
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
                setFinalizationRequested(true);
                toast.success(
                    'Đang hoàn thiện ảnh chất lượng cao trước khi áp dụng.',
                );
                return;
            }
            setActiveJobId(null);
            setActiveProduct(null);
            setFinalizationRequested(false);
        } catch (error: unknown) {
            // Lỗi optimistic-lock hoặc permission phải hiện trong toast và vẫn giữ preview để seller xử lý tiếp.
            toast.error(getErrorMessage(error));
        }
    };

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
        // Mo khoa dialog neu buoc final that bai de seller co the xem loi, dong dialog hoac tao lai job.
        if (
            status === 'FAILED' ||
            status === 'REJECTED' ||
            status === 'APPLIED'
        ) {
            setFinalizationRequested(false);
            return;
        }
        if (status !== 'REVIEW_REQUIRED') return;
        // Chi chay buoc apply cuoi khi query da nhan job FINAL, tranh gui lap luc cache con REVIEW_REQUIRED cua ban preview.
        if (activeJobQuery.data?.generationProfile !== 'FINAL') return;
        setFinalizationRequested(false);
        void handleApply();
    }, [
        activeJobId,
        activeJobQuery.data?.generationProfile,
        activeJobQuery.data?.status,
        activeProduct,
        applyMutation.isPending,
        finalizationRequested,
    ]);

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
                <div className="relative overflow-hidden border-b border-zinc-200 bg-gradient-to-br from-white via-zinc-50 to-zinc-100 px-6 py-8 text-zinc-950 sm:px-8">
                    <div className="absolute -right-16 -top-20 size-64 rounded-full bg-zinc-200/70 blur-3xl" />
                    <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                        <div className="max-w-2xl">
                            <div className="mb-4 flex items-center gap-3">
                                <span className="flex size-11 items-center justify-center rounded-2xl bg-zinc-950 text-white shadow-sm">
                                    <AiAssistantIcon
                                        size={24}
                                        className="invert"
                                    />
                                </span>
                                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
                                    Seller AI Studio
                                </span>
                            </div>
                            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                                Tối ưu hình ảnh sản phẩm
                            </h1>
                            <p className="mt-3 max-w-xl text-sm leading-6 text-zinc-600">
                                Tạo nền trắng chuyên nghiệp hoặc nền lifestyle
                                bằng AI. Bạn luôn xem trước và duyệt kết quả
                                trước khi áp dụng.
                            </p>
                        </div>
                        <div className="grid grid-cols-3 gap-2 sm:gap-3">
                            <MetricCard
                                label="Đã tối ưu"
                                value={overviewQuery.data?.optimizedProducts}
                                icon={CheckCircle2}
                            />
                            <MetricCard
                                label="Lượt xem"
                                value={overviewQuery.data?.totalViews}
                                icon={BarChart3}
                            />
                            <MetricCard
                                label="Lượt bán"
                                value={overviewQuery.data?.totalSold}
                                icon={Package}
                            />
                        </div>
                    </div>
                </div>
                <div className="grid gap-4 bg-zinc-50/70 p-5 md:grid-cols-2 md:p-6">
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

            <section className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm">
                <div className="flex flex-col gap-3 border-b border-zinc-200 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
                            Danh sách sản phẩm
                        </p>
                        <h2 className="mt-1 text-xl font-semibold text-zinc-950">
                            Chọn một sản phẩm cần tối ưu
                        </h2>
                    </div>
                    <Button
                        variant="outline"
                        onClick={() => void productsQuery.refetch()}
                        disabled={productsQuery.isFetching}
                    >
                        <RefreshCw
                            className={`size-4 ${productsQuery.isFetching ? 'animate-spin' : ''}`}
                            aria-hidden="true"
                        />
                        Làm mới
                    </Button>
                </div>
                <div className="flex flex-wrap gap-2 border-b border-zinc-200 px-5 py-3 sm:px-6">
                    <button
                        type="button"
                        onClick={() => setActiveTab('pending')}
                        className={`rounded-full px-3 py-1.5 text-xs font-semibold ${activeTab === 'pending' ? 'bg-zinc-950 text-white' : 'text-zinc-500 hover:bg-zinc-100'}`}
                    >
                        Cần tối ưu lại ({products.length})
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('optimized')}
                        className={`rounded-full px-3 py-1.5 text-xs font-semibold ${activeTab === 'optimized' ? 'bg-zinc-950 text-white' : 'text-zinc-500 hover:bg-zinc-100'}`}
                    >
                        Đã tối ưu bằng AI (
                        {overviewQuery.data?.optimizedProducts ?? 0})
                    </button>
                </div>
                {productsQuery.isError ? (
                    <div className="m-5 flex gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                        <AlertCircle
                            className="size-5 shrink-0"
                            aria-hidden="true"
                        />
                        <p>
                            Không tải được danh sách sản phẩm. Vui lòng thử lại
                            sau.
                        </p>
                    </div>
                ) : null}
                <div className="divide-y divide-zinc-100">
                    {visibleProducts.map((product) => (
                        <label
                            key={product.id}
                            className="flex cursor-pointer items-center gap-4 px-5 py-4 transition-colors hover:bg-zinc-50 sm:px-6"
                        >
                            <input
                                type="radio"
                                name="ai-optimization-product"
                                checked={selectedIds[0] === product.id}
                                onChange={() => toggleProduct(product.id)}
                                disabled={activeTab === 'optimized'}
                                className="size-4 accent-zinc-950"
                                aria-label={`Chọn ${product.name}`}
                            />
                            <span className="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-zinc-200 bg-zinc-50">
                                {product.thumbnailUrl ? (
                                    <img
                                        src={product.thumbnailUrl}
                                        alt=""
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    <Package
                                        className="size-6 text-zinc-300"
                                        aria-hidden="true"
                                    />
                                )}
                            </span>
                            <span className="min-w-0 flex-1">
                                <span className="block truncate text-sm font-semibold text-zinc-950">
                                    {product.name}
                                </span>
                                <span className="mt-1 block text-xs text-zinc-500">
                                    {product.totalSold} đã bán · cập nhật{' '}
                                    {new Date(
                                        product.updatedAt,
                                    ).toLocaleDateString('vi-VN')}
                                </span>
                            </span>
                            <span className="hidden rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-600 sm:inline-flex">
                                {product.aiStatus === 'APPLIED'
                                    ? 'Đã tối ưu'
                                    : 'Chưa tối ưu'}
                            </span>
                            <ChevronRight
                                className="size-4 text-zinc-400"
                                aria-hidden="true"
                            />
                        </label>
                    ))}
                    {!productsQuery.isLoading &&
                    visibleProducts.length === 0 ? (
                        <div className="p-10 text-center text-sm text-zinc-500">
                            {activeTab === 'optimized'
                                ? 'Chưa có sản phẩm đã áp dụng ảnh AI.'
                                : 'Chưa có sản phẩm phù hợp để tối ưu.'}
                        </div>
                    ) : null}
                </div>
                {selectedIds.length > 0 ? (
                    <div className="sticky bottom-4 z-10 mx-4 mb-4 space-y-4 rounded-2xl border border-zinc-200 bg-white p-4 shadow-xl sm:mx-6">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <p className="text-sm font-semibold text-zinc-950">
                                    Đã chọn {selectedIds.length} sản phẩm
                                </p>
                                <p className="mt-1 text-xs text-zinc-500">
                                    Chọn kiểu ảnh rồi bắt đầu xử lý. Ảnh gốc
                                    luôn được giữ lại.
                                </p>
                            </div>
                            <div className="flex flex-wrap items-center gap-2">
                                <Select
                                    value={mode}
                                    onValueChange={(value) =>
                                        setMode(value as OptimizationMode)
                                    }
                                >
                                    <SelectTrigger className="h-10 min-w-36 rounded-xl border-zinc-200 bg-white text-sm text-zinc-700 focus:ring-zinc-950">
                                        <SelectValue
                                            className="sr-only"
                                            placeholder="Chọn kiểu ảnh"
                                        />
                                        <span aria-hidden="true">
                                            {mode === 'WHITE_BACKGROUND'
                                                ? 'Nền trắng'
                                                : 'Nền lifestyle'}
                                        </span>
                                    </SelectTrigger>
                                    <SelectContent
                                        align="end"
                                        className="rounded-xl border-zinc-200"
                                    >
                                        <SelectItem value="WHITE_BACKGROUND">
                                            Nền trắng
                                        </SelectItem>
                                        <SelectItem value="LIFESTYLE_BACKGROUND">
                                            Nền lifestyle
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                                <Button
                                    onClick={() => void handleCreateJobs()}
                                    disabled={
                                        !canGenerate ||
                                        !hasValidOptimizationSelection ||
                                        createMutation.isPending ||
                                        hasInvalidLifestyleDescription
                                    }
                                >
                                    {createMutation.isPending
                                        ? 'Đang tạo yêu cầu...'
                                        : 'Bắt đầu tối ưu'}
                                    <ChevronRight
                                        className="size-4"
                                        aria-hidden="true"
                                    />
                                </Button>
                            </div>
                        </div>
                        {selectedIds.length === 1 ? (
                            <ProductImageSelectionPanel
                                productId={selectedIds[0]}
                                selectedAssetIds={
                                    selectedAssetIdsByProduct[selectedIds[0]] ??
                                    []
                                }
                                disabled={
                                    !canGenerate || createMutation.isPending
                                }
                                onChange={({ assetIds, primaryImageUrl }) => {
                                    setSelectedAssetIdsByProduct((current) => ({
                                        ...current,
                                        [selectedIds[0]]: assetIds,
                                    }));
                                    setSelectedSourceImageUrlsByProduct(
                                        (current) => ({
                                            ...current,
                                            [selectedIds[0]]: primaryImageUrl,
                                        }),
                                    );
                                }}
                            />
                        ) : null}
                        {mode === 'LIFESTYLE_BACKGROUND' ? (
                            <LifestyleBackgroundStudio
                                value={lifestyleBackground}
                                selectedProductCount={selectedIds.length}
                                disabled={
                                    !canGenerate || createMutation.isPending
                                }
                                onChange={setLifestyleBackground}
                            />
                        ) : null}
                    </div>
                ) : null}
                <div className="border-t border-zinc-200 px-5 py-4 text-xs text-zinc-500 sm:px-6">
                    <span className="font-medium text-zinc-700">Lưu ý:</span>{' '}
                    ảnh gốc không bị xóa. Seller phải xem trước và xác nhận
                    trước khi áp dụng.
                </div>
            </section>

            <AiOptimizationPreviewDialog
                product={activeProduct}
                job={activeJobQuery.data ?? null}
                open={Boolean(activeJobId)}
                onOpenChange={(open) => {
                    if (
                        !open &&
                        !applyMutation.isPending &&
                        !rejectMutation.isPending &&
                        !finalizationRequested
                    ) {
                        setActiveJobId(null);
                        setActiveProduct(null);
                        setFinalizationRequested(false);
                    }
                }}
                onReject={() => void handleReject()}
                rejecting={rejectMutation.isPending}
                onApply={() => void handleApply()}
                applying={applyMutation.isPending || finalizationRequested}
            />
        </div>
    );
}

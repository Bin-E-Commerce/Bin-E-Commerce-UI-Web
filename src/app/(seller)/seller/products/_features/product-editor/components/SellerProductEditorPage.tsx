'use client';

// File này là composition page của wizard tạo/chỉnh sửa sản phẩm Seller Center.
// Page chỉ ghép layout và truyền form context; request AI, mapping payload và giao diện assistant nằm ở feature riêng.

import Link from 'next/link';
import { ArrowLeft, PackagePlus } from 'lucide-react';

import { buttonVariants } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useSellerProductEditor } from '../hooks/useSellerProductEditor';
import { ProductCreateActions } from './layout/ProductCreateActions';
import { ProductCreateChecklist } from './layout/ProductCreateChecklist';
import { ProductCreatePreview } from './layout/ProductCreatePreview';
import { ProductCreateStepGuide } from './layout/ProductCreateStepGuide';
import { ProductCreateStepContent } from './ProductCreateStepContent';

// Ghép wizard tạo sản phẩm thành ba vùng: tiến độ, một bước đang nhập và preview cố định.
// Chỉ một section được mount tại mỗi thời điểm nên seller không phải cuộn qua một biểu mẫu quá dài.
// Hai sidebar có vùng cuộn riêng để chúng vẫn đọc được khi form trung tâm dài hơn viewport.
interface SellerProductEditorPageProps {
    productId?: string;
}

// Hiển thị chung wizard tạo/chỉnh sửa, chỉ thay đổi nguồn dữ liệu và hành động submit theo productId.
// Dùng chung cho route tạo mới và chỉnh sửa; productId có mặt thì hook hydrate dữ liệu hiện tại.
export function SellerProductEditorPage({ productId }: SellerProductEditorPageProps) {
    const {
        form,
        references,
        loadingAttributes,
        submittingStatus,
        activeStep,
        validations,
        canContinue,
        canSubmit,
        selectCategory,
        selectBrand,
        goToStep,
        goNext,
        goBack,
        submitProduct,
        isEditMode,
        loadingProduct,
    } = useSellerProductEditor(productId);

    if (loadingProduct) {
        return (
            <div className="mx-auto w-full max-w-[1760px] space-y-5 px-4 py-5 sm:px-6 lg:px-8 xl:px-10">
                <Skeleton className="h-12 w-80" />
                <div className="grid gap-5 lg:grid-cols-[250px_minmax(0,1fr)_280px]">
                    <Skeleton className="h-96" />
                    <Skeleton className="h-[42rem]" />
                    <Skeleton className="h-96" />
                </div>
            </div>
        );
    }

    return (
        <div className="mx-auto w-full max-w-[1760px] px-4 py-5 sm:px-6 lg:px-8 xl:px-10">
            <header className="mb-5 flex flex-col gap-4 border-b border-zinc-200 pb-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3">
                    <span className="flex size-11 shrink-0 items-center justify-center rounded-md bg-zinc-950 text-white">
                        <PackagePlus className="size-5" />
                    </span>
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                            Quản lý sản phẩm
                        </p>
                        <h1 className="mt-1 text-2xl font-bold text-zinc-950">
                            {isEditMode ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}
                        </h1>
                        <p className="mt-1 text-sm text-zinc-500">
                            {isEditMode
                                ? 'Cập nhật thông tin, phân loại và tồn kho trong một luồng thống nhất.'
                                : 'Khai báo thông tin bán hàng, phân loại và đóng gói trong một luồng thống nhất.'}
                        </p>
                    </div>
                </div>
                <Link
                    href={productId ? `/seller/products/${productId}` : '/seller/products'}
                    className={buttonVariants({
                        variant: 'outline',
                        size: 'lg',
                    })}
                >
                    <ArrowLeft className="size-4" />
                    Quay lại danh sách
                </Link>
            </header>

            <div
                id="product-create-workspace"
                className="scroll-mt-24 grid items-start gap-5 lg:grid-cols-[250px_minmax(0,1fr)_280px] lg:gap-6"
            >
                <aside className="space-y-4 lg:sticky lg:top-24 lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto lg:pr-1">
                    <ProductCreateChecklist
                        activeStep={activeStep}
                        validations={validations}
                        onStepChange={goToStep}
                    />
                    <ProductCreateStepGuide
                        activeStep={activeStep}
                        validation={validations[activeStep]}
                    />
                </aside>

                <form
                    className="min-h-[34rem] min-w-0 rounded-md border border-zinc-200 bg-white shadow-sm"
                    onSubmit={(event) => event.preventDefault()}
                >
                    <ProductCreateStepContent
                        activeStep={activeStep}
                        form={form}
                        references={references}
                        loadingAttributes={loadingAttributes}
                        onCategorySelect={selectCategory}
                        onBrandSelect={selectBrand}
                    />
                    <ProductCreateActions
                        activeStep={activeStep}
                        canContinue={canContinue}
                        canSubmit={canSubmit}
                        submittingStatus={submittingStatus}
                        mode={isEditMode ? 'edit' : 'create'}
                        cancelHref={productId ? `/seller/products/${productId}` : '/seller/products'}
                        onBack={goBack}
                        onNext={goNext}
                        onSubmit={submitProduct}
                    />
                </form>

                <aside className="lg:sticky lg:top-24 lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto lg:pr-1">
                    <ProductCreatePreview form={form} />
                </aside>
            </div>
        </div>
    );
}

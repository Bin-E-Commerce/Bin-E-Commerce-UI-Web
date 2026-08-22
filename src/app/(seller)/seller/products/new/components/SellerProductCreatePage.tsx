'use client';

import Link from 'next/link';
import { ArrowLeft, PackagePlus } from 'lucide-react';

import { buttonVariants } from '@/components/ui/button';
import { useSellerProductCreate } from '../hooks/useSellerProductCreate';
import { ProductCreateActions } from './layout/ProductCreateActions';
import { ProductCreateChecklist } from './layout/ProductCreateChecklist';
import { ProductCreatePreview } from './layout/ProductCreatePreview';
import { ProductCreateStepGuide } from './layout/ProductCreateStepGuide';
import { ProductCreateStepContent } from './ProductCreateStepContent';

// Ghép wizard tạo sản phẩm thành ba vùng: tiến độ, một bước đang nhập và preview cố định.
// Chỉ một section được mount tại mỗi thời điểm nên seller không phải cuộn qua một biểu mẫu quá dài.
// Hai sidebar có vùng cuộn riêng để chúng vẫn đọc được khi form trung tâm dài hơn viewport.
export function SellerProductCreatePage() {
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
    } = useSellerProductCreate();

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
                            Thêm sản phẩm mới
                        </h1>
                        <p className="mt-1 text-sm text-zinc-500">
                            Khai báo thông tin bán hàng, phân loại và đóng gói
                            trong một luồng thống nhất.
                        </p>
                    </div>
                </div>
                <Link
                    href="/seller/products"
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

import { CheckCircle2, CircleAlert, Lightbulb } from 'lucide-react';

import { cn } from '@/lib/utils';
import { PRODUCT_CREATE_STEPS } from '../../constants/product-create-steps.constant';
import type { ProductCreateStepId, ProductCreateStepValidation } from '../../types/product-create-step.type';

interface ProductCreateStepGuideProps {
    activeStep: ProductCreateStepId;
    validation: ProductCreateStepValidation;
}

// Đưa hướng dẫn của đúng section ra cạnh form để seller không phải nhớ quy tắc khi cuộn qua nhiều nội dung.
export function ProductCreateStepGuide({ activeStep, validation }: ProductCreateStepGuideProps) {
    const step = PRODUCT_CREATE_STEPS.find((item) => item.id === activeStep);

    if (!step) return null;

    return (
        <aside className="self-start rounded-md border border-zinc-200 bg-zinc-50 p-4">
            <div className="flex items-start gap-3">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-zinc-950 text-white">
                    <Lightbulb className="size-4" />
                </span>
                <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Đang thực hiện</p>
                    <h2 className="mt-1 text-base font-semibold text-zinc-950">{step.label}</h2>
                    <p className="mt-1 text-sm leading-5 text-zinc-600">{step.description}</p>
                </div>
            </div>

            <div
                className={cn(
                    'mt-4 rounded-md border p-3 text-sm',
                    validation.valid
                        ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                        : 'border-amber-200 bg-amber-50 text-amber-900',
                )}
            >
                <div className="flex items-center gap-2 font-medium">
                    {validation.valid ? <CheckCircle2 className="size-4" /> : <CircleAlert className="size-4" />}
                    {validation.valid ? 'Bước đã hợp lệ' : 'Cần hoàn thiện bước này'}
                </div>
                {!validation.valid && validation.errors.length > 0 ? (
                    <ul className="mt-2 list-disc space-y-1 pl-5 text-xs leading-5">
                        {validation.errors.map((error) => <li key={error}>{error}</li>)}
                    </ul>
                ) : null}
            </div>

            <div className="mt-4 border-t border-zinc-200 pt-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Gợi ý</p>
                <ul className="mt-2 space-y-2 text-sm leading-5 text-zinc-600">
                    {activeStep === 'basic' ? (
                        <>
                            <li>• Tải tối thiểu 2 ảnh rõ nét và chọn ảnh đầu tiên làm ảnh bìa.</li>
                            <li>• Tên sản phẩm nên có thương hiệu, loại sản phẩm và đặc điểm chính.</li>
                        </>
                    ) : null}
                    {activeStep === 'details' ? (
                        <>
                            <li>• Chọn đúng thương hiệu và các thuộc tính do ngành hàng cung cấp.</li>
                            <li>• Mô tả càng đầy đủ càng giúp khách hàng hiểu sản phẩm trước khi mua.</li>
                        </>
                    ) : null}
                    {activeStep === 'sales' ? (
                        <>
                            <li>• Mỗi SKU cần có giá bán hợp lệ và số lượng tồn kho không âm.</li>
                            <li>• Nếu sản phẩm có màu hoặc kích thước, hãy tạo phân loại trước khi nhập SKU.</li>
                        </>
                    ) : null}
                    {activeStep === 'shipping' ? (
                        <>
                            <li>• Khai báo kích thước và khối lượng sau khi đóng gói.</li>
                            <li>• Thông tin này sẽ được dùng để tính phí và chọn phương án giao hàng phù hợp.</li>
                        </>
                    ) : null}
                    {activeStep === 'other' ? (
                        <>
                            <li>• Chọn tình trạng sản phẩm và bổ sung xuất xứ để hoàn thiện thông tin công khai.</li>
                            <li>• Kiểm tra preview trước khi lưu nháp hoặc đăng bán.</li>
                        </>
                    ) : null}
                </ul>
            </div>
        </aside>
    );
}

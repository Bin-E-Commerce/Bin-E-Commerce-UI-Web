/**
 * Panel hướng dẫn và cảnh báo cho bước wizard đang được chọn.
 * Component không tự validate hoặc điều hướng; nó chỉ trình bày validation đã được editor hook tính toán.
 */

import { CheckCircle2, CircleAlert, Lightbulb } from 'lucide-react';

import { cn } from '@/lib/utils';
import { PRODUCT_CREATE_STEPS } from '../../constants/product-create-steps.constant';
import type { ProductCreateStepId, ProductCreateStepValidation } from '../../types/product-create-step.type';

interface ProductCreateStepGuideProps {
    activeStep: ProductCreateStepId;
    validation: ProductCreateStepValidation;
}

/**
 * Panel tóm tắt bước hiện tại đặt cạnh form thay cho card sidebar cao.
 * Component ưu tiên hiển thị trạng thái và lỗi cần xử lý; phần mẹo được đưa vào details
 * để seller có thể mở khi cần mà không chiếm chiều cao của khu vực nhập liệu.
 */

// Tìm metadata của bước đang chọn; route luôn truyền id hợp lệ nhưng vẫn trả null để UI an toàn khi cấu hình thay đổi.
export function ProductCreateStepGuide({ activeStep, validation }: ProductCreateStepGuideProps) {
    const step = PRODUCT_CREATE_STEPS.find((item) => item.id === activeStep);

    if (!step) return null;

    return (
        <section className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 sm:p-5">
            <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(260px,0.8fr)] lg:items-start">
                <div className="flex min-w-0 items-start gap-3">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-zinc-950 text-white">
                        <Lightbulb className="size-4" />
                    </span>
                    <div className="min-w-0">
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
                            Đang thực hiện
                        </p>
                        <h2 className="mt-1 break-words text-base font-semibold leading-5 text-zinc-950">
                            {step.label}
                        </h2>
                        <p className="mt-1 break-words text-sm leading-5 text-zinc-600">
                            {step.description}
                        </p>
                    </div>
                </div>

                <div
                    className={cn(
                        'grid gap-3 rounded-xl border px-4 py-3 text-sm',
                        validation.valid
                            ? 'border-zinc-200 bg-white text-zinc-950 shadow-sm'
                            : 'border-amber-200 bg-amber-50 text-amber-900',
                    )}
                >
                    <div className="flex min-w-0 items-start gap-3 font-medium leading-5">
                        {validation.valid ? (
                            <CheckCircle2 className="mt-0.5 size-7 shrink-0 rounded-full bg-zinc-950 p-1.5 text-white" />
                        ) : (
                            <CircleAlert className="mt-0.5 size-7 shrink-0 rounded-full bg-amber-100 p-1.5 text-amber-700" />
                        )}
                        <span className="min-w-0 break-words">
                            <span className="block">{validation.valid ? 'Bước đã hoàn tất' : 'Cần hoàn thiện bước này'}</span>
                            {validation.valid ? (
                                <span className="mt-0.5 block text-xs font-normal text-zinc-500">
                                    Thông tin đã sẵn sàng để tiếp tục.
                                </span>
                            ) : null}
                        </span>
                    </div>
                    {!validation.valid && validation.errors.length > 0 ? (
                        <ul className="mt-2 list-disc space-y-1 pl-5 text-xs leading-4.5">
                            {validation.errors.map((error) => (
                                <li key={error} className="break-words">
                                    {error}
                                </li>
                            ))}
                        </ul>
                    ) : null}
                </div>
            </div>

            <details className="mt-4 border-t border-zinc-200 pt-3">
                <summary className="flex cursor-pointer list-none items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500 [&::-webkit-details-marker]:hidden">
                    <Lightbulb className="size-3.5" />
                    Gợi ý hoàn thiện
                </summary>
                <ul className="mt-3 grid gap-x-6 gap-y-2 text-xs leading-4.5 text-zinc-600 sm:grid-cols-2">
                    {activeStep === 'basic' ? (
                        <>
                            <li className="list-disc break-words pl-1">Tải tối thiểu 2 ảnh rõ nét và chọn ảnh đầu tiên làm ảnh bìa.</li>
                            <li className="list-disc break-words pl-1">Tên sản phẩm nên có thương hiệu, loại sản phẩm và đặc điểm chính.</li>
                        </>
                    ) : null}
                    {activeStep === 'details' ? (
                        <>
                            <li className="list-disc break-words pl-1">Chọn đúng thương hiệu và các thuộc tính do ngành hàng cung cấp.</li>
                            <li className="list-disc break-words pl-1">Mô tả càng đầy đủ càng giúp khách hàng hiểu sản phẩm trước khi mua.</li>
                        </>
                    ) : null}
                    {activeStep === 'sales' ? (
                        <>
                            <li className="list-disc break-words pl-1">Mỗi SKU cần có giá bán hợp lệ và số lượng tồn kho không âm.</li>
                            <li className="list-disc break-words pl-1">Nếu sản phẩm có màu hoặc kích thước, hãy tạo phân loại trước khi nhập SKU.</li>
                        </>
                    ) : null}
                    {activeStep === 'shipping' ? (
                        <>
                            <li className="list-disc break-words pl-1">Khai báo kích thước và khối lượng sau khi đóng gói.</li>
                            <li className="list-disc break-words pl-1">Thông tin này dùng để tính phí và chọn phương án giao hàng phù hợp.</li>
                        </>
                    ) : null}
                    {activeStep === 'other' ? (
                        <>
                            <li className="list-disc break-words pl-1">Chọn tình trạng sản phẩm và bổ sung xuất xứ để hoàn thiện thông tin công khai.</li>
                            <li className="list-disc break-words pl-1">Kiểm tra preview trước khi lưu nháp hoặc đăng bán.</li>
                        </>
                    ) : null}
                </ul>
            </details>
        </section>
    );
}

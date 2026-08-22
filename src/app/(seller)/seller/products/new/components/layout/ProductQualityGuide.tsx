'use client';

import { type ReactNode } from 'react';
import { Check, CircleAlert, Image, Info, PlayCircle, Type } from 'lucide-react';
import { useWatch, type UseFormReturn } from 'react-hook-form';

import { cn } from '@/lib/utils';
import type { SellerProductCreateFormValues } from '../../types/seller-product-create-form.type';

interface ProductQualityGuideProps {
    form: UseFormReturn<SellerProductCreateFormValues>;
}

interface QualityItemProps {
    status: 'complete' | 'pending' | 'manual';
    children: ReactNode;
}

// Hiển thị rõ tiêu chí nào đã được hệ thống kiểm tra và tiêu chí nào người bán phải tự đối chiếu bằng mắt.
function QualityItem({ status, children }: QualityItemProps) {
    const Icon = status === 'complete' ? Check : status === 'manual' ? CircleAlert : Info;

    return (
        <li className="flex items-start gap-2 text-xs leading-5 text-zinc-600">
            <Icon
                className={cn(
                    'mt-0.5 size-3.5 shrink-0',
                    status === 'complete' ? 'text-emerald-600' : status === 'manual' ? 'text-amber-600' : 'text-zinc-400',
                )}
            />
            <span>{children}</span>
        </li>
    );
}

// Tổng hợp rule có thể kiểm tra ngay ở client; chất lượng thị giác của ảnh luôn cần người bán tự rà soát để tránh chấm điểm sai.
export function ProductQualityGuide({ form }: ProductQualityGuideProps) {
    const values = useWatch({ control: form.control });
    const imageCount = values.images?.length ?? 0;
    const titleLength = values.name?.trim().length ?? 0;
    const descriptionLength = values.description?.trim().length ?? 0;
    const hasVideo = Boolean(values.video);

    return (
        <aside className="rounded-md border border-zinc-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                Tiêu chuẩn hiển thị
            </p>
            <p className="mt-1 text-sm leading-6 text-zinc-600">
                Hoàn thiện các điều kiện nền tảng để sản phẩm dễ tìm, rõ ràng và đáng tin cậy hơn.
            </p>

            <div className="mt-5 space-y-5">
                <section>
                    <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2 text-sm font-semibold text-zinc-950">
                            <Image className="size-4" />
                            Hình ảnh
                        </div>
                        <span className={cn('text-xs font-semibold tabular-nums', imageCount >= 2 ? 'text-emerald-700' : 'text-zinc-500')}>
                            {imageCount} / tối thiểu 2
                        </span>
                    </div>
                    <p className="mt-2 text-xs font-medium text-zinc-500">Hệ thống kiểm tra</p>
                    <ul className="mt-1.5 space-y-1.5">
                        <QualityItem status={imageCount >= 2 ? 'complete' : 'pending'}>
                            Tải lên ít nhất 2 hình ảnh sản phẩm.
                        </QualityItem>
                    </ul>
                    <p className="mt-3 text-xs font-medium text-zinc-500">Tự rà soát trước khi đăng</p>
                    <ul className="mt-1.5 space-y-1.5">
                        <QualityItem status="manual">Ảnh đúng tỷ lệ, hiển thị đầy đủ sản phẩm và không có viền trắng.</QualityItem>
                        <QualityItem status="manual">Ảnh rõ nét, nền gọn; không để watermark che mất sản phẩm.</QualityItem>
                    </ul>
                </section>

                <section className="border-t border-zinc-100 pt-4">
                    <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2 text-sm font-semibold text-zinc-950">
                            <Type className="size-4" />
                            Tiêu đề
                        </div>
                        <span className={cn('text-xs font-semibold tabular-nums', titleLength >= 20 ? 'text-emerald-700' : 'text-zinc-500')}>
                            {titleLength} ký tự
                        </span>
                    </div>
                    <p className="mt-2 text-xs font-medium text-zinc-500">Hệ thống kiểm tra</p>
                    <ul className="mt-1.5 space-y-1.5">
                        <QualityItem status={titleLength >= 20 ? 'complete' : 'pending'}>Có ít nhất 20 ký tự.</QualityItem>
                    </ul>
                    <p className="mt-3 text-xs font-medium text-zinc-500">Tự rà soát trước khi đăng</p>
                    <ul className="mt-1.5 space-y-1.5">
                        <QualityItem status="manual">Nêu đúng sản phẩm hoặc thương hiệu; không lặp từ khóa, dùng từ phóng đại hay nội dung không liên quan.</QualityItem>
                    </ul>
                </section>

                <section className="border-t border-zinc-100 pt-4">
                    <div className="flex items-center justify-between gap-3">
                        <span className="text-sm font-semibold text-zinc-950">Mô tả</span>
                        <span className={cn('text-xs font-semibold tabular-nums', descriptionLength >= 100 || imageCount > 0 ? 'text-emerald-700' : 'text-zinc-500')}>
                            {descriptionLength} ký tự
                        </span>
                    </div>
                    <ul className="mt-2 space-y-1.5">
                        <QualityItem status={descriptionLength >= 100 || imageCount > 0 ? 'complete' : 'pending'}>
                            Có ít nhất 100 ký tự mô tả hoặc ít nhất 1 hình ảnh minh họa.
                        </QualityItem>
                    </ul>
                </section>

                <section className="border-t border-zinc-100 pt-4">
                    <div className="flex items-center gap-2 text-sm font-semibold text-zinc-950">
                        <PlayCircle className="size-4" />
                        Mức xuất sắc
                    </div>
                    <ul className="mt-2 space-y-1.5">
                        <QualityItem status={hasVideo ? 'complete' : 'pending'}>Đăng tải video sản phẩm dài từ 10 đến 60 giây.</QualityItem>
                    </ul>
                </section>
            </div>
        </aside>
    );
}

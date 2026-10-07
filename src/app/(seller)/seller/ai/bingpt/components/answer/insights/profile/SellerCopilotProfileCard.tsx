// Thẻ tóm tắt hồ sơ tài khoản và shop; chỉ hiển thị trường allowlist backend cung cấp trong ngữ cảnh seller đã xác thực.
'use client';

import Image from 'next/image';
import { Mail, Phone } from 'lucide-react';
import { useState } from 'react';
import type { ExtractSellerCopilotProfile } from '../../../../types/answer/insight.types';

interface SellerCopilotProfileCardProps {
    insight: ExtractSellerCopilotProfile;
}

// Chuyển role/status/mô hình kinh doanh đã biết thành nhãn dễ hiểu, còn giá trị mới vẫn giữ nguyên để không mất dữ liệu.
function formatProfileLabel(value: string): string {
    const labels: Record<string, string> = {
        ACTIVE: 'Đang hoạt động',
        SELLER: 'Người bán',
        SUSPENDED: 'Tạm khóa',
        CLOSED: 'Đã đóng',
        RETAIL: 'Bán lẻ',
        BRAND: 'Thương hiệu chính hãng',
        DISTRIBUTOR: 'Nhà phân phối',
    };
    return labels[value.toUpperCase()] ?? value;
}

// Tạo fallback initials khi tài khoản chưa có ảnh hoặc URL ảnh không tải được.
function getProfileInitials(name: string): string {
    return (
        name
            .trim()
            .split(/\s+/u)
            .slice(-2)
            .map((part) => part[0]?.toLocaleUpperCase('vi-VN') ?? '')
            .join('') || 'S'
    );
}

// Hiển thị tài khoản và shop trong cùng một thẻ; lỗi tải ảnh chỉ thay ảnh tương ứng bằng fallback, không làm mất nội dung hồ sơ.
export function SellerCopilotProfileCard({
    insight,
}: SellerCopilotProfileCardProps) {
    const [failedImages, setFailedImages] = useState<string[]>([]);
    const avatarUrl = insight.account.avatarUrl?.trim() || null;
    const logoUrl = insight.shop.logoUrl?.trim() || null;
    const canShowAvatar = avatarUrl && !failedImages.includes(avatarUrl);
    const canShowLogo = logoUrl && !failedImages.includes(logoUrl);
    // Màu xanh chỉ biểu thị đúng trạng thái ACTIVE; trạng thái khác giữ trung tính để không gán ý nghĩa sai.
    const accountIsActive = insight.account.status.toUpperCase() === 'ACTIVE';
    const shopIsActive = insight.shop.status.toUpperCase() === 'ACTIVE';
    // Giữ hàng liên hệ ngay cả khi phone trống để trạng thái thiếu dữ liệu không bị nhầm với lỗi bố cục.
    const accountPhone = insight.account.phone || 'Chưa cập nhật';

    return (
        <section
            className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm"
            aria-label="Hồ sơ tài khoản và shop"
        >
            <div className="grid md:grid-cols-2">
                <div className="min-w-0 p-5 sm:p-6">
                    <div className="flex min-w-0 items-center gap-4">
                        <div className="relative flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-full bg-pink-50 text-sm font-semibold text-pink-700 ring-4 ring-pink-50/70">
                            {canShowAvatar ? (
                                <Image
                                    src={avatarUrl ?? ''}
                                    alt={`Ảnh đại diện ${insight.account.name}`}
                                    fill
                                    sizes="56px"
                                    className="object-cover"
                                    unoptimized
                                    onError={() =>
                                        setFailedImages((current) =>
                                            current.includes(avatarUrl)
                                                ? current
                                                : [...current, avatarUrl],
                                        )
                                    }
                                />
                            ) : (
                                <span aria-hidden="true">
                                    {getProfileInitials(insight.account.name)}
                                </span>
                            )}
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-400">
                                Tài khoản
                            </p>
                            <h3 className="mt-1 truncate text-base font-semibold text-zinc-950">
                                {insight.account.name}
                            </h3>
                            <div className="mt-1.5 flex flex-wrap items-center gap-2">
                                <span className="text-xs text-zinc-500">
                                    {formatProfileLabel(insight.account.role)}
                                </span>
                                <span
                                    className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium ${accountIsActive ? 'bg-emerald-50 text-emerald-700' : 'bg-zinc-100 text-zinc-600'}`}
                                >
                                    <span
                                        className={`size-1.5 rounded-full ${accountIsActive ? 'bg-emerald-500' : 'bg-zinc-400'}`}
                                        aria-hidden="true"
                                    />
                                    {formatProfileLabel(insight.account.status)}
                                </span>
                            </div>
                        </div>
                    </div>

                    <dl className="mt-6 space-y-4 border-t border-zinc-100 pt-5">
                        <div className="flex min-w-0 items-start gap-3">
                            <Mail
                                className="mt-0.5 size-4 shrink-0 text-zinc-400"
                                aria-hidden="true"
                            />
                            <div className="min-w-0">
                                <dt className="text-xs text-zinc-500">Email</dt>
                                <dd className="mt-0.5 break-all text-sm font-medium text-zinc-800">
                                    {insight.account.email}
                                </dd>
                            </div>
                        </div>
                        <div className="flex min-w-0 items-start gap-3">
                            <Phone
                                className="mt-0.5 size-4 shrink-0 text-zinc-400"
                                aria-hidden="true"
                            />
                            <div className="min-w-0">
                                <dt className="text-xs text-zinc-500">
                                    Số điện thoại
                                </dt>
                                <dd
                                    className={`mt-0.5 text-sm font-medium ${insight.account.phone ? 'text-zinc-800' : 'text-zinc-400'}`}
                                >
                                    {accountPhone}
                                </dd>
                            </div>
                        </div>
                    </dl>
                </div>

                <div className="min-w-0 border-t border-zinc-200 bg-zinc-50/70 p-5 sm:p-6 md:border-l md:border-t-0">
                    <div className="flex min-w-0 items-center gap-4">
                        <div className="relative flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-zinc-200 bg-white text-sm font-semibold text-zinc-600 shadow-sm">
                            {canShowLogo ? (
                                <Image
                                    src={logoUrl ?? ''}
                                    alt={`Logo ${insight.shop.name}`}
                                    fill
                                    sizes="56px"
                                    className="object-cover"
                                    unoptimized
                                    onError={() =>
                                        setFailedImages((current) =>
                                            current.includes(logoUrl)
                                                ? current
                                                : [...current, logoUrl],
                                        )
                                    }
                                />
                            ) : (
                                <span aria-hidden="true">
                                    {getProfileInitials(insight.shop.name)}
                                </span>
                            )}
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-400">
                                Cửa hàng
                            </p>
                            <h3 className="mt-1 truncate text-base font-semibold text-zinc-950">
                                {insight.shop.name}
                            </h3>
                            <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-zinc-500">
                                <span>
                                    {formatProfileLabel(
                                        insight.shop.businessModel,
                                    )}
                                </span>
                                <span aria-hidden="true">·</span>
                                <span
                                    className={`inline-flex items-center gap-1.5 font-medium ${shopIsActive ? 'text-emerald-700' : 'text-zinc-600'}`}
                                >
                                    <span
                                        className={`size-1.5 rounded-full ${shopIsActive ? 'bg-emerald-500' : 'bg-zinc-400'}`}
                                        aria-hidden="true"
                                    />
                                    {formatProfileLabel(insight.shop.status)}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 border-t border-zinc-200/80 pt-5">
                        <p className="text-xs font-medium text-zinc-500">
                            Giới thiệu cửa hàng
                        </p>
                        <p className="mt-1.5 text-sm leading-6 text-zinc-700">
                            {insight.shop.description ||
                                'Chưa có mô tả cửa hàng.'}
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}

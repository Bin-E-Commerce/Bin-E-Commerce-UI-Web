import {
    BadgeCheck,
    FileCheck2,
    Fingerprint,
    LockKeyhole,
    UserRoundCheck,
} from 'lucide-react';

import type { ShopProfileDto } from '@/services/seller';
import {
    formatDocumentType,
    formatProfileType,
    formatShopProfileDate,
} from '../utils/shop-profile-formatters';
import { ShopProfileDataRow } from './ShopProfileDataRow';

interface ShopIdentityPanelProps {
    profile: ShopProfileDto;
}

// Trình bày kết quả xác minh và loại giấy tờ đã nộp mà không trả URL tài liệu nhạy cảm xuống trình duyệt.
export function ShopIdentityPanel({ profile }: ShopIdentityPanelProps) {
    const { identity } = profile;

    return (
        <div className="p-5 sm:p-7">
            <section className="flex flex-col gap-4 border-b border-zinc-200 pb-6 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3">
                    <span className="flex size-11 shrink-0 items-center justify-center rounded-md bg-zinc-950 text-white">
                        <BadgeCheck className="size-5" />
                    </span>
                    <div>
                        <h2 className="font-semibold text-zinc-950">
                            Định danh đã được xác minh
                        </h2>
                        <p className="mt-1 text-sm leading-6 text-zinc-500">
                            Hồ sơ đã được đối chiếu với giấy tờ người bán cung
                            cấp trong quá trình đăng ký.
                        </p>
                    </div>
                </div>
                <span className="inline-flex w-fit items-center gap-2 rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-xs font-medium text-zinc-700">
                    <UserRoundCheck className="size-4" />
                    Xác minh {formatShopProfileDate(identity.verifiedAt)}
                </span>
            </section>

            <div className="mt-7 grid gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(280px,0.8fr)]">
                <section>
                    <div className="flex items-center gap-2">
                        <Fingerprint className="size-4 text-zinc-500" />
                        <h3 className="font-semibold text-zinc-950">
                            Thông tin đối chiếu
                        </h3>
                    </div>
                    <dl className="mt-3">
                        <ShopProfileDataRow
                            label="Loại người bán"
                            value={formatProfileType(identity.profileType)}
                        />
                        <ShopProfileDataRow
                            label="Họ tên / Pháp nhân"
                            value={identity.legalName}
                        />
                        <ShopProfileDataRow
                            label="Số CCCD"
                            value={identity.citizenIdMasked}
                        />
                        <ShopProfileDataRow
                            label="Người đại diện"
                            value={identity.representativeName}
                        />
                        <ShopProfileDataRow
                            label="Chức vụ / Vai trò"
                            value={identity.representativeRole}
                        />
                        <ShopProfileDataRow
                            label="Thông tin liên hệ"
                            value={
                                <span className="space-y-1">
                                    <span className="block">
                                        {identity.contactEmail}
                                    </span>
                                    <span className="block font-normal text-zinc-500">
                                        {identity.contactPhone}
                                    </span>
                                </span>
                            }
                        />
                    </dl>
                </section>

                <section className="border-t border-zinc-200 pt-7 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
                    <div className="flex items-center gap-2">
                        <FileCheck2 className="size-4 text-zinc-500" />
                        <h3 className="font-semibold text-zinc-950">
                            Giấy tờ đã xác minh
                        </h3>
                    </div>
                    <div className="mt-4 space-y-2">
                        {identity.documentTypes.length > 0 ? (
                            identity.documentTypes.map((documentType) => (
                                <div
                                    key={documentType}
                                    className="flex items-center justify-between gap-3 rounded-md border border-zinc-200 px-3 py-3"
                                >
                                    <span className="text-sm font-medium text-zinc-800">
                                        {formatDocumentType(documentType)}
                                    </span>
                                    <BadgeCheck className="size-4 shrink-0 text-zinc-700" />
                                </div>
                            ))
                        ) : (
                            <p className="rounded-md border border-dashed border-zinc-200 p-4 text-sm text-zinc-500">
                                Chưa có thông tin loại giấy tờ.
                            </p>
                        )}
                    </div>
                    <div className="mt-5 flex items-start gap-3 rounded-md bg-zinc-50 p-4">
                        <LockKeyhole className="mt-0.5 size-4 shrink-0 text-zinc-500" />
                        <p className="text-xs leading-5 text-zinc-500">
                            Ảnh giấy tờ không được hiển thị tại Seller Center để
                            hạn chế truy cập không cần thiết vào dữ liệu định
                            danh.
                        </p>
                    </div>
                </section>
            </div>
        </div>
    );
}

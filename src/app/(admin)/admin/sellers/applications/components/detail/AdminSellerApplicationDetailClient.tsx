'use client';

import Link from 'next/link';
import {
    ArrowLeft,
    BadgeCheck,
    CreditCard,
    FileCheck2,
    ImageOff,
    MapPin,
    RefreshCw,
    Store,
    UserRound,
} from 'lucide-react';

import { Button, buttonVariants } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { useSessionPermission } from '@/services/auth/access';
import type {
    SellerApplicationDto,
    SellerVerificationDocumentDto,
} from '@/services/seller';
import { AdminSellerApplicationStatusBadge } from '../AdminSellerApplicationStatusBadge';
import { useAdminSellerApplication } from '../../hooks/useAdminSellerApplication';
import { useSellerApplicationLocationNames } from '../../hooks/useSellerApplicationLocationNames';
import {
    formatAdminDateTime,
    formatBusinessModel,
    formatNullableText,
    formatPayoutAccountType,
    formatSellerProfileType,
    getApplicationShopDisplayName,
} from '../../utils/seller-application-admin-formatters';
import {
    AdminSellerApplicationDetailField,
    AdminSellerApplicationDetailSection,
} from './AdminSellerApplicationDetailSection';
import { RejectSellerApplicationDialog } from './RejectSellerApplicationDialog';

interface AdminSellerApplicationDetailClientProps {
    applicationId: string;
}

// Container client của trang chi tiết: lấy hồ sơ theo id và tách rõ trạng thái loading/error/content.
export function AdminSellerApplicationDetailClient({
    applicationId,
}: AdminSellerApplicationDetailClientProps) {
    const query = useAdminSellerApplication(applicationId);

    if (query.isLoading) {
        return <AdminSellerApplicationDetailSkeleton />;
    }

    if (query.isError || !query.data) {
        return (
            <section className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
                <h1 className="text-lg font-semibold text-red-800">
                    Không tải được hồ sơ
                </h1>
                <p className="mt-2">
                    Hồ sơ có thể không tồn tại hoặc tài khoản hiện tại không có quyền xem.
                </p>
                <div className="mt-5 flex flex-wrap gap-3">
                    <Link
                        href="/admin/sellers/applications"
                        className={cn(buttonVariants({ variant: 'outline' }), 'rounded-full')}
                    >
                        <ArrowLeft className="size-4" />
                        Quay lại danh sách
                    </Link>
                    <Button
                        type="button"
                        className="rounded-full"
                        onClick={() => query.refetch()}
                    >
                        <RefreshCw className="size-4" />
                        Thử lại
                    </Button>
                </div>
            </section>
        );
    }

    return (
        <AdminSellerApplicationDetailContent
            application={query.data}
            refreshing={query.isFetching}
            onRefresh={() => query.refetch()}
        />
    );
}

interface AdminSellerApplicationDetailContentProps {
    application: SellerApplicationDto;
    refreshing: boolean;
    onRefresh: () => void;
}

// Render hồ sơ theo cách admin duyệt thực tế: nhìn thông tin nhập, nhìn ảnh giấy tờ, rồi đối chiếu từng nhóm.
function AdminSellerApplicationDetailContent({
    application,
    refreshing,
    onRefresh,
}: AdminSellerApplicationDetailContentProps) {
    // Permission lấy từ session do backend resolve; việc ẩn nút chỉ phục vụ UX, endpoint vẫn được gateway và seller-service bảo vệ độc lập.
    const canRejectApplication = useSessionPermission(
        'seller.application.reject',
    );

    return (
        <div className="space-y-5">
            <section className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="flex items-start gap-4">
                        <ShopLogo application={application} />
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-400">
                                Chi tiết hồ sơ seller
                            </p>
                            <h1 className="mt-2 text-2xl font-semibold text-zinc-950">
                                {getApplicationShopDisplayName(application)}
                            </h1>
                            <div className="mt-3 flex flex-wrap items-center gap-2">
                                <AdminSellerApplicationStatusBadge
                                    status={application.status}
                                />
                                <span className="rounded-full border border-zinc-200 px-3 py-1 text-xs text-zinc-500">
                                    Mã hồ sơ: {application.id}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {application.status === 'pending_review' &&
                        canRejectApplication ? (
                            <RejectSellerApplicationDialog
                                applicationId={application.id}
                                shopName={getApplicationShopDisplayName(application)}
                            />
                        ) : null}
                        <Link
                            href="/admin/sellers/applications"
                            className={cn(buttonVariants({ variant: 'outline' }), 'rounded-full')}
                        >
                            <ArrowLeft className="size-4" />
                            Quay lại danh sách
                        </Link>
                        <Button
                            type="button"
                            variant="outline"
                            className="rounded-full"
                            disabled={refreshing}
                            onClick={onRefresh}
                        >
                            <RefreshCw className={cn('size-4', refreshing && 'animate-spin')} />
                            Làm mới
                        </Button>
                    </div>
                </div>
            </section>

            <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_420px]">
                <div className="space-y-5">
                    <IdentityReviewSection application={application} />
                    <ShopInformationSection application={application} />
                    <PickupAddressSection application={application} />
                    <PayoutSection application={application} />
                </div>

                <div className="space-y-5">
                    <ReviewTimelineSection application={application} />
                    <ReviewChecklistSection application={application} />
                </div>
            </div>
        </div>
    );
}

interface ApplicationSectionProps {
    application: SellerApplicationDto;
}

// Hiển thị logo shop thật nếu có; fallback icon giúp header vẫn cân đối khi hồ sơ thiếu logo.
function ShopLogo({ application }: ApplicationSectionProps) {
    return (
        <div className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-zinc-100 ring-1 ring-zinc-200">
            {application.shop.logoUrl ? (
                <img
                    src={application.shop.logoUrl}
                    alt="Logo shop"
                    className="h-full w-full object-cover"
                />
            ) : (
                <Store className="size-6 text-zinc-500" />
            )}
        </div>
    );
}

// Nhóm đối chiếu quan trọng nhất: dữ liệu người bán đặt cạnh ảnh giấy tờ để admin kiểm tra nhanh.
function IdentityReviewSection({ application }: ApplicationSectionProps) {
    const identityLabel =
        application.seller.profileType === 'business' ? 'Mã số thuế' : 'Số CCCD';
    const identityValue =
        application.seller.profileType === 'business'
            ? application.seller.taxCode
            : application.seller.citizenId;

    return (
        <AdminSellerApplicationDetailSection
            title="Đối chiếu định danh"
            description="So sánh thông tin người bán đã nhập với ảnh giấy tờ trước khi duyệt hồ sơ."
        >
            <div className="grid gap-5 lg:grid-cols-[minmax(0,0.95fr)_minmax(360px,1.05fr)]">
                <div className="space-y-3">
                    <AdminSellerApplicationDetailField
                        label="Loại hồ sơ"
                        value={formatSellerProfileType(application.seller.profileType)}
                    />
                    <AdminSellerApplicationDetailField
                        label="Họ tên / Pháp nhân"
                        value={formatNullableText(application.seller.legalName)}
                    />
                    <AdminSellerApplicationDetailField
                        label={identityLabel}
                        value={formatNullableText(identityValue)}
                    />
                    <AdminSellerApplicationDetailField
                        label="Người đại diện"
                        value={formatNullableText(application.seller.representativeName)}
                    />
                    <AdminSellerApplicationDetailField
                        label="Chức vụ / Vai trò"
                        value={formatNullableText(application.seller.representativeRole)}
                    />
                    <AdminSellerApplicationDetailField
                        label="Liên hệ"
                        value={
                            <div className="space-y-1">
                                <p>{formatNullableText(application.seller.email ?? application.userEmail)}</p>
                                <p className="text-zinc-500">
                                    {formatNullableText(application.seller.phone)}
                                </p>
                            </div>
                        }
                    />
                </div>

                <DocumentPreviewGrid application={application} />
            </div>
        </AdminSellerApplicationDetailSection>
    );
}

// Chọn đúng bộ giấy tờ theo loại hồ sơ để admin không phải đoán key JSON phía backend.
function getRequiredDocuments(application: SellerApplicationDto) {
    if (application.seller.profileType === 'business') {
        return [
            {
                key: 'businessLicense',
                title: 'Giấy phép kinh doanh',
                description: 'Đối chiếu tên pháp nhân và mã số thuế.',
            },
            {
                key: 'representativeDocument',
                title: 'Giấy tờ người đại diện',
                description: 'Đối chiếu người đại diện vận hành hồ sơ.',
            },
        ];
    }

    return [
        {
            key: 'citizenIdFront',
            title: 'CCCD mặt trước',
            description: 'Đối chiếu họ tên, số CCCD và ngày sinh nếu có.',
        },
        {
            key: 'citizenIdBack',
            title: 'CCCD mặt sau',
            description: 'Đối chiếu thông tin cấp giấy tờ và dấu hiệu hợp lệ.',
        },
    ];
}

// Render ảnh giấy tờ thành lưới riêng để nghiệp vụ duyệt không bị lẫn với các field text.
function DocumentPreviewGrid({ application }: ApplicationSectionProps) {
    const documents = getRequiredDocuments(application);

    return (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 2xl:grid-cols-2">
            {documents.map((document) => (
                <DocumentPreviewCard
                    key={document.key}
                    title={document.title}
                    description={document.description}
                    document={application.seller.documents?.[document.key]}
                />
            ))}
        </div>
    );
}

interface DocumentPreviewCardProps {
    title: string;
    description: string;
    document?: SellerVerificationDocumentDto;
}

// Card ảnh giấy tờ có preview lớn, trạng thái thiếu rõ ràng và link mở ảnh gốc khi cần soi chi tiết.
function DocumentPreviewCard({
    title,
    description,
    document,
}: DocumentPreviewCardProps) {
    const documentUrl = document?.url;
    const hasDocument = Boolean(documentUrl);

    return (
        <article
            className={cn(
                'rounded-xl border p-3',
                hasDocument
                    ? 'border-zinc-200 bg-white'
                    : 'border-amber-200 bg-amber-50',
            )}
        >
            <div className="relative flex aspect-[4/3] items-center justify-center overflow-hidden rounded-lg border border-zinc-200 bg-zinc-50">
                {hasDocument ? (
                    <img
                        src={documentUrl}
                        alt={title}
                        className="h-full w-full object-cover"
                    />
                ) : (
                    <div className="flex flex-col items-center gap-2 text-zinc-500">
                        <ImageOff className="size-8" />
                        <span className="text-xs font-medium">Chưa tải ảnh</span>
                    </div>
                )}
            </div>
            <div className="mt-3 space-y-1">
                <div className="flex items-start justify-between gap-2">
                    <h3 className="text-sm font-semibold text-zinc-950">{title}</h3>
                    <span
                        className={cn(
                            'rounded-full px-2 py-0.5 text-[11px] font-medium',
                            hasDocument
                                ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
                                : 'bg-amber-100 text-amber-700',
                        )}
                    >
                        {hasDocument ? 'Đã có ảnh' : 'Thiếu ảnh'}
                    </span>
                </div>
                <p className="text-xs leading-5 text-zinc-500">{description}</p>
                {document?.fileName ? (
                    <p className="truncate text-xs text-zinc-400">{document.fileName}</p>
                ) : null}
                {hasDocument ? (
                    <a
                        href={documentUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex text-xs font-medium text-zinc-950 underline underline-offset-4"
                    >
                        Mở ảnh gốc
                    </a>
                ) : null}
            </div>
        </article>
    );
}

// Nhóm thông tin nhận diện shop, gồm slug public, ngành hàng, mô hình bán và mô tả.
function ShopInformationSection({ application }: ApplicationSectionProps) {
    return (
        <AdminSellerApplicationDetailSection
            title="Thông tin shop"
            description="Kiểm tra tên, đường dẫn, ngành hàng và logo sẽ hiển thị cho người mua."
        >
            <div className="grid gap-3 md:grid-cols-2">
                <AdminSellerApplicationDetailField
                    label="Tên shop"
                    value={formatNullableText(application.shop.name)}
                />
                <AdminSellerApplicationDetailField
                    label="Đường dẫn shop"
                    value={formatNullableText(application.shop.slug)}
                />
                <AdminSellerApplicationDetailField
                    label="Ngành hàng chính"
                    value={formatNullableText(application.shop.mainCategoryId)}
                />
                <AdminSellerApplicationDetailField
                    label="Mô hình bán hàng"
                    value={formatBusinessModel(application.shop.businessModel)}
                />
                <AdminSellerApplicationDetailField
                    label="Logo shop"
                    value={
                        application.shop.logoUrl ? (
                            <a
                                href={application.shop.logoUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="text-zinc-950 underline underline-offset-4"
                            >
                                Mở ảnh logo
                            </a>
                        ) : (
                            'Chưa cung cấp'
                        )
                    }
                />
                <AdminSellerApplicationDetailField
                    label="Mô tả shop"
                    value={formatNullableText(application.shop.description)}
                />
            </div>
        </AdminSellerApplicationDetailSection>
    );
}

// Hiển thị địa chỉ lấy hàng bằng tên hành chính thay vì UUID để admin đọc được ngay trên màn hình duyệt.
function PickupAddressSection({ application }: ApplicationSectionProps) {
    const locationNames = useSellerApplicationLocationNames(
        application.pickupAddress.provinceId,
        application.pickupAddress.wardId,
    );

    return (
        <AdminSellerApplicationDetailSection
            title="Địa chỉ lấy hàng"
            description="Kho mặc định dùng để nhận đơn đầu tiên và đối chiếu khu vực vận hành của shop."
        >
            <div className="grid gap-3 md:grid-cols-2">
                <AdminSellerApplicationDetailField
                    label="Người phụ trách"
                    value={formatNullableText(application.pickupAddress.contactName)}
                />
                <AdminSellerApplicationDetailField
                    label="Số điện thoại kho"
                    value={formatNullableText(application.pickupAddress.phone)}
                />
                <AdminSellerApplicationDetailField
                    label="Tỉnh / Thành phố"
                    value={
                        locationNames.loading
                            ? 'Đang tải tên địa chỉ...'
                            : locationNames.provinceName
                    }
                />
                <AdminSellerApplicationDetailField
                    label="Phường / Xã"
                    value={
                        locationNames.loading
                            ? 'Đang tải tên địa chỉ...'
                            : locationNames.wardName
                    }
                />
                <AdminSellerApplicationDetailField
                    label="Địa chỉ chi tiết"
                    value={formatNullableText(application.pickupAddress.addressLine)}
                />
            </div>
        </AdminSellerApplicationDetailSection>
    );
}

// Nhóm thanh toán giúp admin kiểm tra tài khoản nhận tiền trước khi kích hoạt shop.
function PayoutSection({ application }: ApplicationSectionProps) {
    return (
        <AdminSellerApplicationDetailSection
            title="Thanh toán"
            description="Tài khoản dùng để nhận tiền sau đối soát."
        >
            <div className="grid gap-3 md:grid-cols-2">
                <AdminSellerApplicationDetailField
                    label="Ngân hàng"
                    value={formatNullableText(application.payout.bankName)}
                />
                <AdminSellerApplicationDetailField
                    label="Mã ngân hàng"
                    value={formatNullableText(application.payout.bankCode)}
                />
                <AdminSellerApplicationDetailField
                    label="Số tài khoản"
                    value={formatNullableText(application.payout.accountNumber)}
                />
                <AdminSellerApplicationDetailField
                    label="Chủ tài khoản"
                    value={formatNullableText(application.payout.accountHolderName)}
                />
                <AdminSellerApplicationDetailField
                    label="Loại tài khoản"
                    value={formatPayoutAccountType(application.payout.accountType)}
                />
                <AdminSellerApplicationDetailField
                    label="Chi nhánh"
                    value={formatNullableText(application.payout.branch)}
                />
            </div>
        </AdminSellerApplicationDetailSection>
    );
}

// Timeline trạng thái giúp admin biết hồ sơ được tạo, gửi và xử lý vào thời điểm nào.
function ReviewTimelineSection({ application }: ApplicationSectionProps) {
    return (
        <AdminSellerApplicationDetailSection
            title="Trạng thái duyệt"
            description="Theo dõi các mốc thời gian quan trọng của hồ sơ."
        >
            <div className="space-y-3">
                <AdminSellerApplicationDetailField
                    label="Trạng thái hiện tại"
                    value={<AdminSellerApplicationStatusBadge status={application.status} />}
                />
                <AdminSellerApplicationDetailField
                    label="Lần gửi hồ sơ"
                    value={`Lần ${Math.max(application.submissionRevision, 1)}`}
                />
                <AdminSellerApplicationDetailField
                    label="Tạo hồ sơ"
                    value={formatAdminDateTime(application.createdAt)}
                />
                <AdminSellerApplicationDetailField
                    label="Gửi duyệt"
                    value={formatAdminDateTime(application.submittedAt)}
                />
                <AdminSellerApplicationDetailField
                    label="Cập nhật gần nhất"
                    value={formatAdminDateTime(application.updatedAt)}
                />
                <AdminSellerApplicationDetailField
                    label="Duyệt lần cuối"
                    value={formatAdminDateTime(application.reviewedAt)}
                />
                <AdminSellerApplicationDetailField
                    label="Ghi chú duyệt"
                    value={formatNullableText(application.reviewNote)}
                    muted={!application.reviewNote}
                />
                {application.correctionTargets.length > 0 ? (
                    <AdminSellerApplicationDetailField
                        label="Nội dung cần chỉnh sửa"
                        value={
                            <div className="flex flex-wrap gap-2">
                                {application.correctionTargets.includes('shop_information') ? (
                                    <span className="rounded-full border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-medium text-red-800">
                                        Thông tin shop
                                    </span>
                                ) : null}
                                {application.correctionTargets.includes('shop_logo') ? (
                                    <span className="rounded-full border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-medium text-red-800">
                                        Logo shop
                                    </span>
                                ) : null}
                                {application.correctionTargets.includes('seller_identity') ? (
                                    <span className="rounded-full border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-medium text-red-800">
                                        Thông tin định danh
                                    </span>
                                ) : null}
                                {application.correctionTargets.includes('verification_documents') ? (
                                    <span className="rounded-full border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-medium text-red-800">
                                        Giấy tờ xác minh
                                    </span>
                                ) : null}
                                {application.correctionTargets.includes('pickup_address') ? (
                                    <span className="rounded-full border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-medium text-red-800">
                                        Địa chỉ lấy hàng
                                    </span>
                                ) : null}
                                {application.correctionTargets.includes('payout_information') ? (
                                    <span className="rounded-full border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-medium text-red-800">
                                        Thông tin thanh toán
                                    </span>
                                ) : null}
                            </div>
                        }
                    />
                ) : null}
            </div>
        </AdminSellerApplicationDetailSection>
    );
}

// Checklist đọc nhanh giúp admin biết hồ sơ đã đủ các phần chính trước khi bấm duyệt ở bước sau.
function ReviewChecklistSection({ application }: ApplicationSectionProps) {
    const identityDocumentsReady = getRequiredDocuments(application).every(
        (document) => application.seller.documents?.[document.key]?.url,
    );
    const checks = [
        {
            icon: Store,
            label: 'Thông tin shop',
            done: Boolean(application.shop.name && application.shop.slug && application.shop.logoUrl),
        },
        {
            icon: UserRound,
            label: 'Thông tin người bán',
            done: Boolean(application.seller.legalName && application.seller.phone && application.seller.email),
        },
        {
            icon: FileCheck2,
            label: 'Ảnh giấy tờ định danh',
            done: identityDocumentsReady,
        },
        {
            icon: MapPin,
            label: 'Địa chỉ lấy hàng',
            done: Boolean(
                application.pickupAddress.contactName &&
                    application.pickupAddress.phone &&
                    application.pickupAddress.addressLine,
            ),
        },
        {
            icon: CreditCard,
            label: 'Tài khoản thanh toán',
            done: Boolean(application.payout.bankCode && application.payout.accountNumber),
        },
    ];

    return (
        <AdminSellerApplicationDetailSection
            title="Kiểm tra nhanh"
            description="Các mục chính cần đủ trước khi chuyển hồ sơ sang bước phê duyệt."
        >
            <div className="space-y-3">
                {checks.map((check) => {
                    const Icon = check.icon;

                    return (
                        <div
                            key={check.label}
                            className="flex items-center justify-between gap-3 rounded-lg border border-zinc-100 bg-zinc-50 px-3 py-3"
                        >
                            <div className="flex items-center gap-3">
                                <span className="flex size-9 items-center justify-center rounded-lg bg-white text-zinc-700 ring-1 ring-zinc-100">
                                    <Icon className="size-4" />
                                </span>
                                <span className="text-sm font-medium text-zinc-950">
                                    {check.label}
                                </span>
                            </div>
                            <span
                                className={cn(
                                    'rounded-full px-2.5 py-1 text-xs font-medium',
                                    check.done
                                        ? 'bg-zinc-950 text-white'
                                        : 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
                                )}
                            >
                                {check.done ? 'Đủ dữ liệu' : 'Cần kiểm tra'}
                            </span>
                        </div>
                    );
                })}

                <div className="rounded-lg border border-zinc-200 bg-white p-4 text-sm leading-6 text-zinc-600">
                    <div className="flex items-start gap-3">
                        <BadgeCheck className="mt-0.5 size-5 text-zinc-500" />
                        <p>
                            Ưu tiên đối chiếu tên người bán, số định danh, ảnh giấy tờ và
                            tài khoản nhận tiền trước khi phê duyệt hồ sơ.
                        </p>
                    </div>
                </div>
            </div>
        </AdminSellerApplicationDetailSection>
    );
}

// Skeleton trang chi tiết giữ vị trí các vùng nội dung lớn trong lúc tải hồ sơ.
function AdminSellerApplicationDetailSkeleton() {
    return (
        <div className="space-y-5">
            <section className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
                <div className="flex items-start gap-4">
                    <Skeleton className="size-16 rounded-xl" />
                    <div className="flex-1">
                        <Skeleton className="h-4 w-44" />
                        <Skeleton className="mt-3 h-8 w-72" />
                        <Skeleton className="mt-3 h-7 w-40 rounded-full" />
                    </div>
                </div>
            </section>

            <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_420px]">
                <div className="space-y-5">
                    {Array.from({ length: 4 }).map((_, index) => (
                        <Skeleton key={index} className="h-64 rounded-xl" />
                    ))}
                </div>
                <div className="space-y-5">
                    <Skeleton className="h-80 rounded-xl" />
                    <Skeleton className="h-72 rounded-xl" />
                </div>
            </div>
        </div>
    );
}

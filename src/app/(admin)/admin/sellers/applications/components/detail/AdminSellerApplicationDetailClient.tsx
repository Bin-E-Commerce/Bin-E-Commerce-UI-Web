'use client';

// Màn hình chi tiết hồ sơ seller: gom thao tác header vào menu.
// Dữ liệu và quyền xử lý vẫn do hook/API sở hữu.
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import {
    ArrowLeft,
    ArrowLeftRight,
    Ban,
    BadgeCheck,
    CreditCard,
    Clock3,
    ImageOff,
    MapPin,
    MoreHorizontal,
    RefreshCw,
    Store,
    UserRound,
} from 'lucide-react';

import { Button, buttonVariants } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import type {
    SellerApplicationDto,
    SellerVerificationDocumentDto,
} from '@/services/seller';
import type {
    AdminSellerApplicationDetailClientProps,
    AdminSellerApplicationDetailContentProps,
    ApplicationSectionProps,
} from '../../types/application-detail.types';
import { AdminSellerApplicationStatusBadge } from '../shared/AdminSellerApplicationStatusBadge';
import { useAdminSellerApplication } from '../../hooks/useAdminSellerApplication';
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
import { ApproveSellerApplicationDialog } from './ApproveSellerApplicationDialog';
import { RejectSellerApplicationDialog } from './RejectSellerApplicationDialog';

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
                    Hồ sơ có thể không tồn tại hoặc tài khoản hiện tại không có
                    quyền xem.
                </p>
                <div className="mt-5 flex flex-wrap gap-3">
                    <Link
                        href="/admin/sellers/applications"
                        className={cn(
                            buttonVariants({ variant: 'outline' }),
                            'rounded-full',
                        )}
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

// Render hồ sơ theo từng hàng nghiệp vụ để phần định danh và trạng thái duyệt đều có đủ chiều ngang.
// Trạng thái dialog được giữ ở đây để menu có thể đóng ngay sau khi chọn mà không unmount bước xác nhận.
// Nút duyệt/từ chối chỉ xuất hiện ở trạng thái chờ; dialog tiếp tục khóa thao tác khi mutation đang chạy.
function AdminSellerApplicationDetailContent({
    application,
    refreshing,
    onRefresh,
}: AdminSellerApplicationDetailContentProps) {
    const [approveDialogOpen, setApproveDialogOpen] = useState(false);
    const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
    // Permission lấy từ session do backend resolve; việc ẩn nút chỉ phục vụ UX, endpoint vẫn được gateway và seller-service bảo vệ độc lập.
    const isPendingReview =
        String(application.status).toLowerCase() === 'pending_review';

    return (
        <div className="space-y-5">
            <section className="rounded-2xl border border-zinc-200/80 bg-white px-3 py-3 shadow-[0_2px_10px_rgba(15,23,42,0.04)] sm:px-4">
                <div className="flex items-center justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                        <ShopLogo application={application} />
                        <div className="min-w-0">
                            <h1 className="mt-0.5 truncate text-lg font-semibold leading-6 text-zinc-950 sm:text-xl">
                                {getApplicationShopDisplayName(application)}
                            </h1>
                            <div className="mt-1.5 flex min-w-0 flex-wrap items-center gap-1.5">
                                <AdminSellerApplicationStatusBadge
                                    status={application.status}
                                />
                                <span
                                    title={`Mã hồ sơ: ${application.id}`}
                                    className="inline-flex max-w-[min(58vw,320px)] items-center gap-1.5 overflow-hidden rounded-full border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-[10px] text-zinc-500 sm:text-[11px]"
                                >
                                    <span className="shrink-0 font-sans">
                                        Mã hồ sơ
                                    </span>
                                    <span aria-hidden="true">·</span>
                                    <span className="truncate font-mono">
                                        {application.id}
                                    </span>
                                </span>
                            </div>
                        </div>
                    </div>

                    <DropdownMenu.Root>
                        <DropdownMenu.Trigger asChild>
                            <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                aria-label="Mở thao tác hồ sơ"
                                title="Thao tác hồ sơ"
                                className="size-9 shrink-0 rounded-xl border-zinc-200 bg-white shadow-sm hover:bg-zinc-50 data-[state=open]:bg-zinc-100 sm:size-10"
                            >
                                <MoreHorizontal className="size-5" />
                            </Button>
                        </DropdownMenu.Trigger>
                        <DropdownMenu.Portal>
                            <DropdownMenu.Content
                                align="end"
                                sideOffset={8}
                                className="z-50 min-w-56 rounded-xl border border-zinc-200 bg-white p-1.5 shadow-xl outline-none"
                            >
                                <DropdownMenu.Label className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-zinc-400">
                                    Thao tác hồ sơ
                                </DropdownMenu.Label>
                                {isPendingReview ? (
                                    <>
                                        <DropdownMenu.Item
                                            onSelect={() =>
                                                setApproveDialogOpen(true)
                                            }
                                            className="flex cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-zinc-800 outline-none transition-colors hover:bg-zinc-100 focus:bg-zinc-100"
                                        >
                                            <BadgeCheck className="size-4" />
                                            Chấp thuận hồ sơ
                                        </DropdownMenu.Item>
                                        <DropdownMenu.Item
                                            onSelect={() =>
                                                setRejectDialogOpen(true)
                                            }
                                            className="flex cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-red-700 outline-none transition-colors hover:bg-red-50 focus:bg-red-50"
                                        >
                                            <Ban className="size-4" />
                                            Từ chối hồ sơ
                                        </DropdownMenu.Item>
                                        <DropdownMenu.Separator className="my-1.5 h-px bg-zinc-100" />
                                    </>
                                ) : null}
                                <DropdownMenu.Item asChild>
                                    <Link
                                        href="/admin/sellers/applications"
                                        className="flex cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-zinc-700 outline-none transition-colors hover:bg-zinc-100 focus:bg-zinc-100"
                                    >
                                        <ArrowLeft className="size-4" />
                                        Quay lại danh sách
                                    </Link>
                                </DropdownMenu.Item>
                                <DropdownMenu.Item
                                    disabled={refreshing}
                                    onSelect={onRefresh}
                                    className="flex cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-zinc-700 outline-none transition-colors hover:bg-zinc-100 focus:bg-zinc-100 data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50"
                                >
                                    <RefreshCw
                                        className={cn(
                                            'size-4',
                                            refreshing && 'animate-spin',
                                        )}
                                    />
                                    Làm mới
                                </DropdownMenu.Item>
                            </DropdownMenu.Content>
                        </DropdownMenu.Portal>
                    </DropdownMenu.Root>
                </div>
            </section>

            <ApproveSellerApplicationDialog
                applicationId={application.id}
                shopName={getApplicationShopDisplayName(application)}
                open={approveDialogOpen}
                onOpenChange={setApproveDialogOpen}
            />
            <RejectSellerApplicationDialog
                applicationId={application.id}
                shopName={getApplicationShopDisplayName(application)}
                open={rejectDialogOpen}
                onOpenChange={setRejectDialogOpen}
            />

            <div className="space-y-4">
                <IdentityReviewSection application={application} />
                <ReviewTimelineSection application={application} />

                <div className="grid min-w-0 gap-3 lg:grid-cols-2">
                    <ShopInformationSection application={application} />
                    <PickupAddressSection application={application} />
                    <div className="lg:col-span-2">
                        <PayoutSection application={application} />
                    </div>
                </div>
            </div>
        </div>
    );
}

// Hiển thị logo shop thật nếu có; fallback icon giúp header vẫn cân đối khi hồ sơ thiếu logo.
function ShopLogo({ application }: ApplicationSectionProps) {
    return (
        <div className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-zinc-100 ring-1 ring-zinc-200 sm:size-14">
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

// Tách dữ liệu thành thông tin cần khớp và thông tin bổ sung để admin không phải rà từng field rời.
// Cột giấy tờ giữ cạnh dữ liệu trên desktop; trên màn hình nhỏ, hai vùng tự xếp dọc theo cùng thứ tự đọc.
function IdentityReviewSection({ application }: ApplicationSectionProps) {
    const identityLabel =
        application.seller.profileType === 'business'
            ? 'Mã số thuế'
            : 'Số CCCD';
    const identityValue =
        application.seller.profileType === 'business'
            ? application.seller.taxCode
            : application.seller.citizenId;

    return (
        <AdminSellerApplicationDetailSection
            title="Đối chiếu định danh"
            description="So sánh thông tin người bán đã nhập với ảnh giấy tờ trước khi duyệt hồ sơ."
            icon={UserRound}
        >
            <div className="grid gap-4 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
                <div className="space-y-3">
                    <div className="rounded-xl border border-zinc-200 bg-zinc-50/70 p-3">
                        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                            <h3 className="text-xs font-semibold text-zinc-800">
                                Thông tin cần khớp
                            </h3>
                            <span className="rounded-full border border-zinc-200 bg-white px-2 py-1 text-[10px] font-medium text-zinc-500">
                                {formatSellerProfileType(
                                    application.seller.profileType,
                                )}
                            </span>
                        </div>
                        <div className="grid gap-2 sm:grid-cols-2">
                            <div className="min-w-0 rounded-lg border border-zinc-200 bg-white px-3 py-2.5">
                                <p className="text-[10px] font-semibold uppercase tracking-wide text-zinc-400">
                                    Họ tên / Pháp nhân
                                </p>
                                <p className="mt-1 break-words text-sm font-semibold leading-5 text-zinc-950">
                                    {formatNullableText(
                                        application.seller.legalName,
                                    )}
                                </p>
                            </div>
                            <div className="min-w-0 rounded-lg border border-zinc-200 bg-white px-3 py-2.5">
                                <p className="text-[10px] font-semibold uppercase tracking-wide text-zinc-400">
                                    {identityLabel}
                                </p>
                                <p className="mt-1 break-all font-mono text-sm font-semibold leading-5 text-zinc-950">
                                    {formatNullableText(identityValue)}
                                </p>
                            </div>
                        </div>
                        <div className="mt-2 flex items-start gap-1.5 border-t border-zinc-200 pt-2 text-[11px] leading-4 text-zinc-500">
                            <ArrowLeftRight className="mt-0.5 size-3.5 shrink-0 text-zinc-700" />
                            <p>
                                So tên và số định danh với ảnh giấy tờ bên cạnh.
                            </p>
                        </div>
                    </div>

                    <div>
                        <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.08em] text-zinc-400">
                            Thông tin bổ sung
                        </p>
                        <div className="grid gap-2 sm:grid-cols-2">
                            <AdminSellerApplicationDetailField
                                label="Người đại diện"
                                value={formatNullableText(
                                    application.seller.representativeName,
                                )}
                            />
                            <AdminSellerApplicationDetailField
                                label="Chức vụ / Vai trò"
                                value={formatNullableText(
                                    application.seller.representativeRole,
                                )}
                            />
                            <AdminSellerApplicationDetailField
                                label="Liên hệ"
                                className="sm:col-span-2"
                                value={
                                    <div className="space-y-1">
                                        <p className="break-all">
                                            {formatNullableText(
                                                application.seller.email ??
                                                    application.userEmail,
                                            )}
                                        </p>
                                        <p className="text-zinc-500">
                                            {formatNullableText(
                                                application.seller.phone,
                                            )}
                                        </p>
                                    </div>
                                }
                            />
                        </div>
                    </div>
                </div>

                <div className="min-w-0">
                    <div className="mb-2 flex items-center justify-between gap-2">
                        <h3 className="text-xs font-semibold text-zinc-800">
                            Giấy tờ xác minh
                        </h3>
                        <span className="text-[10px] text-zinc-400">
                            So trực tiếp với ảnh
                        </span>
                    </div>
                    <DocumentPreviewGrid application={application} />
                </div>
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

// Đặt các giấy tờ cạnh nhau theo thứ tự mặt trước/mặt sau hoặc giấy phép/người đại diện.
function DocumentPreviewGrid({ application }: ApplicationSectionProps) {
    const documents = getRequiredDocuments(application);

    return (
        <div className="grid auto-rows-fr items-stretch gap-3 sm:grid-cols-2">
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

// Card giấy tờ giữ chiều cao đồng nhất và mở ảnh đầy đủ trong dialog để admin soi trực tiếp.
function DocumentPreviewCard({
    title,
    description,
    document,
}: DocumentPreviewCardProps) {
    const [previewOpen, setPreviewOpen] = useState(false);
    const documentUrl = document?.url;
    const hasDocument = Boolean(documentUrl);

    return (
        <article
            className={cn(
                'flex h-full flex-col rounded-xl border p-2.5 sm:p-3',
                hasDocument
                    ? 'border-zinc-200 bg-white'
                    : 'border-amber-200 bg-amber-50',
            )}
        >
            <div className="relative flex aspect-[4/3] items-center justify-center overflow-hidden rounded-lg border border-zinc-200 bg-zinc-50">
                {documentUrl ? (
                    <img
                        src={documentUrl}
                        alt={title}
                        className="h-full w-full object-cover"
                    />
                ) : (
                    <div className="flex flex-col items-center gap-2 text-zinc-500">
                        <ImageOff className="size-8" />
                        <span className="text-xs font-medium">
                            Chưa tải ảnh
                        </span>
                    </div>
                )}
            </div>
            <div className="mt-2.5 flex flex-1 flex-col">
                <div className="flex items-start justify-between gap-2">
                    <h3 className="text-sm font-semibold text-zinc-950">
                        {title}
                    </h3>
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
                <p className="mt-1 text-xs leading-5 text-zinc-500">
                    {description}
                </p>
                {document?.fileName ? (
                    <p className="mt-1 truncate text-xs text-zinc-400">
                        {document.fileName}
                    </p>
                ) : null}
                {documentUrl ? (
                    <>
                        <Button
                            type="button"
                            variant="link"
                            className="mt-auto h-auto justify-start p-0 pt-2 text-xs font-medium text-zinc-950 underline underline-offset-4"
                            onClick={() => setPreviewOpen(true)}
                        >
                            Mở ảnh gốc
                        </Button>
                        <Dialog
                            open={previewOpen}
                            onOpenChange={setPreviewOpen}
                        >
                            <DialogContent className="gap-3 sm:max-w-4xl">
                                <DialogHeader className="pr-8">
                                    <DialogTitle>{title}</DialogTitle>
                                    <DialogDescription>
                                        Xem ảnh gốc để đối chiếu thông tin giấy tờ.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="relative h-[min(70dvh,720px)] min-h-40 w-full overflow-hidden rounded-lg border border-zinc-200 bg-zinc-50">
                                    <Image
                                        src={documentUrl}
                                        alt={title}
                                        fill
                                        unoptimized
                                        className="object-contain"
                                    />
                                </div>
                            </DialogContent>
                        </Dialog>
                    </>
                ) : null}
            </div>
        </article>
    );
}

// Nhóm thông tin nhận diện shop; logo mở trong dialog để admin xem ảnh mà không rời hồ sơ.
function ShopInformationSection({ application }: ApplicationSectionProps) {
    const [logoPreviewOpen, setLogoPreviewOpen] = useState(false);

    return (
        <AdminSellerApplicationDetailSection
            title="Thông tin shop"
            description="Kiểm tra tên, đường dẫn, ngành hàng và logo sẽ hiển thị cho người mua."
            icon={Store}
            density="compact"
        >
            <div className="grid gap-2 sm:grid-cols-2">
                <AdminSellerApplicationDetailField
                    label="Tên shop"
                    compact
                    value={formatNullableText(application.shop.name)}
                />
                <AdminSellerApplicationDetailField
                    label="Đường dẫn shop"
                    compact
                    value={formatNullableText(application.shop.slug)}
                />
                <AdminSellerApplicationDetailField
                    label="Mã ngành hàng"
                    compact
                    value={
                        <span className="break-all font-mono text-xs">
                            {formatNullableText(
                                application.shop.mainCategoryId,
                            )}
                        </span>
                    }
                />
                <AdminSellerApplicationDetailField
                    label="Mô hình bán hàng"
                    compact
                    value={formatBusinessModel(application.shop.businessModel)}
                />
                <AdminSellerApplicationDetailField
                    label="Logo shop"
                    compact
                    value={
                        application.shop.logoUrl ? (
                            <>
                                <Button
                                    type="button"
                                    variant="link"
                                    className="h-auto justify-start p-0 text-xs font-medium text-zinc-950 underline underline-offset-4"
                                    onClick={() => setLogoPreviewOpen(true)}
                                >
                                    Mở ảnh logo
                                </Button>
                                <Dialog
                                    open={logoPreviewOpen}
                                    onOpenChange={setLogoPreviewOpen}
                                >
                                    <DialogContent className="gap-3 sm:max-w-2xl">
                                        <DialogHeader className="pr-8">
                                            <DialogTitle>Logo shop</DialogTitle>
                                            <DialogDescription>
                                                Xem ảnh logo shop đã tải lên.
                                            </DialogDescription>
                                        </DialogHeader>
                                        <div className="relative h-[min(60dvh,560px)] min-h-40 w-full overflow-hidden rounded-lg border border-zinc-200 bg-zinc-50">
                                            <Image
                                                src={application.shop.logoUrl}
                                                alt="Logo shop"
                                                fill
                                                unoptimized
                                                className="object-contain"
                                            />
                                        </div>
                                    </DialogContent>
                                </Dialog>
                            </>
                        ) : (
                            'Chưa cung cấp'
                        )
                    }
                />
                <AdminSellerApplicationDetailField
                    label="Mô tả shop"
                    compact
                    value={formatNullableText(application.shop.description)}
                />
            </div>
        </AdminSellerApplicationDetailSection>
    );
}

// Hiển thị địa chỉ lấy hàng bằng tên hành chính thay vì UUID để admin đọc được ngay trên màn hình duyệt.
function PickupAddressSection({ application }: ApplicationSectionProps) {
    return (
        <AdminSellerApplicationDetailSection
            title="Địa chỉ lấy hàng"
            description="Kho mặc định dùng để nhận đơn đầu tiên và đối chiếu khu vực vận hành của shop."
            icon={MapPin}
            density="compact"
        >
            <div className="grid gap-2 sm:grid-cols-2">
                <AdminSellerApplicationDetailField
                    label="Người phụ trách"
                    compact
                    value={formatNullableText(
                        application.pickupAddress.contactName,
                    )}
                />
                <AdminSellerApplicationDetailField
                    label="Số điện thoại kho"
                    compact
                    value={formatNullableText(application.pickupAddress.phone)}
                />
                <AdminSellerApplicationDetailField
                    label="Tỉnh / Thành phố"
                    compact
                    value={formatNullableText(
                        application.pickupAddress.provinceName,
                    )}
                />
                <AdminSellerApplicationDetailField
                    label="Quận / Huyện"
                    compact
                    value={formatNullableText(
                        application.pickupAddress.districtName,
                    )}
                />
                <AdminSellerApplicationDetailField
                    label="Phường / Xã"
                    compact
                    value={formatNullableText(
                        application.pickupAddress.wardName,
                    )}
                />
                <AdminSellerApplicationDetailField
                    label="Địa chỉ chi tiết"
                    compact
                    value={formatNullableText(
                        application.pickupAddress.addressLine,
                    )}
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
            icon={CreditCard}
            density="compact"
        >
            <div className="grid gap-2 sm:grid-cols-2">
                <AdminSellerApplicationDetailField
                    label="Ngân hàng"
                    compact
                    value={formatNullableText(application.payout.bankName)}
                />
                <AdminSellerApplicationDetailField
                    label="Mã ngân hàng"
                    compact
                    value={formatNullableText(application.payout.bankCode)}
                />
                <AdminSellerApplicationDetailField
                    label="Số tài khoản"
                    compact
                    value={formatNullableText(application.payout.accountNumber)}
                />
                <AdminSellerApplicationDetailField
                    label="Chủ tài khoản"
                    compact
                    value={formatNullableText(
                        application.payout.accountHolderName,
                    )}
                />
                <AdminSellerApplicationDetailField
                    label="Loại tài khoản"
                    compact
                    value={formatPayoutAccountType(
                        application.payout.accountType,
                    )}
                />
                <AdminSellerApplicationDetailField
                    label="Chi nhánh"
                    compact
                    value={formatNullableText(application.payout.branch)}
                />
            </div>
        </AdminSellerApplicationDetailSection>
    );
}

// Timeline trạng thái chiếm trọn một hàng để trạng thái và các mốc thời gian dễ quét.
// Hai thông tin chính nằm trên nửa hàng đầu; bốn mốc ngày chia đều hàng kế tiếp trên desktop.
// Ghi chú và nội dung cần chỉnh sửa luôn chiếm toàn chiều ngang để không bị bó hẹp.
function ReviewTimelineSection({ application }: ApplicationSectionProps) {
    return (
        <AdminSellerApplicationDetailSection
            title="Trạng thái duyệt"
            description="Theo dõi các mốc thời gian quan trọng của hồ sơ."
            icon={Clock3}
        >
            <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
                <AdminSellerApplicationDetailField
                    label="Trạng thái hiện tại"
                    className="sm:col-span-2"
                    value={
                        <AdminSellerApplicationStatusBadge
                            status={application.status}
                        />
                    }
                />
                <AdminSellerApplicationDetailField
                    label="Lần gửi hồ sơ"
                    className="sm:col-span-2"
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
                    className="sm:col-span-2 xl:col-span-4"
                />
                {application.correctionTargets.length > 0 ? (
                    <AdminSellerApplicationDetailField
                        label="Nội dung cần chỉnh sửa"
                        className="sm:col-span-2 xl:col-span-4"
                        value={
                            <div className="flex flex-wrap gap-2">
                                {application.correctionTargets.includes(
                                    'shop_information',
                                ) ? (
                                    <span className="rounded-full border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-medium text-red-800">
                                        Thông tin shop
                                    </span>
                                ) : null}
                                {application.correctionTargets.includes(
                                    'shop_logo',
                                ) ? (
                                    <span className="rounded-full border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-medium text-red-800">
                                        Logo shop
                                    </span>
                                ) : null}
                                {application.correctionTargets.includes(
                                    'seller_identity',
                                ) ? (
                                    <span className="rounded-full border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-medium text-red-800">
                                        Thông tin định danh
                                    </span>
                                ) : null}
                                {application.correctionTargets.includes(
                                    'verification_documents',
                                ) ? (
                                    <span className="rounded-full border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-medium text-red-800">
                                        Giấy tờ xác minh
                                    </span>
                                ) : null}
                                {application.correctionTargets.includes(
                                    'pickup_address',
                                ) ? (
                                    <span className="rounded-full border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-medium text-red-800">
                                        Địa chỉ lấy hàng
                                    </span>
                                ) : null}
                                {application.correctionTargets.includes(
                                    'payout_information',
                                ) ? (
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

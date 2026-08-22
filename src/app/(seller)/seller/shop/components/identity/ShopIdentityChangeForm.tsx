'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { FileCheck2, Loader2, LockKeyhole, Send, X } from 'lucide-react';
import { useForm } from 'react-hook-form';

import { VerificationUploadCard } from '@/app/(seller)/seller/register/components/shared/VerificationUploadCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import type {
    SellerVerificationDocumentDto,
    ShopProfileDto,
} from '@/services/seller';
import { useShopProfileChangeRequest } from '../../hooks/useShopProfileChangeRequest';
import {
    shopIdentityChangeSchema,
    type ShopIdentityChangeFormValues,
} from '../../schemas/shop-profile-change.schema';
import { formatProfileType } from '../../utils/shop-profile-formatters';
import { ShopChangeField } from '../shared/ShopChangeField';

interface ShopIdentityChangeFormProps {
    profile: ShopProfileDto;
    onCancel: () => void;
    onSubmitted: () => void;
}

// Thu thập lại trọn bộ định danh và chứng từ mới; dữ liệu đang có hiệu lực không bị ghi đè trước khi admin duyệt.
export function ShopIdentityChangeForm({
    profile,
    onCancel,
    onSubmitted,
}: ShopIdentityChangeFormProps) {
    const mutation = useShopProfileChangeRequest(onSubmitted);
    const form = useForm<ShopIdentityChangeFormValues>({
        resolver: zodResolver(shopIdentityChangeSchema),
        mode: 'onChange',
        defaultValues: {
            profileType: profile.identity.profileType,
            legalName: profile.identity.legalName ?? '',
            citizenId: '',
            representativeName: profile.identity.representativeName ?? '',
            representativeRole: profile.identity.representativeRole ?? '',
            contactEmail: profile.identity.contactEmail ?? '',
            contactPhone: profile.identity.contactPhone ?? '',
            documents: {},
            requestNote: '',
        },
    });
    const {
        register,
        setValue,
        watch,
        formState: { errors, isValid },
    } = form;
    const isBusiness = profile.identity.profileType === 'business';
    const documents = watch('documents');

    // Cập nhật một ảnh trong map chứng từ và kích hoạt validate ngay để nút gửi phản ánh đúng trạng thái upload.
    const handleDocumentChange = (
        key: string,
        document: SellerVerificationDocumentDto | undefined,
    ) => {
        const nextDocuments = { ...documents };
        if (document) {
            nextDocuments[key] = document;
        } else {
            delete nextDocuments[key];
        }

        setValue('documents', nextDocuments, {
            shouldDirty: true,
            shouldTouch: true,
            shouldValidate: true,
        });
    };

    // Payload không chứa profileType vì loại pháp nhân đã khóa; chuyển loại hồ sơ cần một quy trình onboarding mới riêng biệt.
    const submit = form.handleSubmit((values) => {
        mutation.mutate({
            requestNote: values.requestNote,
            identity: {
                legalName: values.legalName,
                citizenId: isBusiness ? null : values.citizenId,
                representativeName: values.representativeName,
                representativeRole: values.representativeRole || null,
                contactEmail: values.contactEmail,
                contactPhone: values.contactPhone,
                documents: values.documents,
            },
        });
    });

    return (
        <form onSubmit={submit}>
            <div className="border-b border-zinc-200 p-5 sm:p-7">
                <div className="flex max-w-3xl items-start gap-3 rounded-md border border-zinc-200 bg-zinc-50 p-4">
                    <LockKeyhole className="mt-0.5 size-5 shrink-0 text-zinc-500" />
                    <div>
                        <h2 className="text-sm font-semibold text-zinc-950">
                            Xác minh lại thông tin định danh
                        </h2>
                        <p className="mt-1 text-sm leading-6 text-zinc-600">
                            Loại hồ sơ{' '}
                            {formatProfileType(profile.identity.profileType)}{' '}
                            được giữ nguyên. Vui lòng nhập lại số giấy tờ đầy đủ
                            và tải bộ ảnh mới để đối chiếu.
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid gap-5 p-5 sm:grid-cols-2 sm:p-7">
                <ShopChangeField
                    label={
                        isBusiness
                            ? 'Tên pháp lý doanh nghiệp'
                            : 'Họ và tên trên CCCD'
                    }
                    required
                    error={errors.legalName?.message}
                >
                    <Input
                        className="h-11"
                        disabled={mutation.isPending}
                        {...register('legalName')}
                    />
                </ShopChangeField>

                {!isBusiness ? (
                    <ShopChangeField
                        label="Số CCCD"
                        required
                        error={errors.citizenId?.message}
                    >
                        <Input
                            inputMode="numeric"
                            className="h-11"
                            placeholder="Nhập lại đầy đủ 9 hoặc 12 số"
                            disabled={mutation.isPending}
                            {...register('citizenId')}
                        />
                    </ShopChangeField>
                ) : null}

                <ShopChangeField
                    label="Người đại diện"
                    required
                    error={errors.representativeName?.message}
                >
                    <Input
                        className="h-11"
                        disabled={mutation.isPending}
                        {...register('representativeName')}
                    />
                </ShopChangeField>
                <ShopChangeField
                    label="Chức vụ / Vai trò"
                    error={errors.representativeRole?.message}
                >
                    <Input
                        className="h-11"
                        placeholder="Ví dụ: Chủ shop hoặc Giám đốc"
                        disabled={mutation.isPending}
                        {...register('representativeRole')}
                    />
                </ShopChangeField>
                <ShopChangeField
                    label="Email liên hệ pháp lý"
                    required
                    error={errors.contactEmail?.message}
                >
                    <Input
                        type="email"
                        className="h-11"
                        disabled={mutation.isPending}
                        {...register('contactEmail')}
                    />
                </ShopChangeField>
                <ShopChangeField
                    label="Số điện thoại pháp lý"
                    required
                    error={errors.contactPhone?.message}
                >
                    <Input
                        inputMode="tel"
                        className="h-11"
                        disabled={mutation.isPending}
                        {...register('contactPhone')}
                    />
                </ShopChangeField>
            </div>

            <section className="border-t border-zinc-200 px-5 py-6 sm:px-7">
                <div className="flex items-start gap-3">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-zinc-950 text-white">
                        <FileCheck2 className="size-5" />
                    </span>
                    <div>
                        <h3 className="text-sm font-semibold text-zinc-950">
                            Giấy tờ mới dùng để đối chiếu
                        </h3>
                        <p className="mt-1 text-sm leading-6 text-zinc-500">
                            Ảnh cần rõ chữ, đủ bốn góc và còn hiệu lực. Bộ giấy
                            tờ cũ không được tự động dùng lại cho yêu cầu mới.
                        </p>
                    </div>
                </div>

                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    {isBusiness ? (
                        <>
                            <VerificationUploadCard
                                id="shop-change-business-license"
                                title="Giấy đăng ký kinh doanh"
                                description="Đối chiếu tên pháp lý và mã số doanh nghiệp."
                                value={documents.businessLicense}
                                error={getDocumentError(
                                    errors.documents,
                                    'businessLicense',
                                )}
                                onChange={(document) =>
                                    handleDocumentChange(
                                        'businessLicense',
                                        document,
                                    )
                                }
                            />
                            <VerificationUploadCard
                                id="shop-change-representative-document"
                                title="Giấy tờ người đại diện"
                                description="CCCD hoặc giấy ủy quyền của người đại diện."
                                value={documents.representativeDocument}
                                error={getDocumentError(
                                    errors.documents,
                                    'representativeDocument',
                                )}
                                onChange={(document) =>
                                    handleDocumentChange(
                                        'representativeDocument',
                                        document,
                                    )
                                }
                            />
                        </>
                    ) : (
                        <>
                            <VerificationUploadCard
                                id="shop-change-citizen-front"
                                title="CCCD mặt trước"
                                description="Ảnh rõ họ tên, số CCCD và khuôn mặt."
                                value={documents.citizenIdFront}
                                error={getDocumentError(
                                    errors.documents,
                                    'citizenIdFront',
                                )}
                                onChange={(document) =>
                                    handleDocumentChange(
                                        'citizenIdFront',
                                        document,
                                    )
                                }
                            />
                            <VerificationUploadCard
                                id="shop-change-citizen-back"
                                title="CCCD mặt sau"
                                description="Ảnh rõ ngày cấp và đặc điểm nhận dạng."
                                value={documents.citizenIdBack}
                                error={getDocumentError(
                                    errors.documents,
                                    'citizenIdBack',
                                )}
                                onChange={(document) =>
                                    handleDocumentChange(
                                        'citizenIdBack',
                                        document,
                                    )
                                }
                            />
                        </>
                    )}
                </div>
            </section>

            <div className="border-t border-zinc-200 p-5 sm:p-7">
                <ShopChangeField
                    label="Lý do thay đổi"
                    required
                    error={errors.requestNote?.message}
                >
                    <Textarea
                        rows={4}
                        className="min-h-24 resize-y"
                        placeholder="Mô tả ngắn gọn lý do cập nhật thông tin định danh."
                        disabled={mutation.isPending}
                        {...register('requestNote')}
                    />
                </ShopChangeField>
            </div>

            <footer className="flex flex-col-reverse gap-2 border-t border-zinc-200 bg-zinc-50/70 px-5 py-4 sm:flex-row sm:justify-end sm:px-7">
                <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    disabled={mutation.isPending}
                    onClick={onCancel}
                >
                    <X className="size-4" />
                    Hủy
                </Button>
                <Button
                    type="submit"
                    size="lg"
                    className="bg-zinc-950 px-5 text-white hover:bg-zinc-800"
                    disabled={mutation.isPending || !isValid}
                >
                    {mutation.isPending ? (
                        <Loader2 className="size-4 animate-spin" />
                    ) : (
                        <Send className="size-4" />
                    )}
                    {mutation.isPending ? 'Đang gửi...' : 'Gửi yêu cầu duyệt'}
                </Button>
            </footer>
        </form>
    );
}

// Đọc lỗi Zod của record tài liệu theo key mà không để component upload phụ thuộc kiểu nội bộ của React Hook Form.
function getDocumentError(errors: unknown, key: string): string | undefined {
    if (!errors || typeof errors !== 'object') return undefined;
    const fieldError = (errors as Record<string, { message?: unknown }>)[key];
    return typeof fieldError?.message === 'string'
        ? fieldError.message
        : undefined;
}

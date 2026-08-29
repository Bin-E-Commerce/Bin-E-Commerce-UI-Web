'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Building2, CreditCard, Loader2, Send, X } from 'lucide-react';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';

import { SellerCombobox } from '@/app/(seller)/seller/register/components/shared/SellerCombobox';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { BANK_OPTIONS } from '@/app/(seller)/seller/banking/constants/bank-options.constant';
import { cn } from '@/lib/utils';
import type { ShopProfileDto } from '@/services/seller';
import {
    shopPayoutChangeSchema,
    shopTaxChangeSchema,
    type ShopPayoutChangeFormValues,
    type ShopTaxChangeFormValues,
} from '../../schemas/shop-profile-change.schema';
import { useShopProfileChangeRequest } from '../../hooks/useShopProfileChangeRequest';
import { ShopChangeField } from '../shared/ShopChangeField';

type ChangeArea = 'tax' | 'payout';

interface ShopTaxAndPayoutChangeFormProps {
    profile: ShopProfileDto;
    onCancel: () => void;
    onSubmitted: () => void;
}

// Cho seller chọn đúng nhóm cần đổi để không phải nhập lại dữ liệu thuế khi chỉ thay tài khoản nhận tiền và ngược lại.
export function ShopTaxAndPayoutChangeForm({
    profile,
    onCancel,
    onSubmitted,
}: ShopTaxAndPayoutChangeFormProps) {
    const [activeArea, setActiveArea] = useState<ChangeArea>('tax');
    const mutation = useShopProfileChangeRequest(onSubmitted);
    const taxForm = useForm<ShopTaxChangeFormValues>({
        resolver: zodResolver(shopTaxChangeSchema),
        mode: 'onChange',
        defaultValues: {
            legalName: profile.tax.legalName ?? '',
            taxCode: '',
            invoiceEmail: profile.tax.invoiceEmail ?? '',
            requestNote: '',
        },
    });
    const payoutForm = useForm<ShopPayoutChangeFormValues>({
        resolver: zodResolver(shopPayoutChangeSchema),
        mode: 'onChange',
        defaultValues: {
            bankCode: profile.tax.payoutBankCode ?? '',
            bankName: profile.tax.payoutBankName ?? '',
            accountNumber: '',
            accountHolderName: profile.tax.payoutAccountHolder ?? '',
            accountType: profile.tax.payoutAccountType,
            branch: profile.tax.payoutBranch ?? '',
            requestNote: '',
        },
    });

    // Đồng bộ cả mã lẫn tên ngân hàng để backend lưu được khóa tích hợp và nhãn hiển thị ổn định.
    const handleBankChange = (bankCode: string) => {
        const bank = BANK_OPTIONS.find((option) => option.value === bankCode);
        payoutForm.setValue('bankCode', bankCode, {
            shouldDirty: true,
            shouldValidate: true,
        });
        payoutForm.setValue('bankName', bank?.label ?? '', {
            shouldDirty: true,
            shouldValidate: true,
        });
    };

    // Chỉ gửi nhóm thuế; số thuế phải nhập lại đầy đủ vì response đọc hồ sơ cố ý chỉ trả dữ liệu đã che.
    const submitTax = taxForm.handleSubmit((values) => {
        mutation.mutate({
            requestNote: values.requestNote,
            tax: {
                legalName: values.legalName,
                taxCode: values.taxCode,
                invoiceEmail: values.invoiceEmail,
            },
        });
    });

    // Chỉ gửi nhóm payout để thay đổi tài khoản nhận tiền luôn có audit và quyết định duyệt độc lập.
    const submitPayout = payoutForm.handleSubmit((values) => {
        mutation.mutate({
            requestNote: values.requestNote,
            payout: {
                bankCode: values.bankCode,
                bankName: values.bankName,
                accountNumber: values.accountNumber,
                accountHolderName: values.accountHolderName,
                accountType: values.accountType,
                branch: values.branch || null,
            },
        });
    });

    const taxErrors = taxForm.formState.errors;
    const payoutErrors = payoutForm.formState.errors;
    const activeFormValid =
        activeArea === 'tax'
            ? taxForm.formState.isValid
            : payoutForm.formState.isValid;

    return (
        <div>
            <div className="border-b border-zinc-200 p-5 sm:p-7">
                <div className="max-w-3xl">
                    <h2 className="text-lg font-semibold text-zinc-950">
                        Yêu cầu cập nhật thuế và thanh toán
                    </h2>
                    <p className="mt-1 text-sm leading-6 text-zinc-500">
                        Dữ liệu hiện tại vẫn có hiệu lực trong lúc đội ngũ vận
                        hành kiểm tra thông tin mới.
                    </p>
                </div>

                <div className="mt-5 grid max-w-3xl gap-3 sm:grid-cols-2">
                    <ChangeAreaButton
                        active={activeArea === 'tax'}
                        icon={<Building2 className="size-5" />}
                        title="Thông tin thuế"
                        description="Tên pháp lý, mã số thuế và email hóa đơn"
                        onClick={() => setActiveArea('tax')}
                    />
                    <ChangeAreaButton
                        active={activeArea === 'payout'}
                        icon={<CreditCard className="size-5" />}
                        title="Tài khoản nhận tiền"
                        description="Ngân hàng, số tài khoản và chủ tài khoản"
                        onClick={() => setActiveArea('payout')}
                    />
                </div>
            </div>

            {activeArea === 'tax' ? (
                <form onSubmit={submitTax}>
                    <div className="grid gap-5 p-5 sm:grid-cols-2 sm:p-7">
                        <ShopChangeField
                            label="Tên pháp lý"
                            required
                            error={taxErrors.legalName?.message}
                        >
                            <Input
                                className="h-11"
                                disabled={mutation.isPending}
                                {...taxForm.register('legalName')}
                            />
                        </ShopChangeField>
                        <ShopChangeField
                            label="Mã số thuế mới"
                            required
                            error={taxErrors.taxCode?.message}
                        >
                            <Input
                                inputMode="numeric"
                                className="h-11"
                                placeholder="Nhập đủ 10 hoặc 13 số"
                                disabled={mutation.isPending}
                                {...taxForm.register('taxCode')}
                            />
                        </ShopChangeField>
                        <ShopChangeField
                            label="Email nhận hóa đơn"
                            required
                            error={taxErrors.invoiceEmail?.message}
                        >
                            <Input
                                type="email"
                                className="h-11"
                                disabled={mutation.isPending}
                                {...taxForm.register('invoiceEmail')}
                            />
                        </ShopChangeField>
                        <div className="sm:col-span-2">
                            <ShopChangeField
                                label="Lý do thay đổi"
                                required
                                error={taxErrors.requestNote?.message}
                            >
                                <Textarea
                                    rows={4}
                                    className="min-h-24 resize-y"
                                    placeholder="Ví dụ: Shop đã cập nhật đăng ký thuế và cần sử dụng thông tin pháp lý mới."
                                    disabled={mutation.isPending}
                                    {...taxForm.register('requestNote')}
                                />
                            </ShopChangeField>
                        </div>
                    </div>
                    <FormActions
                        submitting={mutation.isPending}
                        submitDisabled={!activeFormValid}
                        onCancel={onCancel}
                    />
                </form>
            ) : (
                <form onSubmit={submitPayout}>
                    <div className="grid gap-5 p-5 sm:grid-cols-2 sm:p-7">
                        <ShopChangeField
                            label="Ngân hàng"
                            required
                            error={payoutErrors.bankCode?.message}
                        >
                            <Controller
                                name="bankCode"
                                control={payoutForm.control}
                                render={({ field }) => (
                                    <SellerCombobox
                                        value={field.value}
                                        options={BANK_OPTIONS}
                                        placeholder="Tìm hoặc chọn ngân hàng"
                                        disabled={mutation.isPending}
                                        onValueChange={handleBankChange}
                                    />
                                )}
                            />
                        </ShopChangeField>
                        <ShopChangeField
                            label="Số tài khoản mới"
                            required
                            error={payoutErrors.accountNumber?.message}
                        >
                            <Input
                                inputMode="numeric"
                                className="h-11"
                                placeholder="Nhập lại đầy đủ số tài khoản"
                                disabled={mutation.isPending}
                                {...payoutForm.register('accountNumber')}
                            />
                        </ShopChangeField>
                        <ShopChangeField
                            label="Tên chủ tài khoản"
                            required
                            error={payoutErrors.accountHolderName?.message}
                        >
                            <Input
                                className="h-11"
                                disabled={mutation.isPending}
                                {...payoutForm.register('accountHolderName')}
                            />
                        </ShopChangeField>
                        <ShopChangeField
                            label="Chi nhánh"
                            error={payoutErrors.branch?.message}
                        >
                            <Input
                                className="h-11"
                                placeholder="Không bắt buộc"
                                disabled={mutation.isPending}
                                {...payoutForm.register('branch')}
                            />
                        </ShopChangeField>
                        <div className="sm:col-span-2">
                            <ShopChangeField
                                label="Loại tài khoản"
                                required
                                error={payoutErrors.accountType?.message}
                            >
                                <div className="grid gap-3 sm:grid-cols-2">
                                    {(['personal', 'business'] as const).map(
                                        (accountType) => (
                                            <button
                                                key={accountType}
                                                type="button"
                                                disabled={mutation.isPending}
                                                className={cn(
                                                    'min-h-14 rounded-md border px-4 text-left text-sm transition-colors',
                                                    payoutForm.watch(
                                                        'accountType',
                                                    ) === accountType
                                                        ? 'border-zinc-950 bg-zinc-950 text-white'
                                                        : 'border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50',
                                                )}
                                                onClick={() =>
                                                    payoutForm.setValue(
                                                        'accountType',
                                                        accountType,
                                                        {
                                                            shouldDirty: true,
                                                            shouldValidate: true,
                                                        },
                                                    )
                                                }
                                            >
                                                {accountType === 'personal'
                                                    ? 'Cá nhân / Hộ kinh doanh'
                                                    : 'Doanh nghiệp'}
                                            </button>
                                        ),
                                    )}
                                </div>
                            </ShopChangeField>
                        </div>
                        <div className="sm:col-span-2">
                            <ShopChangeField
                                label="Lý do thay đổi"
                                required
                                error={payoutErrors.requestNote?.message}
                            >
                                <Textarea
                                    rows={4}
                                    className="min-h-24 resize-y"
                                    placeholder="Ví dụ: Shop chuyển sang tài khoản nhận tiền mới để đối soát doanh thu."
                                    disabled={mutation.isPending}
                                    {...payoutForm.register('requestNote')}
                                />
                            </ShopChangeField>
                        </div>
                    </div>
                    <FormActions
                        submitting={mutation.isPending}
                        submitDisabled={!activeFormValid}
                        onCancel={onCancel}
                    />
                </form>
            )}
        </div>
    );
}

interface ChangeAreaButtonProps {
    active: boolean;
    icon: React.ReactNode;
    title: string;
    description: string;
    onClick: () => void;
}

// Hiển thị lựa chọn nhóm thay đổi như segmented cards để mục tiêu request luôn rõ trước khi nhập form.
function ChangeAreaButton({
    active,
    icon,
    title,
    description,
    onClick,
}: ChangeAreaButtonProps) {
    return (
        <button
            type="button"
            className={cn(
                'flex min-h-20 items-start gap-3 rounded-md border p-4 text-left transition-colors',
                active
                    ? 'border-zinc-950 bg-zinc-950 text-white'
                    : 'border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50',
            )}
            onClick={onClick}
        >
            <span className="mt-0.5 shrink-0">{icon}</span>
            <span>
                <span className="block text-sm font-semibold">{title}</span>
                <span
                    className={cn(
                        'mt-1 block text-xs leading-5',
                        active ? 'text-zinc-300' : 'text-zinc-500',
                    )}
                >
                    {description}
                </span>
            </span>
        </button>
    );
}

interface FormActionsProps {
    submitting: boolean;
    submitDisabled: boolean;
    onCancel: () => void;
}

// Dùng chung footer để trạng thái gửi duyệt nhất quán giữa nhóm thuế và payout.
function FormActions({
    submitting,
    submitDisabled,
    onCancel,
}: FormActionsProps) {
    return (
        <footer className="flex flex-col-reverse gap-2 border-t border-zinc-200 bg-zinc-50/70 px-5 py-4 sm:flex-row sm:justify-end sm:px-7">
            <Button
                type="button"
                variant="outline"
                size="lg"
                disabled={submitting}
                onClick={onCancel}
            >
                <X className="size-4" />
                Hủy
            </Button>
            <Button
                type="submit"
                size="lg"
                className="bg-zinc-950 px-5 text-white hover:bg-zinc-800"
                disabled={submitting || submitDisabled}
            >
                {submitting ? (
                    <Loader2 className="size-4 animate-spin" />
                ) : (
                    <Send className="size-4" />
                )}
                {submitting ? 'Đang gửi...' : 'Gửi yêu cầu duyệt'}
            </Button>
        </footer>
    );
}

// Dialog thêm hoặc sửa tài khoản nhận hoàn; validate trước khi ghi dữ liệu nhạy cảm qua Auth Service.
'use client';

import { useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Building2, CreditCard, LoaderCircle, UserRound } from 'lucide-react';
import { Controller, useForm } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { BANK_OPTIONS } from '@/constants/bank-options.constant';
import type { RefundBankAccountProfile } from '@/services/auth';
import { refundBankAccountSchema } from '../schemas/refund-bank-account.schema';
import type {
    RefundBankAccountDialogProps,
    RefundBankAccountFormValues,
} from '../types/refund-bank-account.type';

// Dùng chung form khi tạo mới/chỉnh sửa; chỉ đóng sau khi API xác nhận đã lưu thành công.
export function RefundBankAccountDialog({
    account,
    isOpen,
    isSaving,
    onOpenChange,
    onSave,
}: RefundBankAccountDialogProps) {
    const form = useForm<RefundBankAccountFormValues>({
        resolver: zodResolver(refundBankAccountSchema),
        mode: 'onChange',
        defaultValues: {
            bankCode: '',
            accountHolder: '',
            accountNumber: '',
        },
    });

    // Không cho đóng hộp thoại khi request đang ghi dữ liệu để tránh mất trạng thái đang xử lý.
    function handleOpenChange(nextOpen: boolean): void {
        if (isSaving && !nextOpen) return;
        onOpenChange(nextOpen);
    }

    // Mỗi lần mở, nạp lại bản đã lưu; khi đóng xóa draft số tài khoản khỏi state của form.
    useEffect(() => {
        if (isOpen) {
            form.reset({
                bankCode: account?.bankCode ?? '',
                accountHolder: account?.accountHolder ?? '',
                accountNumber: account?.accountNumber ?? '',
            });
            return;
        }
        form.reset({ bankCode: '', accountHolder: '', accountNumber: '' });
    }, [account, form, isOpen]);

    // Lấy tên ngân hàng chuẩn từ danh mục thay vì tin nhãn do trình duyệt gửi lên.
    async function handleSubmit(
        values: RefundBankAccountFormValues,
    ): Promise<void> {
        const bank = BANK_OPTIONS.find(
            (option) => option.value === values.bankCode,
        );
        if (!bank) {
            form.setError('bankCode', {
                message: 'Vui lòng chọn ngân hàng hợp lệ.',
            });
            return;
        }

        const normalizedHolder = values.accountHolder
            .normalize('NFC')
            .trim()
            .replace(/\s+/gu, ' ')
            .toLocaleUpperCase('vi-VN');
        const payload: RefundBankAccountProfile = {
            bankCode: bank.value,
            bankName: bank.label,
            accountHolder: normalizedHolder,
            accountNumber: values.accountNumber.trim(),
        };

        try {
            await onSave(payload);
            onOpenChange(false);
        } catch {
            // Mutation hiển thị lỗi; giữ form mở và draft để khách không phải nhập lại dữ liệu.
        }
    }

    const errors = form.formState.errors;

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogContent className="gap-0 overflow-hidden p-0 sm:max-w-lg">
                <DialogHeader className="border-b border-zinc-100 px-6 py-5 pr-14">
                    <div className="mb-3 flex size-10 items-center justify-center rounded-xl bg-zinc-100 text-zinc-800">
                        <CreditCard className="size-5" />
                    </div>
                    <DialogTitle className="text-lg font-semibold text-zinc-950">
                        {account
                            ? 'Chỉnh sửa tài khoản nhận hoàn'
                            : 'Thêm tài khoản nhận hoàn'}
                    </DialogTitle>
                    <DialogDescription>
                        Nhập đúng thông tin trên tài khoản ngân hàng để nhận
                        tiền hoàn đơn hàng.
                    </DialogDescription>
                </DialogHeader>

                <form
                    className="space-y-5 px-6 py-5"
                    onSubmit={form.handleSubmit(handleSubmit)}
                >
                    <div className="space-y-2">
                        <Label htmlFor="refund-bank">Ngân hàng</Label>
                        <Controller
                            name="bankCode"
                            control={form.control}
                            render={({ field }) => (
                                <Select
                                    value={field.value || null}
                                    onValueChange={(value) =>
                                        field.onChange(value ?? '')
                                    }
                                    disabled={isSaving}
                                >
                                    <SelectTrigger
                                        id="refund-bank"
                                        aria-invalid={Boolean(errors.bankCode)}
                                        className="h-11 w-full rounded-xl"
                                    >
                                        <SelectValue placeholder="Chọn ngân hàng" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {BANK_OPTIONS.map((bank) => (
                                            <SelectItem
                                                key={bank.value}
                                                value={bank.value}
                                            >
                                                {bank.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                        {errors.bankCode?.message ? (
                            <p className="text-xs text-destructive">
                                {errors.bankCode.message}
                            </p>
                        ) : null}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="refund-account-holder">
                            Tên chủ tài khoản
                        </Label>
                        <div className="relative">
                            <UserRound className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-zinc-400" />
                            <Input
                                id="refund-account-holder"
                                autoComplete="cc-name"
                                maxLength={100}
                                className="h-11 rounded-xl pl-10"
                                aria-invalid={Boolean(errors.accountHolder)}
                                aria-describedby={
                                    errors.accountHolder
                                        ? 'refund-account-holder-error'
                                        : 'refund-account-holder-help'
                                }
                                placeholder="Ví dụ: NGUYEN VAN A"
                                disabled={isSaving}
                                {...form.register('accountHolder')}
                            />
                        </div>
                        {errors.accountHolder?.message ? (
                            <p
                                id="refund-account-holder-error"
                                className="text-xs text-destructive"
                            >
                                {errors.accountHolder.message}
                            </p>
                        ) : (
                            <p
                                id="refund-account-holder-help"
                                className="text-xs text-zinc-500"
                            >
                                Nhập đúng tên ngân hàng hiển thị, không viết
                                tắt. Hệ thống chấp nhận dấu chấm (.), nháy đơn
                                (&apos;) và gạch nối (-) nếu tên có các dấu này.
                            </p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="refund-account-number">
                            Số tài khoản
                        </Label>
                        <div className="relative">
                            <Building2 className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-zinc-400" />
                            <Input
                                id="refund-account-number"
                                autoComplete="off"
                                inputMode="numeric"
                                maxLength={30}
                                className="h-11 rounded-xl pl-10"
                                aria-invalid={Boolean(errors.accountNumber)}
                                aria-describedby={
                                    errors.accountNumber
                                        ? 'refund-account-number-error'
                                        : 'refund-account-number-help'
                                }
                                placeholder="Nhập từ 6 đến 30 chữ số"
                                disabled={isSaving}
                                {...form.register('accountNumber')}
                            />
                        </div>
                        {errors.accountNumber?.message ? (
                            <p
                                id="refund-account-number-error"
                                className="text-xs text-destructive"
                            >
                                {errors.accountNumber.message}
                            </p>
                        ) : (
                            <p
                                id="refund-account-number-help"
                                className="text-xs text-zinc-500"
                            >
                                Chỉ nhập chữ số, giữ cả số 0 ở đầu nếu có.
                            </p>
                        )}
                    </div>

                    <div className="rounded-xl border border-zinc-200 bg-zinc-50 px-3.5 py-3 text-xs leading-5 text-zinc-600">
                        Thông tin này chỉ dùng để hỗ trợ chuyển khoản hoàn tiền
                        cho bạn và có thể cập nhật bất cứ lúc nào.
                    </div>

                    <DialogFooter className="-mx-6 -mb-5 px-6 py-4">
                        <Button
                            type="button"
                            variant="outline"
                            className="h-10 rounded-xl px-4"
                            disabled={isSaving}
                            onClick={() => onOpenChange(false)}
                        >
                            Hủy
                        </Button>
                        <Button
                            type="submit"
                            className="h-10 rounded-xl px-4"
                            disabled={isSaving || !form.formState.isValid}
                        >
                            {isSaving ? (
                                <LoaderCircle className="size-4 animate-spin" />
                            ) : null}
                            {isSaving ? 'Đang lưu...' : 'Lưu tài khoản'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

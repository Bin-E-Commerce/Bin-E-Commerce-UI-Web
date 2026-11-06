// File này quản lý giao diện hủy đơn và thu thập thông tin nhận hoàn khi đơn đã thanh toán.
// Trạng thái đơn và mutation thuộc feature đơn hàng; component chỉ kiểm tra đầu vào và chuyển dữ liệu qua callback.

'use client';

import { useEffect, useState } from 'react';
import {
    Check,
    CreditCard,
    LoaderCircle,
    PencilLine,
    XCircle,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { BANK_OPTIONS } from '@/constants/bank-options.constant';
import { useAppSelector } from '@/store/hooks';
import type { RefundBankAccountProfile } from '@/services/auth';
import type { CancelOrderInput } from '@/services/order/types/cancel-order.types';
import type {
    CancelOrderDialogProps,
    QuickReasonOptionProps,
} from '../types/cancel-order-dialog.types';
import { useSavedRefundBankAccounts } from '../../hooks/useRefundBankAccount';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

// Tên chủ tài khoản chỉ nhận chữ Unicode và khoảng trắng giữa các phần tên.
const REFUND_ACCOUNT_HOLDER_PATTERN =
    /^\p{L}[\p{L}\p{M}]*(?: \p{L}[\p{L}\p{M}]*)*$/u;
const EMPTY_REFUND_BANK_ACCOUNTS: RefundBankAccountProfile[] = [];

// Chuẩn hóa Unicode, gom khoảng trắng và viết hoa trước khi hiển thị/lưu tên.
// Không tự xóa ký tự sai để người dùng thấy lỗi và sửa thay vì gửi nhầm tên khác.
function normalizeRefundAccountHolder(value: string): string {
    return value
        .normalize('NFC')
        .trim()
        .replace(/\s+/gu, ' ')
        .toLocaleUpperCase('vi-VN');
}

// Kiểm tra đúng giới hạn và tập ký tự trước khi cho phép gửi tài khoản hoàn.
function isValidRefundAccountHolder(value: string): boolean {
    const normalized = normalizeRefundAccountHolder(value);
    return (
        normalized.length >= 2 &&
        normalized.length <= 100 &&
        REFUND_ACCOUNT_HOLDER_PATTERN.test(normalized)
    );
}

// Giữ lựa chọn quick reason khi mở sửa; lý do tự nhập được đưa về mục Khác để hiện lại trong textarea.
function getReasonSelection(reason: string | null | undefined): string {
    if (!reason) return '';
    return [
        'Tôi đặt nhầm sản phẩm',
        'Muốn thay đổi thông tin nhận hàng',
        'Muốn đổi phương thức thanh toán',
        'Tìm được sản phẩm tốt hơn',
        'Không còn nhu cầu mua',
    ].includes(reason)
        ? reason
        : 'Khác';
}

// Chọn lựa nhanh giúp Customer hoàn tất lý do hủy bằng một lần chạm trên mobile hoặc desktop.
function QuickReasonOption({
    value,
    selected,
    onSelect,
}: QuickReasonOptionProps) {
    return (
        <Button
            variant="ghost"
            type="button"
            aria-pressed={selected}
            onClick={() => onSelect(value)}
            className={`min-w-0 justify-start whitespace-normal ${selected ? 'border-red-200 bg-red-50/80 text-zinc-950 shadow-sm ring-1 ring-red-100' : 'border-zinc-200 bg-white text-zinc-700 hover:-translate-y-px hover:border-zinc-300 hover:bg-zinc-50 hover:shadow-sm'} flex min-h-12 w-full cursor-pointer items-center gap-3 rounded-2xl border px-3.5 py-2.5 text-left text-sm transition-all`}
        >
            <span
                className={`flex size-5 shrink-0 items-center justify-center rounded-full border transition-colors ${selected ? 'border-red-500 bg-red-500 text-white' : 'border-zinc-300 bg-white text-transparent'}`}
            >
                <Check className="size-3" aria-hidden="true" />
            </span>
            <span className="min-w-0 flex-1 whitespace-normal break-words leading-5">
                {value}
            </span>
        </Button>
    );
}

// Dùng chung form cho gửi yêu cầu và sửa yêu cầu đã hủy; luôn prefill từ snapshot của đơn khi đang sửa.
// Khi tạo mới, dữ liệu hồ sơ chỉ được áp dụng nếu người dùng chưa bắt đầu sửa form; mọi kiểm tra vẫn được backend xác nhận.
export function CancelOrderDialog({
    loading,
    requiresRefundBankAccount,
    mode = 'cancel',
    initialReason,
    initialRefundBankAccount,
    onConfirm,
}: CancelOrderDialogProps) {
    const isEditing = mode === 'edit';
    const [open, setOpen] = useState(false);
    const [selectedReason, setSelectedReason] = useState('');
    const [reason, setReason] = useState('');
    const [reasonTouched, setReasonTouched] = useState(false);
    const [bankCode, setBankCode] = useState('');
    const [accountHolder, setAccountHolder] = useState('');
    const [accountHolderTouched, setAccountHolderTouched] = useState(false);
    const [accountNumber, setAccountNumber] = useState('');
    const [accountEdited, setAccountEdited] = useState(false);
    const [savedBankAccountId, setSavedBankAccountId] = useState('');
    // Ràng buộc query hồ sơ với user hiện tại để tránh dùng nhầm cache sau khi đổi tài khoản.
    const userId = useAppSelector((state) => state.auth.user?.id ?? '');
    const savedBankAccountQuery = useSavedRefundBankAccounts(
        open && requiresRefundBankAccount,
        userId,
    );
    const savedBankAccounts =
        savedBankAccountQuery.data ?? EMPTY_REFUND_BANK_ACCOUNTS;
    const normalizedAccountHolder = normalizeRefundAccountHolder(accountHolder);
    const isAccountHolderValid = isValidRefundAccountHolder(
        normalizedAccountHolder,
    );
    const showAccountHolderError =
        accountHolderTouched && !isAccountHolderValid;
    const showReasonError = reasonTouched && !reason.trim();

    // Dùng mặc định khi form mới tải danh sách trễ; khi sửa, nối ID nếu snapshot đơn khớp một bản lưu sẵn.
    useEffect(() => {
        if (
            !open ||
            !requiresRefundBankAccount ||
            accountEdited ||
            !savedBankAccountQuery.data
        ) {
            return;
        }

        if (isEditing) {
            const matchingAccount = savedBankAccounts.find(
                (account) =>
                    account.bankCode === bankCode &&
                    account.accountHolder === accountHolder &&
                    account.accountNumber === accountNumber,
            );
            setSavedBankAccountId(matchingAccount?.id ?? '');
            return;
        }

        if (!bankCode && !accountHolder && !accountNumber) {
            const defaultAccount =
                savedBankAccounts.find((account) => account.isDefault) ??
                savedBankAccounts[0];
            if (defaultAccount) {
                setSavedBankAccountId(defaultAccount.id);
                setBankCode(defaultAccount.bankCode);
                setAccountHolder(defaultAccount.accountHolder);
                setAccountNumber(defaultAccount.accountNumber);
            }
            return;
        }

        const matchingAccount = savedBankAccounts.find(
            (account) =>
                account.bankCode === bankCode &&
                account.accountHolder === accountHolder &&
                account.accountNumber === accountNumber,
        );
        setSavedBankAccountId(matchingAccount?.id ?? '');
    }, [
        accountEdited,
        accountHolder,
        accountNumber,
        isEditing,
        bankCode,
        open,
        requiresRefundBankAccount,
        savedBankAccounts,
        savedBankAccountQuery.data,
    ]);

    // Xóa form khi đóng để không giữ dữ liệu nhạy cảm ngoài lượt làm việc hiện tại.
    function resetForm() {
        setSelectedReason('');
        setReason('');
        setReasonTouched(false);
        setBankCode('');
        setAccountHolder('');
        setAccountHolderTouched(false);
        setAccountNumber('');
        setAccountEdited(false);
        setSavedBankAccountId('');
    }

    // Chọn lý do có sẵn sẽ điền thẳng vào trường bắt buộc; chọn “Khác” để xóa nội dung và nhập lời giải thích riêng.
    function selectReason(value: string) {
        setSelectedReason(value);
        setReason(value === 'Khác' ? '' : value);
        setReasonTouched(value === 'Khác');
    }

    // Mở form với snapshot của đơn hoặc tài khoản mặc định đã lưu; không giữ ID account từ lần mở trước.
    // Khi đóng, xóa dữ liệu nhạy cảm khỏi state; lúc đang gửi thì bỏ qua thao tác đóng để không mất trạng thái mutation.
    function handleOpenChange(nextOpen: boolean) {
        if (loading && !nextOpen) return;
        if (nextOpen && !open) {
            const startingAccount = isEditing
                ? initialRefundBankAccount
                : (savedBankAccounts.find((account) => account.isDefault) ??
                  savedBankAccounts[0]);
            setSelectedReason(
                isEditing ? getReasonSelection(initialReason) : '',
            );
            setReason(isEditing ? (initialReason ?? '') : '');
            setReasonTouched(false);
            setBankCode(startingAccount?.bankCode ?? '');
            setAccountHolder(startingAccount?.accountHolder ?? '');
            setAccountNumber(startingAccount?.accountNumber ?? '');
            const matchingSavedAccount = savedBankAccounts.find(
                (account) =>
                    account.bankCode === startingAccount?.bankCode &&
                    account.accountHolder === startingAccount?.accountHolder &&
                    account.accountNumber === startingAccount?.accountNumber,
            );
            setSavedBankAccountId(
                isEditing
                    ? (matchingSavedAccount?.id ?? '')
                    : ((startingAccount as RefundBankAccountProfile | undefined)
                          ?.id ?? ''),
            );
            setAccountHolderTouched(false);
            setAccountEdited(false);
        }
        setOpen(nextOpen);
        if (!nextOpen) resetForm();
    }

    // Gửi lý do và tài khoản đã chuẩn hóa; chỉ đóng form sau khi order đã được tạo hoặc cập nhật thành công.
    async function confirm() {
        const normalizedReason = reason.trim();
        // Chặn lý do rỗng hoặc chỉ có khoảng trắng trước khi gọi mutation; API cũng kiểm tra lại ở HTTP boundary.
        if (!normalizedReason) {
            setReasonTouched(true);
            return;
        }
        const selectedBank = BANK_OPTIONS.find(
            (option) => option.value === bankCode,
        );
        const normalizedAccountNumber = accountNumber.trim();
        // Không gửi yêu cầu hủy khi tài khoản nhận hoàn chưa đủ; backend vẫn xác minh trạng thái và dữ liệu lần cuối.
        if (
            requiresRefundBankAccount &&
            (!selectedBank ||
                !isAccountHolderValid ||
                !/^\d{6,30}$/.test(normalizedAccountNumber))
        ) {
            return;
        }
        const input: CancelOrderInput = {
            reason: normalizedReason,
            ...(requiresRefundBankAccount
                ? {
                      refundBankAccount: {
                          bankCode,
                          bankName: selectedBank!.label,
                          accountHolder: normalizedAccountHolder,
                          accountNumber: normalizedAccountNumber,
                      },
                      ...(savedBankAccountId
                          ? { savedRefundBankAccountId: savedBankAccountId }
                          : {}),
                  }
                : {}),
        };
        await onConfirm(input);
        setOpen(false);
        resetForm();
    }

    return (
        <>
            <Button
                variant="outline"
                className="group h-9 cursor-pointer gap-2 rounded-full border-zinc-200 bg-white px-3.5 text-xs font-semibold text-zinc-600 shadow-sm hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                onClick={() => handleOpenChange(true)}
            >
                {isEditing ? (
                    <PencilLine
                        className="size-4 text-current"
                        aria-hidden="true"
                    />
                ) : (
                    <XCircle
                        className="size-4 text-current"
                        aria-hidden="true"
                    />
                )}
                {isEditing ? 'Chỉnh sửa thông tin hủy' : 'Hủy đơn'}
            </Button>
            <Dialog open={open} onOpenChange={handleOpenChange}>
                <DialogContent
                    showCloseButton={false}
                    overlayClassName="bg-black/45 backdrop-blur-sm"
                    className="flex max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-3xl flex-col gap-0 overflow-hidden rounded-2xl border border-zinc-200 bg-white p-0 shadow-xl sm:max-w-3xl"
                >
                    <DialogHeader className="shrink-0 border-b border-zinc-100 bg-gradient-to-br from-red-50/70 via-white to-white px-6 py-6 text-left sm:px-7">
                        <div className="flex items-start gap-3">
                            <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-red-50 text-red-500 ring-1 ring-red-100">
                                <XCircle
                                    className="size-5"
                                    aria-hidden="true"
                                />
                            </div>
                            <div className="pt-0.5">
                                <DialogTitle className="text-lg">
                                    {isEditing
                                        ? 'Cập nhật yêu cầu hủy'
                                        : 'Hủy đơn hàng?'}
                                </DialogTitle>
                                <DialogDescription className="mt-1.5 leading-5">
                                    {isEditing
                                        ? 'Sửa lý do hoặc thông tin nhận hoàn. Thông tin đã lưu sẽ được cập nhật cho yêu cầu này.'
                                        : 'Vui lòng chọn lý do để chúng tôi cải thiện trải nghiệm mua sắm của bạn.'}
                                </DialogDescription>
                            </div>
                        </div>
                    </DialogHeader>

                    <div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-6 py-6 sm:px-7">
                        <div>
                            <p className="mb-3.5 text-sm font-semibold text-zinc-950">
                                Vì sao bạn muốn hủy đơn?{' '}
                                <span
                                    aria-hidden="true"
                                    className="text-red-600"
                                >
                                    *
                                </span>
                            </p>
                            <p className="mb-3.5 text-xs text-zinc-500">
                                Chọn một lý do bên dưới hoặc nhập lý do cụ thể.
                            </p>
                            <div className="grid gap-2 sm:grid-cols-2">
                                <QuickReasonOption
                                    value="Tôi đặt nhầm sản phẩm"
                                    selected={
                                        selectedReason ===
                                        'Tôi đặt nhầm sản phẩm'
                                    }
                                    onSelect={selectReason}
                                />
                                <QuickReasonOption
                                    value="Muốn thay đổi thông tin nhận hàng"
                                    selected={
                                        selectedReason ===
                                        'Muốn thay đổi thông tin nhận hàng'
                                    }
                                    onSelect={selectReason}
                                />
                                <QuickReasonOption
                                    value="Muốn đổi phương thức thanh toán"
                                    selected={
                                        selectedReason ===
                                        'Muốn đổi phương thức thanh toán'
                                    }
                                    onSelect={selectReason}
                                />
                                <QuickReasonOption
                                    value="Tìm được sản phẩm tốt hơn"
                                    selected={
                                        selectedReason ===
                                        'Tìm được sản phẩm tốt hơn'
                                    }
                                    onSelect={selectReason}
                                />
                                <QuickReasonOption
                                    value="Không còn nhu cầu mua"
                                    selected={
                                        selectedReason ===
                                        'Không còn nhu cầu mua'
                                    }
                                    onSelect={selectReason}
                                />
                                <QuickReasonOption
                                    value="Khác"
                                    selected={selectedReason === 'Khác'}
                                    onSelect={selectReason}
                                />
                            </div>
                        </div>

                        <div>
                            <Label
                                htmlFor="cancel-reason"
                                className="text-sm font-semibold text-zinc-950"
                            >
                                Lý do hủy đơn hàng{' '}
                                <span
                                    aria-hidden="true"
                                    className="text-red-600"
                                >
                                    *
                                </span>
                            </Label>
                            <Textarea
                                id="cancel-reason"
                                required
                                aria-required="true"
                                aria-invalid={showReasonError}
                                aria-describedby={
                                    showReasonError
                                        ? 'cancel-reason-error'
                                        : 'cancel-reason-hint'
                                }
                                value={reason}
                                onChange={(event) => {
                                    // Ghi nhận thao tác nhập để báo lỗi ngay khi người dùng xóa hết lý do đã chọn.
                                    setReason(event.target.value.slice(0, 500));
                                    setSelectedReason('Khác');
                                    setReasonTouched(true);
                                }}
                                maxLength={500}
                                placeholder="Nhập lý do hủy đơn hàng"
                                className={`mt-2 min-h-28 resize-none rounded-xl border-zinc-200 bg-white ${showReasonError ? 'border-red-300 focus-visible:ring-red-300/30' : ''}`}
                            />
                            {showReasonError ? (
                                <p
                                    id="cancel-reason-error"
                                    role="alert"
                                    className="mt-1.5 text-xs text-red-600"
                                >
                                    Vui lòng chọn hoặc nhập lý do hủy đơn hàng.
                                </p>
                            ) : (
                                <p
                                    id="cancel-reason-hint"
                                    className="mt-1.5 text-xs text-zinc-500"
                                >
                                    Bắt buộc. Có thể sửa nội dung đã được điền
                                    từ lý do chọn nhanh.
                                </p>
                            )}
                            <div className="mt-1.5 flex items-center justify-between text-xs text-zinc-400">
                                <span>Tối đa 500 ký tự</span>
                                <span>{reason.length}/500</span>
                            </div>
                        </div>

                        {requiresRefundBankAccount ? (
                            <section className="relative overflow-hidden rounded-2xl border border-amber-200/80 bg-gradient-to-br from-amber-50 via-white to-orange-50/60 p-4 shadow-sm ring-1 ring-amber-100/70 sm:p-5">
                                <div
                                    aria-hidden="true"
                                    className="pointer-events-none absolute -right-8 -top-10 size-32 rounded-full bg-amber-100/50 blur-2xl"
                                />
                                <div className="relative flex items-start gap-3">
                                    <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white text-amber-700 shadow-sm ring-1 ring-amber-200/80">
                                        <CreditCard
                                            className="size-5"
                                            aria-hidden="true"
                                        />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <p className="text-sm font-semibold text-zinc-950">
                                                Tài khoản nhận lại tiền
                                            </p>
                                            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-800">
                                                Cần cung cấp
                                            </span>
                                        </div>
                                        <p className="mt-1 text-xs leading-5 text-zinc-600">
                                            Đơn đã thanh toán qua Pay2S. Admin
                                            sẽ dùng thông tin này để chuyển
                                            khoản hoàn tiền sau khi kiểm tra.
                                        </p>
                                    </div>
                                </div>
                                {savedBankAccounts.length > 0 ? (
                                    <p className="relative mt-3 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs leading-5 text-emerald-800">
                                        Chọn tài khoản đã lưu hoặc thêm thông
                                        tin mới. Tài khoản mới sẽ được lưu vào
                                        hồ sơ sau khi gửi yêu cầu thành công.
                                    </p>
                                ) : null}
                                {savedBankAccountQuery.isError ? (
                                    <p className="relative mt-3 rounded-xl border border-amber-200 bg-white px-3 py-2 text-xs leading-5 text-amber-800">
                                        Chưa tải được tài khoản đã lưu; bạn vẫn
                                        có thể nhập thông tin mới.
                                    </p>
                                ) : null}
                                <div className="relative mt-5 grid gap-4">
                                    <div className="grid gap-1.5">
                                        <Label
                                            htmlFor="saved-refund-bank-account"
                                            className="text-xs font-semibold text-zinc-700"
                                        >
                                            Tài khoản đã lưu
                                        </Label>
                                        <Select
                                            value={savedBankAccountId}
                                            onValueChange={(value) => {
                                                if (
                                                    value === '__new_account__'
                                                ) {
                                                    setSavedBankAccountId('');
                                                    setBankCode('');
                                                    setAccountHolder('');
                                                    setAccountNumber('');
                                                    setAccountEdited(true);
                                                    return;
                                                }
                                                const account =
                                                    savedBankAccounts.find(
                                                        (saved) =>
                                                            saved.id === value,
                                                    );
                                                if (!account) return;
                                                setSavedBankAccountId(
                                                    account.id,
                                                );
                                                setBankCode(account.bankCode);
                                                setAccountHolder(
                                                    account.accountHolder,
                                                );
                                                setAccountNumber(
                                                    account.accountNumber,
                                                );
                                                setAccountEdited(false);
                                            }}
                                        >
                                            <SelectTrigger
                                                id="saved-refund-bank-account"
                                                className="h-11 w-full rounded-xl border-zinc-200 bg-white shadow-sm data-[size=default]:h-11"
                                            >
                                                <SelectValue
                                                    placeholder={
                                                        isEditing &&
                                                        initialRefundBankAccount
                                                            ? 'Tài khoản đang dùng trên đơn'
                                                            : 'Chọn tài khoản nhận hoàn'
                                                    }
                                                />
                                            </SelectTrigger>
                                            <SelectContent className="max-h-64">
                                                {savedBankAccounts.map(
                                                    (account) => (
                                                        <SelectItem
                                                            key={account.id}
                                                            value={account.id}
                                                        >
                                                            {account.bankName} ·{' '}
                                                            {
                                                                account.accountHolder
                                                            }{' '}
                                                            ·{' '}
                                                            {account.accountNumber.slice(
                                                                -4,
                                                            )}
                                                            {account.isDefault
                                                                ? ' · Mặc định'
                                                                : ''}
                                                        </SelectItem>
                                                    ),
                                                )}
                                                <SelectItem value="__new_account__">
                                                    Nhập tài khoản khác
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <p className="text-xs leading-5 text-zinc-500">
                                            Chọn để điền nhanh. Nếu đổi thông
                                            tin bên dưới, tài khoản mới sẽ được
                                            lưu riêng sau khi gửi yêu cầu.
                                        </p>
                                    </div>
                                    <div className="grid gap-1.5">
                                        <Label
                                            htmlFor="refund-bank-name"
                                            className="text-xs font-semibold text-zinc-700"
                                        >
                                            Ngân hàng{' '}
                                            <span
                                                aria-hidden="true"
                                                className="text-red-600"
                                            >
                                                *
                                            </span>
                                        </Label>
                                        <Select
                                            value={bankCode}
                                            onValueChange={(value) => {
                                                // Lưu mã ngân hàng chuẩn cùng nhãn để QR admin không phải suy đoán từ chuỗi tự nhập.
                                                setBankCode(value ?? '');
                                                setAccountEdited(true);
                                                setSavedBankAccountId('');
                                            }}
                                        >
                                            <SelectTrigger
                                                id="refund-bank-name"
                                                aria-required="true"
                                                className="h-11 w-full rounded-xl border-zinc-200 bg-white shadow-sm transition-colors focus-visible:border-amber-400 focus-visible:ring-amber-300/30 data-[size=default]:h-11"
                                            >
                                                <SelectValue placeholder="Chọn ngân hàng nhận tiền" />
                                            </SelectTrigger>
                                            <SelectContent className="max-h-64">
                                                {BANK_OPTIONS.map((option) => (
                                                    <SelectItem
                                                        key={option.value}
                                                        value={option.value}
                                                    >
                                                        {option.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="grid gap-1.5">
                                        <Label
                                            htmlFor="refund-account-holder"
                                            className="text-xs font-semibold text-zinc-700"
                                        >
                                            Tên chủ tài khoản{' '}
                                            <span
                                                aria-hidden="true"
                                                className="text-red-600"
                                            >
                                                *
                                            </span>
                                        </Label>
                                        <Input
                                            id="refund-account-holder"
                                            required
                                            aria-invalid={
                                                showAccountHolderError
                                            }
                                            aria-describedby={
                                                showAccountHolderError
                                                    ? 'refund-account-holder-hint refund-account-holder-error'
                                                    : 'refund-account-holder-hint'
                                            }
                                            autoComplete="name"
                                            maxLength={100}
                                            value={accountHolder}
                                            className="h-11 rounded-xl border-zinc-200 bg-white shadow-sm transition-colors placeholder:text-zinc-400 focus-visible:border-amber-400 focus-visible:ring-amber-300/30"
                                            onChange={(event) => {
                                                // Giữ chữ người dùng nhập để báo lỗi thay vì âm thầm xóa ký tự có thể làm sai tên ngân hàng.
                                                setAccountHolder(
                                                    event.target.value.slice(
                                                        0,
                                                        100,
                                                    ),
                                                );
                                                setAccountEdited(true);
                                                setSavedBankAccountId('');
                                            }}
                                            onBlur={(event) => {
                                                // Chuẩn hóa khoảng trắng ở lúc rời trường, sau khi người dùng đã hoàn tất nhập tên.
                                                setAccountHolder(
                                                    normalizeRefundAccountHolder(
                                                        event.target.value,
                                                    ),
                                                );
                                                setAccountHolderTouched(true);
                                            }}
                                            placeholder="Tên in trên tài khoản ngân hàng"
                                        />
                                        <p
                                            id="refund-account-holder-hint"
                                            className="text-xs text-zinc-500"
                                        >
                                            Nhập đúng tên ngân hàng hiển thị; hệ
                                            thống chuẩn hóa chữ hoa và khoảng
                                            trắng.
                                        </p>
                                        {showAccountHolderError ? (
                                            <p
                                                id="refund-account-holder-error"
                                                role="alert"
                                                className="text-xs text-red-600"
                                            >
                                                {normalizedAccountHolder.length <
                                                    2 ||
                                                normalizedAccountHolder.length >
                                                    100
                                                    ? 'Tên chủ tài khoản phải có từ 2 đến 100 ký tự.'
                                                    : 'Chỉ dùng chữ cái và khoảng trắng. Hãy nhập đúng tên ngân hàng hiển thị.'}
                                            </p>
                                        ) : null}
                                    </div>
                                    <div className="grid gap-1.5">
                                        <Label
                                            htmlFor="refund-account-number"
                                            className="text-xs font-semibold text-zinc-700"
                                        >
                                            Số tài khoản{' '}
                                            <span
                                                aria-hidden="true"
                                                className="text-red-600"
                                            >
                                                *
                                            </span>
                                        </Label>
                                        <Input
                                            id="refund-account-number"
                                            required
                                            inputMode="numeric"
                                            autoComplete="off"
                                            maxLength={30}
                                            value={accountNumber}
                                            className="h-11 rounded-xl border-zinc-200 bg-white shadow-sm transition-colors placeholder:text-zinc-400 focus-visible:border-amber-400 focus-visible:ring-amber-300/30"
                                            onChange={(event) => {
                                                // Chuẩn hóa số tài khoản chỉ còn chữ số để chấp nhận thao tác dán có khoảng trắng hoặc dấu phân cách.
                                                setAccountNumber(
                                                    event.target.value
                                                        .replace(/\D/g, '')
                                                        .slice(0, 30),
                                                );
                                                setAccountEdited(true);
                                                setSavedBankAccountId('');
                                            }}
                                            placeholder="Nhập từ 6 đến 30 chữ số"
                                        />
                                    </div>
                                </div>
                            </section>
                        ) : null}
                    </div>

                    <DialogFooter className="mx-0 mb-0 shrink-0 border-t border-zinc-100 bg-zinc-50/50 px-6 py-4 sm:px-7">
                        <Button
                            type="button"
                            variant="outline"
                            disabled={loading}
                            onClick={() => handleOpenChange(false)}
                            className="h-10 cursor-pointer rounded-xl border-zinc-200 bg-white px-4 text-sm shadow-sm"
                        >
                            {isEditing ? 'Đóng' : 'Giữ lại đơn'}
                        </Button>
                        <Button
                            variant={isEditing ? 'default' : 'destructive'}
                            disabled={
                                loading ||
                                !reason.trim() ||
                                (requiresRefundBankAccount &&
                                    (!bankCode ||
                                        !isAccountHolderValid ||
                                        !/^\d{6,30}$/.test(accountNumber)))
                            }
                            onClick={() => void confirm()}
                            className="h-10 cursor-pointer rounded-xl px-4 text-sm shadow-sm"
                        >
                            {loading ? (
                                <>
                                    <LoaderCircle
                                        className="size-4 animate-spin"
                                        aria-hidden="true"
                                    />
                                    {isEditing ? 'Đang lưu...' : 'Đang hủy...'}
                                </>
                            ) : isEditing ? (
                                'Lưu thay đổi'
                            ) : (
                                'Xác nhận hủy đơn'
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

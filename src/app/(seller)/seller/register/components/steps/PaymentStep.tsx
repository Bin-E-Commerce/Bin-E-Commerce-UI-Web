import { BadgeCheck, CalendarDays, Landmark } from 'lucide-react';

import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { BANK_OPTIONS } from '../../constants/seller-register-options.constant';
import type {
    SellerRegisterFieldErrors,
    SellerRegisterFormValues,
} from '../../types/seller-register-form.type';
import { Field } from '../shared/Field';
import { inputClassName } from '../shared/form-control.styles';
import { OptionCard } from '../shared/OptionCard';
import { SellerCombobox } from '../shared/SellerCombobox';

interface PaymentStepProps {
    values: SellerRegisterFormValues['payout'];
    errors: SellerRegisterFieldErrors;
    onChange: (patch: Partial<SellerRegisterFormValues['payout']>) => void;
}

// Bước thanh toán thu thập tài khoản nhận tiền và các lựa chọn đủ rõ để seller hiểu cách đối soát.
export function PaymentStep({ values, errors, onChange }: PaymentStepProps) {
    // Lưu cả code và tên ngân hàng để backend không phải phụ thuộc label FE ở các lần đọc sau.
    const handleBankChange = (bankCode: string) => {
        const selectedBank = BANK_OPTIONS.find((bank) => bank.value === bankCode);
        onChange({
            bankCode,
            bankName: selectedBank?.label ?? '',
        });
    };

    return (
        <div className="grid gap-6 xl:grid-cols-[1fr_280px]">
            <div className="space-y-6">
                <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-5">
                    <div className="flex items-start gap-3">
                        <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-white text-zinc-800 shadow-sm ring-1 ring-zinc-200">
                            <Landmark className="size-5" />
                        </span>
                        <div>
                            <p className="text-sm font-semibold text-zinc-950">
                                Tài khoản nhận thanh toán
                            </p>
                            <p className="mt-1 text-sm leading-6 text-zinc-600">
                                Tiền bán hàng sẽ được chuyển về tài khoản này
                                sau khi đơn hoàn tất và đủ điều kiện đối soát.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                        <Field
                            label="Loại tài khoản"
                            htmlFor="accountType"
                            error={errors['payout.accountType']}
                            required
                        >
                            <div
                                id="accountType"
                                className="grid gap-3 sm:grid-cols-2"
                            >
                                <OptionCard
                                    title="Cá nhân / Hộ kinh doanh"
                                    description="Dùng tài khoản đứng tên người đại diện."
                                    active={values.accountType === 'personal'}
                                    onClick={() =>
                                        onChange({ accountType: 'personal' })
                                    }
                                />
                                <OptionCard
                                    title="Doanh nghiệp"
                                    description="Dùng tài khoản công ty hoặc pháp nhân."
                                    active={values.accountType === 'business'}
                                    onClick={() =>
                                        onChange({ accountType: 'business' })
                                    }
                                />
                            </div>
                        </Field>
                    </div>

                    <Field
                        label="Ngân hàng"
                        htmlFor="bankName"
                        error={errors['payout.bankCode'] ?? errors['payout.bankName']}
                        required
                    >
                        <SellerCombobox
                            id="bankName"
                            value={values.bankCode}
                            options={BANK_OPTIONS}
                            placeholder="Tìm hoặc chọn ngân hàng"
                            onValueChange={handleBankChange}
                        />
                    </Field>
                    <Field
                        label="Số tài khoản"
                        htmlFor="bankAccount"
                        error={errors['payout.accountNumber']}
                        required
                    >
                        <Input
                            id="bankAccount"
                            value={values.accountNumber}
                            className={inputClassName}
                            inputMode="numeric"
                            autoComplete="off"
                            placeholder="Ví dụ: 0123456789"
                            onChange={(event) =>
                                onChange({ accountNumber: event.target.value })
                            }
                        />
                    </Field>
                    <Field
                        label="Tên chủ tài khoản"
                        htmlFor="accountHolder"
                        error={errors['payout.accountHolderName']}
                        required
                    >
                        <Input
                            id="accountHolder"
                            value={values.accountHolderName}
                            className={inputClassName}
                            autoComplete="name"
                            placeholder={
                                values.accountType === 'business'
                                    ? 'Tên công ty / pháp nhân'
                                    : 'Tên đúng như trên giấy tờ'
                            }
                            onChange={(event) =>
                                onChange({
                                    accountHolderName: event.target.value,
                                })
                            }
                        />
                    </Field>
                    <Field
                        label="Chi nhánh / khu vực"
                        htmlFor="bankBranch"
                        error={errors['payout.branch']}
                    >
                        <Input
                            id="bankBranch"
                            value={values.branch}
                            className={inputClassName}
                            placeholder="Không bắt buộc"
                            onChange={(event) =>
                                onChange({ branch: event.target.value })
                            }
                        />
                    </Field>
                </div>
            </div>

            <aside className="space-y-4 rounded-xl border border-zinc-200 bg-white p-5">
                <div className="flex gap-3">
                    <BadgeCheck className="mt-0.5 size-5 shrink-0 text-zinc-800" />
                    <div>
                        <p className="text-sm font-semibold text-zinc-950">
                            Khớp thông tin hồ sơ
                        </p>
                        <p className="mt-1 text-sm leading-6 text-zinc-600">
                            Tên chủ tài khoản nên trùng với thông tin người bán
                            hoặc pháp nhân đã khai.
                        </p>
                    </div>
                </div>

                <Separator />

                <div className="flex gap-3">
                    <CalendarDays className="mt-0.5 size-5 shrink-0 text-zinc-800" />
                    <div>
                        <p className="text-sm font-semibold text-zinc-950">
                            Đối soát định kỳ
                        </p>
                        <p className="mt-1 text-sm leading-6 text-zinc-600">
                            Doanh thu được ghi nhận sau khi đơn hàng hoàn tất,
                            sau đó chuyển theo lịch thanh toán của shop.
                        </p>
                    </div>
                </div>
            </aside>
        </div>
    );
}

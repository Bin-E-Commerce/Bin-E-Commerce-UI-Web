import { FileCheck2 } from 'lucide-react';

import { Input } from '@/components/ui/input';
import type {
    SellerRegisterFieldErrors,
    SellerRegisterFormValues,
} from '../../types/seller-register-form.type';
import { Field } from '../shared/Field';
import { inputClassName } from '../shared/form-control.styles';
import { OptionCard } from '../shared/OptionCard';
import { VerificationUploadCard } from '../shared/VerificationUploadCard';

interface SellerInfoStepProps {
    values: SellerRegisterFormValues['seller'];
    errors: SellerRegisterFieldErrors;
    onChange: (patch: Partial<SellerRegisterFormValues['seller']>) => void;
}

// Bước thông tin người bán tách cá nhân và doanh nghiệp để xác định đúng nhóm giấy tờ cần duyệt.
export function SellerInfoStep({
    values,
    errors,
    onChange,
}: SellerInfoStepProps) {
    const isBusiness = values.profileType === 'business';

    return (
        <div className="space-y-5">
            <div className="grid gap-3 sm:grid-cols-2">
                <OptionCard
                    title="Cá nhân / Hộ kinh doanh"
                    description="Dành cho người bán tự vận hành, dùng CCCD để định danh hồ sơ."
                    active={values.profileType === 'individual'}
                    onClick={() =>
                        onChange({ profileType: 'individual', taxCode: '' })
                    }
                />
                <OptionCard
                    title="Doanh nghiệp"
                    description="Dành cho công ty, thương hiệu hoặc nhà phân phối có mã số thuế."
                    active={values.profileType === 'business'}
                    onClick={() =>
                        onChange({ profileType: 'business', citizenId: '' })
                    }
                />
            </div>

            <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4">
                <p className="text-sm font-semibold text-zinc-950">
                    {isBusiness
                        ? 'Hồ sơ doanh nghiệp cần trùng thông tin đăng ký kinh doanh.'
                        : 'Hồ sơ cá nhân cần trùng thông tin trên CCCD.'}
                </p>
                <p className="mt-1 text-sm leading-6 text-zinc-600">
                    {isBusiness
                        ? 'Vui lòng nhập đúng tên pháp lý, mã số thuế và người đại diện để hồ sơ được xử lý thuận lợi.'
                        : 'Vui lòng nhập đúng họ tên, số CCCD và thông tin liên hệ để hồ sơ được xử lý thuận lợi.'}
                </p>
            </div>

            <div className="grid gap-x-5 gap-y-4 sm:grid-cols-2">
                {isBusiness ? (
                    <Field
                        label="Tên pháp lý doanh nghiệp"
                        htmlFor="legalName"
                        error={errors['seller.legalName']}
                    >
                        <Input
                            id="legalName"
                            value={values.legalName}
                            className={inputClassName}
                            placeholder="Ví dụ: Công ty TNHH Bin Tech"
                            onChange={(event) =>
                                onChange({ legalName: event.target.value })
                            }
                        />
                    </Field>
                ) : (
                    <Field
                        label="Họ và tên trên CCCD"
                        htmlFor="identityName"
                        error={errors['seller.legalName']}
                    >
                        <Input
                            id="identityName"
                            value={values.legalName}
                            className={inputClassName}
                            placeholder="Nhập đúng họ tên trên giấy tờ"
                            onChange={(event) =>
                                onChange({ legalName: event.target.value })
                            }
                        />
                    </Field>
                )}

                {isBusiness ? (
                    <Field
                        label="Mã số thuế"
                        htmlFor="taxCode"
                        error={errors['seller.taxCode']}
                    >
                        <Input
                            id="taxCode"
                            value={values.taxCode}
                            className={inputClassName}
                            placeholder="Nhập mã số thuế doanh nghiệp"
                            onChange={(event) =>
                                onChange({ taxCode: event.target.value })
                            }
                        />
                    </Field>
                ) : (
                    <Field
                        label="Số CCCD"
                        htmlFor="citizenId"
                        error={errors['seller.citizenId']}
                    >
                        <Input
                            id="citizenId"
                            value={values.citizenId}
                            className={inputClassName}
                            placeholder="Nhập số căn cước công dân"
                            onChange={(event) =>
                                onChange({ citizenId: event.target.value })
                            }
                        />
                    </Field>
                )}

                <Field
                    label="Người đại diện vận hành"
                    htmlFor="representativeName"
                    error={errors['seller.representativeName']}
                >
                    <Input
                        id="representativeName"
                        value={values.representativeName}
                        className={inputClassName}
                        placeholder={
                            isBusiness
                                ? 'Nhập người phụ trách shop'
                                : 'Có thể trùng với chủ CCCD'
                        }
                        onChange={(event) =>
                            onChange({ representativeName: event.target.value })
                        }
                    />
                </Field>
                <Field
                    label="Số điện thoại"
                    htmlFor="sellerPhone"
                    error={errors['seller.phone']}
                >
                    <Input
                        id="sellerPhone"
                        value={values.phone}
                        className={inputClassName}
                        placeholder="Nhập số điện thoại"
                        onChange={(event) =>
                            onChange({ phone: event.target.value })
                        }
                    />
                </Field>
                <Field
                    label="Email liên hệ"
                    htmlFor="sellerEmail"
                    error={errors['seller.email']}
                >
                    <Input
                        id="sellerEmail"
                        type="email"
                        value={values.email}
                        className={inputClassName}
                        placeholder="seller@email.com"
                        onChange={(event) =>
                            onChange({ email: event.target.value })
                        }
                    />
                </Field>
                <Field
                    label="Chức vụ / vai trò"
                    htmlFor="representativeRole"
                    error={errors['seller.representativeRole']}
                >
                    <Input
                        id="representativeRole"
                        value={values.representativeRole}
                        className={inputClassName}
                        placeholder={
                            isBusiness
                                ? 'Ví dụ: Chủ sở hữu, giám đốc, quản lý vận hành'
                                : 'Ví dụ: Chủ shop, người vận hành chính'
                        }
                        onChange={(event) =>
                            onChange({ representativeRole: event.target.value })
                        }
                    />
                </Field>
            </div>

            <div className="rounded-xl border border-zinc-200 p-4">
                <div className="flex items-start gap-3">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-zinc-950 text-white">
                        <FileCheck2 className="size-5" />
                    </span>
                    <div>
                        <p className="text-sm font-semibold text-zinc-950">
                            Giấy tờ dùng để đối chiếu
                        </p>
                        <p className="mt-1 text-sm leading-6 text-zinc-600">
                            Tải lên giấy tờ rõ nét, còn hiệu lực và trùng với
                            thông tin bạn đã nhập để rút ngắn thời gian duyệt
                            hồ sơ.
                        </p>
                    </div>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    {isBusiness ? (
                        <>
                            <VerificationUploadCard
                                id="businessLicense"
                                title="Giấy đăng ký kinh doanh"
                                description="Đối chiếu tên pháp lý và mã số thuế."
                            />
                            <VerificationUploadCard
                                id="representativeDocument"
                                title="Giấy tờ người đại diện"
                                description="CCCD hoặc giấy ủy quyền của người vận hành."
                            />
                        </>
                    ) : (
                        <>
                            <VerificationUploadCard
                                id="citizenIdFront"
                                title="CCCD mặt trước"
                                description="Đối chiếu họ tên và số CCCD."
                            />
                            <VerificationUploadCard
                                id="citizenIdBack"
                                title="CCCD mặt sau"
                                description="Bổ sung thông tin kiểm tra hồ sơ cá nhân."
                            />
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

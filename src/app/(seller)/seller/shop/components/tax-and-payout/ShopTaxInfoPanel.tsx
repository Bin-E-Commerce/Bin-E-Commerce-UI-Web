import { Building2, CircleDollarSign, Info, ReceiptText } from 'lucide-react';

import type { ShopProfileDto } from '@/services/seller';
import { formatProfileType } from '../../utils/shop-profile-formatters';
import { ShopProfileDataRow } from '../shared/ShopProfileDataRow';

interface ShopTaxInfoPanelProps {
    profile: ShopProfileDto;
}

// Hiển thị snapshot thuế và tài khoản nhận tiền đã được duyệt, không cho sửa trực tiếp để giữ tính toàn vẹn hồ sơ.
export function ShopTaxInfoPanel({ profile }: ShopTaxInfoPanelProps) {
    const { tax } = profile;

    return (
        <div className="p-5 sm:p-7">
            <div className="flex items-start gap-3 rounded-md border border-zinc-200 bg-zinc-50 p-4">
                <Info className="mt-0.5 size-5 shrink-0 text-zinc-500" />
                <div>
                    <p className="text-sm font-semibold text-zinc-950">
                        Thông tin dùng cho đối soát
                    </p>
                    <p className="mt-1 text-sm leading-6 text-zinc-500">
                        Dữ liệu nhạy cảm được che bớt trên giao diện. Khi cần
                        thay đổi thông tin pháp lý hoặc tài khoản nhận tiền,
                        shop sẽ phải xác minh lại.
                    </p>
                </div>
            </div>

            <div className="mt-7 grid gap-8 lg:grid-cols-2">
                <section>
                    <div className="flex items-center gap-2">
                        <ReceiptText className="size-4 text-zinc-500" />
                        <h2 className="font-semibold text-zinc-950">
                            Hồ sơ thuế
                        </h2>
                    </div>
                    <dl className="mt-3">
                        <ShopProfileDataRow
                            label="Loại hồ sơ"
                            value={formatProfileType(tax.profileType)}
                        />
                        <ShopProfileDataRow
                            label="Tên pháp lý"
                            value={tax.legalName}
                        />
                        <ShopProfileDataRow
                            label="Mã số thuế"
                            value={tax.taxCodeMasked}
                        />
                        <ShopProfileDataRow
                            label="Email nhận thông báo"
                            value={tax.invoiceEmail}
                        />
                    </dl>
                </section>

                <section className="border-t border-zinc-200 pt-7 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
                    <div className="flex items-center gap-2">
                        <CircleDollarSign className="size-4 text-zinc-500" />
                        <h2 className="font-semibold text-zinc-950">
                            Tài khoản nhận thanh toán
                        </h2>
                    </div>
                    <dl className="mt-3">
                        <ShopProfileDataRow
                            label="Loại tài khoản"
                            value={
                                tax.payoutAccountType === 'business'
                                    ? 'Doanh nghiệp'
                                    : 'Cá nhân / Hộ kinh doanh'
                            }
                        />
                        <ShopProfileDataRow
                            label="Ngân hàng"
                            value={tax.payoutBankName}
                        />
                        <ShopProfileDataRow
                            label="Chủ tài khoản"
                            value={tax.payoutAccountHolder}
                        />
                        <ShopProfileDataRow
                            label="Số tài khoản"
                            value={tax.payoutAccountNumberMasked}
                        />
                    </dl>
                </section>
            </div>

            <div className="mt-7 flex items-start gap-3 border-t border-zinc-200 pt-5 text-xs leading-5 text-zinc-500">
                <Building2 className="mt-0.5 size-4 shrink-0" />
                Tên chủ tài khoản nên trùng với cá nhân hoặc pháp nhân trong hồ
                sơ để quá trình đối soát không bị gián đoạn.
            </div>
        </div>
    );
}

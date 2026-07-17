import type { ReactNode } from 'react';
import { CircleAlert, CircleCheck } from 'lucide-react';
import type { SellerApplicationCorrectionTarget } from '@/services/seller';

interface SellerApplicationRejectionNoticeProps {
    reviewNote: string;
    correctionTargets: SellerApplicationCorrectionTarget[];
    changedCorrectionTargets: SellerApplicationCorrectionTarget[];
}

// Hiển thị nguyên nhân hồ sơ bị trả lại ngay trước form để seller biết chính xác phần cần sửa trước khi thao tác.
export function SellerApplicationRejectionNotice({
    reviewNote,
    correctionTargets,
    changedCorrectionTargets,
}: SellerApplicationRejectionNoticeProps) {
    const completedAllCorrections = correctionTargets.every((target) =>
        changedCorrectionTargets.includes(target),
    );

    return (
        <section className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-950">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-white text-red-700 ring-1 ring-red-200">
                <CircleAlert className="size-5" />
            </span>
            <div>
                <h2 className="text-sm font-semibold">Hồ sơ cần được cập nhật</h2>
                <p className="mt-1 whitespace-pre-line text-sm leading-6 text-red-800">
                    {reviewNote}
                </p>
                {correctionTargets.length > 0 ? (
                    <ul className="mt-4 grid gap-2 md:grid-cols-2">
                        {correctionTargets.includes('shop_information') ? (
                            <CorrectionStatus
                                changed={changedCorrectionTargets.includes('shop_information')}
                                description="Kiểm tra lại tên shop, đường dẫn, ngành hàng, mô hình bán và phần mô tả."
                            >
                                Thông tin shop
                            </CorrectionStatus>
                        ) : null}
                        {correctionTargets.includes('shop_logo') ? (
                            <CorrectionStatus
                                changed={changedCorrectionTargets.includes('shop_logo')}
                                description="Tải logo vuông, rõ nét, không bị vỡ và không chứa thông tin liên hệ bên ngoài."
                            >
                                Logo shop
                            </CorrectionStatus>
                        ) : null}
                        {correctionTargets.includes('seller_identity') ? (
                            <CorrectionStatus
                                changed={changedCorrectionTargets.includes('seller_identity')}
                                description="Đối chiếu họ tên pháp lý, số CCCD hoặc mã số thuế, người đại diện và thông tin liên hệ."
                            >
                                Thông tin định danh
                            </CorrectionStatus>
                        ) : null}
                        {correctionTargets.includes('verification_documents') ? (
                            <CorrectionStatus
                                changed={changedCorrectionTargets.includes('verification_documents')}
                                description="Tải lại đầy đủ ảnh mặt trước, mặt sau CCCD hoặc giấy phép kinh doanh; ảnh phải rõ và đủ bốn góc."
                            >
                                Giấy tờ xác minh
                            </CorrectionStatus>
                        ) : null}
                        {correctionTargets.includes('pickup_address') ? (
                            <CorrectionStatus
                                changed={changedCorrectionTargets.includes('pickup_address')}
                                description="Kiểm tra người phụ trách, số điện thoại, tỉnh thành, phường xã và địa chỉ lấy hàng chi tiết."
                            >
                                Địa chỉ lấy hàng
                            </CorrectionStatus>
                        ) : null}
                        {correctionTargets.includes('payout_information') ? (
                            <CorrectionStatus
                                changed={changedCorrectionTargets.includes('payout_information')}
                                description="Kiểm tra ngân hàng, số tài khoản, tên chủ tài khoản, loại tài khoản và chi nhánh."
                            >
                                Thông tin thanh toán
                            </CorrectionStatus>
                        ) : null}
                    </ul>
                ) : null}
                <p className="mt-3 text-xs font-medium leading-5 text-red-700">
                    {completedAllCorrections
                        ? 'Bạn đã cập nhật đủ các nhóm được yêu cầu. Hãy kiểm tra lại hồ sơ trước khi gửi.'
                        : 'Tất cả nhóm được yêu cầu phải chuyển sang trạng thái “Đã cập nhật” trước khi gửi lại hồ sơ.'}
                </p>
            </div>
        </section>
    );
}

interface CorrectionStatusProps {
    changed: boolean;
    children: ReactNode;
    description: string;
}

// Badge chuyển sang trạng thái đã sửa ngay khi target có field dirty, giúp seller biết còn thiếu nhóm nào trước khi đến bước xác nhận.
function CorrectionStatus({
    changed,
    children,
    description,
}: CorrectionStatusProps) {
    return (
        <li
            className={
                changed
                    ? 'rounded-lg border border-zinc-950 bg-zinc-950 p-3 text-white'
                    : 'rounded-lg border border-red-200 bg-white p-3 text-red-950'
            }
        >
            <div className="flex items-center justify-between gap-3">
                <span className="flex items-center gap-1.5 text-sm font-semibold">
                    {changed ? <CircleCheck className="size-4" /> : null}
                    {children}
                </span>
                <span
                    className={
                        changed
                            ? 'shrink-0 text-[11px] font-medium text-zinc-300'
                            : 'shrink-0 text-[11px] font-medium text-red-600'
                    }
                >
                    {changed ? 'Đã cập nhật' : 'Chưa cập nhật'}
                </span>
            </div>
            <p
                className={
                    changed
                        ? 'mt-1.5 text-xs leading-5 text-zinc-300'
                        : 'mt-1.5 text-xs leading-5 text-red-700'
                }
            >
                {description}
            </p>
        </li>
    );
}

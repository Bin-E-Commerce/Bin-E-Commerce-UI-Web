import type { ReactNode } from 'react';
import { CircleAlert, CircleCheck } from 'lucide-react';

import type { SellerApplicationCorrectionTarget } from '@/services/seller';
import {
    getCorrectionTargetsForStep,
    type VerificationDocumentReplacementProgress,
} from '../../utils/seller-correction-progress';

interface SellerStepCorrectionGuidanceProps {
    currentStep: number;
    correctionTargets: SellerApplicationCorrectionTarget[];
    changedCorrectionTargets: SellerApplicationCorrectionTarget[];
    verificationDocumentProgress: VerificationDocumentReplacementProgress;
    reviewNote: string | null;
}

// Hiển thị yêu cầu ngay trong đúng bước form để seller biết chính xác nhóm field nào cần thao tác.
export function SellerStepCorrectionGuidance({
    currentStep,
    correctionTargets,
    changedCorrectionTargets,
    verificationDocumentProgress,
    reviewNote,
}: SellerStepCorrectionGuidanceProps) {
    const targets = getCorrectionTargetsForStep(correctionTargets, currentStep);
    if (targets.length === 0) return null;

    const completed = targets.every((target) =>
        changedCorrectionTargets.includes(target),
    );

    return (
        <section
            className={
                completed
                    ? 'rounded-xl border border-zinc-300 bg-zinc-50 p-4'
                    : 'rounded-xl border border-red-200 bg-red-50 p-4'
            }
        >
            <div className="flex items-start gap-3">
                <span
                    className={
                        completed
                            ? 'flex size-9 shrink-0 items-center justify-center rounded-lg bg-zinc-950 text-white'
                            : 'flex size-9 shrink-0 items-center justify-center rounded-lg bg-white text-red-700 ring-1 ring-red-200'
                    }
                >
                    {completed ? (
                        <CircleCheck className="size-5" />
                    ) : (
                        <CircleAlert className="size-5" />
                    )}
                </span>
                <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                        <h3 className="text-sm font-semibold text-zinc-950">
                            Nội dung cần chỉnh tại bước này
                        </h3>
                        <span
                            className={
                                completed
                                    ? 'text-xs font-medium text-zinc-700'
                                    : 'text-xs font-medium text-red-700'
                            }
                        >
                            {completed ? 'Đã cập nhật' : 'Cần cập nhật'}
                        </span>
                    </div>
                    {reviewNote ? (
                        <div className="mt-3 rounded-lg border border-red-200 bg-white px-3 py-2.5">
                            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-red-700">
                                Ghi chú từ bộ phận duyệt
                            </p>
                            <p className="mt-1 text-sm leading-6 text-zinc-800">
                                {reviewNote}
                            </p>
                        </div>
                    ) : null}
                    <div className="mt-3 space-y-3">
                        {targets.includes('shop_information') ? (
                            <CorrectionInstruction
                                changed={changedCorrectionTargets.includes('shop_information')}
                                title="Thông tin shop"
                            >
                                Chỉnh ít nhất một thông tin chưa chính xác trong tên shop, đường dẫn, ngành hàng, mô hình bán hoặc mô tả.
                            </CorrectionInstruction>
                        ) : null}
                        {targets.includes('shop_logo') ? (
                            <CorrectionInstruction
                                changed={changedCorrectionTargets.includes('shop_logo')}
                                title="Logo shop"
                            >
                                Chọn và tải lại logo vuông, rõ nét, không bị vỡ hoặc chứa thông tin liên hệ ngoài nền tảng.
                            </CorrectionInstruction>
                        ) : null}
                        {targets.includes('seller_identity') ? (
                            <CorrectionInstruction
                                changed={changedCorrectionTargets.includes('seller_identity')}
                                title="Thông tin định danh"
                            >
                                Đối chiếu và chỉnh lại họ tên pháp lý, số CCCD hoặc mã số thuế, người đại diện, số điện thoại và email theo giấy tờ.
                            </CorrectionInstruction>
                        ) : null}
                        {targets.includes('verification_documents') ? (
                            <CorrectionInstruction
                                changed={changedCorrectionTargets.includes('verification_documents')}
                                title={`Giấy tờ xác minh (${verificationDocumentProgress.replaced}/${verificationDocumentProgress.required})`}
                            >
                                {verificationDocumentProgress.complete
                                    ? 'Đã tải thành công đầy đủ giấy tờ mới. Bạn có thể tiếp tục kiểm tra các yêu cầu còn lại.'
                                    : `Cần tải lại đủ ${verificationDocumentProgress.required} ảnh bắt buộc. Ảnh chỉ được tính sau khi upload thành công, phải rõ chữ và đủ bốn góc.`}
                            </CorrectionInstruction>
                        ) : null}
                        {targets.includes('pickup_address') ? (
                            <CorrectionInstruction
                                changed={changedCorrectionTargets.includes('pickup_address')}
                                title="Địa chỉ lấy hàng"
                            >
                                Chỉnh người phụ trách, số điện thoại, tỉnh thành, phường xã hoặc địa chỉ chi tiết để đơn vị vận chuyển có thể lấy hàng.
                            </CorrectionInstruction>
                        ) : null}
                        {targets.includes('payout_information') ? (
                            <CorrectionInstruction
                                changed={changedCorrectionTargets.includes('payout_information')}
                                title="Thông tin thanh toán"
                            >
                                Chỉnh ngân hàng, số tài khoản, tên chủ tài khoản, loại tài khoản hoặc chi nhánh để khớp hồ sơ người bán.
                            </CorrectionInstruction>
                        ) : null}
                    </div>
                </div>
            </div>
        </section>
    );
}

interface CorrectionInstructionProps {
    changed: boolean;
    title: string;
    children: ReactNode;
}

// Mỗi instruction có trạng thái riêng vì một bước có thể đồng thời bị yêu cầu sửa định danh và giấy tờ.
function CorrectionInstruction({
    changed,
    title,
    children,
}: CorrectionInstructionProps) {
    return (
        <div className="grid gap-1 sm:grid-cols-[160px_minmax(0,1fr)]">
            <p className="flex items-center gap-1.5 text-sm font-semibold text-zinc-950">
                {changed ? <CircleCheck className="size-4" /> : null}
                {title}
            </p>
            <p className="text-sm leading-6 text-zinc-700">{children}</p>
        </div>
    );
}

import { ReviewBlock } from '../shared/ReviewBlock';
import type { SellerRegisterFieldErrors } from '../../types/seller-register-form.type';

interface ReviewStepProps {
    acceptedTerms: boolean;
    errors: SellerRegisterFieldErrors;
    onAcceptedTermsChange: (acceptedTerms: boolean) => void;
}

// Bước xác nhận cho người bán đọc lại các nhóm thông tin chính trước khi gửi duyệt.
export function ReviewStep({
    acceptedTerms,
    errors,
    onAcceptedTermsChange,
}: ReviewStepProps) {
    return (
        <div className="space-y-5">
            <div className="grid gap-4 lg:grid-cols-2">
                <ReviewBlock
                    title="Thông tin shop"
                    items={[
                        'Tên shop và slug đã sẵn sàng',
                        'Đã chọn ngành hàng chính',
                        'Logo shop đã được tải lên',
                    ]}
                />
                <ReviewBlock
                    title="Người bán"
                    items={[
                        'Loại seller đã chọn đúng',
                        'Thông tin liên hệ cần xác minh',
                        'Giấy tờ định danh sẽ được kiểm tra khi duyệt hồ sơ',
                    ]}
                />
                <ReviewBlock
                    title="Vận hành"
                    items={[
                        'Có địa chỉ lấy hàng mặc định',
                        'Có người phụ trách kho',
                        'Sẵn sàng nhận đơn đầu tiên',
                    ]}
                />
                <ReviewBlock
                    title="Tài chính"
                    items={[
                        'Có tài khoản nhận thanh toán',
                        'Đối soát sau khi đơn hoàn tất',
                        'Có thể cập nhật sau khi duyệt',
                    ]}
                />
            </div>

            <div className="space-y-2">
                <label className="flex items-start gap-3 rounded-xl border border-zinc-200 bg-white p-4 text-sm text-zinc-700">
                    <input
                        type="checkbox"
                        checked={acceptedTerms}
                        className="mt-1 size-4 accent-zinc-950"
                        onChange={(event) =>
                            onAcceptedTermsChange(event.target.checked)
                        }
                    />
                    <span>
                        Tôi xác nhận thông tin đã cung cấp là chính xác và đồng
                        ý với điều khoản dành cho người bán trên Bin E-Commerce.
                    </span>
                </label>
                {errors.acceptedTerms ? (
                    <p className="px-1 text-xs text-red-600">
                        {errors.acceptedTerms}
                    </p>
                ) : null}
            </div>
        </div>
    );
}

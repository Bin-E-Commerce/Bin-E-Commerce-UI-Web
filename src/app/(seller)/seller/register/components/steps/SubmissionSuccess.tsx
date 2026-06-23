import { CheckCircle2 } from 'lucide-react';

// Màn hình xác nhận sau submit giúp người dùng biết hồ sơ đã được nhận và email đang được gửi qua notification-service.
export function SubmissionSuccess() {
    return (
        <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-6 text-center">
            <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-zinc-950 text-white">
                <CheckCircle2 className="size-7" />
            </span>
            <h3 className="mt-4 text-xl font-semibold text-zinc-950">
                Hồ sơ đã được gửi
            </h3>
            <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-zinc-600">
                Bin đã nhận hồ sơ đăng ký người bán của bạn. Chúng tôi sẽ gửi
                email xác nhận và thông báo tiếp khi hồ sơ được duyệt hoặc cần
                bổ sung thông tin.
            </p>
        </div>
    );
}


// Phần mở đầu AI Image Optimization; giải thích bài toán seller gặp phải và flow tổng quát trước khi đi vào kiến trúc chi tiết.
import {
    Check,
    Eye,
    ImagePlus,
    LockKeyhole,
    ShieldCheck,
    Sparkles,
    Star,
} from 'lucide-react';

// Tạo một bước timeline gọn; mỗi bước trả lời rõ ai xử lý, kiểm tra gì và kết quả chuyển sang chặng kế tiếp.
function GeneralFlowStep({
    number,
    title,
    description,
    icon: Icon,
    last = false,
}: {
    number: string;
    title: string;
    description: string;
    icon: typeof Check;
    last?: boolean;
}) {
    return (
        <li className="relative flex gap-3">
            {!last ? (
                <span
                    aria-hidden="true"
                    className="absolute left-3.5 top-8 h-[calc(100%+0.5rem)] w-px bg-zinc-200"
                />
            ) : null}
            <span className="relative z-10 grid size-7 shrink-0 place-items-center rounded-lg border border-zinc-200 bg-white text-zinc-700">
                <Icon aria-hidden="true" className="size-3.5" />
            </span>
            <div className="min-w-0 flex-1 pb-3">
                <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                    <span className="font-mono text-[10px] text-zinc-500">
                        {number}
                    </span>
                    <h3 className="text-sm font-semibold text-zinc-950">
                        {title}
                    </h3>
                </div>
                <p className="mt-1 text-xs leading-5 text-zinc-600">
                    {description}
                </p>
            </div>
        </li>
    );
}

// Giải thích lý do cần chức năng trước, sau đó cho thấy AI tạo ảnh nhanh nhưng quyền quyết định vẫn thuộc về seller.
export function AiOptimizationRequestOverview() {
    return (
        <section
            id="ai-optimization-request-overview"
            tabIndex={-1}
            className="scroll-mt-24 rounded-[1.5rem] border border-zinc-200 bg-white p-4 shadow-[0_16px_48px_-40px_rgba(24,24,27,0.45)] outline-none focus-visible:ring-2 focus-visible:ring-zinc-300 sm:p-5"
        >
            <div className="grid gap-5 lg:grid-cols-[minmax(0,0.78fr)_minmax(360px,1.22fr)] lg:gap-8">
                <div className="flex h-full min-w-0 flex-col justify-center">
                    <p className="text-center font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500">
                        Vì sao cần chức năng này?
                    </p>
                    <h2 className="mt-2.5 text-center text-xl font-semibold leading-tight tracking-tight text-zinc-950 sm:text-2xl">
                        Biến ảnh sản phẩm thành hình ảnh bán hàng chuyên nghiệp
                        bằng AI
                    </h2>
                    <p className="mt-2.5 text-center text-sm leading-6 text-zinc-600">
                        Tạo ảnh nền trắng hoặc lifestyle đẹp, rõ và phù hợp hơn;
                        seller chọn bản tốt nhất để khách dễ hình dung sản phẩm.
                    </p>

                    <div className="mt-4 rounded-xl border border-zinc-200 bg-zinc-50 p-3">
                        <div className="flex flex-col items-center gap-1">
                            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-500">
                                AI làm gì?
                            </p>
                            <span className="font-mono text-[10px] text-zinc-400">
                                3 bước
                            </span>
                        </div>
                        <div className="mt-2.5 flex flex-wrap items-center justify-center gap-1.5 text-[11px] text-zinc-600">
                            <span className="rounded-lg border border-zinc-200 bg-white px-2.5 py-1.5">
                                Ảnh sản phẩm
                            </span>
                            <span aria-hidden="true" className="text-zinc-400">
                                →
                            </span>
                            <span className="rounded-lg border border-zinc-200 bg-white px-2.5 py-1.5">
                                AI tối ưu
                            </span>
                            <span aria-hidden="true" className="text-zinc-400">
                                →
                            </span>
                            <span className="rounded-lg border border-zinc-300 bg-white px-2.5 py-1.5 font-medium text-zinc-950">
                                Seller duyệt
                            </span>
                        </div>
                    </div>

                    <dl className="mt-3 grid gap-2 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
                        <div className="flex flex-col items-center gap-1.5 rounded-xl border border-zinc-200 bg-white p-2.5 text-center">
                            <Star
                                aria-hidden="true"
                                className="size-4 shrink-0 text-zinc-700"
                            />
                            <dt className="text-xs font-semibold text-zinc-950">
                                Nổi bật hơn
                            </dt>
                        </div>
                        <div className="flex flex-col items-center gap-1.5 rounded-xl border border-zinc-200 bg-white p-2.5 text-center">
                            <Eye
                                aria-hidden="true"
                                className="size-4 shrink-0 text-zinc-700"
                            />
                            <dt className="text-xs font-semibold text-zinc-950">
                                Dễ hình dung
                            </dt>
                        </div>
                        <div className="flex flex-col items-center gap-1.5 rounded-xl border border-zinc-200 bg-white p-2.5 text-center">
                            <ShieldCheck
                                aria-hidden="true"
                                className="size-4 shrink-0 text-zinc-700"
                            />
                            <dt className="text-xs font-semibold text-zinc-950">
                                Seller duyệt
                            </dt>
                        </div>
                    </dl>
                </div>

                <div className="min-w-0 rounded-xl border border-zinc-200 bg-white p-3.5 sm:p-4">
                    <header className="flex items-end justify-between gap-3 border-b border-zinc-100 pb-3">
                        <div>
                            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500">
                                Luồng tổng quát
                            </p>
                            <h2 className="mt-1 text-base font-semibold tracking-tight text-zinc-950">
                                Từ ảnh nguồn đến ảnh sẵn sàng dùng
                            </h2>
                        </div>
                        <span className="shrink-0 rounded-full border border-zinc-200 bg-zinc-50 px-2.5 py-1 font-mono text-[10px] text-zinc-500">
                            5 chặng
                        </span>
                    </header>
                    <ol className="mt-4">
                        <GeneralFlowStep
                            number="01"
                            title="Chọn ảnh nguồn"
                            icon={ImagePlus}
                            description="Seller chọn sản phẩm, ảnh gốc, kiểu nền trắng hoặc lifestyle và gửi yêu cầu."
                        />
                        <GeneralFlowStep
                            number="02"
                            title="Xác minh trước khi tạo"
                            icon={LockKeyhole}
                            description="Backend kiểm tra seller, quyền thao tác, ảnh nguồn và phiên bản hiện tại."
                        />
                        <GeneralFlowStep
                            number="03"
                            title="Tạo ảnh ở nền"
                            icon={Sparkles}
                            description="Job được lưu để worker xử lý; màn hình seller không phải chờ provider AI."
                        />
                        <GeneralFlowStep
                            number="04"
                            title="Seller xem và chọn"
                            icon={Eye}
                            description="Output được trả về để xem trước, so sánh và quyết định có sử dụng hay không."
                        />
                        <GeneralFlowStep
                            number="05"
                            title="Xác nhận hoặc quay lại"
                            icon={Check}
                            last
                            description="Ảnh chỉ được sử dụng sau khi kiểm tra lần cuối; seller vẫn có thể từ chối hoặc khôi phục."
                        />
                    </ol>
                    <div className="mt-1 flex items-start gap-2 border-t border-zinc-100 pt-3 text-xs leading-5 text-zinc-600">
                        <ShieldCheck
                            aria-hidden="true"
                            className="mt-0.5 size-4 shrink-0 text-zinc-700"
                        />
                        <p>
                            <span className="font-semibold text-zinc-950">
                                Điểm kiểm soát:
                            </span>{' '}
                            AI chỉ tạo đề xuất; seller là người quyết định ảnh
                            nào được sử dụng.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}

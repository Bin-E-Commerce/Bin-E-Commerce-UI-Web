// Trình bày phần mở đầu Recommendation theo một request thực tế.
// Component chỉ sở hữu bố cục giải thích, không gọi API hoặc quản lý trạng thái.
import {
    Activity,
    ArrowRight,
    Boxes,
    ListOrdered,
    PackageCheck,
    UserRound,
} from 'lucide-react';

// Giúp người đọc nắm thứ tự xử lý và vòng cập nhật hành vi trước khi đi vào tài liệu chi tiết.
export function RecommendationRequestOverview() {
    return (
        <section
            id="recommendation-request-overview"
            tabIndex={-1}
            className="scroll-mt-24 overflow-hidden rounded-3xl border border-zinc-200 bg-white p-4 shadow-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-zinc-500 sm:p-6 lg:p-7"
        >
            <div className="grid gap-5 lg:grid-cols-[minmax(0,0.76fr)_minmax(0,1.24fr)] lg:items-center lg:gap-7">
                <div>
                    <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-500">
                        <span
                            aria-hidden="true"
                            className="h-px w-5 bg-zinc-400"
                        />
                        Trước khi sản phẩm được gợi ý
                    </p>
                    <h2 className="mt-3 text-2xl font-semibold tracking-tight text-zinc-950 sm:text-2xl">
                        Một gợi ý tốt bắt đầu từ ngữ cảnh.
                    </h2>
                    <p className="mt-3 max-w-lg text-sm leading-6 text-zinc-700">
                        Không chỉ hỏi “sản phẩm nào bán chạy?” — hệ thống còn
                        kết nối người mua quan tâm gì, đang xem gì và sản phẩm
                        nào liên quan. Từ đó, danh sách được xếp theo từng ngữ
                        cảnh; mỗi tương tác lại góp dữ liệu cho lần gợi ý tiếp
                        theo.
                    </p>
                    <p className="mt-3 rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-xs leading-5 text-zinc-700">
                        <span className="font-semibold text-zinc-900">
                            Chưa có lịch sử?
                        </span>{' '}
                        Hệ thống vẫn thử nguồn candidate dự phòng và xếp hạng
                        bằng Standard.
                    </p>
                </div>

                <div
                    role="list"
                    className="grid grid-cols-2 gap-2 xl:grid-cols-[minmax(0,1fr)_0.65rem_minmax(0,1fr)_0.65rem_minmax(0,1fr)_0.65rem_minmax(0,1fr)] xl:gap-1"
                >
                    <div
                        role="listitem"
                        className="flex min-h-28 flex-col rounded-2xl border border-zinc-200 bg-white p-3"
                    >
                        <span className="mb-2.5 grid size-8 place-items-center rounded-xl border border-zinc-200 bg-white text-zinc-800">
                            <UserRound aria-hidden="true" className="size-4" />
                        </span>
                        <h3 className="text-sm font-semibold text-zinc-950">
                            Ngữ cảnh
                        </h3>
                        <p className="mt-1 text-xs leading-5 text-zinc-600">
                            Sở thích, phiên truy cập và sản phẩm đang xem
                        </p>
                    </div>
                    <ArrowRight
                        aria-hidden="true"
                        className="hidden size-3.5 self-center text-zinc-400 xl:block"
                    />
                    <div
                        role="listitem"
                        className="flex min-h-28 flex-col rounded-2xl border border-zinc-200 bg-white p-3"
                    >
                        <span className="mb-2.5 grid size-8 place-items-center rounded-xl border border-zinc-200 bg-white text-zinc-800">
                            <Boxes aria-hidden="true" className="size-4" />
                        </span>
                        <h3 className="text-sm font-semibold text-zinc-950">
                            Ứng viên
                        </h3>
                        <p className="mt-1 text-xs leading-5 text-zinc-600">
                            Tìm từ hồ sơ, xu hướng, nội dung tương đồng và hành
                            vi.
                        </p>
                    </div>
                    <ArrowRight
                        aria-hidden="true"
                        className="hidden size-3.5 self-center text-zinc-400 xl:block"
                    />
                    <div
                        role="listitem"
                        className="flex min-h-28 flex-col rounded-2xl border border-zinc-200 bg-white p-3"
                    >
                        <span className="mb-2.5 grid size-8 place-items-center rounded-xl border border-zinc-200 bg-white text-zinc-800">
                            <ListOrdered
                                aria-hidden="true"
                                className="size-4"
                            />
                        </span>
                        <h3 className="text-sm font-semibold text-zinc-950">
                            Xếp hạng
                        </h3>
                        <p className="mt-1 text-xs leading-5 text-zinc-600">
                            Standard chấm theo trọng số; AI-Enhanced kết hợp dự
                            đoán ML.
                        </p>
                    </div>
                    <ArrowRight
                        aria-hidden="true"
                        className="hidden size-3.5 self-center text-zinc-400 xl:block"
                    />
                    <div
                        role="listitem"
                        className="flex min-h-28 flex-col rounded-2xl border border-zinc-300 bg-white p-3"
                    >
                        <span className="mb-2.5 grid size-8 place-items-center rounded-xl border border-zinc-900 bg-zinc-900 text-white">
                            <PackageCheck
                                aria-hidden="true"
                                className="size-4"
                            />
                        </span>
                        <h3 className="text-sm font-semibold text-zinc-950">
                            Kết quả
                        </h3>
                        <p className="mt-1 text-xs leading-5 text-zinc-600">
                            Sản phẩm phù hợp, thứ hạng và lý do gợi ý
                        </p>
                    </div>
                </div>
            </div>

            <div className="mt-4 flex items-start gap-3 border-t border-zinc-200 pt-3.5">
                <span className="grid size-8 shrink-0 place-items-center rounded-xl border border-zinc-200 bg-white text-zinc-800">
                    <Activity aria-hidden="true" className="size-4" />
                </span>
                <div className="min-w-0 flex-1">
                    <p className="text-xs leading-5 text-zinc-600 sm:text-sm">
                        <span className="font-semibold text-zinc-900">
                            Kết quả mở đầu cho lần gợi ý tiếp theo.
                        </span>{' '}
                        Impression và click đi qua Kafka để cập nhật hồ sơ,
                        không chặn request hiện tại.
                    </p>
                    <p className="mt-1 text-xs leading-5 text-zinc-500 sm:text-sm">
                        Đọc tiếp: mở{' '}
                        <span className="font-semibold text-zinc-900">
                            Kiến trúc hệ thống
                        </span>{' '}
                        bên dưới để xem service nào đứng sau từng bước.
                    </p>
                </div>
            </div>
        </section>
    );
}

// Giải thích cách hồ sơ và phiên truy cập được dùng để tìm candidate theo sản phẩm, danh mục và thương hiệu.
// Component chỉ trình bày luồng truy xuất hiện có; không đọc profile, gọi catalog hay xếp hạng sản phẩm.

import { ArrowRight } from 'lucide-react';
import { RecommendationDisclosure } from '../shared/RecommendationDisclosure';

// Trình bày tuần tự ngữ cảnh, chuẩn hóa, truy vấn song song và bàn giao candidate cho ranking.
export function CatalogAffinityFlow() {
    return (
        <RecommendationDisclosure
            id="recommendation-affinity-flow-title"
            number="2.1.3.1"
            title="Tìm từ sản phẩm, danh mục và thương hiệu đã quan tâm"
            description="Dùng khi đã có tín hiệu sở thích: bắt đầu từ thứ người mua từng chọn, rồi mở rộng vừa đủ để không chỉ trả lại đúng những món cũ."
            level={5}
            variant="flow"
        >
            <div className="space-y-3">
                <section aria-label="Ngữ cảnh đầu vào">
                    <article className="rounded-xl border border-zinc-200 bg-white p-4">
                        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 pb-3">
                            <div className="flex items-center gap-3">
                                <span className="flex size-11 shrink-0 flex-col items-center justify-center rounded-xl border border-zinc-200 bg-white leading-none">
                                    <span className="text-[8px] font-medium uppercase tracking-wide text-zinc-500">
                                        Bước
                                    </span>
                                    <span className="mt-1 font-mono text-sm font-semibold text-zinc-900">
                                        01
                                    </span>
                                </span>
                                <div>
                                    <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
                                        Ngữ cảnh đầu vào
                                    </p>
                                    <h5 className="mt-1 text-sm font-semibold text-zinc-950">
                                        Hồ sơ dài hạn + phiên hiện tại
                                    </h5>
                                </div>
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                                <span className="rounded-full border border-zinc-200 bg-white px-2 py-1 font-mono text-[9px] text-zinc-600">
                                    Profile · PostgreSQL
                                </span>
                                <span className="rounded-full border border-zinc-200 bg-white px-2 py-1 font-mono text-[9px] text-zinc-600">
                                    Session · Redis
                                </span>
                            </div>
                        </header>
                        <div className="grid gap-3 pt-3 sm:grid-cols-3 sm:divide-x sm:divide-zinc-100">
                            <div className="sm:pr-3">
                                <p className="text-[10px] font-semibold text-zinc-800">
                                    Hồ sơ
                                </p>
                                <p className="mt-1 text-[11px] leading-4 text-zinc-600">
                                    Tối đa 30 sản phẩm, 12 danh mục và 12 thương
                                    hiệu có preference dương.
                                </p>
                            </div>
                            <div className="sm:px-3">
                                <p className="text-[10px] font-semibold text-zinc-800">
                                    Phiên
                                </p>
                                <p className="mt-1 text-[11px] leading-4 text-zinc-600">
                                    Bổ sung danh mục và thương hiệu vừa xem để
                                    phản ánh ý định mới.
                                </p>
                            </div>
                            <div className="sm:pl-3">
                                <p className="text-[10px] font-semibold text-zinc-800">
                                    Loại trừ
                                </p>
                                <p className="mt-1 text-[11px] leading-4 text-zinc-600">
                                    Sản phẩm đang mở và tối đa 3 sản phẩm tương
                                    tác gần nhất.
                                </p>
                            </div>
                        </div>
                    </article>
                </section>

                <div aria-hidden="true" className="flex justify-center py-0.5">
                    <ArrowRight className="size-4 rotate-90 text-zinc-400" />
                </div>

                <section aria-label="Chuẩn hóa ngữ cảnh">
                    <article className="rounded-xl border border-zinc-200 bg-white p-4">
                        <header className="flex items-center gap-3 border-b border-zinc-100 pb-3">
                            <span className="flex size-11 shrink-0 flex-col items-center justify-center rounded-xl border border-zinc-200 bg-white leading-none">
                                <span className="text-[8px] font-medium uppercase tracking-wide text-zinc-500">
                                    Bước
                                </span>
                                <span className="mt-1 font-mono text-sm font-semibold text-zinc-900">
                                    02
                                </span>
                            </span>
                            <div>
                                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
                                    Chuẩn hóa trước khi truy vấn
                                </p>
                                <h5 className="mt-0.5 text-sm font-semibold text-zinc-950">
                                    Gộp ngữ cảnh, giữ đúng ý định
                                </h5>
                            </div>
                        </header>
                        <ol className="grid gap-x-6 gap-y-2 pt-3 sm:grid-cols-2">
                            <li className="text-[11px] leading-4 text-zinc-600">
                                <strong className="font-semibold text-zinc-800">
                                    Đọc đúng hồ sơ:
                                </strong>{' '}
                                theo user đã xác thực hoặc session khách.
                            </li>
                            <li className="text-[11px] leading-4 text-zinc-600">
                                <strong className="font-semibold text-zinc-800">
                                    Tạo ứng viên:
                                </strong>{' '}
                                chỉ dùng preference có điểm dương.
                            </li>
                            <li className="text-[11px] leading-4 text-zinc-600">
                                <strong className="font-semibold text-zinc-800">
                                    Gộp phiên:
                                </strong>{' '}
                                hợp nhất ID danh mục/thương hiệu từ Redis rồi
                                khử trùng.
                            </li>
                            <li className="text-[11px] leading-4 text-zinc-600">
                                <strong className="font-semibold text-zinc-800">
                                    Giữ điểm âm:
                                </strong>{' '}
                                không tạo ứng viên; ranking áp penalty sau.
                            </li>
                        </ol>
                    </article>
                </section>

                <div aria-hidden="true" className="flex justify-center py-0.5">
                    <ArrowRight className="size-4 rotate-90 text-zinc-400" />
                </div>

                <section
                    aria-label="Ba truy vấn catalog song song"
                    className="rounded-xl border border-zinc-200 bg-white p-4"
                >
                    <header className="mb-3 flex items-center gap-3 border-b border-zinc-100 pb-3">
                        <span className="flex size-11 shrink-0 flex-col items-center justify-center rounded-xl border border-zinc-200 bg-white leading-none">
                            <span className="text-[8px] font-medium uppercase tracking-wide text-zinc-500">
                                Bước
                            </span>
                            <span className="mt-1 font-mono text-sm font-semibold text-zinc-900">
                                03
                            </span>
                        </span>
                        <div>
                            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
                                Ba nhánh truy vấn chạy song song
                            </p>
                            <p className="mt-1 text-xs text-zinc-600">
                                Mỗi nhánh tìm candidate theo một loại tín hiệu;
                                các giới hạn dưới đây được áp dụng riêng cho
                                từng nhánh.
                            </p>
                        </div>
                    </header>
                    <div>
                        <div className="grid gap-3 lg:grid-cols-3">
                            <article className="flex h-full flex-col rounded-xl border border-zinc-200 bg-white p-4">
                                <div className="flex items-center justify-between gap-2">
                                    <p className="font-mono text-[10px] font-semibold tracking-[0.08em] text-zinc-500">
                                        PRODUCT_AFFINITY
                                    </p>
                                    <span className="rounded-full border border-zinc-200 px-2 py-0.5 text-[9px] font-medium text-zinc-600">
                                        Tối đa 30
                                    </span>
                                </div>
                                <h6 className="mt-2 text-sm font-semibold text-zinc-950">
                                    Khớp đúng sản phẩm
                                </h6>
                                <p className="mt-1.5 flex-1 text-xs leading-5 text-zinc-600">
                                    Tra product ID có preference dương, giữ thứ
                                    tự sở thích; chỉ trả món đang hoạt động và
                                    còn hàng.
                                </p>
                                <p className="mt-3 border-t border-zinc-100 pt-2.5 text-[11px] leading-4 text-zinc-500">
                                    <strong className="font-semibold text-zinc-700">
                                        Đổi lại:
                                    </strong>{' '}
                                    sát sở thích đã biết, nhưng không tự tìm món
                                    mới nếu profile thiếu ID phù hợp.
                                </p>
                            </article>
                            <article className="flex h-full flex-col rounded-xl border border-zinc-200 bg-white p-4">
                                <div className="flex items-center justify-between gap-2">
                                    <p className="font-mono text-[10px] font-semibold tracking-[0.08em] text-zinc-500">
                                        CATEGORY_AFFINITY
                                    </p>
                                    <span className="rounded-full border border-zinc-200 px-2 py-0.5 text-[9px] font-medium text-zinc-600">
                                        Tối đa 100
                                    </span>
                                </div>
                                <h6 className="mt-2 text-sm font-semibold text-zinc-950">
                                    Mở rộng trong cùng danh mục
                                </h6>
                                <p className="mt-1.5 flex-1 text-xs leading-5 text-zinc-600">
                                    Ghép danh mục hồ sơ với danh mục vừa xem; ưu
                                    tiên món còn hàng có tổng đã bán cao.
                                </p>
                                <p className="mt-3 border-t border-zinc-100 pt-2.5 text-[11px] leading-4 text-zinc-500">
                                    <strong className="font-semibold text-zinc-700">
                                        Đổi lại:
                                    </strong>{' '}
                                    tăng độ phủ, nhưng cùng danh mục chưa chắc
                                    cùng ý định cụ thể.
                                </p>
                            </article>
                            <article className="flex h-full flex-col rounded-xl border border-zinc-200 bg-white p-4">
                                <div className="flex items-center justify-between gap-2">
                                    <p className="font-mono text-[10px] font-semibold tracking-[0.08em] text-zinc-500">
                                        BRAND_AFFINITY
                                    </p>
                                    <span className="rounded-full border border-zinc-200 px-2 py-0.5 text-[9px] font-medium text-zinc-600">
                                        Tối đa 80
                                    </span>
                                </div>
                                <h6 className="mt-2 text-sm font-semibold text-zinc-950">
                                    Giữ thương hiệu quen thuộc
                                </h6>
                                <p className="mt-1.5 flex-1 text-xs leading-5 text-zinc-600">
                                    Ghép thương hiệu hồ sơ với thương hiệu vừa
                                    xem; ưu tiên món còn hàng có tổng đã bán
                                    cao.
                                </p>
                                <p className="mt-3 border-t border-zinc-100 pt-2.5 text-[11px] leading-4 text-zinc-500">
                                    <strong className="font-semibold text-zinc-700">
                                        Đổi lại:
                                    </strong>{' '}
                                    hợp với người trung thành thương hiệu, nhưng
                                    có thể làm lựa chọn kém đa dạng.
                                </p>
                            </article>
                        </div>
                    </div>
                </section>

                <div aria-hidden="true" className="flex justify-center py-0.5">
                    <ArrowRight className="size-4 rotate-90 text-zinc-400" />
                </div>

                <section
                    aria-label="Hợp nhất candidate và ranking"
                    className="space-y-3"
                >
                    <article className="rounded-xl border border-zinc-200 bg-white p-4">
                        <header className="flex items-center gap-3 border-b border-zinc-100 pb-3">
                            <span className="flex size-11 shrink-0 flex-col items-center justify-center rounded-xl border border-zinc-200 bg-white leading-none">
                                <span className="text-[8px] font-medium uppercase tracking-wide text-zinc-500">
                                    Bước
                                </span>
                                <span className="mt-1 font-mono text-sm font-semibold text-zinc-900">
                                    04
                                </span>
                            </span>
                            <div>
                                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
                                    Hợp nhất kết quả
                                </p>
                                <h5 className="mt-1 text-sm font-semibold text-zinc-950">
                                    Candidate Union
                                </h5>
                            </div>
                        </header>
                        <p className="mt-1.5 text-xs leading-5 text-zinc-600">
                            Ba danh sách candidate có thể trùng nhau. Hợp nhất
                            khử trùng theo{' '}
                            <code className="font-mono text-[10px]">
                                productId
                            </code>
                            , đồng thời giữ lại nguồn đã tìm thấy từng món.
                        </p>
                    </article>

                    <div
                        aria-hidden="true"
                        className="flex justify-center py-0.5"
                    >
                        <ArrowRight className="size-4 rotate-90 text-zinc-400" />
                    </div>

                    <article className="rounded-xl border border-zinc-200 bg-white p-4">
                        <header className="flex items-center gap-3 border-b border-zinc-100 pb-3">
                            <span className="flex size-11 shrink-0 flex-col items-center justify-center rounded-xl border border-zinc-200 bg-white leading-none">
                                <span className="text-[8px] font-medium uppercase tracking-wide text-zinc-500">
                                    Bước
                                </span>
                                <span className="mt-1 font-mono text-sm font-semibold text-zinc-900">
                                    05
                                </span>
                            </span>
                            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
                                Ranking quyết định thứ tự
                            </p>
                        </header>
                        <p className="mt-1.5 text-xs leading-5 text-zinc-700">
                            Feature hồ sơ được tính từ preference đã suy giảm
                            theo thời gian và chuẩn hóa về 0–1:
                        </p>
                        <p className="mt-2 rounded-lg bg-zinc-50 px-3 py-2 font-mono text-xs text-zinc-800">
                            profileAffinity = clamp(P + 0,6C + 0,4B)
                        </p>
                        <p className="mt-2 text-xs leading-5 text-zinc-600">
                            P/C/B lần lượt là điểm sản phẩm/danh mục/thương
                            hiệu. Trọng số Standard mặc định là 25%, có thể thay
                            theo policy.
                        </p>
                    </article>
                </section>
            </div>
        </RecommendationDisclosure>
    );
}

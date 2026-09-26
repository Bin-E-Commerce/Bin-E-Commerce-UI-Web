// Giải thích cách Recommendation chọn nguồn nền khi hồ sơ/phiên chưa đủ dữ liệu cá nhân hóa.
// Component mô tả truy vấn catalog và giới hạn hiện tại; không tự tạo candidate hoặc quyết định thứ hạng.

import { ArrowRight, TrendingUp } from 'lucide-react';
import { RecommendationDisclosure } from '../shared/RecommendationDisclosure';
import { RecommendationStepHeader } from '../shared/RecommendationStepHeader';

// Phân biệt nguồn trending luôn chạy với ba nguồn chỉ được bổ sung khi request ở chiến lược cold-start.
export function ColdStartFlow() {
    return (
        <RecommendationDisclosure
            id="recommendation-cold-start-flow-title"
            number="2.1.3.2"
            title="Vẫn tạo được danh sách khi chưa biết khách thích gì"
            description="Dùng nguồn thị trường làm nền cho khách mới; khi đã có hồ sơ hoặc tín hiệu trong phiên, chỉ giữ trending để không thay thế cá nhân hóa bằng danh sách đại trà."
            level={5}
            variant="flow"
        >
            <div className="space-y-3">
                <section
                    className="rounded-xl border border-zinc-200 bg-white p-3"
                    aria-label="Cách chọn chiến lược gợi ý"
                >
                    <RecommendationStepHeader
                        number="01"
                        eyebrow="Chọn theo dữ liệu thực sự có"
                        title="Strategy quyết định có cần mở rộng bằng nguồn cold-start hay không"
                        description="Không có điểm đủ lớn thì hệ thống không tự bịa ra sở thích."
                        asideContent={
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200 bg-zinc-50 px-2.5 py-1 font-mono text-[10px] font-medium text-zinc-600">
                                <TrendingUp
                                    aria-hidden="true"
                                    className="size-3.5"
                                />
                                Trending luôn chạy
                            </span>
                        }
                        titleLevel={5}
                    />
                    <div className="mt-2 grid gap-2 md:grid-cols-3">
                        <article className="rounded-lg border border-zinc-200 bg-white p-2.5">
                            <p className="font-mono text-[10px] font-semibold text-zinc-500">
                                PERSONALIZED
                            </p>
                            <p className="mt-1 text-xs font-semibold text-zinc-900">
                                Có preference dương trong hồ sơ
                            </p>
                            <p className="mt-1 text-[11px] leading-4 text-zinc-600">
                                Dùng affinity cá nhân và các nguồn mở rộng;
                                trending vẫn bổ sung góc nhìn thị trường.
                            </p>
                        </article>
                        <article className="rounded-lg border border-zinc-200 bg-white p-2.5">
                            <p className="font-mono text-[10px] font-semibold text-zinc-500">
                                SESSION_BASED
                            </p>
                            <p className="mt-1 text-xs font-semibold text-zinc-900">
                                Chưa có hồ sơ dương, nhưng có context phiên
                            </p>
                            <p className="mt-1 text-[11px] leading-4 text-zinc-600">
                                Dựa vào danh mục/thương hiệu vừa xem; không thêm
                                cả bộ best-selling, newest và explore.
                            </p>
                        </article>
                        <article className="rounded-lg border border-zinc-300 bg-white p-2.5">
                            <p className="font-mono text-[10px] font-semibold text-zinc-700">
                                COLD_START
                            </p>
                            <p className="mt-1 text-xs font-semibold text-zinc-900">
                                Chưa có hồ sơ hay context phiên
                            </p>
                            <p className="mt-1 text-[11px] leading-4 text-zinc-600">
                                Bổ sung ba nguồn catalog ổn định để request đầu
                                tiên vẫn có lựa chọn.
                            </p>
                        </article>
                    </div>
                </section>

                <div aria-hidden="true" className="flex justify-center py-0.5">
                    <ArrowRight className="size-4 rotate-90 text-zinc-400" />
                </div>

                <section
                    className="rounded-xl border border-zinc-200 bg-white p-3"
                    aria-label="Bốn nguồn thị trường và cold-start"
                >
                    <RecommendationStepHeader
                        number="02"
                        eyebrow="Truy vấn catalog song song"
                        title="Một nguồn xu hướng chung, ba nguồn chỉ mở khi cold-start"
                        description="Tất cả chỉ lấy sản phẩm đang hoạt động, còn hàng và không nằm trong danh sách loại trừ."
                        titleLevel={5}
                    />
                    <div className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
                        <article className="rounded-xl border border-zinc-200 bg-white p-3">
                            <div className="flex items-center justify-between gap-2">
                                <p className="font-mono text-[10px] font-semibold text-zinc-600">
                                    TRENDING
                                </p>
                                <span className="rounded-full bg-white px-2 py-0.5 text-[9px] font-medium text-zinc-500">
                                    mọi strategy
                                </span>
                            </div>
                            <h6 className="mt-1.5 text-xs font-semibold text-zinc-950">
                                Bắt nhịp nhu cầu gần đây
                            </h6>
                            <p className="mt-1.5 text-[11px] leading-5 text-zinc-600">
                                Tối đa 80 món, xếp theo tổng hợp hành vi:{' '}
                                <code className="font-mono text-[10px]">
                                    0,1×view hôm nay + 0,5×click hôm nay +
                                    2×add-to-cart 7 ngày + 3×purchase 30 ngày
                                </code>
                                .
                            </p>
                            <p className="mt-2 border-t border-zinc-200 pt-2 text-[10px] leading-4 text-zinc-500">
                                Nếu thiếu aggregate gần đây, code dùng legacy
                                popularity; hòa điểm thì ưu tiên total_sold rồi
                                productId. Vẫn là xu hướng chung, không phải sở
                                thích riêng.
                            </p>
                        </article>
                        <article className="rounded-xl border border-zinc-200 bg-white p-3">
                            <p className="font-mono text-[10px] font-semibold text-zinc-500">
                                BEST_SELLING · COLD_START
                            </p>
                            <h6 className="mt-1.5 text-xs font-semibold text-zinc-950">
                                Lấy món có tổng đã bán cao
                            </h6>
                            <p className="mt-1.5 text-[11px] leading-5 text-zinc-600">
                                Tối đa 80 món, sắp theo{' '}
                                <code className="font-mono text-[10px]">
                                    total_sold
                                </code>{' '}
                                giảm dần; tạo mốc khởi đầu đáng tin khi chưa có
                                hành vi cá nhân.
                            </p>
                            <p className="mt-2 border-t border-zinc-100 pt-2 text-[10px] leading-4 text-zinc-500">
                                Có thể nghiêng về món lâu năm, chưa chắc đang
                                tăng nhu cầu.
                            </p>
                        </article>
                        <article className="rounded-xl border border-zinc-200 bg-white p-3">
                            <p className="font-mono text-[10px] font-semibold text-zinc-500">
                                NEWEST · COLD_START
                            </p>
                            <h6 className="mt-1.5 text-xs font-semibold text-zinc-950">
                                Dành chỗ cho mặt hàng mới
                            </h6>
                            <p className="mt-1.5 text-[11px] leading-5 text-zinc-600">
                                Tối đa 80 món, sắp theo{' '}
                                <code className="font-mono text-[10px]">
                                    created_at
                                </code>{' '}
                                mới nhất; không đợi sản phẩm tích lũy view hay
                                đơn bán.
                            </p>
                            <p className="mt-2 border-t border-zinc-100 pt-2 text-[10px] leading-4 text-zinc-500">
                                Đổi lại, hàng mới chưa có đủ dữ liệu để xác nhận
                                chất lượng.
                            </p>
                        </article>
                        <article className="rounded-xl border border-zinc-200 bg-white p-3">
                            <p className="font-mono text-[10px] font-semibold text-zinc-500">
                                EXPLORE · COLD_START
                            </p>
                            <h6 className="mt-1.5 text-xs font-semibold text-zinc-950">
                                Giữ một lối khám phá ổn định
                            </h6>
                            <p className="mt-1.5 text-[11px] leading-5 text-zinc-600">
                                Tối đa 60 món theo{' '}
                                <code className="font-mono text-[10px]">
                                    productId
                                </code>{' '}
                                tăng dần; cùng request sẽ không đổi ngẫu nhiên
                                vì thứ tự nguồn.
                            </p>
                            <p className="mt-2 border-t border-zinc-100 pt-2 text-[10px] leading-4 text-zinc-500">
                                Ổn định và đa dạng, nhưng thứ tự này không biểu
                                thị độ phù hợp.
                            </p>
                        </article>
                    </div>
                </section>

                <div aria-hidden="true" className="flex justify-center py-0.5">
                    <ArrowRight className="size-4 rotate-90 text-zinc-400" />
                </div>

                <section
                    className="rounded-xl border border-zinc-200 bg-white p-3"
                    aria-label="Đầu ra và đánh đổi của nguồn dự phòng"
                >
                    <RecommendationStepHeader
                        number="03"
                        eyebrow="Hợp nhất và bàn giao"
                        title="Candidate Union xử lý kết quả trước ranking"
                        titleLevel={5}
                    />
                    <div className="mt-3 grid gap-2 lg:grid-cols-2">
                        <article className="rounded-lg border border-zinc-200 bg-white p-3">
                            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-zinc-500">
                                Đầu ra & xử lý lỗi
                            </p>
                            <p className="mt-1.5 text-xs leading-5 text-zinc-700">
                                Mỗi nguồn trả về một list riêng, không trả vị
                                trí cuối. Nguồn chạy song song; nếu một truy vấn
                                lỗi, nguồn khác vẫn được giữ. Candidate Union
                                gộp trùng và giới hạn toàn pool ở 300 trước
                                ranking.
                            </p>
                        </article>
                        <article className="rounded-lg border border-zinc-200 bg-white p-3">
                            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-zinc-500">
                                Đánh đổi & cách cải thiện
                            </p>
                            <p className="mt-1.5 text-xs leading-5 text-zinc-700">
                                Nguồn thị trường giúp tránh danh sách rỗng nhưng
                                có thể quá đại trà; bestseller nhìn về tổng bán,
                                newest ưu tiên độ mới, explore ưu tiên tính ổn
                                định. Các mức 80/80/60/80 là giới hạn hiện tại,
                                cần đánh giá coverage, latency và hiệu quả
                                ranking trên toàn bộ traffic trước khi tinh
                                chỉnh.
                            </p>
                        </article>
                    </div>
                </section>
            </div>
        </RecommendationDisclosure>
    );
}

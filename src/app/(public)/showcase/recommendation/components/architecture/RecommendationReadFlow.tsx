// Sơ đồ luồng đọc Recommendation từ request Web đến response có attribution, phản ánh đúng các nhánh cache và ranking.
// Component chỉ trình bày pipeline; không gọi service, tính điểm hay mô phỏng trạng thái dữ liệu runtime.
import { ArrowDown } from 'lucide-react';
import type { ReactNode } from 'react';
import { RecommendationCandidatePipeline } from './RecommendationCandidatePipeline';
import { RecommendationRankingLogicLink } from '../ranking/RecommendationRankingLogicLink';
import { RecommendationStepHeader } from '../shared/RecommendationStepHeader';

// Dùng chung một khung và header cho các chặng để số thứ tự, tiêu đề và màu sắc luôn thẳng hàng.
function RecommendationReadStepCard({
    step,
    title,
    children,
    ariaLabel,
}: {
    step: string;
    title: string;
    children: ReactNode;
    ariaLabel?: string;
}) {
    return (
        <article
            aria-label={ariaLabel}
            className="h-full min-w-0 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm shadow-zinc-950/[0.03]"
        >
            <RecommendationStepHeader
                number={step}
                title={title}
                className="px-4 py-3"
            />
            <div className="p-4">{children}</div>
        </article>
    );
}

// Trình bày đường phục vụ đồng bộ bằng các chặng cùng khuôn; cache hit trả kết quả, còn cache miss mới đi tiếp pipeline.
export function RecommendationReadFlow() {
    return (
        <section className="min-w-0">
            <ol
                className="grid gap-3 lg:grid-cols-3"
                aria-label="Request đi vào Recommendation"
            >
                <li className="min-w-0">
                    <RecommendationReadStepCard
                        step="01"
                        title="Web Storefront"
                    >
                        <p className="text-xs leading-5 text-zinc-600">
                            Chọn vị trí hiển thị, trang và số sản phẩm cần lấy.
                            Trang chi tiết gửi thêm <code>productId</code> làm
                            sản phẩm mốc.
                        </p>
                    </RecommendationReadStepCard>
                </li>
                <li className="min-w-0">
                    <RecommendationReadStepCard step="02" title="API Gateway">
                        <p className="text-xs leading-5 text-zinc-600">
                            Chuyển tiếp{' '}
                            <code>
                                GET /api/v1/recommendation/recommendations
                            </code>{' '}
                            cùng user đã xác thực hoặc session khách; Web không
                            tự truy vấn catalog hay xếp hạng sản phẩm.
                        </p>
                    </RecommendationReadStepCard>
                </li>
                <li className="min-w-0">
                    <RecommendationReadStepCard
                        step="03"
                        title="Recommendation API"
                    >
                        <p className="text-xs leading-5 text-zinc-600">
                            Kiểm tra surface, định dạng ID và phân trang. Mỗi
                            trang tối đa 24 sản phẩm; khách chỉ xem trang đầu,
                            trang chi tiết tối đa 6.
                        </p>
                    </RecommendationReadStepCard>
                </li>
            </ol>

            <div
                className="flex flex-col items-center py-4 text-zinc-400"
                aria-hidden="true"
            >
                <span className="h-3 w-px bg-zinc-300" />
                <ArrowDown className="size-4" />
            </div>

            <RecommendationReadStepCard
                step="04"
                title="Redis · kiểm tra cache"
                ariaLabel="Bước 04: Redis kiểm tra cache"
            >
                <div className="space-y-4">
                    <div className="grid gap-3 sm:grid-cols-2">
                        <article className="overflow-hidden rounded-xl border border-zinc-200 bg-white">
                            <header className="border-b border-zinc-200 bg-zinc-50/70 px-4 py-3">
                                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-zinc-500">
                                    Mục đích
                                </p>
                                <h5 className="mt-1 text-xs font-semibold leading-5 text-zinc-950">
                                    Giảm thời gian chờ và xử lý lặp
                                </h5>
                            </header>
                            <p className="p-4 text-xs leading-5 text-zinc-600">
                                Nếu kết quả còn dùng được, service bỏ qua việc
                                đọc hồ sơ/phiên, gom sản phẩm tiềm năng và chạy
                                xếp hạng/ML. Nhờ đó giảm thời gian chờ và tải
                                lặp lên các nguồn dữ liệu, nhất là ở trang có
                                nhiều request cùng ngữ cảnh.
                            </p>
                        </article>

                        <article className="overflow-hidden rounded-xl border border-zinc-200 bg-white">
                            <header className="border-b border-zinc-200 bg-zinc-50/70 px-4 py-3">
                                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-zinc-500">
                                    Dữ liệu được lưu
                                </p>
                                <h5 className="mt-1 text-xs font-semibold leading-5 text-zinc-950">
                                    Response đã chọn sản phẩm và xếp hạng
                                </h5>
                            </header>
                            <p className="p-4 text-xs leading-5 text-zinc-600">
                                Redis lưu response của đúng trang: sản phẩm, thứ
                                hạng, điểm, nguồn/lý do và metadata. Khi cache
                                miss, kết quả được dựng từ hồ sơ/catalog trong
                                PostgreSQL, hành vi gần đây trong session và
                                candidate từ xu hướng, quan hệ hoặc Qdrant khi
                                có dữ liệu phù hợp. Redis chỉ giữ bản kết quả
                                tạm, không thay dữ liệu gốc.
                            </p>
                        </article>

                        <article className="overflow-hidden rounded-xl border border-zinc-200 bg-white">
                            <header className="border-b border-zinc-200 bg-zinc-50/70 px-4 py-3">
                                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-zinc-500">
                                    Điều kiện cache hit
                                </p>
                                <h5 className="mt-1 text-xs font-semibold leading-5 text-zinc-950">
                                    Đúng người dùng, đúng lượt xem
                                </h5>
                            </header>
                            <p className="p-4 text-xs leading-5 text-zinc-600">
                                Key phải khớp người dùng/phiên khách, vị trí,
                                sản phẩm mốc, trang, phiên bản luật xếp hạng/thử
                                nghiệm và version cache; kết quả cũng phải còn
                                hạn. TTL mặc định 5 phút, cấu hình từ 30 giây
                                đến 1 giờ. Mỗi lượt hit vẫn có requestId và item
                                token mới.
                            </p>
                        </article>

                        <article className="overflow-hidden rounded-xl border border-zinc-200 bg-white">
                            <header className="border-b border-zinc-200 bg-zinc-50/70 px-4 py-3">
                                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-zinc-500">
                                    Đánh đổi & kiểm soát
                                </p>
                                <h5 className="mt-1 text-xs font-semibold leading-5 text-zinc-950">
                                    Nhanh hơn, nhưng kết quả là snapshot tạm
                                    thời
                                </h5>
                            </header>
                            <p className="p-4 text-xs leading-5 text-zinc-600">
                                Hành vi mới có thể cần chờ Kafka cập nhật hồ sơ.
                                Khi cập nhật xong, phiên bản cache của người đó
                                tăng để request kế tiếp bỏ qua snapshot cũ;
                                catalog đổi cũng tăng phiên bản cache chung. Nếu
                                Redis lỗi, hệ thống chạy lại pipeline từ
                                PostgreSQL nhưng thiếu ngữ cảnh phiên, nên phản
                                hồi có thể chậm và kém cá nhân hóa hơn. TTL giới
                                hạn thời gian lưu snapshot.
                            </p>
                        </article>
                    </div>

                    <div className="grid gap-2 text-xs sm:grid-cols-2">
                        <p className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 leading-5 text-zinc-600">
                            <span className="font-semibold text-zinc-950">
                                HIT
                            </span>{' '}
                            · response đã xếp hạng + requestId/token mới
                        </p>
                        <p className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 leading-5 text-zinc-600">
                            <span className="font-semibold text-zinc-950">
                                MISS
                            </span>{' '}
                            · dựng ngữ cảnh → tìm ứng viên → xếp hạng → lưu
                            cache
                        </p>
                    </div>
                </div>
            </RecommendationReadStepCard>

            <div
                className="flex flex-col items-center py-4 text-zinc-400"
                aria-hidden="true"
            >
                <span className="h-3 w-px bg-zinc-300" />
                <ArrowDown className="size-4" />
                <span className="mt-1 text-[10px] font-medium text-zinc-500">
                    Nhánh cache miss
                </span>
            </div>

            <RecommendationCandidatePipeline />
            <div
                className="flex flex-col items-center py-4 text-zinc-400"
                aria-hidden="true"
            >
                <span className="h-3 w-px bg-zinc-300" />
                <ArrowDown className="size-4" />
            </div>

            <section aria-label="Xếp hạng ứng viên">
                <div className="mx-auto max-w-3xl text-center">
                    <h4 className="mt-2 text-xl font-semibold tracking-tight text-zinc-950 sm:text-2xl">
                        AI có cải thiện thứ tự gợi ý không?
                    </h4>
                    <p className="mx-auto mt-2 max-w-2xl text-sm leading-6 text-zinc-600">
                        Hai phương pháp dùng chung quy trình tìm sản phẩm, chỉ
                        khác cách chấm điểm. Trong thử nghiệm, mỗi tài khoản
                        hoặc phiên khách luôn ở cùng một nhánh; lượt hiển thị,
                        nhấp và đơn hoàn tất được gắn về đúng gợi ý để so sánh.
                        AI không mặc định được xem là tốt hơn.
                    </p>
                </div>
                <div className="mt-5 grid items-stretch gap-4 md:grid-cols-2">
                    <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white">
                        <RecommendationStepHeader
                            number="06"
                            title="Standard Ranking"
                            titleLevel={5}
                            className="px-4 py-3"
                        />
                        <div className="flex-1 p-4 sm:p-5">
                            <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4">
                                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-zinc-400">
                                    Công thức điểm
                                </p>
                                <code className="mt-2 block break-words text-xs leading-5 text-zinc-800">
                                    clamp(Σ(weight × feature) − negativePenalty,
                                    0, 1)
                                </code>
                                <p className="mt-2 text-xs leading-5 text-zinc-600">
                                    8 feature được chuẩn hóa; trọng số policy có
                                    tổng 100%, penalty từ sở thích âm được trừ
                                    riêng.
                                </p>
                            </div>

                            <dl className="mt-4 space-y-3">
                                <div>
                                    <dt className="text-[10px] font-semibold uppercase tracking-[0.12em] text-zinc-400">
                                        Vai trò
                                    </dt>
                                    <dd className="mt-1 text-xs leading-5 text-zinc-600">
                                        Tạo baseline xác định, dễ lần ngược từng
                                        tín hiệu để biết vì sao sản phẩm đứng ở
                                        vị trí đó.
                                    </dd>
                                </div>
                                <div>
                                    <dt className="text-[10px] font-semibold uppercase tracking-[0.12em] text-zinc-400">
                                        Điều chỉnh
                                    </dt>
                                    <dd className="mt-1 text-xs leading-5 text-zinc-600">
                                        Admin tinh chỉnh{' '}
                                        <code>hybridWeights</code> trong policy;{' '}
                                        <code>HYBRID</code> là baseline để đối
                                        chiếu ranking mode.
                                    </dd>
                                </div>
                            </dl>
                        </div>
                        <p className="mt-auto border-t border-zinc-100 bg-zinc-50/70 px-5 py-3 text-xs leading-5 text-zinc-600">
                            <span className="font-semibold text-zinc-800">
                                Đánh đổi ·{' '}
                            </span>
                            Dễ kiểm soát, không cần gọi model; nhưng phụ thuộc
                            trọng số con người đặt và khó nắm hết tương tác phức
                            tạp giữa tín hiệu.
                        </p>
                    </article>

                    <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white">
                        <RecommendationStepHeader
                            number="06"
                            title="AI-Enhanced Ranking"
                            titleLevel={5}
                            className="px-4 py-3"
                        />
                        <div className="flex-1 p-4 sm:p-5">
                            <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4">
                                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-zinc-400">
                                    Công thức điểm
                                </p>
                                <code className="mt-2 block break-words text-xs leading-5 text-zinc-800">
                                    clamp(Standard × (1 − mlBlend) + ML ×
                                    mlBlend, 0, 1)
                                </code>
                                <p className="mt-2 text-xs leading-5 text-zinc-600">
                                    Model dự đoán điểm cho từng ứng viên từ cùng
                                    feature vector; không tạo thêm nguồn sản
                                    phẩm.
                                </p>
                            </div>

                            <dl className="mt-4 space-y-3">
                                <div>
                                    <dt className="text-[10px] font-semibold uppercase tracking-[0.12em] text-zinc-400">
                                        Điều chỉnh & đo lường
                                    </dt>
                                    <dd className="mt-1 text-xs leading-5 text-zinc-600">
                                        <code>mlBlend</code> mặc định 0,3, giới
                                        hạn tối đa 0,5. Analytics nhóm theo
                                        ranking mode thực tế để đo hiệu quả có attribution.
                                    </dd>
                                </div>
                                <div>
                                    <dt className="text-[10px] font-semibold uppercase tracking-[0.12em] text-zinc-400">
                                        Fallback an toàn
                                    </dt>
                                    <dd className="mt-1 text-xs leading-5 text-zinc-600">
                                        Nếu response model thiếu phiên bản hợp
                                        lệ, cả lượt dùng Standard; ứng viên
                                        thiếu prediction vẫn giữ điểm baseline.
                                    </dd>
                                </div>
                            </dl>
                        </div>
                        <p className="mt-auto border-t border-zinc-100 bg-zinc-50/70 px-5 py-3 text-xs leading-5 text-zinc-600">
                            <span className="font-semibold text-zinc-800">
                                Đánh đổi ·{' '}
                            </span>
                            Có thể khai thác quan hệ giữa nhiều tín hiệu, nhưng
                            cần model ổn định, thêm độ trễ inference và
                            attribution đủ tin cậy để chứng minh hiệu quả.
                        </p>
                    </article>
                </div>

                <div className="mt-4 grid gap-3 rounded-2xl border border-zinc-200 bg-zinc-50 p-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:px-5">
                    <div>
                        <p className="text-xs font-semibold text-zinc-950">
                            Quyết định bằng outcome, không chỉ bằng score
                        </p>
                        <p className="mt-1 text-xs leading-5 text-zinc-600">
                            So impression → click → đơn hoàn tất có attribution;
                            dùng kết quả để tinh chỉnh trọng số Standard hoặc tỷ
                            lệ blend.
                        </p>
                    </div>
                    <RecommendationRankingLogicLink />
                </div>
                <p className="mt-2 text-center text-xs leading-5 text-zinc-500">
                    Sau xếp hạng, cả hai nhánh cùng qua bước cân bằng độ đa
                    dạng; danh sách chuẩn tối đa 180 sản phẩm.
                </p>
            </section>

            <div
                className="flex flex-col items-center py-4 text-zinc-400"
                aria-hidden="true"
            >
                <span className="h-3 w-px bg-zinc-300" />
                <ArrowDown className="size-4" />
            </div>

            <section
                className="overflow-hidden rounded-2xl border border-zinc-200 bg-white"
                aria-label="Response danh sách gợi ý"
            >
                <RecommendationStepHeader
                    number="07"
                    title="Response danh sách gợi ý"
                    className="px-4 pt-4 sm:px-5"
                />

                <div className="p-4 sm:p-5">
                    <div className="grid items-stretch gap-3 md:grid-cols-3">
                        <article className="h-full overflow-hidden rounded-xl border border-zinc-200 bg-white">
                            <header className="relative px-4 py-3 after:absolute after:inset-x-4 after:bottom-0 after:h-px after:bg-zinc-200 after:content-['']">
                                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-zinc-500">
                                    Trên từng sản phẩm
                                </p>
                                <h5 className="mt-1 text-sm font-semibold text-zinc-950">
                                    Nội dung để hiển thị
                                </h5>
                            </header>
                            <dl className="space-y-2.5 p-4 text-xs leading-5">
                                <div>
                                    <dt className="font-mono text-[11px] font-medium text-zinc-800">
                                        product
                                    </dt>
                                    <dd className="text-zinc-600">
                                        Tên, ảnh, slug, giá và thông tin cần để
                                        dựng thẻ sản phẩm.
                                    </dd>
                                </div>
                                <div>
                                    <dt className="font-mono text-[11px] font-medium text-zinc-800">
                                        rank · score
                                    </dt>
                                    <dd className="text-zinc-600">
                                        Vị trí và điểm dùng để xếp hạng — không
                                        phải xác suất mua.
                                    </dd>
                                </div>
                                <div>
                                    <dt className="font-mono text-[11px] font-medium text-zinc-800">
                                        source · reasons
                                    </dt>
                                    <dd className="text-zinc-600">
                                        <code>source</code> cho biết nguồn ứng
                                        viên được ưu tiên; <code>reasons</code>{' '}
                                        là câu viết sẵn ánh xạ từ nguồn đó (ví
                                        dụ <code>PRODUCT_AFFINITY</code> → “Dựa
                                        trên sản phẩm bạn từng quan tâm”). Nếu
                                        nhiều nguồn cùng tìm thấy sản phẩm, API
                                        chọn nguồn đứng trước theo thứ tự ưu
                                        tiên — đây không phải lời giải thích do
                                        AI tạo.
                                    </dd>
                                </div>
                            </dl>
                        </article>

                        <article className="h-full overflow-hidden rounded-xl border border-zinc-200 bg-white">
                            <header className="relative px-4 py-3 after:absolute after:inset-x-4 after:bottom-0 after:h-px after:bg-zinc-200 after:content-['']">
                                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-zinc-500">
                                    Trên toàn bộ response
                                </p>
                                <h5 className="mt-1 text-sm font-semibold text-zinc-950">
                                    Ngữ cảnh và phân trang
                                </h5>
                            </header>
                            <dl className="space-y-2.5 p-4 text-xs leading-5">
                                <div>
                                    <dt className="font-mono text-[11px] font-medium text-zinc-800">
                                        requestId
                                    </dt>
                                    <dd className="text-zinc-600">
                                        Mã riêng cho response, giúp nối log và
                                        sự kiện phát sinh từ lượt gợi ý.
                                    </dd>
                                </div>
                                <div>
                                    <dt className="font-mono text-[11px] font-medium text-zinc-800">
                                        strategy · profileState
                                    </dt>
                                    <dd className="text-zinc-600">
                                        Cho biết gợi ý theo hồ sơ, phiên hay
                                        cold-start; đồng thời phân biệt khách
                                        với tài khoản đã có hoặc chưa có sở
                                        thích tích cực.
                                    </dd>
                                </div>
                                <div>
                                    <dt className="font-mono text-[11px] font-medium text-zinc-800">
                                        page · pageSize · total · totalPages
                                    </dt>
                                    <dd className="text-zinc-600">
                                        Cho biết đang ở trang nào và còn bao
                                        nhiêu sản phẩm.
                                    </dd>
                                </div>
                                <div>
                                    <dt className="font-mono text-[11px] font-medium text-zinc-800">
                                        generatedAt
                                    </dt>
                                    <dd className="text-zinc-600">
                                        Thời điểm response được tạo.
                                    </dd>
                                </div>
                            </dl>
                        </article>

                        <article className="h-full overflow-hidden rounded-xl border border-zinc-200 bg-white">
                            <header className="relative px-4 py-3 after:absolute after:inset-x-4 after:bottom-0 after:h-px after:bg-zinc-200 after:content-['']">
                                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-zinc-500">
                                    Dấu vết xếp hạng
                                </p>
                                <h5 className="mt-1 text-sm font-semibold text-zinc-950">
                                    Policy, model và ranking mode
                                </h5>
                            </header>
                            <dl className="space-y-2.5 p-4 text-xs leading-5">
                                <div>
                                    <dt className="font-mono text-[11px] font-medium text-zinc-800">
                                        ruleVersion · rankingPolicyVersion
                                    </dt>
                                    <dd className="text-zinc-600">
                                        Phiên bản luật và policy đã dùng để xếp
                                        hạng.
                                    </dd>
                                </div>
                                <div>
                                    <dt className="font-mono text-[11px] font-medium text-zinc-800">
                                        rankingModelVersion
                                    </dt>
                                    <dd className="text-zinc-600">
                                        Phiên bản model nếu lượt này có dự đoán
                                        ML hợp lệ; nếu không sẽ là{' '}
                                        <code>null</code>.
                                    </dd>
                                </div>
                                <div>
                                    <dt className="font-mono text-[11px] font-medium text-zinc-800">
                                        rankingMode
                                    </dt>
                                    <dd className="text-zinc-600">
                                        ID và nhánh đang được so sánh; nếu
                                        request dùng mode nào thì ghi nhận đúng mode đó; khi fallback là{' '}
                                        <code>null</code>.
                                    </dd>
                                </div>
                            </dl>
                        </article>
                    </div>

                    <div className="mt-3 grid gap-3 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
                        <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4">
                            <p className="text-xs font-semibold text-zinc-950">
                                Giới hạn danh sách
                            </p>
                            <p className="mt-1 text-xs leading-5 text-zinc-600">
                                Tối đa 24 sản phẩm mỗi trang · trang chi tiết
                                tối đa 6 · khách chỉ xem trang đầu.
                            </p>
                        </div>
                        <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4">
                            <p className="text-xs font-semibold text-zinc-950">
                                Ghi nhận đúng lượt tương tác
                            </p>
                            <p className="mt-1 text-xs leading-5 text-zinc-600">
                                <code>recommendationItemId</code> được ký theo
                                người dùng/phiên, request, sản phẩm, thứ hạng và
                                policy để xác thực impression/click đúng lượt
                                gợi ý. Ngay cả khi Redis trả danh sách đã cache,
                                mỗi response vẫn có <code>requestId</code> và
                                token mới, tránh gộp nhầm nhiều lần hiển thị.
                            </p>
                        </div>
                    </div>
                </div>
            </section>
        </section>
    );
}

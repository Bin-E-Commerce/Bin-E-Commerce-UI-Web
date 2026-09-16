// Trình bày flow AI-Enhanced Ranking theo thứ tự đọc từ tổng quan đến chi tiết triển khai.
// Component chỉ giải thích pipeline hiện có; không gọi AI Service, không tự tính ranking và không thay đổi runtime policy.
import {
    ArrowDown,
    ArrowRight,
    CheckCircle2,
    Database,
    ShieldCheck,
} from 'lucide-react';
import { RecommendationDisclosure } from '../shared/RecommendationDisclosure';
import { RecommendationStepHeader } from '../shared/RecommendationStepHeader';

// Giúp người đọc hiểu AI chỉ bổ sung score cho candidate pool, còn Standard vẫn là baseline và fallback bắt buộc.
export function RecommendationAiEnhancedRanking() {
    return (
        <RecommendationDisclosure
            id="ai-enhanced-ranking-formula"
            number="2.2.3"
            title="Công thức AI-Enhanced Ranking hoạt động như thế nào?"
            description="Đọc từ trên xuống: xem cách hệ thống chọn sản phẩm, chấm điểm ban đầu, nhờ AI sắp xếp tốt hơn và vẫn giữ kết quả an toàn khi AI gặp lỗi."
            level={4}
            variant="flow"
        >
            <div className="space-y-4">
                <section
                    className="rounded-2xl border-[1px] border-solid border-zinc-200 bg-white p-4 sm:p-5"
                    aria-label="Flow tổng quan AI-Enhanced Ranking"
                >
                    <header className="pb-3">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
                            01 · ĐỌC TRƯỚC FLOW TỔNG QUAN
                        </p>
                        <h5 className="mt-1 text-sm font-semibold text-zinc-950">
                            Từ một candidate đến thứ hạng cuối cùng
                        </h5>
                        <p className="mt-1 text-xs leading-5 text-zinc-600">
                            AI không tự tạo danh sách sản phẩm. Hệ thống chọn ra
                            các sản phẩm phù hợp trước, chấm điểm theo cách
                            thông thường, rồi chỉ nhờ AI sắp xếp lại khi đủ điều
                            kiện. Nếu AI gặp lỗi, hệ thống vẫn trả kết quả bằng
                            cách chấm điểm ban đầu.
                        </p>
                    </header>
                    <div className="mt-4 space-y-2">
                        <div className="grid gap-2 md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)_auto_minmax(0,1fr)] md:items-center">
                            <div className="min-w-0 rounded-2xl border-[1px] border-solid border-zinc-200 bg-white p-3 sm:p-4">
                                <RecommendationStepHeader
                                    number="01"
                                    eyebrow="Đầu vào · candidate pool"
                                    title="Hợp nhất sản phẩm phù hợp"
                                    description="Gộp candidate từ catalog, profile/session và các nguồn liên quan."
                                    titleLevel={5}
                                    showDivider={false}
                                />
                            </div>
                            <span
                                aria-hidden="true"
                                className="mx-auto text-zinc-400"
                            >
                                <ArrowRight className="hidden size-4 md:block" />
                                <ArrowDown className="size-4 md:hidden" />
                            </span>
                            <div className="min-w-0 rounded-2xl border-[1px] border-solid border-zinc-200 bg-white p-3 sm:p-4">
                                <RecommendationStepHeader
                                    number="02"
                                    eyebrow="Baseline · Standard Ranking"
                                    title="Tính Standard score"
                                    description="Tính từ 8 feature, weight và negative penalty."
                                    titleLevel={5}
                                    showDivider={false}
                                />
                            </div>
                            <span
                                aria-hidden="true"
                                className="mx-auto text-zinc-400"
                            >
                                <ArrowRight className="hidden size-4 md:block" />
                                <ArrowDown className="size-4 md:hidden" />
                            </span>
                            <div className="min-w-0 rounded-2xl border-[1px] border-solid border-zinc-200 bg-white p-3 sm:p-4">
                                <RecommendationStepHeader
                                    number="03"
                                    eyebrow="Điều kiện · runtime policy"
                                    title="Kiểm tra điều kiện chạy AI"
                                    description="Kiểm tra policy, khả năng gọi model và trạng thái model."
                                    titleLevel={5}
                                    showDivider={false}
                                />
                            </div>
                        </div>
                        <div
                            aria-hidden="true"
                            className="flex justify-center py-0.5"
                        >
                            <ArrowDown className="size-4 text-zinc-400" />
                        </div>
                        <div className="grid gap-2 md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)_auto_minmax(0,1fr)] md:items-center">
                            <div className="min-w-0 rounded-2xl border-[1px] border-solid border-zinc-200 bg-white p-3 sm:p-4">
                                <RecommendationStepHeader
                                    number="04"
                                    eyebrow="Inference · LightGBM"
                                    title="Dự đoán AI score"
                                    description="Gửi 9 feature theo batch đến AI Service."
                                    titleLevel={5}
                                    showDivider={false}
                                />
                            </div>
                            <span
                                aria-hidden="true"
                                className="mx-auto text-zinc-400"
                            >
                                <ArrowRight className="hidden size-4 md:block" />
                                <ArrowDown className="size-4 md:hidden" />
                            </span>
                            <div className="min-w-0 rounded-2xl border-[1px] border-solid border-zinc-200 bg-white p-3 sm:p-4">
                                <RecommendationStepHeader
                                    number="05"
                                    eyebrow="Blend · hybrid score"
                                    title="Pha AI với Standard"
                                    description="λ quyết định mức ảnh hưởng AI."
                                    titleLevel={5}
                                    showDivider={false}
                                />
                            </div>
                            <span
                                aria-hidden="true"
                                className="mx-auto text-zinc-400"
                            >
                                <ArrowRight className="hidden size-4 md:block" />
                                <ArrowDown className="size-4 md:hidden" />
                            </span>
                            <div className="min-w-0 rounded-2xl border-[1px] border-solid border-zinc-200 bg-white p-3 sm:p-4">
                                <RecommendationStepHeader
                                    number="06"
                                    eyebrow="Đầu ra · final ranking"
                                    title="Sort và trả kết quả"
                                    description="Sort, diversity/quota và trả metadata."
                                    titleLevel={5}
                                    showDivider={false}
                                />
                            </div>
                        </div>
                    </div>
                    <p className="mt-4 rounded-xl border border-zinc-200 bg-zinc-50 p-3 text-xs leading-5 text-zinc-600">
                        <strong className="text-zinc-900">
                            Cách đọc flow:
                        </strong>{' '}
                        Nếu một bước AI thất bại, flow không dừng. Nó quay về
                        Standard ở đúng boundary phù hợp và vẫn trả được
                        recommendation.
                    </p>
                </section>

                <section
                    className="rounded-2xl border border-zinc-200 bg-white p-4 sm:p-5"
                    aria-label="Công thức AI-Enhanced Ranking"
                >
                    <header className="border-b border-zinc-200 pb-3">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
                            02 · CÔNG THỨC CỐT LÕI
                        </p>
                        <h5 className="mt-1 text-sm font-semibold text-zinc-950">
                            Standard tạo nền, AI điều chỉnh có giới hạn
                        </h5>
                        <p className="mt-1 text-xs leading-5 text-zinc-600">
                            Mục tiêu của công thức là xếp sản phẩm phù hợp lên
                            trước nhưng vẫn giữ kết quả ổn định, giải thích được
                            và có thể quay về Standard bất cứ lúc nào.
                        </p>
                    </header>
                    <div className="mt-4 grid gap-3 lg:grid-cols-2">
                        <div className="rounded-xl border border-zinc-200 p-4">
                            <p className="text-[10px] font-semibold uppercase tracking-wide text-zinc-500">
                                Standard score
                            </p>
                            <code className="mt-2 block rounded-lg bg-zinc-50 p-3 font-mono text-xs leading-6 text-zinc-950">
                                S_standard = clamp(Σ(featureᵢ × weightᵢ) −
                                negativePenalty, 0, 1)
                            </code>
                            <p className="mt-2 text-[11px] leading-5 text-zinc-600">
                                Đây là điểm nền do code tính trực tiếp từ 8 tín
                                hiệu nghiệp vụ. Mỗi tín hiệu nằm trong khoảng
                                0–1, được nhân với trọng số, cộng lại rồi trừ
                                riêng tín hiệu không phù hợp.
                            </p>
                            <p className="mt-2 text-[11px] leading-5 text-zinc-600">
                                <strong className="text-zinc-900">
                                    Mục tiêu:
                                </strong>{' '}
                                luôn có một thứ tự sản phẩm an toàn để phục vụ
                                người dùng và làm mốc so sánh khi thử AI.
                            </p>
                        </div>
                        <div className="rounded-xl border border-zinc-200 p-4">
                            <p className="text-[10px] font-semibold uppercase tracking-wide text-zinc-500">
                                AI-Enhanced final score
                            </p>
                            <code className="mt-2 block rounded-lg bg-zinc-50 p-3 font-mono text-xs leading-6 text-zinc-950">
                                S_final = clamp((1 − λ) × S_standard + λ × S_AI,
                                0, 1)
                            </code>
                            <p className="mt-2 text-[11px] leading-5 text-zinc-600">
                                AI không thay thế điểm nền. Model chỉ dự đoán
                                thêm <span className="font-mono">S_AI</span>,
                                sau đó hệ thống pha hai điểm bằng{' '}
                                <span className="font-mono">λ = mlBlend</span>.
                            </p>
                            <p className="mt-2 text-[11px] leading-5 text-zinc-600">
                                <strong className="text-zinc-900">
                                    Mục tiêu:
                                </strong>{' '}
                                tận dụng quan hệ phức tạp mà model học được
                                nhưng giới hạn rủi ro;{' '}
                                <span className="font-mono">λ</span> chỉ từ 0
                                đến 0,5 nên Standard luôn giữ ít nhất 50% ảnh
                                hưởng.
                            </p>
                        </div>
                    </div>
                    <div className="mt-3 grid gap-2 text-[11px] leading-5 text-zinc-600 md:grid-cols-4">
                        <p className="rounded-xl border border-zinc-200 p-3">
                            <strong className="text-zinc-900">Feature:</strong>{' '}
                            tín hiệu đã đưa về 0–1.
                        </p>
                        <p className="rounded-xl border border-zinc-200 p-3">
                            <strong className="text-zinc-900">Weight:</strong>{' '}
                            mức ảnh hưởng của feature trong Standard.
                        </p>
                        <p className="rounded-xl border border-zinc-200 p-3">
                            <strong className="text-zinc-900">λ:</strong> mức
                            ảnh hưởng của AI ở điểm cuối.
                        </p>
                        <p className="rounded-xl border border-zinc-200 p-3">
                            <strong className="text-zinc-900">Clamp:</strong>{' '}
                            giữ score cuối trong khoảng 0–1.
                        </p>
                    </div>
                    <div className="mt-3 rounded-xl border border-zinc-200 bg-white p-4">
                        <p className="text-[10px] font-semibold uppercase tracking-wide text-zinc-500">
                            Đọc các ký hiệu trong công thức
                        </p>
                        <div className="mt-3 grid gap-3 text-[11px] leading-5 text-zinc-600 md:grid-cols-2">
                            <p>
                                <strong className="font-mono text-zinc-900">
                                    featureᵢ:
                                </strong>{' '}
                                một tín hiệu của candidate, ví dụ sản phẩm có
                                hợp sở thích hay đang được xem cùng sản phẩm
                                hiện tại không. Tất cả đều được chuẩn hóa về
                                0–1.
                            </p>
                            <p>
                                <strong className="font-mono text-zinc-900">
                                    weightᵢ:
                                </strong>{' '}
                                mức ưu tiên của tín hiệu trong Standard. Weight
                                không phải điểm của sản phẩm; nó là “quyền biểu
                                quyết” của từng feature.
                            </p>
                            <p>
                                <strong className="font-mono text-zinc-900">
                                    negativePenalty:
                                </strong>{' '}
                                mức trừ cho preference âm như sản phẩm, category
                                hoặc brand người dùng từng trả lại hay thể hiện
                                không phù hợp. Penalty bị giới hạn tối đa 0,15.
                            </p>
                            <p>
                                <strong className="font-mono text-zinc-900">
                                    S_AI:
                                </strong>{' '}
                                điểm LightGBM dự đoán từ đúng 9 giá trị đầu vào.
                                Đây là ranking score 0–1, không phải xác suất
                                mua hàng.
                            </p>
                            <p>
                                <strong className="font-mono text-zinc-900">
                                    λ = mlBlend:
                                </strong>{' '}
                                tỷ lệ ảnh hưởng của AI. λ = 0 nghĩa là chỉ
                                Standard; λ = 0,3 nghĩa là 70% Standard và 30%
                                AI.
                            </p>
                            <p>
                                <strong className="font-mono text-zinc-900">
                                    clamp(x, 0, 1):
                                </strong>{' '}
                                nếu x nhỏ hơn 0 thì đưa về 0, lớn hơn 1 thì đưa
                                về 1. Việc này giữ mọi score cùng một thang đo.
                            </p>
                        </div>
                    </div>
                    <div className="mt-3 rounded-xl border border-zinc-200 p-4">
                        <p className="text-[10px] font-semibold uppercase tracking-wide text-zinc-500">
                            Công thức tạo ra từng feature
                        </p>
                        <p className="mt-1 text-[11px] leading-5 text-zinc-600">
                            Đây là lớp chuẩn hóa trước khi cộng weight. Mục đích
                            là đưa các nguồn dữ liệu khác nhau — preference,
                            phiên truy cập, Qdrant, quan hệ hành vi và catalog —
                            về cùng thang 0–1 để so sánh công bằng.
                        </p>
                        <div className="mt-3 grid gap-2 md:grid-cols-2">
                            <div className="rounded-lg bg-zinc-50 p-3 text-[11px] leading-5 text-zinc-600">
                                <p className="font-mono font-semibold text-zinc-900">
                                    profileAffinity = clamp(P + 0,6C + 0,4B)
                                </p>
                                <p className="mt-1">
                                    P/C/B lần lượt là preference của
                                    product/category/brand. Mỗi preference được
                                    decay theo{' '}
                                    <span className="font-mono">
                                        score × 0,5^(tuổi / halfLife)
                                    </span>
                                    , chia 8 rồi clamp. Mặc định half-life là 7
                                    ngày.
                                </p>
                            </div>
                            <div className="rounded-lg bg-zinc-50 p-3 text-[11px] leading-5 text-zinc-600">
                                <p className="font-mono font-semibold text-zinc-900">
                                    sessionContext = clamp(0,6C + 0,25B + 0,15A)
                                </p>
                                <p className="mt-1">
                                    C = trùng category gần đây, B = trùng brand
                                    gần đây, A = candidate có cùng sản phẩm neo
                                    hiện tại. Mỗi điều kiện là 0 hoặc 1; trọng
                                    số giúp nhu cầu trong phiên phản ứng nhanh.
                                </p>
                            </div>
                            <div className="rounded-lg bg-zinc-50 p-3 text-[11px] leading-5 text-zinc-600">
                                <p className="font-mono font-semibold text-zinc-900">
                                    semanticSimilarity = clamp(rawSimilarity)
                                </p>
                                <p className="mt-1">
                                    Lấy similarity từ embedding/Qdrant. Source
                                    chỉ đóng góp khi vector còn khớp snapshot
                                    catalog; clamp bảo vệ ranker nếu provider
                                    trả giá trị ngoài 0–1.
                                </p>
                            </div>
                            <div className="rounded-lg bg-zinc-50 p-3 text-[11px] leading-5 text-zinc-600">
                                <p className="font-mono font-semibold text-zinc-900">
                                    coBehavior = max(raw / (raw + scale))
                                </p>
                                <p className="mt-1">
                                    Chuẩn hóa từng quan hệ rồi lấy giá trị lớn
                                    nhất của candidate. Scale mặc định: CO_VIEW
                                    = 1, CO_CART = 3, CO_PURCHASE = 6; hành vi
                                    mua vì thế có ngưỡng mạnh hơn xem.
                                </p>
                            </div>
                            <div className="rounded-lg bg-zinc-50 p-3 text-[11px] leading-5 text-zinc-600">
                                <p className="font-mono font-semibold text-zinc-900">
                                    popularity = clamp(max(log1p(totalSold) /
                                    12, sourceRankScore))
                                </p>
                                <p className="mt-1">
                                    Kết hợp tổng đã bán với vị trí trong
                                    TRENDING/BEST_SELLING. Dùng{' '}
                                    <span className="font-mono">log1p</span> để
                                    vài sản phẩm bán quá nhiều không lấn át toàn
                                    bộ danh sách.
                                </p>
                            </div>
                            <div className="rounded-lg bg-zinc-50 p-3 text-[11px] leading-5 text-zinc-600">
                                <p className="font-mono font-semibold text-zinc-900">
                                    freshness = bucket theo tuổi sản phẩm
                                </p>
                                <p className="mt-1">
                                    ≤ 1 ngày: 1, ≤ 7 ngày: 0,8, ≤ 30 ngày: 0,55,
                                    ≤ 90 ngày: 0,3, cũ hơn: 0,1. Bucket ổn định
                                    hơn một hàm liên tục và vẫn tạo cơ hội cho
                                    item mới.
                                </p>
                            </div>
                            <div className="rounded-lg bg-zinc-50 p-3 text-[11px] leading-5 text-zinc-600">
                                <p className="font-mono font-semibold text-zinc-900">
                                    quality = clamp(0,55R + 0,25V + 0,2I)
                                </p>
                                <p className="mt-1">
                                    R = rating/5, V ={' '}
                                    <span className="font-mono">
                                        log1p(reviewCount) / log1p(100)
                                    </span>
                                    , I = 1 nếu còn tồn kho. Rating là tín hiệu
                                    chính, review tạo độ tin cậy, stock ngăn đẩy
                                    item không thể phục vụ.
                                </p>
                            </div>
                            <div className="rounded-lg bg-zinc-50 p-3 text-[11px] leading-5 text-zinc-600">
                                <p className="font-mono font-semibold text-zinc-900">
                                    exploration = profileAffinity &gt; 0,4 ? 0 :
                                    sourceMatch
                                </p>
                                <p className="mt-1">
                                    Nếu đã có affinity mạnh thì không cộng thêm
                                    exploration. Nếu chưa, candidate từ
                                    EXPLORE/NEWEST nhận 1 để khám phá có kiểm
                                    soát thay vì ngẫu nhiên.
                                </p>
                            </div>
                        </div>
                        <p className="mt-3 rounded-lg border border-zinc-200 bg-white p-3 text-[11px] leading-5 text-zinc-600">
                            <strong className="text-zinc-900">
                                Penalty riêng:
                            </strong>{' '}
                            các preference âm được decay giống preference dương,
                            cộng theo product/category/brand, chuẩn hóa theo 8
                            rồi giới hạn{' '}
                            <span className="font-mono">
                                negativePenalty ≤ 0,15
                            </span>
                            . Tách penalty khỏi feature dương giúp “không phù
                            hợp” luôn làm giảm điểm và không bị triệt tiêu bởi
                            một tín hiệu tích cực khác.
                        </p>
                    </div>
                    <div className="mt-3 overflow-x-auto rounded-xl border border-zinc-200">
                        <table className="min-w-[760px] w-full border-collapse text-left text-[11px] leading-5">
                            <caption className="sr-only">
                                Trọng số Standard mặc định và mục tiêu của từng
                                tín hiệu
                            </caption>
                            <thead className="bg-zinc-50 text-[10px] font-semibold uppercase tracking-wide text-zinc-500">
                                <tr>
                                    <th className="px-3 py-2.5">Tín hiệu</th>
                                    <th className="px-3 py-2.5">
                                        Weight mặc định
                                    </th>
                                    <th className="px-3 py-2.5">
                                        Nguồn dữ liệu
                                    </th>
                                    <th className="px-3 py-2.5">Mục tiêu</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-100 text-zinc-600">
                                <tr>
                                    <td className="px-3 py-2.5 font-mono text-zinc-900">
                                        profileAffinity
                                    </td>
                                    <td className="px-3 py-2.5">0,25 · 25%</td>
                                    <td className="px-3 py-2.5">
                                        Preference dài hạn theo sản phẩm,
                                        category, brand
                                    </td>
                                    <td className="px-3 py-2.5">
                                        Cá nhân hóa theo sở thích đã tích lũy
                                    </td>
                                </tr>
                                <tr>
                                    <td className="px-3 py-2.5 font-mono text-zinc-900">
                                        sessionContext
                                    </td>
                                    <td className="px-3 py-2.5">0,18 · 18%</td>
                                    <td className="px-3 py-2.5">
                                        Category, brand và sản phẩm gần đây
                                        trong phiên
                                    </td>
                                    <td className="px-3 py-2.5">
                                        Bắt kịp nhu cầu hiện tại nhanh hơn
                                        profile dài hạn
                                    </td>
                                </tr>
                                <tr>
                                    <td className="px-3 py-2.5 font-mono text-zinc-900">
                                        semanticSimilarity
                                    </td>
                                    <td className="px-3 py-2.5">0,15 · 15%</td>
                                    <td className="px-3 py-2.5">
                                        Similarity từ embedding/Qdrant
                                    </td>
                                    <td className="px-3 py-2.5">
                                        Tìm sản phẩm gần nhau về nội dung
                                    </td>
                                </tr>
                                <tr>
                                    <td className="px-3 py-2.5 font-mono text-zinc-900">
                                        coBehavior
                                    </td>
                                    <td className="px-3 py-2.5">0,10 · 10%</td>
                                    <td className="px-3 py-2.5">
                                        Quan hệ xem, thêm giỏ và mua cùng nhau
                                    </td>
                                    <td className="px-3 py-2.5">
                                        Khai thác hành vi “người xem món này
                                        cũng xem món kia”
                                    </td>
                                </tr>
                                <tr>
                                    <td className="px-3 py-2.5 font-mono text-zinc-900">
                                        popularity
                                    </td>
                                    <td className="px-3 py-2.5">0,12 · 12%</td>
                                    <td className="px-3 py-2.5">
                                        Total sold và thứ hạng
                                        trending/best-selling
                                    </td>
                                    <td className="px-3 py-2.5">
                                        Giữ sản phẩm có nhu cầu chung không bị
                                        bỏ quên
                                    </td>
                                </tr>
                                <tr>
                                    <td className="px-3 py-2.5 font-mono text-zinc-900">
                                        freshness
                                    </td>
                                    <td className="px-3 py-2.5">0,08 · 8%</td>
                                    <td className="px-3 py-2.5">
                                        Tuổi sản phẩm trong catalog
                                    </td>
                                    <td className="px-3 py-2.5">
                                        Tạo cơ hội cho sản phẩm mới
                                    </td>
                                </tr>
                                <tr>
                                    <td className="px-3 py-2.5 font-mono text-zinc-900">
                                        quality
                                    </td>
                                    <td className="px-3 py-2.5">0,08 · 8%</td>
                                    <td className="px-3 py-2.5">
                                        Rating, số review và tình trạng tồn kho
                                    </td>
                                    <td className="px-3 py-2.5">
                                        Ưu tiên item có chất lượng và còn khả
                                        năng phục vụ
                                    </td>
                                </tr>
                                <tr>
                                    <td className="px-3 py-2.5 font-mono text-zinc-900">
                                        exploration
                                    </td>
                                    <td className="px-3 py-2.5">0,04 · 4%</td>
                                    <td className="px-3 py-2.5">
                                        Nguồn EXPLORE/NEWEST khi affinity chưa
                                        cao
                                    </td>
                                    <td className="px-3 py-2.5">
                                        Mở rộng khám phá nhưng không lấn át cá
                                        nhân hóa
                                    </td>
                                </tr>
                                <tr className="bg-zinc-50">
                                    <td className="px-3 py-2.5 font-mono font-semibold text-zinc-900">
                                        Tổng
                                    </td>
                                    <td className="px-3 py-2.5 font-semibold text-zinc-900">
                                        1,00 · 100%
                                    </td>
                                    <td className="px-3 py-2.5" colSpan={2}>
                                        Backend tự normalize tổng weight về 1.
                                        Admin có thể thay đổi tỷ lệ, nhưng không
                                        được gửi key lạ hoặc tổng bằng 0.
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <div className="mt-3 grid gap-3 lg:grid-cols-3">
                        <div className="rounded-xl border border-zinc-200 bg-white p-4 text-[11px] leading-5 text-zinc-600">
                            <p className="font-semibold text-zinc-900">
                                Các con số này lấy từ đâu?
                            </p>
                            <p className="mt-1.5">
                                Weight mặc định là policy khởi đầu được khai báo
                                trong{' '}
                                <span className="font-mono">
                                    RecommendationRuleService
                                </span>
                                . Chúng là quyết định sản phẩm có thể điều chỉnh
                                qua Admin, không phải con số tự sinh bởi
                                LightGBM.
                            </p>
                        </div>
                        <div className="rounded-xl border border-zinc-200 p-4 text-[11px] leading-5 text-zinc-600">
                            <p className="font-semibold text-zinc-900">
                                AI học từ đâu?
                            </p>
                            <p className="mt-1.5">
                                LightGBM được train offline từ dataset gồm 9
                                feature và label 0–1. Runtime chỉ load artifact
                                đã train; model không tự thay đổi trọng số trong
                                lúc người dùng gửi request.
                            </p>
                        </div>
                        <div className="rounded-xl border border-zinc-200 p-4 text-[11px] leading-5 text-zinc-600">
                            <p className="font-semibold text-zinc-900">
                                Vì sao không để AI quyết định hết?
                            </p>
                            <p className="mt-1.5">
                                Standard dễ audit và luôn có sẵn. Giới hạn{' '}
                                <span className="font-mono">mlBlend ≤ 0,5</span>
                                , kiểm tra prediction và fallback giúp rollout
                                AI có kiểm soát.
                            </p>
                        </div>
                    </div>
                </section>

                <section
                    className="rounded-2xl border border-zinc-200 bg-white p-4 sm:p-5"
                    aria-label="Chi tiết các bước AI-Enhanced Ranking"
                >
                    <header className="border-b border-zinc-200 pb-3">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
                            03 · ĐI CHI TIẾT THEO FLOW
                        </p>
                        <h5 className="mt-1 text-sm font-semibold text-zinc-950">
                            Mỗi bước giải quyết một vấn đề khác nhau
                        </h5>
                        <p className="mt-1 text-xs leading-5 text-zinc-600">
                            Đọc lần lượt từ Bước 01 đến Bước 06. Phần này giải
                            thích tại sao bước đó tồn tại, nó dùng thành phần
                            nào và đánh đổi là gì.
                        </p>
                    </header>
                    <div className="mt-4 space-y-2">
                        <section className="rounded-2xl border border-zinc-200 bg-white p-3 sm:p-4">
                            <RecommendationStepHeader
                                number="01"
                                eyebrow="Điều kiện · runtime policy"
                                title="Kiểm tra policy và khả năng chạy AI"
                                description="Khi policy bật, mọi request đều được thử bằng AI; model lỗi sẽ fallback Standard."
                                titleLevel={5}
                            />
                            <div className="mt-3 grid gap-2 pt-1 text-[11px] leading-5 text-zinc-600 md:grid-cols-3">
                                <p>
                                    <strong className="text-zinc-900">
                                        Tại sao cần:
                                    </strong>{' '}
                                    Cần biết AI đang được bật hay tắt trước khi
                                    chọn mode phục vụ request.
                                </p>
                                <p>
                                    <strong className="text-zinc-900">
                                        Dùng để làm gì:
                                    </strong>{' '}
                                    Đọc{' '}
                                    <span className="font-mono">mlEnabled</span>
                                    . Khi bật, AI áp dụng cho 100% request đủ
                                    điều kiện; không hash actor/session để chia
                                    nhóm.
                                </p>
                                <p>
                                    <strong className="text-zinc-900">
                                        Đánh đổi:
                                    </strong>{' '}
                                    AI có thể tốn thêm độ trễ; vì vậy model lỗi
                                    hoặc không hợp lệ vẫn phải fallback về
                                    Standard để không làm hỏng response.
                                </p>
                            </div>
                        </section>
                        <div
                            aria-hidden="true"
                            className="flex justify-center py-0.5"
                        >
                            <ArrowDown className="size-4 text-zinc-400" />
                        </div>
                        <section className="rounded-2xl border border-zinc-200 bg-white p-3 sm:p-4">
                            <RecommendationStepHeader
                                number="02"
                                eyebrow="Baseline · Standard Ranking"
                                title="Tính Standard score trước"
                                description="Baseline phải sẵn sàng ngay cả khi AI chưa tồn tại hoặc không phản hồi."
                                titleLevel={5}
                            />
                            <div className="mt-3 grid gap-2 pt-1 text-[11px] leading-5 text-zinc-600 md:grid-cols-3">
                                <p>
                                    <strong className="text-zinc-900">
                                        Tại sao cần:
                                    </strong>{' '}
                                    Người dùng luôn cần kết quả; Standard cũng
                                    là mốc để so sánh AI.
                                </p>
                                <p>
                                    <strong className="text-zinc-900">
                                        Dùng để làm gì:
                                    </strong>{' '}
                                    Tính 8 feature theo hybrid weights, trừ{' '}
                                    <span className="font-mono">
                                        negativePenalty
                                    </span>{' '}
                                    và clamp thành{' '}
                                    <span className="font-mono">
                                        S_standard
                                    </span>
                                    .
                                </p>
                                <p>
                                    <strong className="text-zinc-900">
                                        Đánh đổi:
                                    </strong>{' '}
                                    Dễ giải thích và ổn định, nhưng không học
                                    được tương tác phức tạp giữa nhiều tín hiệu.
                                </p>
                            </div>
                        </section>
                        <div
                            aria-hidden="true"
                            className="flex justify-center py-0.5"
                        >
                            <ArrowDown className="size-4 text-zinc-400" />
                        </div>
                        <section className="rounded-2xl border border-zinc-200 bg-white p-3 sm:p-4">
                            <RecommendationStepHeader
                                number="03"
                                eyebrow="Đầu vào · model contract"
                                title="Tạo feature vector đúng thứ tự"
                                description="Một candidate được biến thành 9 cột số mà artifact đã được train để hiểu."
                                titleLevel={5}
                            />
                            <div className="mt-3 grid gap-2 pt-1 text-[11px] leading-5 text-zinc-600 md:grid-cols-3">
                                <p>
                                    <strong className="text-zinc-900">
                                        Tại sao cần:
                                    </strong>{' '}
                                    JSON đúng format chưa đủ; sai thứ tự cột sẽ
                                    khiến model hiểu sai ý nghĩa dữ liệu.
                                </p>
                                <p>
                                    <strong className="text-zinc-900">
                                        Dùng để làm gì:
                                    </strong>{' '}
                                    Gửi{' '}
                                    <span className="font-mono">
                                        profileAffinity, sessionContext,
                                        semanticSimilarity, coBehavior,
                                        popularity, freshness, quality,
                                        exploration, negativePenalty
                                    </span>
                                    .
                                </p>
                                <p>
                                    <strong className="text-zinc-900">
                                        Đánh đổi:
                                    </strong>{' '}
                                    Kết quả nhất quán và dễ validate, nhưng đổi
                                    feature bắt buộc kiểm tra hoặc train lại
                                    artifact.
                                </p>
                            </div>
                        </section>
                        <div
                            aria-hidden="true"
                            className="flex justify-center py-0.5"
                        >
                            <ArrowDown className="size-4 text-zinc-400" />
                        </div>
                        <section className="rounded-2xl border border-zinc-200 bg-white p-3 sm:p-4">
                            <RecommendationStepHeader
                                number="04"
                                eyebrow="Inference · AI Service"
                                title="Gọi LightGBM qua internal contract"
                                description="Recommendation Service gọi batch prediction; browser không được gọi trực tiếp AI Service."
                                titleLevel={5}
                            />
                            <div className="mt-3 grid gap-2 pt-1 text-[11px] leading-5 text-zinc-600 md:grid-cols-3">
                                <p>
                                    <strong className="text-zinc-900">
                                        Tại sao cần:
                                    </strong>{' '}
                                    Tách model thành AI Service giúp thay model,
                                    scale inference và theo dõi readiness độc
                                    lập.
                                </p>
                                <p>
                                    <strong className="text-zinc-900">
                                        Dùng để làm gì:
                                    </strong>{' '}
                                    Gửi tối đa 300 item bằng internal token; AI
                                    Service validate payload và trả{' '}
                                    <span className="font-mono">S_AI</span>{' '}
                                    trong 0–1.
                                </p>
                                <p>
                                    <strong className="text-zinc-900">
                                        Đánh đổi:
                                    </strong>{' '}
                                    Có network hop và timeout. Batch hiệu quả
                                    hơn nhưng lỗi có thể khiến cả batch
                                    fallback.
                                </p>
                            </div>
                        </section>
                        <div
                            aria-hidden="true"
                            className="flex justify-center py-0.5"
                        >
                            <ArrowDown className="size-4 text-zinc-400" />
                        </div>
                        <section className="rounded-2xl border border-zinc-200 bg-white p-3 sm:p-4">
                            <RecommendationStepHeader
                                number="05"
                                eyebrow="Safety check · validation"
                                title="Kiểm tra prediction trước khi blend"
                                description="Response nội bộ vẫn được xem là untrusted input cho đến khi đủ điều kiện."
                                titleLevel={5}
                            />
                            <div className="mt-3 grid gap-2 pt-1 text-[11px] leading-5 text-zinc-600 md:grid-cols-3">
                                <p>
                                    <strong className="text-zinc-900">
                                        Tại sao cần:
                                    </strong>{' '}
                                    Prediction sai có thể làm sai thứ hạng và cả
                                    số liệu phân tích hiệu quả.
                                </p>
                                <p>
                                    <strong className="text-zinc-900">
                                        Dùng để làm gì:
                                    </strong>{' '}
                                    Kiểm tra item ID, duplicate, số lượng, 9
                                    feature, số hữu hạn, score 0–1 và model
                                    version.{' '}
                                    <span className="font-mono">
                                        ranking-fallback-v1
                                    </span>{' '}
                                    không được tính là ML.
                                </p>
                                <p>
                                    <strong className="text-zinc-900">
                                        Đánh đổi:
                                    </strong>{' '}
                                    Validation chặt làm fallback nhiều hơn,
                                    nhưng bảo vệ chất lượng và độ tin cậy của
                                    metrics.
                                </p>
                            </div>
                        </section>
                        <div
                            aria-hidden="true"
                            className="flex justify-center py-0.5"
                        >
                            <ArrowDown className="size-4 text-zinc-400" />
                        </div>
                        <section className="rounded-2xl border border-zinc-200 bg-white p-3 sm:p-4">
                            <RecommendationStepHeader
                                number="06"
                                eyebrow="Đầu ra · final ranking"
                                title="Blend, sort và áp dụng luật hiển thị"
                                description="AI điều chỉnh score; nó không được bypass diversity, quota hoặc fallback của hệ thống."
                                titleLevel={5}
                            />
                            <div className="mt-3 grid gap-2 pt-1 text-[11px] leading-5 text-zinc-600 md:grid-cols-3">
                                <p>
                                    <strong className="text-zinc-900">
                                        Tại sao cần:
                                    </strong>{' '}
                                    Điểm AI chỉ là tín hiệu bổ sung, không phải
                                    quyết định kinh doanh cuối cùng.
                                </p>
                                <p>
                                    <strong className="text-zinc-900">
                                        Dùng để làm gì:
                                    </strong>{' '}
                                    Tính{' '}
                                    <span className="font-mono">S_final</span>,
                                    sort giảm dần, áp cold-start mix/diversity
                                    và trả{' '}
                                    <span className="font-mono">
                                        rankingMode
                                    </span>
                                    và model version.
                                </p>
                                <p>
                                    <strong className="text-zinc-900">
                                        Đánh đổi:
                                    </strong>{' '}
                                    Diversity có thể đẩy item điểm cao xuống để
                                    tránh lặp shop/category, nhưng danh sách cân
                                    bằng và hữu ích hơn.
                                </p>
                            </div>
                        </section>
                    </div>
                </section>

                <section
                    className="rounded-2xl border border-zinc-200 bg-white p-4 sm:p-5"
                    aria-label="Model train và dữ liệu AI ranking"
                >
                    <header className="border-b border-zinc-200 pb-3">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
                            04 · MODEL ĐƯỢC TRAIN NHƯ THẾ NÀO?
                        </p>
                        <h5 className="mt-1 text-sm font-semibold text-zinc-950">
                            LightGBM học từ feature và label, không tự học trực
                            tiếp trong request
                        </h5>
                        <p className="mt-1 text-xs leading-5 text-zinc-600">
                            Training là quy trình offline. Request online chỉ
                            load artifact đã train và gọi prediction; không
                            train lại, không gọi provider AI để tạo dữ liệu
                            trong lúc người dùng chờ.
                        </p>
                    </header>
                    <div className="mt-4 grid gap-3">
                        <div className="rounded-xl border border-zinc-200 bg-white p-4 text-[11px] leading-5 text-zinc-600">
                            <p className="font-semibold text-zinc-900">
                                LightGBM là thuật toán gì?
                            </p>
                            <p className="mt-1.5">
                                LightGBM là thuật toán học có giám sát thuộc
                                nhóm{' '}
                                <strong className="text-zinc-900">
                                    Gradient Boosting Decision Tree
                                </strong>
                                . Model tạo ra nhiều cây quyết định nhỏ. Cây sau
                                quan sát lỗi của các cây trước rồi học thêm phần
                                còn thiếu; tổng của các cây tạo thành dự đoán
                                cuối.
                            </p>
                            <p className="mt-1.5">
                                Mỗi nhánh cây có thể học một điều kiện như
                                “sessionContext cao nhưng quality thấp” hoặc
                                “semanticSimilarity cao và candidate đến từ nhóm
                                liên quan”. Vì vậy model nhìn được mối quan hệ
                                kết hợp giữa nhiều feature mà phép cộng tuyến
                                tính của Standard không biểu diễn được.
                            </p>
                            <p className="mt-1.5">
                                <strong className="text-zinc-900">
                                    Trong hệ thống này:
                                </strong>{' '}
                                LightGBM chỉ re-rank tối đa 300 candidate đã
                                được Recommendation Service chọn. Nó không tìm
                                sản phẩm, không đọc trực tiếp catalog và không
                                thay thế bước filter, quota hay diversity.
                            </p>
                        </div>
                        <div className="grid gap-3 lg:grid-cols-2">
                            <div className="rounded-xl border border-zinc-200 bg-white p-4 text-[11px] leading-5 text-zinc-600">
                            <p className="font-semibold text-zinc-900">
                                Model cải thiện điểm nào?
                            </p>
                            <ul className="mt-1.5 space-y-1.5">
                                <li>
                                    <strong className="text-zinc-900">
                                        Standard:
                                    </strong>{' '}
                                    dễ hiểu nhưng cộng các tín hiệu theo weight
                                    cố định.
                                </li>
                                <li>
                                    <strong className="text-zinc-900">
                                        LightGBM:
                                    </strong>{' '}
                                    học được ngưỡng và tương tác phi tuyến từ dữ
                                    liệu lịch sử.
                                </li>
                                <li>
                                    <strong className="text-zinc-900">
                                        Kết quả:
                                    </strong>{' '}
                                    các candidate có cùng Standard score vẫn có
                                    thể được phân biệt tốt hơn theo pattern từng
                                    xuất hiện trong hành vi người dùng.
                                </li>
                                <li>
                                    <strong className="text-zinc-900">
                                        Giới hạn:
                                    </strong>{' '}
                                    model chỉ cải thiện thứ tự trong candidate
                                    pool; candidate bị thiếu từ bước tạo nguồn
                                    sẽ không thể được AI “tìm lại”.
                                </li>
                            </ul>
                            </div>
                            <div className="rounded-xl border border-zinc-200 bg-white p-4 text-[11px] leading-5 text-zinc-600">
                            <p className="font-semibold text-zinc-900">
                                Model chỉ tốt khi nào?
                            </p>
                            <ul className="mt-1.5 space-y-1.5">
                                <li>
                                    <strong className="text-zinc-900">
                                        Dữ liệu đủ:
                                    </strong>{' '}
                                    có đủ lượt hiển thị và tương tác đại diện cho
                                    nhiều nhóm người dùng, không chỉ một vài sản
                                    phẩm phổ biến.
                                </li>
                                <li>
                                    <strong className="text-zinc-900">
                                        Label đúng:
                                    </strong>{' '}
                                    click, thêm giỏ hoặc purchase phải phản ánh
                                    đúng mục tiêu muốn tối ưu; label nhiễu sẽ
                                    khiến model học sai.
                                </li>
                                <li>
                                    <strong className="text-zinc-900">
                                        Feature nhất quán:
                                    </strong>{' '}
                                    9 feature lúc train phải có cùng ý nghĩa,
                                    thứ tự và cách chuẩn hóa khi inference.
                                </li>
                                <li>
                                    <strong className="text-zinc-900">
                                        Được đo lường:
                                    </strong>{' '}
                                    cần validation offline, theo dõi CTR,
                                    conversion, latency và data drift sau khi
                                    rollout.
                                </li>
                                <li>
                                    <strong className="text-zinc-900">
                                        Không bị lệch dữ liệu:
                                    </strong>{' '}
                                    nếu chỉ train từ sản phẩm đã được ưu tiên
                                    trước đó, model có thể lặp lại bias cũ.
                                </li>
                            </ul>
                            </div>
                        </div>
                    </div>
                    <div className="mt-3 rounded-xl border border-zinc-200 p-4">
                        <p className="text-[10px] font-semibold uppercase tracking-wide text-zinc-500">
                            Vì sao chọn LightGBM thay vì các hướng khác?
                        </p>
                        <h6 className="mt-1 text-sm font-semibold text-zinc-950">
                            Đây là lựa chọn phù hợp nhất với bài toán re-ranking
                            hiện tại
                        </h6>
                        <p className="mt-1 text-[11px] leading-5 text-zinc-600">
                            LightGBM không được chọn vì nó luôn tốt hơn mọi
                            thuật toán. Nó được chọn vì khớp với các ràng buộc
                            đang có: mỗi candidate chỉ có 9 feature dạng số,
                            label được chuẩn hóa về 0–1, request cần inference
                            nhanh, model phải dễ kiểm tra và có thể fallback về
                            Standard bất cứ lúc nào.
                        </p>
                        <div className="mt-3 grid gap-2 md:grid-cols-2 lg:grid-cols-4">
                            <div className="rounded-lg bg-zinc-50 p-3 text-[11px] leading-5 text-zinc-600">
                                <strong className="text-zinc-900">
                                    Dữ liệu:
                                </strong>{' '}
                                Gradient boosting rất hợp với dữ liệu bảng nhỏ
                                và feature số; không cần dựng thêm embedding
                                hoặc chuỗi xử lý phức tạp.
                            </div>
                            <div className="rounded-lg bg-zinc-50 p-3 text-[11px] leading-5 text-zinc-600">
                                <strong className="text-zinc-900">
                                    Độ trễ:
                                </strong>{' '}
                                Model dạng cây dự đoán nhanh trên batch
                                candidate, phù hợp với giới hạn thời gian của
                                request recommendation.
                            </div>
                            <div className="rounded-lg bg-zinc-50 p-3 text-[11px] leading-5 text-zinc-600">
                                <strong className="text-zinc-900">
                                    Khả năng audit:
                                </strong>{' '}
                                Có thể kiểm tra thứ tự 9 feature, version
                                artifact, validation metric và kết quả
                                prediction.
                            </div>
                            <div className="rounded-lg bg-zinc-50 p-3 text-[11px] leading-5 text-zinc-600">
                                <strong className="text-zinc-900">
                                    Rollout:
                                </strong>{' '}
                                    AI chỉ bổ sung score; Standard vẫn là baseline,
                                    nên có thể bật cho toàn bộ request và tắt ngay
                                    khi model không ổn định.
                            </div>
                        </div>
                        <div className="mt-3 rounded-lg border border-zinc-200 bg-zinc-50 p-3 text-[11px] leading-5 text-zinc-600">
                            <strong className="text-zinc-900">
                                Nó cải thiện gì?
                            </strong>{' '}
                            Standard cộng các tín hiệu theo weight cố định.
                            LightGBM học thêm các ngưỡng và tương tác phi tuyến,
                            ví dụ cùng một mức{' '}
                            <span className="font-mono">profileAffinity</span>{' '}
                            nhưng candidate có{' '}
                            <span className="font-mono">quality</span>,{' '}
                            <span className="font-mono">freshness</span> hoặc{' '}
                            <span className="font-mono">
                                semanticSimilarity
                            </span>{' '}
                            khác nhau sẽ được phân biệt tốt hơn. Vì vậy AI chủ
                            yếu cải thiện thứ tự trong candidate pool và khả
                            năng tie-break; nó không tự tạo candidate mới, không
                            thay filter/quota/diversity và không đảm bảo score
                            là xác suất mua hàng.
                        </div>
                        <p className="mt-3 text-[11px] leading-5 text-zinc-600">
                            <strong className="text-zinc-900">
                                Cách ra quyết định:
                            </strong>{' '}
                            So sánh mức phù hợp với input hiện tại, chi phí
                            inference, độ phức tạp vận hành và khả năng
                            rollback. XGBoost là đối thủ gần nhất và vẫn cần
                            benchmark thực tế nếu dữ liệu hoặc tải thay đổi; các
                            lựa chọn còn lại chỉ nên thay thế khi contract dữ
                            liệu và mục tiêu sản phẩm thay đổi.
                        </p>
                        <div className="mt-3 overflow-x-auto rounded-lg border border-zinc-200">
                            <table className="min-w-[1040px] w-full border-collapse text-left text-[11px] leading-5">
                                <caption className="sr-only">
                                    So sánh LightGBM với các thuật toán ranking
                                    khác
                                </caption>
                                <thead className="bg-zinc-50 text-[10px] font-semibold uppercase tracking-wide text-zinc-500">
                                    <tr>
                                        <th className="px-3 py-2.5">
                                            Thuật toán
                                        </th>
                                        <th className="px-3 py-2.5">
                                            Phù hợp ở đâu?
                                        </th>
                                        <th className="px-3 py-2.5">
                                            Hạn chế với hệ thống hiện tại
                                        </th>
                                        <th className="px-3 py-2.5">
                                            Quyết định
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-100 text-zinc-600">
                                    <tr className="bg-zinc-50/70">
                                        <td className="px-3 py-2.5 font-semibold text-zinc-900">
                                            LightGBM
                                        </td>
                                        <td className="px-3 py-2.5">
                                            Dữ liệu bảng, feature số, quan hệ
                                            phi tuyến và inference theo batch.
                                        </td>
                                        <td className="px-3 py-2.5">
                                            Chất lượng phụ thuộc label, dữ liệu
                                            lịch sử và việc giữ đúng thứ tự 9
                                            feature.
                                        </td>
                                        <td className="px-3 py-2.5 font-semibold text-zinc-900">
                                            Chọn làm model hiện tại vì cân bằng
                                            tốt giữa chất lượng, tốc độ và khả
                                            năng rollback.
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="px-3 py-2.5 font-semibold text-zinc-900">
                                            Logistic Regression
                                        </td>
                                        <td className="px-3 py-2.5">
                                            Nhanh, dễ giải thích, phù hợp làm
                                            baseline.
                                        </td>
                                        <td className="px-3 py-2.5">
                                            Chủ yếu học quan hệ tuyến tính; khó
                                            biểu diễn tương tác phức tạp giữa 9
                                            feature.
                                        </td>
                                        <td className="px-3 py-2.5">
                                            Giữ làm mốc so sánh, không chọn làm
                                            AI re-ranker.
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="px-3 py-2.5 font-semibold text-zinc-900">
                                            Random Forest
                                        </td>
                                        <td className="px-3 py-2.5">
                                            Ổn định, ít nhạy với scale và dễ
                                            triển khai.
                                        </td>
                                        <td className="px-3 py-2.5">
                                            Các cây độc lập có thể nặng hơn cho
                                            batch inference; không tận dụng
                                            boosting để sửa lỗi tuần tự.
                                        </td>
                                        <td className="px-3 py-2.5">
                                            Chưa ưu tiên vì cần footprint lớn
                                            hơn cho cùng pipeline.
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="px-3 py-2.5 font-semibold text-zinc-900">
                                            XGBoost
                                        </td>
                                        <td className="px-3 py-2.5">
                                            Rất mạnh trên dữ liệu bảng và là đối
                                            thủ gần nhất.
                                        </td>
                                        <td className="px-3 py-2.5">
                                            Thêm một lựa chọn runtime cần
                                            benchmark, đóng gói và vận hành song
                                            song; chưa có bằng chứng đủ để đổi
                                            model hiện tại.
                                        </td>
                                        <td className="px-3 py-2.5">
                                            Ứng viên benchmark khi tải, dữ liệu
                                            hoặc metric thay đổi.
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="px-3 py-2.5 font-semibold text-zinc-900">
                                            CatBoost
                                        </td>
                                        <td className="px-3 py-2.5">
                                            Xử lý categorical feature tốt, giảm
                                            công sức encode.
                                        </td>
                                        <td className="px-3 py-2.5">
                                            Input hiện tại đã là 9 số đã chuẩn
                                            hóa; chưa cần lợi thế categorical
                                            trực tiếp.
                                        </td>
                                        <td className="px-3 py-2.5">
                                            Chưa dùng để tránh thêm độ phức tạp
                                            không cần thiết.
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="px-3 py-2.5 font-semibold text-zinc-900">
                                            Neural Network
                                        </td>
                                        <td className="px-3 py-2.5">
                                            Học pattern rất phức tạp khi dữ liệu
                                            lớn và feature phong phú.
                                        </td>
                                        <td className="px-3 py-2.5">
                                            Cần nhiều dữ liệu, tuning và giám
                                            sát hơn; khó audit và thường tăng
                                            chi phí/độ trễ với tabular nhỏ.
                                        </td>
                                        <td className="px-3 py-2.5">
                                            Chỉ cân nhắc khi dữ liệu đủ lớn và
                                            có nhu cầu biểu diễn sâu hơn.
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="px-3 py-2.5 font-semibold text-zinc-900">
                                            LambdaMART / LTR
                                        </td>
                                        <td className="px-3 py-2.5">
                                            Tối ưu trực tiếp thứ tự trong từng
                                            query/session group.
                                        </td>
                                        <td className="px-3 py-2.5">
                                            Dataset hiện tại mới là từng dòng
                                            feature + label, chưa có group/query
                                            label contract.
                                        </td>
                                        <td className="px-3 py-2.5">
                                            Có thể chuyển sang khi log đủ
                                            session và mục tiêu ranking rõ hơn.
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <p className="mt-3 rounded-lg border border-zinc-200 p-3 text-[11px] leading-5 text-zinc-600">
                            <strong className="text-zinc-900">Kết luận:</strong>{' '}
                            LightGBM là quyết định phù hợp với giai đoạn hiện
                            tại, không phải cam kết vĩnh viễn. Khi có dataset
                            lớn hơn, label theo session rõ hơn hoặc metric thực
                            tế cho thấy model khác tốt hơn, hệ thống có thể
                            benchmark model mới rồi thay artifact theo version;
                            contract 9 feature, validation và fallback vẫn là
                            các điều kiện bắt buộc.
                        </p>
                    </div>
                    <div className="mt-4 grid gap-3 lg:grid-cols-2">
                        <div className="rounded-xl border border-zinc-200 bg-white p-4">
                            <p className="font-mono text-[10px] font-semibold tracking-widest text-zinc-400">
                                TRAINING INPUT
                            </p>
                            <ol className="mt-3 space-y-2 text-xs leading-5 text-zinc-600">
                                <li>
                                    <strong className="text-zinc-900">
                                        1.
                                    </strong>{' '}
                                    Dataset JSONL: mỗi dòng có{' '}
                                    <span className="font-mono">
                                        features[9]
                                    </span>{' '}
                                    và <span className="font-mono">label</span>{' '}
                                    0–1.
                                </li>
                                <li>
                                    <strong className="text-zinc-900">
                                        2.
                                    </strong>{' '}
                                    Validate dữ liệu: tối thiểu 20 dòng, có cả
                                    label thấp/cao, không có NaN/Infinity và mọi
                                    dòng đủ 9 giá trị.
                                </li>
                                <li>
                                    <strong className="text-zinc-900">
                                        3.
                                    </strong>{' '}
                                    Tách khoảng 80% train và 20% validation theo
                                    thứ tự dataset; dữ liệu nên được sắp theo
                                    thời gian để validation gần với dữ liệu
                                    tương lai.
                                </li>
                            </ol>
                        </div>
                        <div className="rounded-xl border border-zinc-200 p-4">
                            <p className="font-mono text-[10px] font-semibold tracking-widest text-zinc-400">
                                LIGHTGBM CONFIGURATION
                            </p>
                            <ul className="mt-3 space-y-2 text-xs leading-5 text-zinc-600">
                                <li>
                                    <strong className="text-zinc-900">
                                        Algorithm:
                                    </strong>{' '}
                                    gradient-boosted decision trees, phù hợp với
                                    dữ liệu dạng bảng và các quan hệ feature
                                    không tuyến tính.
                                </li>
                                <li>
                                    <strong className="text-zinc-900">
                                        Objective:
                                    </strong>{' '}
                                    <span className="font-mono">binary</span>;
                                    metric validation là{' '}
                                    <span className="font-mono">
                                        binary_logloss
                                    </span>
                                    .
                                </li>
                                <li>
                                    <strong className="text-zinc-900">
                                        Guardrail:
                                    </strong>{' '}
                                    learning rate 0,05, tối đa 200 rounds, early
                                    stopping sau 20 rounds không cải thiện, seed
                                    cố định 42 để tái lập.
                                </li>
                            </ul>
                        </div>
                    </div>
                    <div className="mt-3 grid gap-3 lg:grid-cols-2">
                        <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4">
                            <p className="text-[10px] font-semibold uppercase tracking-wide text-zinc-500">
                                Từ dữ liệu đến model artifact
                            </p>
                            <ol className="mt-3 space-y-2 text-[11px] leading-5 text-zinc-600">
                                <li>
                                    <strong className="text-zinc-900">
                                        01 · Ghi nhận:
                                    </strong>{' '}
                                    lấy các feature tại thời điểm candidate được
                                    hiển thị cùng kết quả tương tác thực tế.
                                </li>
                                <li>
                                    <strong className="text-zinc-900">
                                        02 · Gán label:
                                    </strong>{' '}
                                    chuyển tín hiệu kết quả thành nhãn 0–1;
                                    label phải phản ánh mục tiêu đã chọn, ví dụ
                                    click hoặc purchase, không được trộn tùy ý.
                                </li>
                                <li>
                                    <strong className="text-zinc-900">
                                        03 · Chia dữ liệu:
                                    </strong>{' '}
                                    80% đầu để học, 20% sau để kiểm tra. Chia
                                    theo thời gian giúp tránh dùng “tương lai”
                                    để dự đoán quá khứ.
                                </li>
                                <li>
                                    <strong className="text-zinc-900">
                                        04 · Học:
                                    </strong>{' '}
                                    LightGBM thêm từng cây để sửa sai số của
                                    ensemble hiện tại, đến khi đạt giới hạn hoặc
                                    validation không còn tốt hơn.
                                </li>
                                <li>
                                    <strong className="text-zinc-900">
                                        05 · Đóng gói:
                                    </strong>{' '}
                                    lưu artifact, model version và metadata; AI
                                    Service chỉ load khi số cột đúng 9, nếu
                                    không thì fallback.
                                </li>
                            </ol>
                        </div>
                        <div className="overflow-x-auto rounded-xl border border-zinc-200">
                            <table className="min-w-[620px] w-full border-collapse text-left text-[11px] leading-5">
                                <caption className="sr-only">
                                    Tham số huấn luyện LightGBM và tác dụng
                                </caption>
                                <thead className="bg-zinc-50 text-[10px] font-semibold uppercase tracking-wide text-zinc-500">
                                    <tr>
                                        <th className="px-3 py-2.5">Tham số</th>
                                        <th className="px-3 py-2.5">
                                            Giá trị hiện tại
                                        </th>
                                        <th className="px-3 py-2.5">
                                            Tác dụng
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-100 text-zinc-600">
                                    <tr>
                                        <td className="px-3 py-2.5 font-mono text-zinc-900">
                                            objective
                                        </td>
                                        <td className="px-3 py-2.5 font-mono">
                                            binary
                                        </td>
                                        <td className="px-3 py-2.5">
                                            Học điểm dự đoán cho label nhị
                                            phân/0–1 theo contract hiện tại.
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="px-3 py-2.5 font-mono text-zinc-900">
                                            metric
                                        </td>
                                        <td className="px-3 py-2.5 font-mono">
                                            binary_logloss
                                        </td>
                                        <td className="px-3 py-2.5">
                                            Đo mức lệch giữa dự đoán và label
                                            trên validation; thấp hơn là tốt
                                            hơn.
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="px-3 py-2.5 font-mono text-zinc-900">
                                            learning_rate
                                        </td>
                                        <td className="px-3 py-2.5 font-mono">
                                            0,05
                                        </td>
                                        <td className="px-3 py-2.5">
                                            Mỗi cây sửa một phần nhỏ, học chậm
                                            hơn nhưng giảm nguy cơ nhảy quá
                                            mạnh.
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="px-3 py-2.5 font-mono text-zinc-900">
                                            num_leaves
                                        </td>
                                        <td className="px-3 py-2.5 font-mono">
                                            31
                                        </td>
                                        <td className="px-3 py-2.5">
                                            Giới hạn độ phức tạp mỗi cây; cao
                                            hơn học được pattern sâu hơn nhưng
                                            dễ overfit.
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="px-3 py-2.5 font-mono text-zinc-900">
                                            feature/bagging_fraction
                                        </td>
                                        <td className="px-3 py-2.5 font-mono">
                                            0,9 / 0,9
                                        </td>
                                        <td className="px-3 py-2.5">
                                            Mỗi vòng chỉ dùng khoảng 90%
                                            feature/data để giảm phụ thuộc vào
                                            một mẫu duy nhất.
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="px-3 py-2.5 font-mono text-zinc-900">
                                            rounds / early stopping
                                        </td>
                                        <td className="px-3 py-2.5 font-mono">
                                            200 / 20
                                        </td>
                                        <td className="px-3 py-2.5">
                                            Tối đa 200 vòng; dừng nếu 20 vòng
                                            liên tiếp không cải thiện
                                            validation.
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="px-3 py-2.5 font-mono text-zinc-900">
                                            seed
                                        </td>
                                        <td className="px-3 py-2.5 font-mono">
                                            42
                                        </td>
                                        <td className="px-3 py-2.5">
                                            Giúp lần train lặp lại được trong
                                            cùng dữ liệu và cấu hình.
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <div className="mt-3 grid gap-2 md:grid-cols-3 text-[11px] leading-5 text-zinc-600">
                        <p className="rounded-xl border border-zinc-200 p-3">
                            <strong className="text-zinc-900">
                                Train xong:
                            </strong>{' '}
                            lưu LightGBM artifact và metadata như model version,
                            feature count, train rows, validation rows, best
                            iteration.
                        </p>
                        <p className="rounded-xl border border-zinc-200 p-3">
                            <strong className="text-zinc-900">Khi boot:</strong>{' '}
                            AI Service chỉ load artifact nếu model có đúng 9
                            feature; thiếu file hoặc sai count thì dùng
                            fallback.
                        </p>
                        <p className="rounded-xl border border-zinc-200 p-3">
                            <strong className="text-zinc-900">Đánh đổi:</strong>{' '}
                            LightGBM nhanh và nhẹ khi inference, nhưng chất
                            lượng phụ thuộc label, dữ liệu lịch sử và việc train
                            lại khi hành vi thay đổi.
                        </p>
                    </div>
                </section>

                <section
                    className="rounded-2xl border border-zinc-200 bg-white p-4 sm:p-5"
                    aria-label="Chín feature của AI ranking"
                >
                    <header className="border-b border-zinc-200 pb-3">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
                            05 · MODEL NHẬN 9 GIÁ TRỊ
                        </p>
                        <h5 className="mt-1 text-sm font-semibold text-zinc-950">
                            Feature vector được tạo ở Recommendation Service
                        </h5>
                    </header>
                    <div className="mt-4 overflow-x-auto rounded-xl border border-zinc-200">
                        <table className="min-w-[760px] w-full border-collapse text-left text-[11px] leading-5">
                            <caption className="sr-only">
                                Chín feature đầu vào của model AI, nguồn dữ liệu
                                và mục tiêu
                            </caption>
                            <thead className="bg-zinc-50 text-[10px] font-semibold uppercase tracking-wide text-zinc-500">
                                <tr>
                                    <th className="px-3 py-2.5">Feature</th>
                                    <th className="px-3 py-2.5">Đang đo gì?</th>
                                    <th className="px-3 py-2.5">
                                        Lấy từ đâu / cách tính
                                    </th>
                                    <th className="px-3 py-2.5">
                                        Mục tiêu và đánh đổi
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-100 text-zinc-600">
                                <tr>
                                    <td className="px-3 py-2.5 font-mono text-zinc-900">
                                        profileAffinity
                                    </td>
                                    <td className="px-3 py-2.5">
                                        Mức hợp với sở thích dài hạn.
                                    </td>
                                    <td className="px-3 py-2.5">
                                        Preference theo product/category/brand,
                                        có decay theo thời gian.
                                    </td>
                                    <td className="px-3 py-2.5">
                                        Cá nhân hóa tốt; có thể lặp sở thích cũ.
                                    </td>
                                </tr>
                                <tr>
                                    <td className="px-3 py-2.5 font-mono text-zinc-900">
                                        sessionContext
                                    </td>
                                    <td className="px-3 py-2.5">
                                        Ý định trong phiên hiện tại.
                                    </td>
                                    <td className="px-3 py-2.5">
                                        Match category, brand và sản phẩm neo
                                        gần đây.
                                    </td>
                                    <td className="px-3 py-2.5">
                                        Bắt kịp nhu cầu nhanh; có thể nhiễu nếu
                                        phiên ngắn.
                                    </td>
                                </tr>
                                <tr>
                                    <td className="px-3 py-2.5 font-mono text-zinc-900">
                                        semanticSimilarity
                                    </td>
                                    <td className="px-3 py-2.5">
                                        Độ gần về nội dung.
                                    </td>
                                    <td className="px-3 py-2.5">
                                        Raw similarity từ embedding/Qdrant,
                                        clamp về 0–1.
                                    </td>
                                    <td className="px-3 py-2.5">
                                        Tìm item tương tự; phụ thuộc catalog và
                                        vector mới.
                                    </td>
                                </tr>
                                <tr>
                                    <td className="px-3 py-2.5 font-mono text-zinc-900">
                                        coBehavior
                                    </td>
                                    <td className="px-3 py-2.5">
                                        Mức thường đi cùng item khác.
                                    </td>
                                    <td className="px-3 py-2.5">
                                        Quan hệ xem/giỏ/mua, chuẩn hóa bằng{' '}
                                        <span className="font-mono">
                                            raw/(raw + scale)
                                        </span>
                                        .
                                    </td>
                                    <td className="px-3 py-2.5">
                                        Tận dụng hành vi cộng đồng; yếu ở
                                        cold-start.
                                    </td>
                                </tr>
                                <tr>
                                    <td className="px-3 py-2.5 font-mono text-zinc-900">
                                        popularity
                                    </td>
                                    <td className="px-3 py-2.5">
                                        Nhu cầu chung của sản phẩm.
                                    </td>
                                    <td className="px-3 py-2.5">
                                        Max giữa{' '}
                                        <span className="font-mono">
                                            log1p(totalSold)/12
                                        </span>{' '}
                                        và rank trending/best-selling.
                                    </td>
                                    <td className="px-3 py-2.5">
                                        Có điểm tựa khi thiếu profile; tránh để
                                        item hot lấn át cá nhân hóa.
                                    </td>
                                </tr>
                                <tr>
                                    <td className="px-3 py-2.5 font-mono text-zinc-900">
                                        freshness
                                    </td>
                                    <td className="px-3 py-2.5">
                                        Sản phẩm mới đến mức nào.
                                    </td>
                                    <td className="px-3 py-2.5">
                                        Bucket theo tuổi: 1, 7, 30 và 90 ngày.
                                    </td>
                                    <td className="px-3 py-2.5">
                                        Tạo cơ hội cho item mới; item mới chưa
                                        chắc phù hợp.
                                    </td>
                                </tr>
                                <tr>
                                    <td className="px-3 py-2.5 font-mono text-zinc-900">
                                        quality
                                    </td>
                                    <td className="px-3 py-2.5">
                                        Chất lượng và khả năng phục vụ.
                                    </td>
                                    <td className="px-3 py-2.5">
                                        Rating 55%, review 25%, còn hàng 20%.
                                    </td>
                                    <td className="px-3 py-2.5">
                                        Ưu tiên item đáng tin; shop mới ít
                                        review có thể bất lợi.
                                    </td>
                                </tr>
                                <tr>
                                    <td className="px-3 py-2.5 font-mono text-zinc-900">
                                        exploration
                                    </td>
                                    <td className="px-3 py-2.5">
                                        Cơ hội khám phá sản phẩm mới.
                                    </td>
                                    <td className="px-3 py-2.5">
                                        Chỉ bật khi affinity ≤ 0,4 và source là
                                        EXPLORE/NEWEST.
                                    </td>
                                    <td className="px-3 py-2.5">
                                        Tăng discovery; có thể giảm precision
                                        tức thời.
                                    </td>
                                </tr>
                                <tr>
                                    <td className="px-3 py-2.5 font-mono text-zinc-900">
                                        negativePenalty
                                    </td>
                                    <td className="px-3 py-2.5">
                                        Mức không phù hợp cần trừ.
                                    </td>
                                    <td className="px-3 py-2.5">
                                        Preference âm đã decay, cộng theo
                                        product/category/brand, tối đa 0,15.
                                    </td>
                                    <td className="px-3 py-2.5">
                                        Giảm lặp item không thích; cần decay để
                                        không phạt nhầm tín hiệu cũ.
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </section>

                <section
                    className="grid gap-3"
                    aria-label="Ví dụ blend và fallback"
                >
                    <div className="rounded-2xl border border-zinc-200 bg-white p-4 sm:p-5">
                        <div className="flex items-center gap-2">
                            <Database
                                aria-hidden="true"
                                className="size-4 text-zinc-700"
                            />
                            <h5 className="text-sm font-semibold text-zinc-950">
                                Ví dụ λ = 0,3
                            </h5>
                        </div>
                        <p className="mt-2 text-xs leading-5 text-zinc-600">
                            Giả sử{' '}
                            <span className="font-mono">
                                S_standard = 0,653
                            </span>{' '}
                            và <span className="font-mono">S_AI = 0,800</span>:
                        </p>
                        <code className="mt-3 block rounded-xl bg-zinc-50 p-3 font-mono text-xs leading-6 text-zinc-900">
                            S_final = (1 − 0,3) × 0,653 + 0,3 × 0,800
                            <br />= 0,4571 + 0,2400 = 0,6971
                        </code>
                        <p className="mt-2 text-[11px] leading-5 text-zinc-500">
                            Standard đóng góp 70%, AI đóng góp 30%. 0,6971 là
                            ranking score, không phải xác suất mua 69,71%.
                        </p>
                        <div className="mt-3 grid gap-2 text-[11px] leading-5 text-zinc-600 sm:grid-cols-3">
                            <p className="rounded-lg border border-zinc-200 p-2.5">
                                <strong className="text-zinc-900">
                                    0,653:
                                </strong>{' '}
                                điểm Standard đã tính từ 8 feature và penalty.
                            </p>
                            <p className="rounded-lg border border-zinc-200 p-2.5">
                                <strong className="text-zinc-900">
                                    0,800:
                                </strong>{' '}
                                điểm model dự đoán từ 9 feature của cùng
                                candidate.
                            </p>
                            <p className="rounded-lg border border-zinc-200 p-2.5">
                                <strong className="text-zinc-900">
                                    0,6971:
                                </strong>{' '}
                                điểm cuối dùng để sort trước diversity/quota.
                            </p>
                        </div>
                        <p className="mt-3 text-[11px] leading-5 text-zinc-600">
                            <strong className="text-zinc-900">
                                Ảnh hưởng lên thứ tự:
                            </strong>{' '}
                            nếu AI đánh giá candidate cao hơn Standard, điểm
                            cuối có thể tăng; nếu AI thấp hơn, điểm có thể giảm.
                            Mức thay đổi bị giới hạn bởi λ, nên AI không thể tự
                            thay thế hoàn toàn baseline.
                        </p>
                    </div>
                    <div className="rounded-2xl border border-zinc-200 bg-white p-4 sm:p-5">
                        <div className="flex items-center gap-2">
                            <ShieldCheck
                                aria-hidden="true"
                                className="size-4 text-zinc-700"
                            />
                            <h5 className="text-sm font-semibold text-zinc-950">
                                Fallback và response contract
                            </h5>
                        </div>
                        <p className="mt-2 text-[11px] leading-5 text-zinc-600">
                            Fallback không phải là xóa kết quả. Hệ thống bỏ phần
                            điểm AI không đáng tin, giữ điểm Standard đã tính và
                            tiếp tục trả danh sách cho người dùng.
                        </p>
                        <div className="mt-3 overflow-x-auto rounded-xl border border-zinc-200">
                            <table className="min-w-[620px] w-full border-collapse text-left text-[11px] leading-5">
                                <caption className="sr-only">
                                    Các điều kiện fallback của AI Enhanced
                                    Ranking
                                </caption>
                                <thead className="bg-zinc-50 text-[10px] font-semibold uppercase tracking-wide text-zinc-500">
                                    <tr>
                                        <th className="px-3 py-2.5">
                                            Điều kiện
                                        </th>
                                        <th className="px-3 py-2.5">
                                            Điểm được dùng
                                        </th>
                                        <th className="px-3 py-2.5">
                                            Metadata response
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-100 text-zinc-600">
                                    <tr>
                                        <td className="px-3 py-2.5">
                                            Policy AI tắt
                                        </td>
                                        <td className="px-3 py-2.5">
                                            100% Standard
                                        </td>
                                        <td className="px-3 py-2.5 font-mono">
                                            HYBRID · modelVersion=null · rankingMode=HYBRID
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="px-3 py-2.5">
                                            Model chưa sẵn sàng hoặc không có
                                            artifact thật
                                        </td>
                                        <td className="px-3 py-2.5">
                                            100% Standard
                                        </td>
                                        <td className="px-3 py-2.5 font-mono">
                                            HYBRID · ghi nhận Standard/Fallback
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="px-3 py-2.5">
                                            Timeout, lỗi HTTP hoặc response sai
                                            schema
                                        </td>
                                        <td className="px-3 py-2.5">
                                            100% Standard
                                        </td>
                                        <td className="px-3 py-2.5 font-mono">
                                            HYBRID · modelVersion=null · rankingMode=HYBRID
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="px-3 py-2.5">
                                            Artifact thật trả prediction hợp lệ
                                        </td>
                                        <td className="px-3 py-2.5">
                                            Blend theo λ
                                        </td>
                                        <td className="px-3 py-2.5 font-mono">
                                            ML_HYBRID · modelVersion · rankingMode=ML_HYBRID
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <ul className="mt-3 space-y-2 text-xs leading-5 text-zinc-600">
                            <li className="flex gap-2">
                                <CheckCircle2
                                    aria-hidden="true"
                                    className="mt-0.5 size-3.5 shrink-0 text-zinc-500"
                                />
                                <span>
                                    <strong className="text-zinc-900">
                                        Không ghi nhận nhầm:
                                    </strong>{' '}
                                    model trả{' '}
                                    <span className="font-mono">
                                        ranking-fallback-v1
                                    </span>{' '}
                                    không được xem là AI treatment.
                                </span>
                            </li>
                            <li className="flex gap-2">
                                <CheckCircle2
                                    aria-hidden="true"
                                    className="mt-0.5 size-3.5 shrink-0 text-zinc-500"
                                />
                                <span>
                                    <strong className="text-zinc-900">
                                        Không làm hỏng response:
                                    </strong>{' '}
                                    lỗi AI chỉ làm mất phần đóng góp AI, không
                                    làm mất recommendation.
                                </span>
                            </li>
                        </ul>
                    </div>
                </section>
            </div>
        </RecommendationDisclosure>
    );
}

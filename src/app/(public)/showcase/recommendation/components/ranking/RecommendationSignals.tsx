// Diễn giải đường đi từ hành vi người mua đến candidate pool; không xếp hạng thay cho mục công thức kế tiếp.
import {
    ArrowRight,
    ChevronDown,
    Clock3,
    Database,
    UserRound,
    ShoppingCart,
    Compass,
} from 'lucide-react';
import type { ReactNode } from 'react';
import { CoBehaviorFlow } from '../flows/CoBehaviorFlow';
import { CatalogAffinityFlow } from '../flows/CatalogAffinityFlow';
import { ColdStartFlow } from '../flows/ColdStartFlow';
import { RecommendationDisclosure } from '../shared/RecommendationDisclosure';
import { RecommendationStepHeader } from '../shared/RecommendationStepHeader';
import { SemanticSimilarityFlow } from '../flows/SemanticSimilarityFlow';

interface SignalFactProps {
    label: string;
    children: ReactNode;
}

// Giữ nhãn “vì sao/cách dùng/áp dụng/đánh đổi” nhất quán để người đọc quét nhanh từng tín hiệu.
function SignalFact({ label, children }: SignalFactProps) {
    return (
        <div>
            <dt className="text-[10px] font-semibold uppercase tracking-wide text-zinc-400">
                {label}
            </dt>
            <dd className="mt-1 text-xs leading-5 text-zinc-600">{children}</dd>
        </div>
    );
}

const behaviorWeights = [
    {
        event: 'Impression',
        code: 'PRODUCT_IMPRESSED',
        value: '0,05',
        comparison: '1/20 điểm xem thô',
        explanation:
            'Chỉ xác nhận sản phẩm đã xuất hiện. 20 impression cùng một sản phẩm cộng bằng +1 trước suy giảm thời gian, tránh exposure lấn át ý định thật.',
    },
    {
        event: 'Xem sản phẩm',
        code: 'PRODUCT_VIEWED',
        value: '1',
        comparison: 'Mốc chuẩn',
        explanation:
            'Một lần mở trang sản phẩm cộng một đơn vị. Chọn mốc 1 để các hành vi khác có thể đọc thành bội số dễ so sánh.',
    },
    {
        event: 'Tìm kiếm',
        code: 'SEARCH_PERFORMED',
        value: '1,5',
        comparison: 'Giữa xem và click',
        explanation:
            'Tìm kiếm chủ động hơn lướt xem nhưng chưa gắn chắc với một sản phẩm. Hiện điểm được lưu ở QUERY, request chưa dùng chiều này để gợi ý.',
    },
    {
        event: 'Click',
        code: 'PRODUCT_CLICKED',
        value: '2',
        comparison: '2 điểm xem',
        explanation:
            'Mở sản phẩm được tính gấp đôi lượt xem vì có hành động chủ động; vẫn thấp hơn giỏ hàng vì chưa thể hiện ý định mua.',
    },
    {
        event: 'Thêm vào giỏ',
        code: 'PRODUCT_ADDED_TO_CART',
        value: '4',
        comparison: '2 click · 4 điểm xem',
        explanation:
            'Tín hiệu mua mạnh hơn mở trang nhưng chưa phải giao dịch đã xác nhận, nên giữ dưới mức +8 của đơn hoàn tất.',
    },
    {
        event: 'Xóa khỏi giỏ',
        code: 'PRODUCT_REMOVED_FROM_CART',
        value: '−2',
        comparison: 'Giảm một nửa điểm thêm giỏ',
        explanation:
            'Nếu thêm giỏ +4 rồi xóa −2, hồ sơ còn +2: giảm ý định mua nhưng không xóa lịch sử xem. Đây là điều chỉnh nhẹ hơn một lần trả hàng.',
    },
    {
        event: 'Đơn hoàn tất',
        code: 'order.purchase.completed',
        value: '+8',
        comparison: '2 lần thêm giỏ / sản phẩm',
        explanation:
            'Đơn đã xác nhận là tín hiệu mạnh nhất. Điểm nhân với số lượng: mua 2 sản phẩm cùng mã cộng +16 vào preference sản phẩm và danh mục nếu có mã.',
    },
    {
        event: 'Đơn trả hàng',
        code: 'order.purchase.returned',
        value: '−8',
        comparison: 'Đảo điểm theo lượng trả',
        explanation:
            'Cùng độ lớn ngược dấu với mua hàng: trả 1 sản phẩm trừ −8, trả một phần chỉ hiệu chỉnh đúng số lượng đã trả.',
    },
];

// Dẫn từ ngữ cảnh đến candidate pool và làm rõ strategy chỉ chọn nguồn đầu vào; ranking mới quyết định thứ tự hiển thị.
export function RecommendationSignals() {
    return (
        <section className="space-y-5">
            <section
                className="rounded-2xl border border-zinc-200 bg-white p-4 sm:p-5"
                aria-label="Luồng tạo danh sách ứng viên"
            >
                <ol
                    className="grid gap-x-2 gap-y-1 sm:grid-cols-2 xl:grid-cols-4"
                    aria-label="Bốn bước tạo gợi ý"
                >
                    <li className="flex items-start justify-between gap-2 border-b border-zinc-200 py-2.5 sm:border-b-0 xl:py-2">
                        <span className="flex items-start gap-3">
                            <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-zinc-100 font-mono text-[10px] font-semibold text-zinc-600">
                                01
                            </span>
                            <span>
                                <strong className="block text-xs font-semibold text-zinc-950">
                                    Đọc tín hiệu
                                </strong>
                                <span className="mt-1 block text-[11px] leading-4 text-zinc-500">
                                    Hồ sơ dài hạn + phiên hiện tại
                                </span>
                            </span>
                        </span>
                        <ArrowRight
                            aria-hidden="true"
                            className="mt-1 hidden size-3.5 shrink-0 text-zinc-400 xl:block"
                        />
                    </li>
                    <li className="flex items-start justify-between gap-2 border-b border-zinc-200 py-2.5 sm:border-b-0 xl:border-l xl:pl-3 xl:py-2">
                        <span className="flex items-start gap-3">
                            <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-zinc-100 font-mono text-[10px] font-semibold text-zinc-600">
                                02
                            </span>
                            <span>
                                <strong className="block text-xs font-semibold text-zinc-950">
                                    Tìm nhiều nguồn
                                </strong>
                                <span className="mt-1 block text-[11px] leading-4 text-zinc-500">
                                    Catalog · Qdrant · quan hệ hành vi
                                </span>
                            </span>
                        </span>
                        <ArrowRight
                            aria-hidden="true"
                            className="mt-1 hidden size-3.5 shrink-0 text-zinc-400 xl:block"
                        />
                    </li>
                    <li className="flex items-start justify-between gap-2 border-b border-zinc-200 py-2.5 sm:border-b-0 xl:border-l xl:pl-3 xl:py-2">
                        <span className="flex items-start gap-3">
                            <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-zinc-100 font-mono text-[10px] font-semibold text-zinc-600">
                                03
                            </span>
                            <span>
                                <strong className="block text-xs font-semibold text-zinc-950">
                                    Gộp và giới hạn
                                </strong>
                                <span className="mt-1 block text-[11px] leading-4 text-zinc-500">
                                    Bỏ trùng · giữ nguồn · tối đa 300
                                </span>
                            </span>
                        </span>
                        <ArrowRight
                            aria-hidden="true"
                            className="mt-1 hidden size-3.5 shrink-0 text-zinc-400 xl:block"
                        />
                    </li>
                    <li className="flex items-start gap-3 py-2.5 xl:border-l xl:pl-3 xl:py-2">
                        <span className="grid size-7 shrink-0 place-items-center rounded-lg border border-zinc-200 bg-white font-mono text-[10px] font-semibold text-zinc-700">
                            04
                        </span>
                        <span>
                            <strong className="block text-xs font-semibold text-zinc-950">
                                Chuyển sang ranking
                            </strong>
                            <span className="mt-1 block text-[11px] leading-4 text-zinc-600">
                                Nguồn không tự quyết định vị trí
                            </span>
                        </span>
                    </li>
                </ol>
            </section>

            <RecommendationDisclosure
                id="recommendation-signal-context"
                number="2.1.1"
                title="Đọc hai lớp tín hiệu, không trộn lịch sử với ý định mới"
                description="Hồ sơ cho biết người mua thường quan tâm gì; session phản ánh điều họ đang xem hoặc làm trong phiên này."
                level={4}
                variant="flow"
            >
                <div className="space-y-4">
                    <div className="grid items-stretch gap-5 lg:grid-cols-2">
                        <article className="flex h-full flex-col rounded-2xl border border-zinc-200 bg-white p-4 sm:p-5">
                            <div className="relative flex items-center gap-3 pb-3 after:absolute after:inset-x-0 after:bottom-0 after:h-px after:bg-zinc-200 after:content-['']">
                                <span className="grid size-9 place-items-center rounded-xl bg-zinc-100 text-zinc-700">
                                    <Database
                                        aria-hidden="true"
                                        className="size-4"
                                    />
                                </span>
                                <div>
                                    <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-zinc-500">
                                        Dữ liệu bền vững · PostgreSQL
                                    </p>
                                    <h4 className="mt-0.5 text-sm font-semibold text-zinc-950">
                                        Hồ sơ sở thích dài hạn
                                    </h4>
                                </div>
                            </div>
                            <dl className="mt-3 grid flex-1 gap-x-4 gap-y-3 sm:grid-cols-2">
                                <SignalFact label="Vì sao dùng">
                                    Giữ sở thích đã tích lũy theo user; khách
                                    chưa đăng nhập vẫn có profile theo session,
                                    nhưng không thành hồ sơ xuyên phiên.
                                </SignalFact>
                                <SignalFact label="Cách hình thành">
                                    Consumer xử lý event rồi cộng/trừ preference
                                    theo sản phẩm, danh mục và thương hiệu; cập
                                    nhật bất đồng bộ sau request.
                                </SignalFact>
                                <SignalFact label="Áp dụng vào đâu">
                                    Bước tạo ứng viên lấy tối đa 30 sản phẩm, 12
                                    danh mục, 12 thương hiệu có điểm dương. Điểm
                                    âm được giữ riêng để ranking áp penalty;
                                    giới hạn này giữ phần đọc/tính điểm gọn.
                                </SignalFact>
                                <SignalFact label="Trade-off">
                                    Top 30/12/12 bỏ bớt sở thích yếu để giới hạn
                                    query/feature; tăng thì tốn đọc/chấm điểm,
                                    giảm thì mất độ phủ. Half-life mặc định 7
                                    ngày làm điểm giảm một nửa mỗi tuần: đổi
                                    dần, không tức thì.
                                </SignalFact>
                            </dl>
                        </article>

                        <article className="flex h-full flex-col rounded-2xl border border-zinc-200 bg-white p-4 sm:p-5">
                            <div className="relative flex items-center gap-3 pb-3 after:absolute after:inset-x-0 after:bottom-0 after:h-px after:bg-zinc-200 after:content-['']">
                                <span className="grid size-9 place-items-center rounded-xl bg-zinc-100 text-zinc-700">
                                    <Clock3
                                        aria-hidden="true"
                                        className="size-4"
                                    />
                                </span>
                                <div>
                                    <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-zinc-500">
                                        Ý định ngắn hạn · Redis
                                    </p>
                                    <h4 className="mt-0.5 text-sm font-semibold text-zinc-950">
                                        Ngữ cảnh phiên hiện tại
                                    </h4>
                                </div>
                            </div>
                            <dl className="mt-3 grid flex-1 gap-x-4 gap-y-3 sm:grid-cols-2">
                                <SignalFact label="Vì sao dùng">
                                    Bắt kịp nhu cầu vừa đổi, kể cả khi người mua
                                    chưa đăng nhập hoặc hồ sơ dài hạn nói về
                                    nhóm hàng khác.
                                </SignalFact>
                                <SignalFact label="Cách lưu">
                                    Giữ sản phẩm, danh mục, thương hiệu, từ khóa
                                    và giỏ hàng gần đây; tối đa 30 sản phẩm, TTL
                                    mặc định 24 giờ.
                                </SignalFact>
                                <SignalFact label="Áp dụng vào đâu">
                                    Danh mục/thương hiệu phiên mở rộng nguồn
                                    catalog; sản phẩm đang xem và gần đây làm
                                    anchor semantic/co-behavior; ranking nhận
                                    feature sessionContext.
                                </SignalFact>
                                <SignalFact label="Trade-off">
                                    30 sản phẩm/24 giờ là mặc định để giữ mạch
                                    mua sắm mà không giữ session vô hạn; ngắn
                                    hơn dễ quên ý định, dài hơn dễ bám ngữ cảnh
                                    cũ. Impression không thành anchor; raw query
                                    được lưu nhưng chưa trực tiếp lọc
                                    candidate/chấm điểm.
                                </SignalFact>
                            </dl>
                        </article>
                    </div>

                    <section
                        className="rounded-2xl border border-zinc-200 bg-white p-4 sm:p-5"
                        aria-labelledby="recommendation-strategy-title"
                    >
                        <div className="border-b border-zinc-200 py-3">
                            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                                <div>
                                    <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-500">
                                        Chọn cách tìm ứng viên
                                    </p>
                                    <h4
                                        id="recommendation-strategy-title"
                                        className="mt-1 text-sm font-semibold text-zinc-950"
                                    >
                                        Có dữ liệu nào, dùng chiến lược đó
                                    </h4>
                                </div>
                                <p className="max-w-xl text-xs leading-5 text-zinc-600">
                                    Hồ sơ là sở thích đã tích lũy; phiên là sản
                                    phẩm hoặc danh mục người mua đang xem lúc
                                    này.
                                </p>
                            </div>
                        </div>

                        <div className="grid gap-4 py-4 md:grid-cols-3 md:divide-x md:divide-zinc-200">
                            <article className="flex h-full flex-col md:pr-4">
                                <div className="flex items-center justify-between gap-3">
                                    <span className="inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-zinc-500">
                                        <span className="grid size-6 place-items-center rounded-lg bg-zinc-100 font-mono">
                                            01
                                        </span>
                                        Có sở thích tích lũy
                                    </span>
                                    <UserRound
                                        aria-hidden="true"
                                        className="size-4 text-zinc-400"
                                    />
                                </div>
                                <p className="mt-3 font-mono text-xs font-semibold text-zinc-950">
                                    PERSONALIZED
                                </p>
                                <p className="mt-1 text-xs leading-5 text-zinc-600">
                                    Ưu tiên sở thích đã tích lũy; hoạt động
                                    trong phiên và nguồn catalog vẫn có thể bổ
                                    sung sản phẩm.
                                </p>
                                <div className="mt-auto flex flex-wrap gap-1.5 pt-4">
                                    <span className="rounded-full border border-zinc-200 bg-white px-2 py-1 text-[10px] text-zinc-600">
                                        Hồ sơ
                                    </span>
                                    <span className="rounded-full border border-zinc-200 bg-white px-2 py-1 text-[10px] text-zinc-600">
                                        Phiên hiện tại
                                    </span>
                                    <span className="rounded-full border border-zinc-200 bg-white px-2 py-1 text-[10px] text-zinc-600">
                                        Catalog
                                    </span>
                                </div>
                            </article>

                            <article className="flex h-full flex-col md:px-4">
                                <div className="flex items-center justify-between gap-3">
                                    <span className="inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-zinc-500">
                                        <span className="grid size-6 place-items-center rounded-lg bg-zinc-100 font-mono">
                                            02
                                        </span>
                                        Chưa có sở thích · có hoạt động phiên
                                    </span>
                                    <Clock3
                                        aria-hidden="true"
                                        className="size-4 text-zinc-400"
                                    />
                                </div>
                                <p className="mt-3 font-mono text-xs font-semibold text-zinc-950">
                                    SESSION_BASED
                                </p>
                                <p className="mt-1 text-xs leading-5 text-zinc-600">
                                    Chưa có sở thích ghi nhận nhưng đang xem sản
                                    phẩm hoặc danh mục? Dùng hoạt động trong
                                    phiên làm tín hiệu, kể cả với khách chưa
                                    đăng nhập.
                                </p>
                                <div className="mt-auto flex flex-wrap gap-1.5 pt-4">
                                    <span className="rounded-full border border-zinc-200 bg-white px-2 py-1 text-[10px] text-zinc-600">
                                        Sản phẩm vừa xem
                                    </span>
                                    <span className="rounded-full border border-zinc-200 bg-white px-2 py-1 text-[10px] text-zinc-600">
                                        Danh mục / thương hiệu
                                    </span>
                                </div>
                            </article>

                            <article className="flex h-full flex-col md:pl-4">
                                <div className="flex items-center justify-between gap-3">
                                    <span className="inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-zinc-500">
                                        <span className="grid size-6 place-items-center rounded-lg bg-zinc-100 font-mono">
                                            03
                                        </span>
                                        Chưa có sở thích · chưa có hoạt động
                                        phiên
                                    </span>
                                    <Compass
                                        aria-hidden="true"
                                        className="size-4 text-zinc-400"
                                    />
                                </div>
                                <p className="mt-3 font-mono text-xs font-semibold text-zinc-950">
                                    COLD_START
                                </p>
                                <p className="mt-1 text-xs leading-5 text-zinc-600">
                                    Tạo danh sách mở đầu từ hàng bán chạy, hàng
                                    mới và khám phá; xu hướng vẫn được bổ sung
                                    riêng.
                                </p>
                                <div className="mt-auto flex flex-wrap gap-1.5 pt-4">
                                    <span className="rounded-full border border-zinc-200 bg-white px-2 py-1 text-[10px] text-zinc-600">
                                        Bán chạy
                                    </span>
                                    <span className="rounded-full border border-zinc-200 bg-white px-2 py-1 text-[10px] text-zinc-600">
                                        Hàng mới
                                    </span>
                                    <span className="rounded-full border border-zinc-200 bg-white px-2 py-1 text-[10px] text-zinc-600">
                                        Khám phá
                                    </span>
                                </div>
                            </article>
                        </div>
                    </section>

                    <aside className="rounded-2xl border border-zinc-200 bg-white p-4 sm:p-5">
                        <div className="border-b border-zinc-200 py-3">
                            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-500">
                                Ví dụ · hồ sơ và phiên không ghi đè nhau
                            </p>
                            <p className="mt-1 text-xs leading-5 text-zinc-600">
                                Người mua thường xem giày nhưng hôm nay lại xem
                                máy pha cà phê. Hệ thống giữ cả hai tín hiệu để
                                tìm ứng viên liên quan.
                            </p>
                        </div>

                        <div className="grid gap-2 py-3 sm:grid-cols-[1fr_auto_1fr_auto_1.2fr] sm:items-center">
                            <div className="py-2 sm:pr-3">
                                <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
                                    Hồ sơ dài hạn
                                </p>
                                <p className="mt-1 text-xs font-semibold text-zinc-950">
                                    Thường xem giày
                                </p>
                            </div>
                            <span className="hidden text-sm font-medium text-zinc-400 sm:block">
                                +
                            </span>
                            <div className="border-t border-zinc-200 py-2 sm:border-l sm:border-t-0 sm:px-3">
                                <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
                                    Phiên hiện tại
                                </p>
                                <p className="mt-1 text-xs font-semibold text-zinc-950">
                                    Đang xem máy pha cà phê
                                </p>
                            </div>
                            <ArrowRight
                                aria-hidden="true"
                                className="mx-auto size-4 rotate-90 text-zinc-400 sm:rotate-0"
                            />
                            <div className="border-t border-zinc-200 py-2 sm:border-l sm:border-t-0 sm:pl-3">
                                <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
                                    Sau đó
                                </p>
                                <p className="mt-1 text-xs font-semibold text-zinc-950">
                                    Tạo pool → mới xếp hạng
                                </p>
                                <p className="mt-1 text-[10px] leading-4 text-zinc-600">
                                    Event vừa phát sinh chỉ ảnh hưởng request
                                    sau khi consumer xử lý.
                                </p>
                            </div>
                        </div>
                    </aside>
                </div>
            </RecommendationDisclosure>

            <RecommendationDisclosure
                id="recommendation-event-weights"
                number="2.1.2"
                title="Vì sao lượt xem là +1, còn đơn hoàn tất là +8?"
                description="Đây là thang heuristic để so sánh mức độ tín hiệu trong hồ sơ sở thích — không phải xác suất mua hay điểm xếp hạng cuối."
                level={4}
                variant="flow"
            >
                <div className="grid gap-3 py-4 sm:grid-cols-2 xl:grid-cols-3">
                    <article className="flex h-full flex-col rounded-xl border border-zinc-200 bg-white p-4">
                        <div className="flex items-center gap-2">
                            <span className="grid size-7 shrink-0 place-items-center rounded-lg border border-zinc-200 bg-white font-mono text-[11px] font-semibold text-zinc-700">
                                01
                            </span>
                            <h5 className="text-sm font-semibold text-zinc-950">
                                Lấy lượt xem làm mốc
                            </h5>
                        </div>
                        <p className="mt-2 flex-1 text-xs leading-5 text-zinc-600">
                            Một lần mở trang sản phẩm được tính +1. Các hành vi
                            khác quy đổi theo mốc này để dễ so sánh và điều
                            chỉnh.
                        </p>
                        <p className="mt-3 rounded-lg bg-zinc-50 px-3 py-2 text-xs text-zinc-700">
                            <strong className="font-mono text-base font-semibold text-zinc-950">
                                +1
                            </strong>
                            <span className="mx-1.5 text-zinc-400">=</span>
                            một lượt xem sản phẩm
                        </p>
                    </article>
                    <article className="flex h-full flex-col rounded-xl border border-zinc-200 bg-white p-4">
                        <div className="flex items-center gap-2">
                            <span className="grid size-7 shrink-0 place-items-center rounded-lg border border-zinc-200 bg-white font-mono text-[11px] font-semibold text-zinc-700">
                                02
                            </span>
                            <h5 className="text-sm font-semibold text-zinc-950">
                                Ý định càng rõ, điểm càng cao
                            </h5>
                        </div>
                        <p className="mt-2 flex-1 text-xs leading-5 text-zinc-600">
                            Impression được tính rất nhẹ; click và thêm giỏ thể
                            hiện quan tâm rõ hơn. Đơn hoàn tất là tín hiệu mạnh
                            nhất.
                        </p>
                        <div className="mt-3 rounded-lg bg-zinc-50 px-3 py-2">
                            <p className="flex flex-wrap items-center gap-x-2 font-mono text-sm font-semibold text-zinc-950">
                                <span>0,05</span>
                                <span className="text-zinc-400">→</span>
                                <span>2</span>
                                <span className="text-zinc-400">→</span>
                                <span>4</span>
                                <span className="text-zinc-400">→</span>
                                <span>8</span>
                            </p>
                            <p className="mt-1 text-[10px] leading-4 text-zinc-500">
                                Hiển thị → click → giỏ → mua
                            </p>
                        </div>
                    </article>
                    <article className="flex h-full flex-col rounded-xl border border-zinc-200 bg-white p-4">
                        <div className="flex items-center gap-2">
                            <span className="grid size-7 shrink-0 place-items-center rounded-lg border border-zinc-200 bg-white font-mono text-[11px] font-semibold text-zinc-700">
                                03
                            </span>
                            <h5 className="text-sm font-semibold text-zinc-950">
                                Bỏ giỏ và trả hàng sẽ trừ điểm
                            </h5>
                        </div>
                        <p className="mt-2 flex-1 text-xs leading-5 text-zinc-600">
                            Bỏ giỏ chỉ trừ một phần điểm; trả hàng đảo điểm mua
                            theo đúng số lượng được trả.
                        </p>
                        <p className="mt-3 rounded-lg bg-zinc-50 px-3 py-2 text-xs text-zinc-700">
                            Bỏ giỏ{' '}
                            <strong className="font-mono text-sm font-semibold text-zinc-950">
                                −2
                            </strong>
                            <span className="mx-2 text-zinc-400">·</span>
                            Trả hàng{' '}
                            <strong className="font-mono text-sm font-semibold text-zinc-950">
                                −8 / sản phẩm
                            </strong>
                        </p>
                        <p className="mt-2 text-[10px] leading-4 text-zinc-500">
                            Mặc định trong{' '}
                            <code className="text-zinc-700">
                                RecommendationRuleService
                            </code>
                            ; có thể ghi đè bằng{' '}
                            <code className="text-zinc-700">
                                RECOMMENDATION_WEIGHT_*
                            </code>
                            .
                        </p>
                    </article>
                    <div className="rounded-xl border border-zinc-200 bg-white p-3 sm:col-span-3">
                        <div className="grid gap-2 lg:grid-cols-[10rem_minmax(0,1fr)]">
                            <div className="flex items-center gap-3 border-b border-zinc-200 px-1 py-2.5 lg:border-b-0 lg:pr-4">
                                <span className="font-mono text-2xl font-semibold tracking-tight text-zinc-950">
                                    +1
                                </span>
                                <span>
                                    <span className="block text-[9px] font-semibold uppercase tracking-[0.12em] text-zinc-500">
                                        Mốc chuẩn
                                    </span>
                                    <span className="mt-0.5 block text-xs font-semibold text-zinc-800">
                                        Một lượt xem
                                    </span>
                                </span>
                            </div>
                            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-5">
                                <div className="border-b border-zinc-200 px-2 py-2 xl:border-b-0 xl:border-l">
                                    <p className="text-[9px] font-semibold uppercase tracking-[0.1em] text-zinc-500">
                                        Impression
                                    </p>
                                    <p className="mt-1 text-xs font-semibold text-zinc-900">
                                        +0,05{' '}
                                        <span className="font-normal text-zinc-500">
                                            · 1/20 lượt xem
                                        </span>
                                    </p>
                                </div>
                                <div className="border-b border-zinc-200 px-2 py-2 xl:border-b-0 xl:border-l">
                                    <p className="text-[9px] font-semibold uppercase tracking-[0.1em] text-zinc-500">
                                        Tìm kiếm
                                    </p>
                                    <p className="mt-1 text-xs font-semibold text-zinc-900">
                                        +1,5{' '}
                                        <span className="font-normal text-zinc-500">
                                            · giữa +1 / +2
                                        </span>
                                    </p>
                                </div>
                                <div className="border-b border-zinc-200 px-2 py-2 xl:border-b-0 xl:border-l">
                                    <p className="text-[9px] font-semibold uppercase tracking-[0.1em] text-zinc-500">
                                        Click
                                    </p>
                                    <p className="mt-1 text-xs font-semibold text-zinc-900">
                                        +2{' '}
                                        <span className="font-normal text-zinc-500">
                                            · 2 lượt xem
                                        </span>
                                    </p>
                                </div>
                                <div className="border-b border-zinc-200 px-2 py-2 xl:border-b-0 xl:border-l">
                                    <p className="text-[9px] font-semibold uppercase tracking-[0.1em] text-zinc-500">
                                        Thêm giỏ
                                    </p>
                                    <p className="mt-1 text-xs font-semibold text-zinc-900">
                                        +4{' '}
                                        <span className="font-normal text-zinc-500">
                                            · 2 click
                                        </span>
                                    </p>
                                </div>
                                <div className="px-2 py-2 xl:border-l">
                                    <p className="text-[9px] font-semibold uppercase tracking-[0.1em] text-zinc-500">
                                        Mua hàng
                                    </p>
                                    <p className="mt-1 text-xs font-semibold text-zinc-900">
                                        +8{' '}
                                        <span className="font-normal text-zinc-500">
                                            · mỗi SP
                                        </span>
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="mt-2 flex flex-col gap-1.5 border-t border-zinc-200 pt-2 sm:flex-row sm:items-start sm:justify-between sm:gap-5">
                            <p className="text-[11px] leading-4 text-zinc-700">
                                <strong className="font-semibold text-zinc-900">
                                    Điểm âm:
                                </strong>{' '}
                                bỏ giỏ −2 giảm một nửa điểm thêm giỏ; trả hàng
                                −8 đảo điểm mua theo số lượng được trả.
                            </p>
                        </div>
                    </div>
                </div>
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    {behaviorWeights.map((item) => (
                        <article
                            key={item.code}
                            className="rounded-xl border border-zinc-200 bg-white p-3"
                        >
                            <div className="flex items-center justify-between gap-2">
                                <p className="text-xs font-semibold text-zinc-950">
                                    {item.event}
                                </p>
                                <span className="rounded-md border border-zinc-300 bg-white px-1.5 py-0.5 font-mono text-xs font-semibold text-zinc-950">
                                    {item.value}
                                </span>
                            </div>
                            <p className="mt-2 text-[11px] leading-4 text-zinc-600">
                                {item.explanation}
                            </p>
                        </article>
                    ))}
                </div>
            </RecommendationDisclosure>

            <RecommendationDisclosure
                id="recommendation-candidate-sources"
                number="2.1.3"
                title="Hệ thống tìm sản phẩm để gợi ý như thế nào?"
                description="Đầu vào là hồ sơ, phiên truy cập hoặc sản phẩm làm mốc. Bốn hướng tìm tạo các danh sách candidate có nguồn gốc rõ ràng; hệ thống gộp chúng trước, rồi ranking mới quyết định thứ tự hiển thị."
                level={4}
                variant="flow"
            >
                <div className="space-y-3">
                    <CatalogAffinityFlow />
                    <ColdStartFlow />
                    <SemanticSimilarityFlow />
                    <CoBehaviorFlow />
                </div>
            </RecommendationDisclosure>

            <RecommendationDisclosure
                id="recommendation-candidate-union"
                number="2.1.4"
                title="Từ nhiều danh sách thành một pool không trùng"
                description="Các nguồn tìm sản phẩm riêng; bước này lọc, gộp và giới hạn kết quả trước khi Standard hoặc AI Ranking tính thứ tự."
                level={4}
                variant="flow"
            >
                <section
                    className="rounded-xl border border-zinc-200 bg-white p-4"
                    aria-label="Các thao tác hợp nhất candidate"
                >
                    <RecommendationStepHeader
                        number="01"
                        eyebrow="Thu thập và chuẩn hóa pool"
                        title="Bốn thao tác trước khi candidate được xếp hạng"
                        description="Các nguồn được thu độc lập; pool sau cùng chỉ giữ một entry cho mỗi productId và tối đa 300 sản phẩm."
                        asideContent={
                            <span className="inline-flex w-fit shrink-0 items-center rounded-full border border-zinc-200 bg-white px-2.5 py-1 font-mono text-[10px] font-semibold text-zinc-600">
                                productId duy nhất · tối đa 300
                            </span>
                        }
                        titleLevel={5}
                    />

                    <ol
                        className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-4"
                        aria-label="Bốn thao tác hợp nhất candidate"
                    >
                        <li className="rounded-xl border border-zinc-200 bg-white p-3">
                            <p className="font-mono text-[10px] font-semibold tracking-[0.12em] text-zinc-400">
                                01 · THU KẾT QUẢ
                            </p>
                            <h4 className="mt-1.5 text-xs font-semibold text-zinc-950">
                                Nguồn nào chạy được thì dùng nguồn đó
                            </h4>
                            <p className="mt-1.5 text-[11px] leading-[1.65] text-zinc-600">
                                Các nguồn chạy song song bằng{' '}
                                <code className="font-mono text-[10px] text-zinc-800">
                                    Promise.allSettled
                                </code>
                                : nguồn lỗi hoặc không có kết quả được bỏ qua,
                                kết quả từ nguồn khác vẫn được giữ.
                            </p>
                            <p className="mt-2 border-t border-zinc-100 pt-2 text-[10px] leading-4 text-zinc-500">
                                <strong className="font-semibold text-zinc-700">
                                    Đánh đổi:
                                </strong>{' '}
                                nguồn lỗi làm pool ít lựa chọn hơn, nhưng không
                                làm hỏng cả request.
                            </p>
                        </li>
                        <li className="rounded-xl border border-zinc-200 bg-white p-3">
                            <p className="font-mono text-[10px] font-semibold tracking-[0.12em] text-zinc-400">
                                02 · LỌC ID
                            </p>
                            <h4 className="mt-1.5 text-xs font-semibold text-zinc-950">
                                Không lặp món vừa xem
                            </h4>
                            <p className="mt-1.5 text-[11px] leading-[1.65] text-zinc-600">
                                Tạo danh sách loại trừ gồm sản phẩm đang mở và
                                tối đa 3 sản phẩm tương tác gần nhất. Các nguồn
                                lọc danh sách này; union kiểm tra lại trước khi
                                nhận món.
                            </p>
                            <p className="mt-2 border-t border-zinc-100 pt-2 text-[10px] leading-4 text-zinc-500">
                                <strong className="font-semibold text-zinc-700">
                                    Đánh đổi:
                                </strong>{' '}
                                giảm gợi ý lặp, nhưng món đang mở sẽ không được
                                đề xuất lại trong request đó.
                            </p>
                        </li>
                        <li className="rounded-xl border border-zinc-200 bg-white p-3">
                            <p className="font-mono text-[10px] font-semibold tracking-[0.12em] text-zinc-400">
                                03 · GỘP TRÙNG
                            </p>
                            <h4 className="mt-1.5 text-xs font-semibold text-zinc-950">
                                Một mã sản phẩm, một candidate
                            </h4>
                            <p className="mt-1.5 text-[11px] leading-[1.65] text-zinc-600">
                                Dùng{' '}
                                <code className="font-mono text-[10px] text-zinc-800">
                                    productId
                                </code>{' '}
                                làm khóa Map. Nếu nhiều nguồn cùng trả một món,
                                chỉ giữ một sản phẩm; nguồn, lý do,{' '}
                                <code className="font-mono text-[10px] text-zinc-800">
                                    rawScore
                                </code>{' '}
                                và món làm mốc vẫn được lưu riêng.
                            </p>
                            <p className="mt-2 border-t border-zinc-100 pt-2 text-[10px] leading-4 text-zinc-500">
                                <strong className="font-semibold text-zinc-700">
                                    Ý nghĩa:
                                </strong>{' '}
                                không cộng điểm nguồn thành điểm cuối; ranking
                                nhận đủ dấu vết để tự chấm và giải thích.
                            </p>
                        </li>
                        <li className="rounded-xl border border-zinc-200 bg-white p-3">
                            <p className="font-mono text-[10px] font-semibold tracking-[0.12em] text-zinc-400">
                                04 · GIỚI HẠN POOL
                            </p>
                            <h4 className="mt-1.5 text-xs font-semibold text-zinc-950">
                                Giữ tối đa 300 món để xếp hạng
                            </h4>
                            <p className="mt-1.5 text-[11px] leading-[1.65] text-zinc-600">
                                Nếu vượt 300, mỗi vòng lấy một món từ từng
                                nguồn. Trong nguồn đó, ưu tiên{' '}
                                <code className="font-mono text-[10px] text-zinc-800">
                                    rawScore
                                </code>{' '}
                                cao; món đã được chọn ở nguồn khác thì bỏ qua.
                            </p>
                            <p className="mt-2 border-t border-zinc-100 pt-2 text-[10px] leading-4 text-zinc-500">
                                <strong className="font-semibold text-zinc-700">
                                    Đánh đổi:
                                </strong>{' '}
                                request nhẹ và có giới hạn, nhưng món ít ưu tiên
                                có thể bị cắt. 300 là guardrail hiện tại, chưa
                                phải ngưỡng tối ưu đã được kiểm chứng.
                            </p>
                        </li>
                    </ol>
                </section>

                <div aria-hidden="true" className="flex justify-center py-0.5">
                    <ChevronDown className="size-4 text-zinc-400" />
                </div>

                <section
                    className="rounded-xl border border-zinc-200 bg-white p-4"
                    aria-label="Ví dụ hợp nhất danh sách candidate"
                >
                    <RecommendationStepHeader
                        number="02"
                        eyebrow="Ví dụ minh họa"
                        title="Nhiều nguồn có thể cùng tìm thấy một sản phẩm"
                        description="Hợp nhất theo productId; thông tin từng nguồn vẫn được giữ để ranking sử dụng."
                        titleLevel={5}
                    />
                    <div className="mt-3 grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] lg:items-center">
                        <div>
                            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
                                Ví dụ · đầu vào từ ba nguồn
                            </p>
                            <div className="mt-2 grid gap-1.5 text-[11px] sm:grid-cols-3 lg:grid-cols-1">
                                <p className="border-b border-zinc-200 py-1.5 text-zinc-600">
                                    <code className="font-mono text-[10px] text-zinc-800">
                                        PRODUCT_AFFINITY
                                    </code>
                                    <span className="mx-1.5 text-zinc-300">
                                        →
                                    </span>
                                    SP-01, SP-02
                                </p>
                                <p className="border-b border-zinc-200 py-1.5 text-zinc-600">
                                    <code className="font-mono text-[10px] text-zinc-800">
                                        SEMANTIC_SIMILARITY
                                    </code>
                                    <span className="mx-1.5 text-zinc-300">
                                        →
                                    </span>
                                    SP-01, SP-03
                                </p>
                                <p className="py-1.5 text-zinc-600">
                                    <code className="font-mono text-[10px] text-zinc-800">
                                        CO_BEHAVIOR
                                    </code>
                                    <span className="mx-1.5 text-zinc-300">
                                        →
                                    </span>
                                    SP-01, SP-04
                                </p>
                            </div>
                        </div>
                        <ArrowRight
                            aria-hidden="true"
                            className="mx-auto size-4 rotate-90 text-zinc-400 lg:rotate-0"
                        />
                        <div className="border-t border-zinc-200 pt-3 lg:border-l lg:border-t-0 lg:pl-4 lg:pt-0">
                            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
                                Sau khi hợp nhất
                            </p>
                            <div className="mt-2 flex flex-wrap gap-1.5">
                                <span className="border-b border-zinc-200 py-1.5 text-[11px] font-semibold text-zinc-800">
                                    SP-01{' '}
                                    <span className="font-normal text-zinc-500">
                                        · 3 nguồn
                                    </span>
                                </span>
                                <span className="border-b border-zinc-200 py-1.5 text-[11px] font-semibold text-zinc-800">
                                    SP-02
                                </span>
                                <span className="border-b border-zinc-200 py-1.5 text-[11px] font-semibold text-zinc-800">
                                    SP-03
                                </span>
                                <span className="border-b border-zinc-200 py-1.5 text-[11px] font-semibold text-zinc-800">
                                    SP-04
                                </span>
                            </div>
                            <p className="mt-2 text-[10px] leading-4 text-zinc-500">
                                SP-01 chỉ còn một entry; ba nguồn và lý do xuất
                                hiện vẫn được lưu riêng.
                            </p>
                        </div>
                    </div>
                </section>

                <div aria-hidden="true" className="flex justify-center py-0.5">
                    <ChevronDown className="size-4 text-zinc-400" />
                </div>

                <section
                    className="rounded-xl border border-zinc-200 bg-white p-4"
                    aria-label="Đầu ra Candidate Union"
                >
                    <RecommendationStepHeader
                        number="03"
                        eyebrow="Đầu ra · ranking"
                        title="Pool candidate được bàn giao để tính điểm"
                        description="Ứng viên chưa phải thứ hạng hiển thị; bước ranking tiếp theo mới quyết định thứ tự."
                        titleLevel={5}
                    />
                    <div className="mt-3 grid gap-2 border-t border-zinc-100 pt-3 md:grid-cols-3">
                        <article className="rounded-lg border border-zinc-200 bg-white p-3">
                            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-zinc-500">
                                Pool đầu vào
                            </p>
                            <p className="mt-1 text-xs font-semibold text-zinc-900">
                                Tối đa 300 productId duy nhất
                            </p>
                            <p className="mt-1 text-[11px] leading-4 text-zinc-600">
                                Sản phẩm đang xem và tối đa 3 sản phẩm tương tác
                                gần nhất đã bị loại khỏi pool.
                            </p>
                        </article>
                        <article className="rounded-lg border border-zinc-200 bg-white p-3">
                            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-zinc-500">
                                Dấu vết nguồn
                            </p>
                            <p className="mt-1 text-xs font-semibold text-zinc-900">
                                Giữ thông tin đóng góp của nguồn
                            </p>
                            <p className="mt-1 text-[11px] leading-4 text-zinc-600">
                                Candidate lưu nguồn tìm thấy; reasonCode và
                                rawScore được giữ theo đóng góp, anchor được lưu
                                khi nguồn cung cấp.
                            </p>
                        </article>
                        <article className="rounded-lg border border-zinc-200 bg-white p-3">
                            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-zinc-500">
                                Bước kế tiếp
                            </p>
                            <p className="mt-1 text-xs font-semibold text-zinc-900">
                                Standard hoặc AI Ranking
                            </p>
                            <p className="mt-1 text-[11px] leading-4 text-zinc-600">
                                Ranking dùng pool candidate để tính điểm và
                                quyết định thứ tự hiển thị; Candidate Union
                                không cộng điểm nguồn thành điểm cuối.
                            </p>
                        </article>
                    </div>
                </section>
            </RecommendationDisclosure>

            <aside className="mt-3 flex items-start gap-3 rounded-xl border border-zinc-200 bg-white p-4">
                <span className="grid size-8 shrink-0 place-items-center rounded-xl border border-zinc-200 bg-white text-zinc-700">
                    <ShoppingCart aria-hidden="true" className="size-4" />
                </span>
                <div>
                    <p className="text-xs font-semibold text-zinc-950">
                        Nếu chưa có dữ liệu phù hợp?
                    </p>
                    <p className="mt-1 text-xs leading-5 text-zinc-600">
                        Không bịa candidate: request mới sẽ chọn strategy theo
                        profile/session; COLD_START dùng nguồn catalog nền.
                        Semantic thiếu vector hoặc co-behavior thiếu quan hệ thì
                        trả rỗng, các nguồn khác vẫn tiếp tục.
                    </p>
                    <p className="mt-2 text-[10px] leading-4 text-zinc-500">
                        Các giới hạn nêu trên là default/guardrail trong code để
                        giữ request hữu hạn; muốn chọn con số khác cần đo
                        coverage, latency và hiệu quả ranking trên cùng mục
                        tiêu.
                    </p>
                </div>
            </aside>
        </section>
    );
}

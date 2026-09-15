// Trình bày pipeline tạo ứng viên theo ba chặng, giúp người đọc theo dõi từ ngữ cảnh đến pool đầu vào ranking.
// Component chỉ mô tả nguồn và giới hạn đã cấu hình; không truy vấn catalog hoặc tự xếp hạng sản phẩm.
import type { ReactNode } from 'react';
import { RecommendationDetailLink } from '../shared/RecommendationDetailLink';
import { RecommendationStepBadge } from '../shared/RecommendationStepBadge';
import { RecommendationStepHeader } from '../shared/RecommendationStepHeader';

type CandidatePipelineStepProps = {
    number: string;
    title: string;
    description: string;
    children: ReactNode;
};

type CandidateSourceGroupProps = {
    title: string;
    count: string;
    columnsClassName: string;
    children: ReactNode;
};

type CandidateSourceItemProps = {
    number: string;
    context: string;
    title: string;
    purpose: string;
    href: string;
};

// Giữ cột nhãn mỗi chặng cố định để mô tả không lấn sang nội dung; phần còn lại dành riêng cho chi tiết và nguồn.
function CandidatePipelineStep({
    number,
    title,
    description,
    children,
}: CandidatePipelineStepProps) {
    return (
        <li className="grid min-w-0 gap-3 border-b border-zinc-200 py-4 last:border-b-0 lg:grid-cols-[12.5rem_minmax(0,1fr)] lg:gap-x-8">
            <header className="flex min-w-0 items-start gap-3">
                <RecommendationStepBadge number={number} />
                <div className="min-w-0">
                    <h5 className="text-sm font-semibold leading-5 text-zinc-950">
                        {title}
                    </h5>
                    <p className="mt-1 text-xs leading-5 text-zinc-600">
                        {description}
                    </p>
                </div>
            </header>
            <div className="min-w-0">{children}</div>
        </li>
    );
}

// Tách mỗi nhóm nguồn bằng một nền và viền nhẹ; danh sách bên trong vẫn phẳng để dễ quét và so sánh.
function CandidateSourceGroup({
    title,
    count,
    columnsClassName,
    children,
}: CandidateSourceGroupProps) {
    return (
        <section className="min-w-0 rounded-xl border border-zinc-200 bg-zinc-50/70 p-3 sm:p-4">
            <header className="mb-2.5 flex items-center justify-between gap-3 border-b border-zinc-200 pb-2">
                <h6 className="text-xs font-semibold text-zinc-900">{title}</h6>
                <span className="shrink-0 rounded-full border border-zinc-200 bg-white px-2 py-0.5 text-[10px] font-medium tabular-nums text-zinc-500">
                    {count}
                </span>
            </header>
            <div className={`grid min-w-0 gap-x-4 ${columnsClassName}`}>
                {children}
            </div>
        </section>
    );
}

// Hiển thị mỗi nguồn như một mục tài liệu gọn; liên kết nhỏ vẫn mở đúng phần giải thích kỹ thuật tương ứng.
function CandidateSourceItem({
    number,
    context,
    title,
    purpose,
    href,
}: CandidateSourceItemProps) {
    return (
        <article className="min-w-0 border-b border-zinc-100 py-2.5 last:border-b-0">
            <p className="text-[9px] font-medium uppercase leading-4 tracking-[0.08em] text-zinc-500">
                {number} · {context}
            </p>
            <div className="mt-1 flex min-w-0 items-start justify-between gap-2">
                <h6 className="min-w-0 text-xs font-semibold leading-5 text-zinc-950">
                    {title}
                </h6>
                <RecommendationDetailLink
                    compact
                    href={href}
                    ariaLabel={'Xem logic chi tiết: ' + title}
                >
                    Chi tiết
                </RecommendationDetailLink>
            </div>
            <p className="mt-1 text-[11px] leading-4 text-zinc-600">
                {purpose}
            </p>
        </article>
    );
}

// Mô tả nhánh cache miss theo ba chặng gọn trong một khung tài liệu; pool chỉ chuyển tiếp ứng viên, ranking mới quyết định thứ tự.
export function RecommendationCandidatePipeline() {
    return (
        <section
            className="min-w-0 rounded-2xl border border-zinc-200 bg-white p-4 sm:p-5"
            aria-label="Dựng ngữ cảnh và tìm ứng viên"
        >
            <RecommendationStepHeader
                number="05"
                title="Từ tín hiệu người mua đến danh sách ứng viên"
                asideContent={
                    <p className="text-xs text-zinc-500">
                        <span className="font-semibold tabular-nums text-zinc-800">
                            03
                        </span>{' '}
                        chặng <span className="px-1 text-zinc-300">·</span>
                        <span className="font-semibold tabular-nums text-zinc-800">
                            09
                        </span>{' '}
                        nguồn
                    </p>
                }
                className="after:inset-x-0"
            />

            <ol
                className="min-w-0"
                aria-label="Ba bước tạo danh sách ứng viên"
            >
                <CandidatePipelineStep
                    number="5.1"
                    title="Dựng ngữ cảnh"
                    description="Kết hợp sở thích đã lưu với hành vi mới để chọn hướng tìm."
                >
                    <div className="grid min-w-0 divide-y divide-zinc-200 sm:grid-cols-3 sm:divide-x sm:divide-y-0 sm:divide-zinc-200">
                        <article className="min-w-0 py-2.5 first:pt-0 last:pb-0 sm:px-3 sm:py-0 sm:first:pl-0 sm:last:pr-0">
                            <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-zinc-500">
                                Hồ sơ dài hạn
                            </p>
                            <p className="mt-1 text-xs leading-5 text-zinc-600">
                                PostgreSQL · tối đa 30 sản phẩm, 12 danh mục và
                                12 thương hiệu.
                            </p>
                        </article>
                        <article className="min-w-0 py-2.5 first:pt-0 last:pb-0 sm:px-3 sm:py-0 sm:first:pl-0 sm:last:pr-0">
                            <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-zinc-500">
                                Phiên hiện tại
                            </p>
                            <p className="mt-1 text-xs leading-5 text-zinc-600">
                                Redis · các mặt hàng và nhóm hàng vừa được tương
                                tác.
                            </p>
                        </article>
                        <article className="min-w-0 py-2.5 first:pt-0 last:pb-0 sm:px-3 sm:py-0 sm:first:pl-0 sm:last:pr-0">
                            <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-zinc-500">
                                Chiến lược tìm
                            </p>
                            <p className="mt-1 text-xs leading-5 text-zinc-600">
                                Có sở thích → cá nhân hóa; thiếu dữ liệu → theo
                                phiên hoặc cold-start.
                            </p>
                        </article>
                    </div>
                </CandidatePipelineStep>

                <CandidatePipelineStep
                    number="5.2"
                    title="Thu ứng viên"
                    description="Các nguồn chạy độc lập; nguồn thiếu dữ liệu được bỏ qua, không chặn nguồn khác."
                >
                    <div className="min-w-0 space-y-4">
                        <CandidateSourceGroup
                            title="Sở thích người mua"
                            count="03 nguồn"
                            columnsClassName="sm:grid-cols-3"
                        >
                            <CandidateSourceItem
                                number="01"
                                context="PRODUCT_AFFINITY · HỒ SƠ"
                                title="Sản phẩm đã quan tâm"
                                purpose="Đưa lại mặt hàng từng tạo tín hiệu sở thích tích cực."
                                href="#recommendation-affinity-flow-title"
                            />
                            <CandidateSourceItem
                                number="02"
                                context="CATEGORY_AFFINITY · HỒ SƠ + PHIÊN"
                                title="Sản phẩm cùng danh mục"
                                purpose="Mở rộng sang nhóm hàng người mua đang quan tâm."
                                href="#recommendation-affinity-flow-title"
                            />
                            <CandidateSourceItem
                                number="03"
                                context="BRAND_AFFINITY · HỒ SƠ + PHIÊN"
                                title="Sản phẩm cùng thương hiệu"
                                purpose="Giữ lại thương hiệu người mua thường chọn."
                                href="#recommendation-affinity-flow-title"
                            />
                        </CandidateSourceGroup>

                        <CandidateSourceGroup
                            title="Xu hướng và cold-start"
                            count="04 nguồn"
                            columnsClassName="sm:grid-cols-2 xl:grid-cols-4"
                        >
                            <CandidateSourceItem
                                number="04"
                                context="TRENDING · NGUỒN NỀN"
                                title="Đang được quan tâm"
                                purpose="Bổ sung sản phẩm có xu hướng tăng."
                                href="#recommendation-cold-start-flow-title"
                            />
                            <CandidateSourceItem
                                number="05"
                                context="BEST_SELLING · COLD-START"
                                title="Bán chạy"
                                purpose="Tạo điểm bắt đầu khi chưa rõ sở thích."
                                href="#recommendation-cold-start-flow-title"
                            />
                            <CandidateSourceItem
                                number="06"
                                context="NEWEST · COLD-START"
                                title="Mới nhất"
                                purpose="Dành chỗ cho sản phẩm mới chưa có lịch sử."
                                href="#recommendation-cold-start-flow-title"
                            />
                            <CandidateSourceItem
                                number="07"
                                context="EXPLORE · COLD-START"
                                title="Khám phá ổn định"
                                purpose="Thêm lựa chọn mà không ngẫu nhiên mỗi request."
                                href="#recommendation-cold-start-flow-title"
                            />
                        </CandidateSourceGroup>

                        <CandidateSourceGroup
                            title="Tương đồng nội dung và hành vi"
                            count="02 nguồn"
                            columnsClassName="sm:grid-cols-2"
                        >
                            <CandidateSourceItem
                                number="08"
                                context="SEMANTIC_SIMILARITY · QDRANT"
                                title="Gần nhau về nội dung"
                                purpose="Tìm sản phẩm gần nghĩa dù chưa có lịch sử mua chung."
                                href="#recommendation-semantic-flow-title"
                            />
                            <CandidateSourceItem
                                number="09"
                                context="CO_BEHAVIOR · QUAN HỆ SẢN PHẨM"
                                title="Thường được xem hoặc mua cùng"
                                purpose="Tìm liên hệ hành vi mà thuộc tính catalog không thể hiện."
                                href="#recommendation-cobehavior-flow-title"
                            />
                        </CandidateSourceGroup>
                    </div>
                </CandidatePipelineStep>

                <CandidatePipelineStep
                    number="5.3"
                    title="Hợp nhất pool"
                    description="Loại trùng và giới hạn tập đầu vào trước khi xếp hạng."
                >
                    <div className="space-y-3">
                        <ol
                            className="grid gap-x-4 sm:grid-cols-2 xl:grid-cols-4"
                            aria-label="Bốn thao tác hợp nhất candidate"
                        >
                            <li className="flex min-w-0 gap-2.5 border-l border-zinc-200 py-2 pl-3">
                                <span className="shrink-0 font-mono text-[10px] font-semibold tabular-nums text-zinc-500">
                                    01
                                </span>
                                <div className="min-w-0">
                                    <p className="text-xs font-semibold text-zinc-800">
                                        Thu nguồn
                                    </p>
                                    <p className="mt-1 text-[11px] leading-4 text-zinc-600">
                                        Một nguồn lỗi không dừng phần còn lại.
                                    </p>
                                </div>
                            </li>
                            <li className="flex min-w-0 gap-2.5 border-l border-zinc-200 py-2 pl-3">
                                <span className="shrink-0 font-mono text-[10px] font-semibold tabular-nums text-zinc-500">
                                    02
                                </span>
                                <div className="min-w-0">
                                    <p className="text-xs font-semibold text-zinc-800">
                                        Loại món vừa xem
                                    </p>
                                    <p className="mt-1 text-[11px] leading-4 text-zinc-600">
                                        Bỏ sản phẩm mốc và tối đa 3 món mới
                                        tương tác.
                                    </p>
                                </div>
                            </li>
                            <li className="flex min-w-0 gap-2.5 border-l border-zinc-200 py-2 pl-3">
                                <span className="shrink-0 font-mono text-[10px] font-semibold tabular-nums text-zinc-500">
                                    03
                                </span>
                                <div className="min-w-0">
                                    <p className="text-xs font-semibold text-zinc-800">
                                        Gộp sản phẩm trùng
                                    </p>
                                    <p className="mt-1 text-[11px] leading-4 text-zinc-600">
                                        Giữ một productId cùng nguồn và lý do
                                        tìm thấy.
                                    </p>
                                </div>
                            </li>
                            <li className="flex min-w-0 gap-2.5 border-l border-zinc-200 py-2 pl-3">
                                <span className="shrink-0 font-mono text-[10px] font-semibold tabular-nums text-zinc-500">
                                    04
                                </span>
                                <div className="min-w-0">
                                    <p className="text-xs font-semibold text-zinc-800">
                                        Giới hạn pool
                                    </p>
                                    <p className="mt-1 text-[11px] leading-4 text-zinc-600">
                                        Tối đa 300 món, chia lượt giữa các nguồn
                                        nếu cần.
                                    </p>
                                </div>
                            </li>
                        </ol>
                    </div>

                    <div className="flex flex-col gap-2 pt-3 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-xs leading-5 text-zinc-600">
                            <span className="font-semibold tabular-nums text-zinc-900">
                                Pool ≤300
                            </span>{' '}
                            · ứng viên chuyển sang Standard hoặc AI-Enhanced
                            Ranking; chưa phải thứ tự hiển thị.
                        </p>
                        <RecommendationDetailLink
                            href="#recommendation-candidate-union"
                            ariaLabel="Xem logic chi tiết về hợp nhất candidate"
                        >
                            Chi tiết hợp nhất
                        </RecommendationDetailLink>
                    </div>
                </CandidatePipelineStep>
            </ol>
        </section>
    );
}

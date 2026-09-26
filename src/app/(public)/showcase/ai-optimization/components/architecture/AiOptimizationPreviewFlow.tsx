// Flow 1.1.1 của AI Image Optimization; giải thích tuần tự từ input đến preview và không sở hữu logic runtime của worker.
'use client';

import { ArrowDown } from 'lucide-react';
import { ShowcaseDisclosure } from '../../../components/shared/ShowcaseDisclosure';
import { handleShowcaseAnchorNavigation } from '../../../utils/handleShowcaseAnchorNavigation';

interface PreviewFlowStepProps {
    number: string;
    phase: string;
    title: string;
    action: string;
    reason: string;
    tradeoff: string;
    technology?: React.ReactNode;
    logicHref?: string;
    logicLabel?: string;
}

// Tạo badge bước cùng kích thước với Recommendation; badge chỉ trình bày thứ tự và không mang trạng thái tương tác.
function StepBadge({ number }: { number: string }) {
    return (
        <span className="flex size-10 shrink-0 flex-col items-center justify-center rounded-xl border border-zinc-200 bg-white text-zinc-800 shadow-sm shadow-zinc-950/5">
            <span
                aria-hidden="true"
                className="text-[7px] font-semibold uppercase tracking-[0.12em] text-zinc-500"
            >
                Bước
            </span>
            <span
                aria-hidden="true"
                className="text-xs font-semibold leading-4 tabular-nums"
            >
                {number}
            </span>
            <span className="sr-only">Bước {number}</span>
        </span>
    );
}

// Render một bước với cùng contract “làm gì, vì sao, đánh đổi” để người đọc hiểu cả UX lẫn lý do kiến trúc phía sau.
function PreviewFlowStep({
    number,
    phase,
    title,
    action,
    reason,
    tradeoff,
    technology,
    logicHref,
    logicLabel,
}: PreviewFlowStepProps) {
    return (
        <article className="h-full rounded-2xl border border-zinc-200 bg-white p-3">
            <div className="flex items-start gap-3">
                <StepBadge number={number} />
                <div className="min-w-0 flex-1 pt-0.5">
                    <p className="font-mono text-[9px] font-medium uppercase tracking-[0.18em] text-zinc-500">
                        {phase}
                    </p>
                    <h4 className="mt-1 text-sm font-semibold text-zinc-950">
                        {title}
                    </h4>
                </div>
                {logicHref && logicLabel ? (
                    <a
                        href={logicHref}
                        aria-controls={logicHref.slice(1)}
                        aria-label={logicLabel}
                        onClick={handleShowcaseAnchorNavigation}
                        className="ml-auto inline-flex shrink-0 items-center gap-1 border-b border-zinc-300 pt-0.5 text-[11px] font-medium text-zinc-900 transition-colors hover:border-zinc-900"
                    >
                        Xem logic
                        <span aria-hidden="true">↘</span>
                    </a>
                ) : null}
            </div>

            <div className="mt-3 grid gap-2 sm:grid-cols-2">
                <div className="rounded-xl border border-zinc-100 bg-white p-3">
                    <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-zinc-500">
                        Làm gì?
                    </p>
                    <p className="mt-1 text-xs leading-5 text-zinc-700">
                        {action}
                    </p>
                </div>
                <div className="rounded-xl border border-zinc-100 bg-white p-3">
                    <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-zinc-500">
                        Tại sao?
                    </p>
                    <p className="mt-1 text-xs leading-5 text-zinc-700">
                        {reason}
                    </p>
                </div>
            </div>

            <div className="mt-2 flex items-start gap-2 text-[11px] leading-5 text-zinc-600">
                <span className="shrink-0 font-semibold text-zinc-900">
                    Đánh đổi
                </span>
                <span>{tradeoff}</span>
            </div>

            {technology ? (
                <div className="mt-3 border-t border-zinc-100 pt-3">
                    {technology}
                </div>
            ) : null}
        </article>
    );
}

// Tạo điểm nối giữa các hàng để người đọc luôn biết flow tiếp tục xuống bước nào.
function FlowConnector() {
    return (
        <div
            className="flex justify-center py-2 text-zinc-400"
            aria-hidden="true"
        >
            <ArrowDown className="size-4" />
        </div>
    );
}

// Giải thích flow tạo preview theo thứ tự dọc; các bước có lượng thông tin tương đương được gom thành một hàng để giảm chiều cao.
export function AiOptimizationPreviewFlow() {
    return (
        <ShowcaseDisclosure
            id="ai-optimization-preview-flow"
            number="1.1.1"
            title="Luồng tạo preview · đi từ trên xuống dưới"
            description="Mỗi bước trả lời ba câu hỏi: hệ thống làm gì, vì sao phải làm và đánh đổi nào được chấp nhận để seller có preview nhanh nhưng an toàn."
        >
            <div className="rounded-2xl border border-zinc-200 bg-white p-2.5 sm:p-3">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-200 px-1 pb-3">
                    <div>
                        <p className="font-mono text-[9px] font-medium uppercase tracking-[0.18em] text-zinc-500">
                            Request → kiểm tra → worker → review
                        </p>
                        <p className="mt-1 text-xs font-medium text-zinc-800">
                            Đọc theo mũi tên từ bước 01 đến bước 06
                        </p>
                    </div>
                    <span className="rounded-full border border-zinc-200 bg-white px-2.5 py-1 font-mono text-[10px] text-zinc-500">
                        6 bước
                    </span>
                </div>

                <ol className="mt-3">
                    <li>
                        <PreviewFlowStep
                            number="01"
                            phase="Input"
                            technology={
                                <div>
                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                        <p className="font-mono text-[9px] font-medium uppercase tracking-[0.16em] text-zinc-500">
                                            Công nghệ phía sau bước này
                                        </p>
                                        <span className="rounded-full border border-zinc-200 bg-white px-2 py-0.5 text-[10px] text-zinc-500">
                                            Chọn 1 pipeline
                                        </span>
                                    </div>
                                    <div className="mt-2 grid gap-2 lg:grid-cols-2">
                                        <div className="rounded-xl border border-zinc-200 bg-white p-2.5">
                                            <div className="flex items-center justify-between gap-2">
                                                <p className="text-xs font-semibold text-zinc-950">
                                                    Nền trắng
                                                </p>
                                                <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-zinc-500">
                                                    Local
                                                </span>
                                            </div>
                                            <p className="mt-1 text-[11px] leading-5 text-zinc-600">
                                                <code className="font-mono text-[10px] text-zinc-800">
                                                    rembg/u2net
                                                </code>{' '}
                                                tách chủ thể, Pillow ghép nền
                                                trắng và xuất WebP. Không gọi
                                                OpenAI nên không phát sinh
                                                token/phí theo request.
                                            </p>
                                            <p className="mt-1.5 text-[10px] leading-4 text-zinc-500">
                                                <strong className="font-semibold text-zinc-800">
                                                    Chọn khi:
                                                </strong>{' '}
                                                cần nhanh, ổn định, tiết kiệm
                                                cho ảnh catalog.
                                            </p>
                                        </div>
                                        <div className="rounded-xl border border-zinc-200 bg-white p-2.5">
                                            <div className="flex items-center justify-between gap-2">
                                                <p className="text-xs font-semibold text-zinc-950">
                                                    Lifestyle
                                                </p>
                                                <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-zinc-500">
                                                    OpenAI
                                                </span>
                                            </div>
                                            <p className="mt-1 text-[11px] leading-5 text-zinc-600">
                                                <code className="font-mono text-[10px] text-zinc-800">
                                                    OpenAILifestyleImageProvider
                                                </code>{' '}
                                                gọi{' '}
                                                <code className="font-mono text-[10px] text-zinc-800">
                                                    gpt-image-2
                                                </code>{' '}
                                                để đổi bối cảnh, ánh sáng và mặt
                                                phẳng xung quanh sản phẩm.
                                            </p>
                                            <p className="mt-1.5 text-[10px] leading-4 text-zinc-500">
                                                <strong className="font-semibold text-zinc-800">
                                                    Đánh đổi:
                                                </strong>{' '}
                                                đẹp và linh hoạt hơn nhưng tốn
                                                phí, lâu hơn, cần seller review.
                                            </p>
                                        </div>
                                    </div>
                                    <div className="mt-2 rounded-xl border border-zinc-200 bg-white p-2.5">
                                        <div className="flex flex-wrap items-center justify-between gap-2">
                                            <p className="font-mono text-[9px] font-medium uppercase tracking-[0.16em] text-zinc-500">
                                                Hồ sơ chất lượng
                                            </p>
                                            <span className="rounded-full border border-zinc-200 bg-white px-2 py-0.5 text-[10px] text-zinc-500">
                                                Lifestyle / OpenAI
                                            </span>
                                        </div>
                                        <div className="mt-2 grid gap-2 lg:grid-cols-2">
                                            <div className="rounded-xl border border-zinc-200 bg-white p-2.5">
                                                <div className="flex items-center justify-between gap-2">
                                                    <p className="text-xs font-semibold text-zinc-950">
                                                        Preview
                                                    </p>
                                                    <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-zinc-500">
                                                        Nhanh để duyệt
                                                    </span>
                                                </div>
                                                <p className="mt-1 text-[11px] leading-5 text-zinc-600">
                                                    Quality{' '}
                                                    <code className="font-mono text-[10px] text-zinc-800">
                                                        low
                                                    </code>
                                                    , kích thước provider{' '}
                                                    <code className="font-mono text-[10px] text-zinc-800">
                                                        1024×1024
                                                    </code>
                                                    , nén JPEG 65%, giới hạn
                                                    cạnh 768px.
                                                </p>
                                                <p className="mt-1.5 text-[10px] leading-4 text-zinc-500">
                                                    Mục tiêu là phản hồi nhanh
                                                    và đủ rõ để seller kiểm tra
                                                    bố cục, không phải bản dùng
                                                    cuối.
                                                </p>
                                            </div>
                                            <div className="rounded-xl border border-zinc-200 bg-white p-2.5">
                                                <div className="flex items-center justify-between gap-2">
                                                    <p className="text-xs font-semibold text-zinc-950">
                                                        Final
                                                    </p>
                                                    <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-zinc-500">
                                                        Dùng sau khi duyệt
                                                    </span>
                                                </div>
                                                <p className="mt-1 text-[11px] leading-5 text-zinc-600">
                                                    Quality{' '}
                                                    <code className="font-mono text-[10px] text-zinc-800">
                                                        medium
                                                    </code>
                                                    , kích thước provider{' '}
                                                    <code className="font-mono text-[10px] text-zinc-800">
                                                        1024×1024
                                                    </code>
                                                    , nén JPEG 85%, giới hạn
                                                    cạnh 1024px.
                                                </p>
                                                <p className="mt-1.5 text-[10px] leading-4 text-zinc-500">
                                                    Được tạo trong trạng thái
                                                    FINALIZING sau khi seller
                                                    xác nhận và trước khi
                                                    Product Service apply.
                                                </p>
                                            </div>
                                        </div>
                                        <p className="mt-2 text-[10px] leading-4 text-zinc-500">
                                            Nền trắng là pipeline local
                                            rembg/Pillow nên dùng giới hạn xử lý
                                            local riêng; bảng trên mô tả profile
                                            provider lifestyle.
                                        </p>
                                    </div>
                                </div>
                            }
                            title="Chọn ảnh nguồn và kiểu hiển thị"
                            action="Seller chọn sản phẩm cần làm ảnh, ảnh nguồn đang dùng và kiểu nền trắng hoặc lifestyle."
                            reason="Nếu chọn nhầm sản phẩm hoặc ảnh nguồn, AI có thể tạo một ảnh đẹp nhưng không đúng hàng thật."
                            tradeoff="Request cần thêm product, source asset và mode; đổi lại AI có đủ ngữ cảnh để tạo đúng mục tiêu."
                        />
                    </li>
                    <FlowConnector />

                    <li>
                        <div className="grid gap-3 lg:grid-cols-2">
                            <PreviewFlowStep
                                number="02"
                                phase="Identity"
                                title="Xác thực seller và quyền thao tác"
                                action="Gateway đọc JWT, xác định seller rồi kiểm tra người đó có quyền xem và tạo ảnh cho sản phẩm hay không."
                                reason="Không để request giả, sai shop hoặc người khác dùng nhầm quota AI của seller."
                                tradeoff="Request không hợp lệ bị từ chối ngay; đổi lại hệ thống tiết kiệm chi phí gọi AI."
                            />
                            <PreviewFlowStep
                                number="03"
                                phase="Guard"
                                title="Kiểm tra sản phẩm trước khi tạo"
                                action="AI Service đối chiếu owner, ảnh nguồn và version hiện tại trước khi cho phép tạo job."
                                reason="Đảm bảo preview được tạo từ dữ liệu seller đang sở hữu, không dùng ảnh đã bị thay thế hoặc xóa."
                                tradeoff="Thêm một lượt kiểm tra giữa service, nhưng tránh tốn AI cho dữ liệu cũ và sai phạm vi."
                            />
                        </div>
                    </li>
                    <FlowConnector />

                    <li>
                        <div className="grid gap-3 lg:grid-cols-2">
                            <PreviewFlowStep
                                number="04"
                                phase="Queue"
                                title="Lưu job để xử lý nền"
                                action="Backend lưu request ở trạng thái PENDING rồi gửi event cho worker; seller nhận phản hồi ngay."
                                reason="Việc tạo ảnh có thể mất thời gian, nên màn hình seller không bị khóa trong lúc provider AI xử lý."
                                tradeoff="Cần queue, lease và trạng thái job; đổi lại hệ thống retry được và không làm request HTTP bị timeout."
                                logicHref="#ai-optimization-queue-orchestration"
                                logicLabel="Xem logic queue và job"
                            />
                            <PreviewFlowStep
                                number="05"
                                phase="Worker"
                                title="Tạo ảnh và lưu dấu vết output"
                                action="Worker nhận job, gọi provider AI, upload preview lên S3 và lưu output liên kết với ảnh nguồn."
                                reason="Seller cần biết ảnh được tạo từ nguồn nào, provider nào và có thể xem lại đúng preview đó."
                                tradeoff="Preview phải có retention và cleanup; đổi lại storage không phình vô hạn và output vẫn truy vết được."
                                logicHref="#ai-optimization-worker-output"
                                logicLabel="Xem logic worker và output"
                            />
                        </div>
                    </li>
                    <FlowConnector />

                    <li>
                        <PreviewFlowStep
                            number="06"
                            phase="Review"
                            title="Trả preview để seller quyết định"
                            action="Job chuyển sang REVIEW_REQUIRED; seller xem ảnh, chọn bản phù hợp hoặc từ chối trước khi áp dụng."
                            reason="AI chỉ đưa ra phương án hình ảnh; seller mới hiểu rõ sản phẩm, thương hiệu và mục tiêu bán hàng."
                            tradeoff="Thêm một bước review, nhưng ngăn ảnh sai được dùng ngay và giữ quyền quyết định ở seller."
                        />
                    </li>
                </ol>
            </div>
        </ShowcaseDisclosure>
    );
}

// Ghép hai flow của mục 1.1; 1.1.1 mô tả cách tạo preview, 1.1.2 mô tả cách seller quyết định và cập nhật an toàn.
import { ArrowDown } from 'lucide-react';
import { ShowcaseDisclosure } from '../../../components/shared/ShowcaseDisclosure';
import { AiOptimizationPreviewFlow } from './AiOptimizationPreviewFlow';

interface ApprovalStepProps {
    number: string;
    phase: string;
    title: string;
    action: string;
    reason: string;
    tradeoff: string;
}

// Giữ badge bước của 1.1.2 đồng nhất với 1.1.1 và Recommendation để người đọc nhận ra thứ tự ngay lập tức.
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

// Trình bày một quyết định theo ba lớp làm gì, tại sao và đánh đổi để logic apply không bị rút gọn thành vài từ kỹ thuật.
function ApprovalStep({
    number,
    phase,
    title,
    action,
    reason,
    tradeoff,
}: ApprovalStepProps) {
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
            <div className="mt-2 flex items-start gap-2 border-t border-zinc-100 pt-2.5 text-[11px] leading-5 text-zinc-600">
                <span className="shrink-0 font-semibold text-zinc-900">
                    Đánh đổi
                </span>
                <span>{tradeoff}</span>
            </div>
        </article>
    );
}

// Nối các nhóm bước bằng một mũi tên duy nhất để layout gọn nhưng vẫn giữ thứ tự xử lý.
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

// Hiển thị các trạng thái sau quyết định; tất cả trạng thái dùng nền trắng để kết quả không bị nhầm với một nhánh lỗi.
function ApprovalStatus({
    status,
    description,
}: {
    status: string;
    description: string;
}) {
    return (
        <li className="rounded-xl border border-zinc-200 bg-white p-3">
            <p className="text-xs font-semibold text-zinc-950">{status}</p>
            <p className="mt-1 text-[11px] leading-4 text-zinc-500">
                {description}
            </p>
        </li>
    );
}

// Giải thích đường đi từ preview seller chọn đến kết quả apply, reject hoặc rollback mà không thay đổi sản phẩm ngoài transaction hợp lệ.
function AiOptimizationApprovalFlow() {
    return (
        <ShowcaseDisclosure
            id="ai-optimization-approval-flow"
            number="1.1.2"
            title="Luồng duyệt và cập nhật · preview đến sản phẩm"
            description="Preview chỉ là đề xuất. Seller chọn trước, backend kiểm tra lại sau; sản phẩm chỉ thay đổi khi đúng người, đúng phiên bản và đúng transaction."
        >
            <div className="rounded-2xl border border-zinc-200 bg-white p-2.5 sm:p-3">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-200 px-1 pb-3">
                    <div>
                        <p className="font-mono text-[9px] font-medium uppercase tracking-[0.18em] text-zinc-500">
                            Review → kiểm tra → quyết định → kết quả
                        </p>
                        <p className="mt-1 text-xs font-medium text-zinc-800">
                            Chỉ seller chọn ảnh; backend mới được phép ghi thay
                            đổi
                        </p>
                    </div>
                    <span className="rounded-full border border-zinc-200 bg-white px-2.5 py-1 font-mono text-[10px] text-zinc-500">
                        4 bước
                    </span>
                </div>

                <ol className="mt-3">
                    <li>
                        <ApprovalStep
                            number="01"
                            phase="Review"
                            title="Seller xác nhận preview muốn dùng"
                            action="Seller mở job REVIEW_REQUIRED, xem preview và xác nhận bản phù hợp với sản phẩm trước khi yêu cầu tạo ảnh final."
                            reason="AI có thể tạo ảnh đẹp nhưng không hiểu đầy đủ chiến lược thương hiệu; quyết định cuối phải thuộc về seller."
                            tradeoff="Thêm một lần xác nhận, nhưng tránh việc output chưa phù hợp tự động thay đổi sản phẩm."
                        />
                    </li>
                    <FlowConnector />

                    <li>
                        <ApprovalStep
                            number="02"
                            phase="Guard"
                            title="Kiểm tra lại quyền và phiên bản"
                            action="Backend kiểm tra seller, job, ownership, trạng thái output và version sản phẩm ngay trước action."
                            reason="Trong lúc seller review, sản phẩm có thể đã bị người khác sửa; không được ghi đè thay đổi mới."
                            tradeoff="Apply có thể bị từ chối dù preview vẫn hợp lệ; đổi lại dữ liệu sản phẩm luôn an toàn."
                        />
                    </li>
                    <FlowConnector />

                    <li>
                        <div className="grid gap-3 lg:grid-cols-2">
                            <ApprovalStep
                                number="03A"
                                phase="Apply"
                                title="Tạo final rồi ghi ảnh bằng transaction"
                                action="Lần xác nhận đầu chuyển job sang FINALIZING để worker tạo ảnh final; sau đó Product Service lock sản phẩm, lưu snapshot, cập nhật gallery row rồi chuyển job thành APPLIED."
                                reason="Ảnh preview chỉ để duyệt; ảnh final và gallery phải thành công cùng nhau, không để sản phẩm cập nhật nửa chừng."
                                tradeoff="Cần lock và transaction lâu hơn một lần update thường, nhưng có thể phục hồi nếu có lỗi."
                            />
                            <ApprovalStep
                                number="03B"
                                phase="Reject / Rollback"
                                title="Từ chối hoặc quay về bản trước"
                                action="Reject cleanup preview; rollback khôi phục snapshot đã lưu và chuyển job sang trạng thái tương ứng."
                                reason="Seller luôn cần đường lui nếu ảnh không đạt, provider lỗi hoặc thay đổi mới gây vấn đề."
                                tradeoff="Cần lưu snapshot và dọn asset; đổi lại ảnh gốc không bị mất và có thể khôi phục rõ ràng."
                            />
                        </div>
                    </li>
                </ol>

                <section
                    className="mt-3 rounded-2xl border border-zinc-200 bg-white p-3"
                    aria-labelledby="ai-optimization-approval-status-title"
                >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                            <p className="font-mono text-[9px] font-medium uppercase tracking-[0.18em] text-zinc-500">
                                Kết quả sau quyết định
                            </p>
                            <h4
                                id="ai-optimization-approval-status-title"
                                className="mt-1 text-xs font-semibold text-zinc-950"
                            >
                                Mỗi trạng thái cho biết sản phẩm đang ở đâu
                            </h4>
                        </div>
                        <span className="font-mono text-[10px] text-zinc-500">
                            review → mutation → recovery
                        </span>
                    </div>
                    <ul className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
                        <ApprovalStatus
                            status="REVIEW_REQUIRED"
                            description="Seller chưa chọn output để áp dụng."
                        />
                        <ApprovalStatus
                            status="Version check"
                            description="Đảm bảo không ghi đè thay đổi mới."
                        />
                        <ApprovalStatus
                            status="Transaction"
                            description="Snapshot và gallery được cập nhật cùng nhau."
                        />
                        <ApprovalStatus
                            status="APPLIED / ROLLED_BACK"
                            description="Có kết quả cuối và đường phục hồi."
                        />
                    </ul>
                </section>
            </div>
        </ShowcaseDisclosure>
    );
}

// Render hai flow của mục 1.1 theo đúng thứ tự mà cây kiến trúc hiển thị cho người đọc.
export function AiOptimizationActivityFlow() {
    return (
        <div className="space-y-3">
            <AiOptimizationPreviewFlow />
            <AiOptimizationApprovalFlow />
        </div>
    );
}

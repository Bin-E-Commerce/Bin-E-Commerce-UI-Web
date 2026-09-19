// Phần logic nghiệp vụ của AI Image Optimization; title dùng component chung và nội dung được trình bày theo flow dễ đọc.
import { ArrowDown, ArrowRight } from 'lucide-react';
import { ShowcaseNote } from '../../../components/shared/ShowcaseNote';
import { ShowcaseDisclosure } from '../../../components/shared/ShowcaseDisclosure';

interface LogicSectionProps {
    id: string;
    number: string;
    title: string;
    description: string;
    children: React.ReactNode;
}

// Dùng đúng title disclosure của mục 2 để các mục 2.1, 2.2 và 2.3 có cùng badge số, mô tả và chevron.
function LogicSection({
    id,
    number,
    title,
    description,
    children,
}: LogicSectionProps) {
    return (
        <ShowcaseDisclosure
            id={id}
            number={number}
            title={title}
            description={description}
        >
            <div className="rounded-2xl border border-zinc-200 bg-white p-4">
                {children}
            </div>
        </ShowcaseDisclosure>
    );
}

interface LifecycleStepProps {
    number: string;
    phase: string;
    title: string;
    action: string;
    meaning: string;
    next: string;
}

// Trình bày một trạng thái bằng cùng ba câu hỏi: backend làm gì, seller hiểu gì và bước tiếp theo là gì.
function LifecycleStep({
    number,
    phase,
    title,
    action,
    meaning,
    next,
}: LifecycleStepProps) {
    return (
        <article className="h-full min-w-0 rounded-2xl border border-zinc-200 bg-white p-3">
            <div className="flex items-start gap-3">
                <span className="flex size-10 shrink-0 flex-col items-center justify-center rounded-xl border border-zinc-200 bg-white shadow-sm shadow-zinc-950/5">
                    <span className="font-mono text-[7px] font-semibold uppercase tracking-[0.12em] text-zinc-500">
                        Bước
                    </span>
                    <span className="text-xs font-semibold leading-4 tabular-nums text-zinc-950">
                        {number}
                    </span>
                </span>
                <div className="min-w-0">
                    <p className="font-mono text-[9px] font-medium uppercase tracking-[0.18em] text-zinc-500">
                        {phase}
                    </p>
                    <h4 className="mt-1 text-sm font-semibold text-zinc-950">
                        {title}
                    </h4>
                </div>
            </div>
            <dl className="mt-3 space-y-2 text-xs leading-5 text-zinc-700">
                <div>
                    <dt className="font-mono text-[9px] uppercase tracking-[0.14em] text-zinc-500">
                        Backend làm gì?
                    </dt>
                    <dd>{action}</dd>
                </div>
                <div>
                    <dt className="font-mono text-[9px] uppercase tracking-[0.14em] text-zinc-500">
                        Seller hiểu gì?
                    </dt>
                    <dd>{meaning}</dd>
                </div>
                <div className="border-t border-zinc-100 pt-2">
                    <dt className="font-mono text-[9px] uppercase tracking-[0.14em] text-zinc-500">
                        Đi tiếp đến
                    </dt>
                    <dd className="font-medium text-zinc-900">{next}</dd>
                </div>
            </dl>
        </article>
    );
}

// Nối các state bằng mũi tên ngang trên desktop và dọc trên mobile để flow không bị mất thứ tự.
function LifecycleConnector() {
    return (
        <li className="flex shrink-0 items-center justify-center py-1 text-zinc-400 lg:px-0.5">
            <ArrowDown className="size-4 lg:hidden" aria-hidden="true" />
            <ArrowRight className="hidden size-4 lg:block" aria-hidden="true" />
        </li>
    );
}

// Giải thích toàn bộ lifecycle từ lúc tạo batch đến lúc preview được duyệt hoặc kết thúc lỗi.
function AiOptimizationLifecycle() {
    return (
        <LogicSection
            id="ai-optimization-lifecycle"
            number="2.1"
            title="Vòng đời batch/job"
            description="Batch giữ danh tính của một request; job theo dõi quá trình tạo ảnh. Đọc từ trái sang phải trên desktop hoặc từ trên xuống dưới trên mobile để biết output đang ở đâu."
        >
            <div className="space-y-4">
                <div className="grid gap-2 sm:grid-cols-2">
                    <article className="rounded-xl border border-zinc-200 bg-white p-3">
                        <p className="font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-zinc-500">
                            Batch là gì?
                        </p>
                        <p className="mt-1 text-sm font-semibold text-zinc-950">
                            Một lần seller gửi yêu cầu
                        </p>
                        <p className="mt-1 text-xs leading-5 text-zinc-600">
                            Batch gom sản phẩm, ảnh nguồn, mode hiển thị và
                            idempotency key. Nhờ vậy retry cùng một request
                            không tạo thêm job trùng.
                        </p>
                    </article>
                    <article className="rounded-xl border border-zinc-200 bg-white p-3">
                        <p className="font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-zinc-500">
                            Job là gì?
                        </p>
                        <p className="mt-1 text-sm font-semibold text-zinc-950">
                            Một đơn vị worker phải xử lý
                        </p>
                        <p className="mt-1 text-xs leading-5 text-zinc-600">
                            Job có state, lease và output riêng. Worker chỉ
                            chuyển job qua những trạng thái đã được backend cho
                            phép.
                        </p>
                    </article>
                </div>

                <ol className="flex flex-col lg:flex-row lg:items-stretch">
                    <li className="min-w-0 flex-1">
                        <LifecycleStep
                            number="01"
                            phase="Request"
                            title="Tạo batch"
                            action="Backend kiểm tra request, tạo batch và ghi fingerprint để nhận diện lần gửi này."
                            meaning="Yêu cầu đã được nhận; chưa gọi provider AI và chưa đụng vào sản phẩm."
                            next="PENDING"
                        />
                    </li>
                    <LifecycleConnector />
                    <li className="min-w-0 flex-1">
                        <LifecycleStep
                            number="02"
                            phase="Waiting"
                            title="Chờ worker claim"
                            action="Job ở PENDING trong queue. Một worker nhận lease có thời hạn trước khi bắt đầu xử lý."
                            meaning="Seller có thể rời màn hình; hệ thống vẫn giữ request và sẽ tiếp tục xử lý nền."
                            next="PROCESSING"
                        />
                    </li>
                    <LifecycleConnector />
                    <li className="min-w-0 flex-1">
                        <LifecycleStep
                            number="03"
                            phase="Processing"
                            title="Tạo preview"
                            action="Worker fetch source, prepare prompt, gọi provider AI, upload output và lưu lineage."
                            meaning="Ảnh đang được tạo; mọi output vẫn là preview riêng, chưa phải ảnh đang dùng."
                            next="REVIEW_REQUIRED hoặc FAILED"
                        />
                    </li>
                    <LifecycleConnector />
                    <li className="min-w-0 flex-1">
                        <LifecycleStep
                            number="04"
                            phase="Review"
                            title="Chờ seller chọn"
                            action="Job chuyển REVIEW_REQUIRED và giữ preview để seller xem, chọn hoặc từ chối."
                            meaning="Seller nhìn thấy kết quả thật trước khi cho phép bất kỳ thay đổi nào."
                            next="FINALIZING hoặc REJECTED"
                        />
                    </li>
                    <LifecycleConnector />
                    <li className="min-w-0 flex-1">
                        <LifecycleStep
                            number="05"
                            phase="Result"
                            title="Kết thúc có kiểm soát"
                            action="Apply ghi transaction và snapshot; lỗi được FAILED; bản đã apply có thể ROLLED_BACK."
                            meaning="Sản phẩm chỉ đổi khi action hợp lệ thành công; nếu không, ảnh gốc vẫn an toàn."
                            next="APPLIED, FAILED hoặc ROLLED_BACK"
                        />
                    </li>
                </ol>

                <div className="grid gap-2 sm:grid-cols-3">
                    <ShowcaseNote
                        tone="white"
                        compact
                        title="Vì sao không gọi AI trực tiếp?"
                    >
                        <p>
                            Request HTTP trả nhanh, không bị timeout khi
                            provider mất thời gian. Queue và worker xử lý phần
                            lâu ở phía sau.
                        </p>
                    </ShowcaseNote>
                    <ShowcaseNote
                        tone="white"
                        compact
                        title="Vì sao phải dừng ở review?"
                    >
                        <p>
                            Preview là đề xuất, không phải dữ liệu sản phẩm.
                            Seller cần nhìn output trước khi cho phép mutation.
                        </p>
                    </ShowcaseNote>
                    <ShowcaseNote
                        tone="white"
                        compact
                        title="Vì sao state bị giới hạn?"
                    >
                        <p>
                            Allow-list ngăn worker nhảy thẳng từ PENDING sang
                            APPLIED và bỏ qua quyền kiểm soát.
                        </p>
                    </ShowcaseNote>
                </div>
            </div>
        </LogicSection>
    );
}

// Giải thích permission và ownership theo flow thực tế để người đọc hiểu mỗi lớp bảo vệ đang chặn rủi ro nào.
function AiOptimizationPermissions() {
    return (
        <LogicSection
            id="ai-optimization-permissions"
            number="2.2"
            title="Permission và sở hữu sản phẩm"
            description="Một nút trên UI không tự tạo ra quyền. Mỗi action đi qua Gateway rồi được Product Service kiểm tra lại trên dữ liệu thật trước khi được chấp nhận."
        >
            <div className="space-y-4">
                <ol className="flex flex-col gap-2 lg:flex-row lg:items-stretch">
                    <li className="min-w-0 flex-1 rounded-2xl border border-zinc-200 bg-white p-3">
                        <p className="font-mono text-[9px] font-medium uppercase tracking-[0.18em] text-zinc-500">
                            01 · Seller action
                        </p>
                        <p className="mt-1 text-sm font-semibold text-zinc-950">
                            Seller gửi yêu cầu
                        </p>
                        <p className="mt-1 text-xs leading-5 text-zinc-600">
                            Seller muốn xem job, tạo preview, áp dụng ảnh hoặc
                            khôi phục ảnh cũ. Backend nhận action cụ thể, không
                            nhận một quyền “dùng AI” chung chung.
                        </p>
                    </li>
                    <li
                        className="flex items-center justify-center text-zinc-400"
                        aria-hidden="true"
                    >
                        <ArrowDown className="size-4 lg:hidden" />
                        <ArrowRight className="hidden size-4 lg:block" />
                    </li>
                    <li className="min-w-0 flex-1 rounded-2xl border border-zinc-200 bg-white p-3">
                        <p className="font-mono text-[9px] font-medium uppercase tracking-[0.18em] text-zinc-500">
                            02 · Gateway
                        </p>
                        <p className="mt-1 text-sm font-semibold text-zinc-950">
                            Kiểm tra route permission
                        </p>
                        <p className="mt-1 text-xs leading-5 text-zinc-600">
                            Gateway xác thực JWT, đọc permission profile và chặn
                            request trước khi nó đi vào service xử lý ảnh.
                        </p>
                    </li>
                    <li
                        className="flex items-center justify-center text-zinc-400"
                        aria-hidden="true"
                    >
                        <ArrowDown className="size-4 lg:hidden" />
                        <ArrowRight className="hidden size-4 lg:block" />
                    </li>
                    <li className="min-w-0 flex-1 rounded-2xl border border-zinc-200 bg-white p-3">
                        <p className="font-mono text-[9px] font-medium uppercase tracking-[0.18em] text-zinc-500">
                            03 · Product Service
                        </p>
                        <p className="mt-1 text-sm font-semibold text-zinc-950">
                            Kiểm tra ownership và version
                        </p>
                        <p className="mt-1 text-xs leading-5 text-zinc-600">
                            Service đối chiếu seller có thật sự sở hữu sản phẩm,
                            ảnh nguồn còn hợp lệ và version chưa bị thay đổi hay
                            không.
                        </p>
                    </li>
                    <li
                        className="flex items-center justify-center text-zinc-400"
                        aria-hidden="true"
                    >
                        <ArrowDown className="size-4 lg:hidden" />
                        <ArrowRight className="hidden size-4 lg:block" />
                    </li>
                    <li className="min-w-0 flex-1 rounded-2xl border border-zinc-200 bg-white p-3">
                        <p className="font-mono text-[9px] font-medium uppercase tracking-[0.18em] text-zinc-500">
                            04 · Decision
                        </p>
                        <p className="mt-1 text-sm font-semibold text-zinc-950">
                            Cho phép hoặc từ chối
                        </p>
                        <p className="mt-1 text-xs leading-5 text-zinc-600">
                            Chỉ khi tất cả điều kiện hợp lệ, action mới được
                            chạy; nếu không, backend trả lỗi rõ ràng và không
                            ghi dữ liệu.
                        </p>
                    </li>
                </ol>

                <div className="grid gap-2 sm:grid-cols-2">
                    <article className="rounded-xl border border-zinc-200 bg-white p-3">
                        <p className="font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-zinc-500">
                            View
                        </p>
                        <p className="mt-1 text-sm font-semibold text-zinc-950">
                            Đọc overview và job
                        </p>
                        <p className="mt-1 text-xs leading-5 text-zinc-600">
                            Cho xem trạng thái, preview và lịch sử xử lý. Không
                            được tạo ảnh, apply hoặc rollback.
                        </p>
                    </article>
                    <article className="rounded-xl border border-zinc-200 bg-white p-3">
                        <p className="font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-zinc-500">
                            Generate
                        </p>
                        <p className="mt-1 text-sm font-semibold text-zinc-950">
                            Tạo preview mới
                        </p>
                        <p className="mt-1 text-xs leading-5 text-zinc-600">
                            Cho tạo job và gọi AI trên source asset thuộc shop.
                            Output chỉ là preview, chưa được đổi sản phẩm.
                        </p>
                    </article>
                    <article className="rounded-xl border border-zinc-200 bg-white p-3">
                        <p className="font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-zinc-500">
                            Apply
                        </p>
                        <p className="mt-1 text-sm font-semibold text-zinc-950">
                            Ghi ảnh mới vào sản phẩm
                        </p>
                        <p className="mt-1 text-xs leading-5 text-zinc-600">
                            Bắt buộc có seller review, đúng owner, đúng version
                            và transaction thành công.
                        </p>
                    </article>
                    <article className="rounded-xl border border-zinc-200 bg-white p-3">
                        <p className="font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-zinc-500">
                            Rollback
                        </p>
                        <p className="mt-1 text-sm font-semibold text-zinc-950">
                            Khôi phục snapshot
                        </p>
                        <p className="mt-1 text-xs leading-5 text-zinc-600">
                            Chỉ chạy sau APPLIED. Backend khôi phục snapshot đã
                            lưu, không tin vào trạng thái hiển thị ở UI.
                        </p>
                    </article>
                </div>

                <div className="grid gap-2 sm:grid-cols-3">
                    <ShowcaseNote tone="white" compact title="Sai permission">
                        <p>
                            Request bị chặn tại Gateway; provider AI không bị
                            gọi và sản phẩm không bị chạm vào.
                        </p>
                    </ShowcaseNote>
                    <ShowcaseNote tone="white" compact title="Sai ownership">
                        <p>
                            Seller có thể có quyền generate nhưng không được
                            dùng ảnh của sản phẩm thuộc shop khác.
                        </p>
                    </ShowcaseNote>
                    <ShowcaseNote tone="white" compact title="Sai version">
                        <p>
                            Apply bị dừng để tránh ghi đè thay đổi mới; seller
                            cần xem lại preview trên version hiện tại.
                        </p>
                    </ShowcaseNote>
                </div>
            </div>
        </LogicSection>
    );
}

// Giải thích kỹ thuật của queue và orchestration: request chỉ tạo job, còn Kafka, outbox relay và worker xử lý phần việc lâu ở phía sau.
function AiOptimizationQueueLogic() {
    return (
        <LogicSection
            id="ai-optimization-queue-orchestration"
            number="2.3"
            title="Queue và điều phối job"
            description="Khi seller bấm tạo ảnh, hệ thống không đứng chờ AI hoàn thành. Request được ghi nhận, xếp hàng và giao cho worker theo cách có thể retry mà không tạo thêm job trùng."
        >
            <div className="space-y-4">
                <div className="rounded-xl border border-zinc-200 bg-white p-3 text-xs leading-5 text-zinc-700">
                    <strong className="text-zinc-950">Cách đọc:</strong> API chỉ
                    xác nhận “đã nhận yêu cầu”. Outbox Relay đọc event bền vững
                    từ PostgreSQL và publish sang Kafka; image worker lấy event
                    ra xử lý. Vì vậy seller không phải chờ AI chạy xong trong
                    cùng một request.
                </div>
                <div className="flex flex-col gap-2 lg:flex-row lg:items-stretch">
                    <article className="min-w-0 flex-1 rounded-xl border border-zinc-200 bg-white p-3">
                        <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-zinc-500">
                            01 · Command
                        </p>
                        <p className="mt-1 text-sm font-semibold text-zinc-950">
                            Nhận request và tạo job
                        </p>
                        <p className="mt-1 text-xs leading-5 text-zinc-600">
                            API kiểm tra quyền, fingerprint và idempotency. Nếu
                            hợp lệ, backend lưu job ở PENDING rồi trả jobId ngay
                            cho seller.
                        </p>
                        <p className="mt-2 border-t border-zinc-100 pt-2 text-[11px] leading-4 text-zinc-500">
                            <strong className="text-zinc-800">Kết quả:</strong>{' '}
                            yêu cầu đã được ghi nhận, nhưng ảnh chưa được tạo.
                        </p>
                    </article>
                    <div
                        className="flex items-center justify-center text-zinc-400"
                        aria-hidden="true"
                    >
                        <ArrowDown className="size-4 lg:hidden" />
                        <ArrowRight className="hidden size-4 lg:block" />
                    </div>
                    <article className="min-w-0 flex-1 rounded-xl border border-zinc-200 bg-white p-3">
                        <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-zinc-500">
                            02 · Outbox → Kafka
                        </p>
                        <p className="mt-1 text-sm font-semibold text-zinc-950">
                            Đưa event vào hàng đợi
                        </p>
                        <p className="mt-1 text-xs leading-5 text-zinc-600">
                            Backend lưu outbox cùng job, relay publish event gồm
                            jobId và fingerprint vào Kafka. Event lỗi hoặc hết
                            lượt retry được đưa vào DLQ.
                        </p>
                        <p className="mt-2 border-t border-zinc-100 pt-2 text-[11px] leading-4 text-zinc-500">
                            <strong className="text-zinc-800">Kết quả:</strong>{' '}
                            công việc được tách khỏi vòng đời của màn hình
                            seller.
                        </p>
                    </article>
                    <div
                        className="flex items-center justify-center text-zinc-400"
                        aria-hidden="true"
                    >
                        <ArrowDown className="size-4 lg:hidden" />
                        <ArrowRight className="hidden size-4 lg:block" />
                    </div>
                    <article className="min-w-0 flex-1 rounded-xl border border-zinc-200 bg-white p-3">
                        <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-zinc-500">
                            03 · Kafka Worker
                        </p>
                        <p className="mt-1 text-sm font-semibold text-zinc-950">
                            Nhận và claim job
                        </p>
                        <p className="mt-1 text-xs leading-5 text-zinc-600">
                            Image worker consume event, lấy lease, kiểm tra job
                            còn hợp lệ và chuyển sang PROCESSING; lease ngăn hai
                            consumer xử lý cùng một job.
                        </p>
                        <p className="mt-2 border-t border-zinc-100 pt-2 text-[11px] leading-4 text-zinc-500">
                            <strong className="text-zinc-800">Kết quả:</strong>{' '}
                            chỉ một worker chịu trách nhiệm cho lần xử lý này.
                        </p>
                    </article>
                </div>
                <div className="grid gap-2 sm:grid-cols-3">
                    <ShowcaseNote
                        tone="white"
                        compact
                        title="Không tạo job trùng"
                    >
                        <p>
                            Fingerprint và idempotency key giúp retry cùng
                            payload chỉ quay về job cũ.
                        </p>
                    </ShowcaseNote>
                    <ShowcaseNote
                        tone="white"
                        compact
                        title="Không khóa màn hình seller"
                    >
                        <p>
                            Seller nhận jobId và xem status qua overview; xử lý
                            AI diễn ra phía sau.
                        </p>
                    </ShowcaseNote>
                    <ShowcaseNote
                        tone="white"
                        compact
                        title="Không tự apply sản phẩm"
                    >
                        <p>
                            Queue chỉ điều phối job. Quyền apply vẫn phải đi qua
                            seller review và Product Service.
                        </p>
                    </ShowcaseNote>
                </div>
            </div>
        </LogicSection>
    );
}

// Giải thích kỹ thuật của worker và Media Service: output phải truy vết được về source, provider và phiên bản xử lý.
function AiOptimizationWorkerLogic() {
    return (
        <LogicSection
            id="ai-optimization-worker-output"
            number="2.4"
            title="Worker, Media Service và lineage output"
            description="Worker không chỉ gọi AI rồi trả về một file ảnh. Nó phải chứng minh preview này được tạo từ ảnh nguồn nào, bằng provider nào, lưu ở đâu và còn được phép review trong bao lâu."
        >
            <div className="space-y-4">
                <div className="rounded-xl border border-zinc-200 bg-white p-3 text-xs leading-5 text-zinc-700">
                    <strong className="text-zinc-950">Cách đọc:</strong> Worker
                    giống một dây chuyền: lấy đúng ảnh nguồn, nhờ provider tạo
                    bản mới, rồi lưu bản preview cùng thông tin để seller kiểm
                    tra được nó sinh ra từ đâu.
                </div>
                <div className="flex flex-col gap-2 lg:flex-row lg:items-stretch">
                    <article className="min-w-0 flex-1 rounded-xl border border-zinc-200 bg-white p-3">
                        <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-zinc-500">
                            01 · Prepare
                        </p>
                        <p className="mt-1 text-sm font-semibold text-zinc-950">
                            Đọc đúng source
                        </p>
                        <p className="mt-1 text-xs leading-5 text-zinc-600">
                            Worker lấy đúng ảnh seller đã chọn, kiểm tra mode
                            nền trắng/lifestyle, prompt version và product
                            version trước khi gọi provider.
                        </p>
                        <p className="mt-2 border-t border-zinc-100 pt-2 text-[11px] leading-4 text-zinc-500">
                            <strong className="text-zinc-800">Mục đích:</strong>{' '}
                            không tạo ảnh từ source đã bị xóa hoặc đã cũ.
                        </p>
                    </article>
                    <div
                        className="flex items-center justify-center text-zinc-400"
                        aria-hidden="true"
                    >
                        <ArrowDown className="size-4 lg:hidden" />
                        <ArrowRight className="hidden size-4 lg:block" />
                    </div>
                    <article className="min-w-0 flex-1 rounded-xl border border-zinc-200 bg-white p-3">
                        <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-zinc-500">
                            02 · Generate
                        </p>
                        <p className="mt-1 text-sm font-semibold text-zinc-950">
                            Gọi provider có kiểm soát
                        </p>
                        <p className="mt-1 text-xs leading-5 text-zinc-600">
                            Worker gửi request tới provider AI và chờ output. Nó
                            lưu provider/model, prompt version và failure code
                            để biết kết quả hoặc lỗi đến từ đâu.
                        </p>
                        <p className="mt-2 border-t border-zinc-100 pt-2 text-[11px] leading-4 text-zinc-500">
                            <strong className="text-zinc-800">Mục đích:</strong>{' '}
                            retry đúng lỗi tạm thời, không gọi lại vô hạn với
                            lỗi input.
                        </p>
                    </article>
                    <div
                        className="flex items-center justify-center text-zinc-400"
                        aria-hidden="true"
                    >
                        <ArrowDown className="size-4 lg:hidden" />
                        <ArrowRight className="hidden size-4 lg:block" />
                    </div>
                    <article className="min-w-0 flex-1 rounded-xl border border-zinc-200 bg-white p-3">
                        <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-zinc-500">
                            03 · Persist
                        </p>
                        <p className="mt-1 text-sm font-semibold text-zinc-950">
                            Upload và ghi lineage
                        </p>
                        <p className="mt-1 text-xs leading-5 text-zinc-600">
                            Output được gửi đến Media Service để lưu vào S3/CDN.
                            Database lưu sourceId, outputId, provider, prompt
                            version, retention và jobId rồi chuyển job sang
                            REVIEW_REQUIRED.
                        </p>
                        <p className="mt-2 border-t border-zinc-100 pt-2 text-[11px] leading-4 text-zinc-500">
                            <strong className="text-zinc-800">Kết quả:</strong>{' '}
                            seller có preview để xem, còn gallery sản phẩm vẫn
                            chưa thay đổi.
                        </p>
                    </article>
                </div>
                <div className="grid gap-2 sm:grid-cols-3">
                    <ShowcaseNote
                        tone="white"
                        compact
                        title="Vì sao cần lineage?"
                    >
                        <p>
                            Seller biết preview được tạo từ ảnh nguồn nào và có
                            thể đối chiếu khi nhiều phiên bản cùng tồn tại.
                        </p>
                    </ShowcaseNote>
                    <ShowcaseNote
                        tone="white"
                        compact
                        title="Vì sao qua Media Service?"
                    >
                        <p>
                            Preview không ghi thẳng vào gallery sản phẩm; Media
                            Service giữ asset tạm trong S3/CDN cho đến khi
                            seller quyết định.
                        </p>
                    </ShowcaseNote>
                    <ShowcaseNote
                        tone="white"
                        compact
                        title="Khi worker lỗi thì sao?"
                    >
                        <p>
                            Job lưu failure code và trạng thái;
                            retry/reject/cleanup được quyết định ở logic 2.6.
                        </p>
                    </ShowcaseNote>
                </div>
            </div>
        </LogicSection>
    );
}

// Mô tả logic kiểm soát token và chi phí provider theo implementation thực tế.
function AiOptimizationCostLogic() {
    return (
        <LogicSection
            id="ai-optimization-cost"
            number="2.5"
            title="Kiểm soát token và chi phí AI"
            description="Chi phí được giảm bằng cách không gọi provider thêm khi không cần và chỉ tạo đúng phần seller đã chọn."
        >
            <div className="space-y-4">
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                    <ShowcaseNote tone="white" compact title="01 · Dedupe">
                        <p>
                            Idempotency key và request hash trả lại batch/job cũ
                            khi browser retry hoặc seller bấm lại; cùng payload
                            không tạo thêm provider call.
                        </p>
                    </ShowcaseNote>
                    <ShowcaseNote
                        tone="white"
                        compact
                        title="02 · Guard trước AI"
                    >
                        <p>
                            Permission, ownership, source asset, rate limit và
                            input được kiểm tra trước khi publish event; request
                            sai không tiêu quota AI.
                        </p>
                    </ShowcaseNote>
                    <ShowcaseNote
                        tone="white"
                        compact
                        title="03 · Đúng phạm vi"
                    >
                        <p>
                            Preview chỉ xử lý source đầu tiên ở quality low để seller
                            duyệt; final dùng quality medium và chỉ chạy sau khi seller
                            xác nhận. Nền trắng dùng rembg/Pillow local, lifestyle mới
                            gọi OpenAI.
                        </p>
                    </ShowcaseNote>
                    <ShowcaseNote tone="white" compact title="04 · Prompt gọn">
                        <p>
                            Lifestyle dùng preset và giới hạn mô tả seller 400
                            ký tự; OpenAI image adapter gọi một output một lần,
                            không auto-retry.
                        </p>
                    </ShowcaseNote>
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                    <article className="rounded-xl border border-zinc-200 bg-white p-3">
                        <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-zinc-500">
                            Nền trắng
                        </p>
                        <p className="mt-1 text-sm font-semibold text-zinc-950">
                            Local, không tính phí theo request
                        </p>
                        <p className="mt-1 text-xs leading-5 text-zinc-600">
                            Worker dùng rembg/u2net để tách nền và Pillow ghép
                            canvas trắng. Pipeline này có thể retry có backoff
                            vì không gọi provider AI trả phí.
                        </p>
                    </article>
                    <article className="rounded-xl border border-zinc-200 bg-white p-3">
                        <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-zinc-500">
                            Lifestyle
                        </p>
                        <p className="mt-1 text-sm font-semibold text-zinc-950">
                            OpenAI, chỉ gọi khi seller có nhu cầu
                        </p>
                        <p className="mt-1 text-xs leading-5 text-zinc-600">
                            Worker gọi gpt-image-2 qua
                            OpenAILifestyleImageProvider. Lease và max_retries=0
                            ngăn redelivery/timeout tự động nhân đôi request có
                            thể đã bị tính phí.
                        </p>
                    </article>
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                    <div className="rounded-xl border border-zinc-200 bg-white p-3 text-xs leading-5 text-zinc-700">
                        <strong className="text-zinc-950">
                            Quota production:
                        </strong>{' '}
                        mỗi seller được tối đa 2 lượt trong cửa sổ 24 giờ.
                        Development/test dùng cửa sổ cấu hình riêng.
                    </div>
                    <div className="rounded-xl border border-zinc-200 bg-white p-3 text-xs leading-5 text-zinc-700">
                        <strong className="text-zinc-950">
                            Giới hạn cần nói rõ:
                        </strong>{' '}
                        AI Service lưu provider, model và prompt version để
                        audit, nhưng chưa có token meter trên frontend. Số tiết
                        kiệm được là provider call tránh được, không phải token
                        giả định.
                    </div>
                </div>
            </div>
        </LogicSection>
    );
}

// Giải thích impact sau apply: đọc baseline và daily metrics từ Recommendation Service, không tự dựng số liệu trên frontend.
function AiOptimizationImpactLogic() {
    return (
        <LogicSection
            id="ai-optimization-impact"
            number="2.7"
            title="Đo tác động sau tối ưu"
            description="Sau khi ảnh cover được apply, hệ thống theo dõi lượt xem và lượt bán theo từng sản phẩm để seller so sánh trước và sau một cách minh bạch."
        >
            <div className="space-y-3">
                <div className="grid gap-2 sm:grid-cols-3">
                    <ShowcaseNote tone="white" compact title="01 · Baseline">
                        <p>
                            AI Service ghi mốc apply thành công; Recommendation
                            Service cung cấp số liệu trước đó và các bucket
                            daily sau apply.
                        </p>
                    </ShowcaseNote>
                    <ShowcaseNote tone="white" compact title="02 · Trạng thái">
                        <p>
                            Product có thể ở COLLECTING, READY, NO_BASELINE,
                            ROLLED_BACK hoặc UNAVAILABLE tùy dữ liệu thực tế.
                        </p>
                    </ShowcaseNote>
                    <ShowcaseNote
                        tone="white"
                        compact
                        title="03 · Không kết luận nhân quả"
                    >
                        <p>
                            Delta lượt xem/lượt bán là tín hiệu so sánh
                            trước/sau, không khẳng định toàn bộ thay đổi đến từ
                            ảnh AI.
                        </p>
                    </ShowcaseNote>
                </div>
                <div className="rounded-xl border border-zinc-200 bg-white p-3 text-xs leading-5 text-zinc-700">
                    <strong className="text-zinc-950">
                        Ranh giới dữ liệu:
                    </strong>{' '}
                    Seller UI đọc impact theo product từ AI Service; AI Service
                    giữ lifecycle job, còn Recommendation Service là nguồn dữ
                    liệu analytics view/sales.
                </div>
            </div>
        </LogicSection>
    );
}

function AiOptimizationReliability() {
    return (
        <LogicSection
            id="ai-optimization-reliability"
            number="2.6"
            title="Retry, reject và rollback"
            description="Worker claim lease trước external call để redelivery không nhân đôi lời gọi trả phí. Hệ thống phân loại lỗi trước khi retry; reject xử lý preview không đạt, còn rollback phục hồi sản phẩm đã từng apply."
        >
            <div className="space-y-4">
                <div className="grid gap-2 lg:grid-cols-3">
                    <article className="rounded-xl border border-zinc-200 bg-white p-3">
                        <div className="flex items-center justify-between gap-2">
                            <p className="font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-zinc-500">
                                01 · Retry
                            </p>
                            <span className="rounded-full border border-zinc-200 px-2 py-0.5 text-[10px] text-zinc-500">
                                Làm lại có điều kiện
                            </span>
                        </div>
                        <h4 className="mt-2 text-sm font-semibold text-zinc-950">
                            Dùng khi lỗi có thể tự hết
                        </h4>
                        <dl className="mt-3 space-y-2 text-xs leading-5 text-zinc-600">
                            <div>
                                <dt className="font-semibold text-zinc-900">
                                    Khi nào?
                                </dt>
                                <dd>
                                    Worker mất kết nối, timeout hạ tầng hoặc
                                    provider tạm unavailable.
                                </dd>
                            </div>
                            <div>
                                <dt className="font-semibold text-zinc-900">
                                    Làm gì?
                                </dt>
                                <dd>
                                    Worker claim lease, tăng attempt và chạy lại
                                    trong giới hạn. Pipeline local được retry có
                                    backoff; OpenAI không auto-retry vì request
                                    ảnh có thể đã bị tính phí.
                                </dd>
                            </div>
                            <div className="border-t border-zinc-100 pt-2">
                                <dt className="font-semibold text-zinc-900">
                                    Kết quả
                                </dt>
                                <dd>
                                    Thành công thì đi tiếp; vượt giới hạn thì
                                    job thành FAILED để seller biết và xử lý lại
                                    chủ động.
                                </dd>
                            </div>
                        </dl>
                    </article>
                    <article className="rounded-xl border border-zinc-200 bg-white p-3">
                        <div className="flex items-center justify-between gap-2">
                            <p className="font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-zinc-500">
                                02 · Reject
                            </p>
                            <span className="rounded-full border border-zinc-200 px-2 py-0.5 text-[10px] text-zinc-500">
                                Bỏ preview
                            </span>
                        </div>
                        <h4 className="mt-2 text-sm font-semibold text-zinc-950">
                            Dùng khi seller không chọn ảnh
                        </h4>
                        <dl className="mt-3 space-y-2 text-xs leading-5 text-zinc-600">
                            <div>
                                <dt className="font-semibold text-zinc-900">
                                    Khi nào?
                                </dt>
                                <dd>
                                    Preview không đúng sản phẩm, không hợp
                                    thương hiệu hoặc seller không muốn sử dụng.
                                </dd>
                            </div>
                            <div>
                                <dt className="font-semibold text-zinc-900">
                                    Làm gì?
                                </dt>
                                <dd>
                                    Đổi job thành REJECTED và cleanup generated
                                    output trên storage tạm.
                                </dd>
                            </div>
                            <div className="border-t border-zinc-100 pt-2">
                                <dt className="font-semibold text-zinc-900">
                                    Kết quả
                                </dt>
                                <dd>
                                    Ảnh gốc và catalog đang dùng không bị xóa;
                                    reject chỉ kết thúc bản preview bị từ chối.
                                </dd>
                            </div>
                        </dl>
                    </article>
                    <article className="rounded-xl border border-zinc-200 bg-white p-3">
                        <div className="flex items-center justify-between gap-2">
                            <p className="font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-zinc-500">
                                03 · Rollback
                            </p>
                            <span className="rounded-full border border-zinc-200 px-2 py-0.5 text-[10px] text-zinc-500">
                                Khôi phục
                            </span>
                        </div>
                        <h4 className="mt-2 text-sm font-semibold text-zinc-950">
                            Dùng sau khi ảnh đã được apply
                        </h4>
                        <dl className="mt-3 space-y-2 text-xs leading-5 text-zinc-600">
                            <div>
                                <dt className="font-semibold text-zinc-900">
                                    Khi nào?
                                </dt>
                                <dd>
                                    Ảnh mới đã vào catalog nhưng sau đó phát
                                    hiện không phù hợp hoặc cần quay lại bản cũ.
                                </dd>
                            </div>
                            <div>
                                <dt className="font-semibold text-zinc-900">
                                    Làm gì?
                                </dt>
                                <dd>
                                    Product Service dùng snapshot đã lưu để phục
                                    hồi trong transaction.
                                </dd>
                            </div>
                            <div className="border-t border-zinc-100 pt-2">
                                <dt className="font-semibold text-zinc-900">
                                    Kết quả
                                </dt>
                                <dd>
                                    Chỉ job đã APPLIED mới được rollback; trạng
                                    thái cuối là ROLLED_BACK, không tạo lại ảnh
                                    bằng AI.
                                </dd>
                            </div>
                        </dl>
                    </article>
                </div>
            </div>
        </LogicSection>
    );
}

// Ghép các nhánh logic thành một section duy nhất để orchestration giữ được bố cục tài liệu giống Recommendation.
export function AiOptimizationLogicOverview() {
    return (
        <div className="space-y-6">
            <AiOptimizationLifecycle />
            <AiOptimizationPermissions />
            <AiOptimizationQueueLogic />
            <AiOptimizationWorkerLogic />
            <AiOptimizationCostLogic />
            <AiOptimizationReliability />
            <AiOptimizationImpactLogic />
        </div>
    );
}

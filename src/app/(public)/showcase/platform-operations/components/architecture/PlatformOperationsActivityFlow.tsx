// Tách từng luồng vận hành thành mục đọc độc lập; component chỉ trình bày static contract từ workflow và runbook.
import type { ReactNode } from 'react';
import { ShowcaseDisclosure } from '../../../components/shared/ShowcaseDisclosure';
import { ShowcaseNote } from '../../../components/shared/ShowcaseNote';

type PlatformOperationsFlowStepCardProps = {
    number: string;
    title: string;
    description: ReactNode;
};

type PlatformOperationsFlowDetailItemProps = {
    eyebrow: string;
    title: string;
    children: ReactNode;
};

type PlatformOperationsStaticFlowProps = {
    detailId: string;
    steps: PlatformOperationsFlowStepCardProps[];
    detailNumber: string;
    detailEyebrow: string;
    detailTitle: string;
    detailItems: PlatformOperationsFlowDetailItemProps[];
    passMessage: ReactNode;
    failMessage: ReactNode;
};

// Dùng cùng một nhịp thị giác cho các bước trong flow: badge nhỏ, tiêu đề ngắn và mô tả đủ để quét nhanh.
function PlatformOperationsFlowStepCard({
    number,
    title,
    description,
}: PlatformOperationsFlowStepCardProps) {
    return (
        <li className="min-w-0 rounded-2xl border border-zinc-200 bg-white p-4 shadow-[0_1px_2px_rgba(24,24,27,0.03)]">
            <header className="flex min-w-0 items-start gap-3 border-b border-zinc-200 pb-3">
                <span className="flex size-10 shrink-0 flex-col items-center justify-center rounded-xl border border-zinc-200 bg-white text-center leading-none shadow-sm">
                    <span className="text-[8px] font-medium uppercase tracking-[0.12em] text-zinc-500">
                        Bước
                    </span>
                    <span className="mt-1 font-mono text-xs font-semibold tabular-nums text-zinc-950">
                        {number}
                    </span>
                </span>
                <h4 className="min-w-0 pt-1 text-sm font-semibold leading-5 text-zinc-950">
                    {title}
                </h4>
            </header>
            <p className="mt-4 text-xs leading-5 text-zinc-600">
                {description}
            </p>
        </li>
    );
}

// Gom phần giải thích sâu thành các card có nhãn cố định để người đọc phân biệt mục đích, dữ liệu và điều kiện pass.
function PlatformOperationsFlowDetailItem({
    eyebrow,
    title,
    children,
}: PlatformOperationsFlowDetailItemProps) {
    return (
        <article className="min-w-0 overflow-hidden rounded-xl border border-zinc-200 bg-white">
            <header className="border-b border-zinc-200 px-4 py-3">
                <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-zinc-500">
                    {eyebrow}
                </p>
                <h5 className="mt-1 text-xs font-semibold leading-5 text-zinc-950">
                    {title}
                </h5>
            </header>
            <p className="px-4 py-3 text-xs leading-5 text-zinc-600">
                {children}
            </p>
        </article>
    );
}

// Dùng chung layout pipeline cho các flow có cùng contract: ba bước đầu, điểm chuyển tiếp và kết quả bàn giao.
function PlatformOperationsStaticFlow({
    detailId,
    steps,
    detailNumber,
    detailEyebrow,
    detailTitle,
    detailItems,
    passMessage,
    failMessage,
}: PlatformOperationsStaticFlowProps) {
    return (
        <div className="space-y-3">
            <ol
                className="grid min-w-0 gap-3 md:grid-cols-3"
                aria-label="Các bước trong flow vận hành"
            >
                {steps.slice(0, 3).map((step) => (
                    <PlatformOperationsFlowStepCard
                        key={step.number}
                        {...step}
                    />
                ))}
            </ol>

            <div className="flex justify-center py-1" aria-hidden="true">
                <span className="text-xl font-light leading-none text-zinc-400">
                    ↓
                </span>
            </div>

            <article
                id={detailId}
                className="min-w-0 rounded-2xl border border-zinc-200 bg-white p-4 sm:p-5"
                aria-label={detailTitle}
            >
                <header className="flex min-w-0 items-start gap-3 border-b border-zinc-200 pb-4">
                    <span className="flex size-10 shrink-0 flex-col items-center justify-center rounded-xl border border-zinc-200 bg-white text-center leading-none shadow-sm">
                        <span className="text-[8px] font-medium uppercase tracking-[0.12em] text-zinc-500">
                            Bước
                        </span>
                        <span className="mt-1 font-mono text-xs font-semibold tabular-nums text-zinc-950">
                            {detailNumber}
                        </span>
                    </span>
                    <div className="min-w-0">
                        <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-zinc-500">
                            {detailEyebrow}
                        </p>
                        <h4 className="mt-1 text-base font-semibold leading-6 text-zinc-950">
                            {detailTitle}
                        </h4>
                    </div>
                </header>

                <div className="mt-4 grid min-w-0 gap-3 sm:grid-cols-2">
                    {detailItems.map((item) => (
                        <PlatformOperationsFlowDetailItem
                            key={item.eyebrow}
                            {...item}
                        >
                            {item.children}
                        </PlatformOperationsFlowDetailItem>
                    ))}
                </div>

                <div className="mt-3 grid min-w-0 gap-2 sm:grid-cols-2">
                    <p className="rounded-xl border border-zinc-200 bg-white px-4 py-3 text-xs leading-5 text-zinc-600">
                        <span className="font-semibold text-zinc-950">
                            PASS
                        </span>
                        <span className="px-1.5 text-zinc-400">·</span>
                        {passMessage}
                    </p>
                    <p className="rounded-xl border border-zinc-200 bg-white px-4 py-3 text-xs leading-5 text-zinc-600">
                        <span className="font-semibold text-zinc-950">
                            FAIL
                        </span>
                        <span className="px-1.5 text-zinc-400">·</span>
                        {failMessage}
                    </p>
                </div>
            </article>
        </div>
    );
}

// Gom các flow CI/CD theo thứ tự phụ thuộc để người đọc biết bước nào tạo đầu vào cho bước kế tiếp.
export function PlatformOperationsActivityFlow() {
    return (
        <ShowcaseDisclosure
            id="platform-operations-flow"
            number="1.1"
            title="Luồng hoạt động"
            description="Một thay đổi đi từ source đến production qua các flow độc lập: kiểm tra, đóng gói, deploy, quan sát và phục hồi."
        >
            <div className="space-y-3">
                <ShowcaseDisclosure
                    id="platform-operations-ci-flow"
                    number="1.1.1"
                    title="Luồng CI · kiểm tra source"
                    description="CI chạy trên Pull Request và main để xác định phạm vi thay đổi, kiểm tra đúng workload và không chạm production."
                >
                    <div className="space-y-3">
                        <ol
                            className="grid min-w-0 gap-3 md:grid-cols-3"
                            aria-label="Các bước kiểm tra source trong CI"
                        >
                            <PlatformOperationsFlowStepCard
                                number="01"
                                title="Pull Request"
                                description={
                                    <>
                                        Khi <strong>Pull Request</strong> được
                                        mở hoặc cập nhật, workflow so sánh{' '}
                                        <strong>base commit</strong> với{' '}
                                        <strong>head commit</strong>. Script đọc
                                        danh sách file thay đổi để nhận diện
                                        service, frontend, packages/common hoặc
                                        manifest hạ tầng đang bị tác động; kết
                                        quả này chỉ dùng để chọn job,{' '}
                                        <strong>
                                            chưa build image và chưa deploy
                                            production
                                        </strong>
                                        .
                                    </>
                                }
                            />
                            <PlatformOperationsFlowStepCard
                                number="02"
                                title="Xác định service bị ảnh hưởng"
                                description={
                                    <>
                                        Từ kết quả <strong>Git diff</strong>,
                                        script tạo matrix gồm các service và
                                        loại kiểm tra cần chạy. Service độc lập
                                        chỉ chạy job của service đó; thay đổi{' '}
                                        <strong>
                                            common package, lockfile, root
                                            config, workflow hoặc deploy script
                                        </strong>{' '}
                                        sẽ mở rộng matrix để không bỏ sót
                                        dependency liên quan.
                                    </>
                                }
                            />
                            <PlatformOperationsFlowStepCard
                                number="03"
                                title="Quality gates theo workload"
                                description={
                                    <>
                                        Mỗi workload chạy bộ kiểm tra riêng:{' '}
                                        <strong>Node.js/Web</strong> có lint,
                                        type-check, unit test và build;{' '}
                                        <strong>AI</strong> có Ruff, mypy và
                                        pytest; <strong>Kubernetes</strong>{' '}
                                        render Kustomize rồi validate bằng
                                        kubeconform. Chỉ khi các job bắt buộc
                                        đều pass, release mới được chuyển sang{' '}
                                        <strong>Build Images</strong>.
                                    </>
                                }
                            />
                        </ol>

                        <div
                            className="flex justify-center py-1"
                            aria-hidden="true"
                        >
                            <span className="text-xl font-light leading-none text-zinc-400">
                                ↓
                            </span>
                        </div>

                        <article
                            id="platform-operations-ci-flow-detail"
                            className="min-w-0 rounded-2xl border border-zinc-200 bg-white p-4 sm:p-5"
                            aria-label="Chi tiết quality gate của CI"
                        >
                            <header className="flex min-w-0 items-start gap-3 border-b border-zinc-200 pb-4">
                                <span className="flex size-10 shrink-0 flex-col items-center justify-center rounded-xl border border-zinc-200 bg-white text-center leading-none shadow-sm">
                                    <span className="text-[8px] font-medium uppercase tracking-[0.12em] text-zinc-500">
                                        Bước
                                    </span>
                                    <span className="mt-1 font-mono text-xs font-semibold tabular-nums text-zinc-950">
                                        04
                                    </span>
                                </span>
                                <div className="min-w-0">
                                    <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-zinc-500">
                                        Từ source đến quyết định release
                                    </p>
                                    <h4 className="mt-1 text-base font-semibold leading-6 text-zinc-950">
                                        Quality gate hợp nhất
                                    </h4>
                                </div>
                            </header>

                            <div className="mt-4 grid min-w-0 gap-3 sm:grid-cols-2">
                                <PlatformOperationsFlowDetailItem
                                    eyebrow="Mục đích"
                                    title="Biết chính xác thay đổi cần kiểm tra"
                                >
                                    <>
                                        CI không chạy toàn bộ repository cho một
                                        thay đổi nhỏ. Việc xác định đúng{' '}
                                        <strong>phạm vi ảnh hưởng</strong> giúp
                                        phản hồi nhanh hơn, đồng thời vẫn kiểm
                                        tra đủ các service có khả năng bị ảnh
                                        hưởng.
                                    </>
                                </PlatformOperationsFlowDetailItem>
                                <PlatformOperationsFlowDetailItem
                                    eyebrow="Dữ liệu đầu vào"
                                    title="Diff, cấu hình và phạm vi ảnh hưởng"
                                >
                                    <>
                                        Pipeline dùng{' '}
                                        <strong>
                                            Git diff, submodule pointer,
                                            package/lockfile, root configuration
                                        </strong>{' '}
                                        và workflow cùng kết quả detect affected
                                        services để chọn đúng nhóm Node.js, Web,
                                        AI hoặc Kubernetes.
                                    </>
                                </PlatformOperationsFlowDetailItem>
                                <PlatformOperationsFlowDetailItem
                                    eyebrow="Điều kiện pass"
                                    title="Tất cả job bắt buộc đều xanh"
                                >
                                    <>
                                        Node.js và Web phải pass{' '}
                                        <strong>
                                            lint, type-check, unit test và build
                                        </strong>
                                        . AI phải pass{' '}
                                        <strong>Ruff, mypy và pytest</strong>.
                                        Manifest phải render thành công và pass{' '}
                                        <strong>kubeconform strict</strong>{' '}
                                        trước khi release được chuyển sang bước
                                        build image.
                                    </>
                                </PlatformOperationsFlowDetailItem>
                                <PlatformOperationsFlowDetailItem
                                    eyebrow="Đánh đổi & kiểm soát"
                                    title="Tối ưu thời gian nhưng vẫn an toàn"
                                >
                                    <>
                                        Chạy theo matrix giúp CI nhanh hơn. Để
                                        tránh bỏ sót dependency, thay đổi ở{' '}
                                        <strong>
                                            common package, lockfile, workflow
                                            hoặc deploy script
                                        </strong>{' '}
                                        được xem là diện rộng. CI dừng trước{' '}
                                        <strong>
                                            GHCR, production secret và lệnh
                                            deploy
                                        </strong>
                                        .
                                    </>
                                </PlatformOperationsFlowDetailItem>
                            </div>

                            <div className="mt-3 grid min-w-0 gap-2 sm:grid-cols-2">
                                <p className="rounded-xl border border-zinc-200 bg-white px-4 py-3 text-xs leading-5 text-zinc-600">
                                    <span className="font-semibold text-zinc-950">
                                        PASS
                                    </span>
                                    <span className="px-1.5 text-zinc-400">
                                        ·
                                    </span>
                                    Tất cả job bắt buộc pass; release được phép
                                    chuyển sang Build Images.
                                </p>
                                <p className="rounded-xl border border-zinc-200 bg-white px-4 py-3 text-xs leading-5 text-zinc-600">
                                    <span className="font-semibold text-zinc-950">
                                        FAIL
                                    </span>
                                    <span className="px-1.5 text-zinc-400">
                                        ·
                                    </span>
                                    Có job fail; dừng pipeline, đọc log, sửa
                                    source rồi chạy lại quality gate.
                                </p>
                            </div>
                        </article>
                    </div>
                    <div className="mt-3">
                        <ShowcaseNote
                            title="Ranh giới của CI"
                            tone="white"
                            compact
                        >
                            CI chỉ đọc source, chạy kiểm tra và tạo artifact
                            local. CI không đọc production secret, không push
                            GHCR và không gửi lệnh deploy production; các bước
                            đó thuộc release và Deploy Production sau này.
                        </ShowcaseNote>
                    </div>
                </ShowcaseDisclosure>

                <ShowcaseDisclosure
                    id="platform-operations-build-flow"
                    number="1.1.2"
                    title="Luồng Build image · tạo release bất biến"
                    description="Sau khi CI trên main pass, Build Images cố định đúng release SHA, build các backend image cần thiết, kiểm tra bảo mật rồi ghi lại quan hệ giữa source, image và digest để production có thể truy nguyên."
                >
                    <div className="space-y-3">
                        <ol
                            className="grid min-w-0 gap-3 md:grid-cols-3"
                            aria-label="Các bước build và phát hành image"
                        >
                            <PlatformOperationsFlowStepCard
                                number="01"
                                title="Resolve SHA"
                                description={
                                    <>
                                        Workflow checkout đúng commit đã{' '}
                                        <strong>pass CI trên main</strong> và
                                        detect lại danh sách workload từ chính
                                        commit đó, tránh build nhầm branch hoặc
                                        working tree.
                                    </>
                                }
                            />
                            <PlatformOperationsFlowStepCard
                                number="02"
                                title="Build và push"
                                description={
                                    <>
                                        Docker Buildx dùng đúng{' '}
                                        <strong>
                                            Dockerfile và build context
                                        </strong>{' '}
                                        của từng service, tạo image gắn{' '}
                                        <strong>full commit SHA</strong> rồi
                                        push lên GHCR; frontend vẫn được ghi
                                        nhận là <strong>Vercel</strong>.
                                    </>
                                }
                            />
                            <PlatformOperationsFlowStepCard
                                number="03"
                                title="Scan và SBOM"
                                description={
                                    <>
                                        <strong>Trivy</strong> quét lỗ hổng
                                        HIGH/CRITICAL, còn{' '}
                                        <strong>SBOM SPDX</strong> ghi lại
                                        dependency bên trong image để kiểm tra
                                        supply chain và truy nguyên khi có sự
                                        cố.
                                    </>
                                }
                            />
                        </ol>

                        <div
                            className="flex justify-center py-1"
                            aria-hidden="true"
                        >
                            <span className="text-xl font-light leading-none text-zinc-400">
                                ↓
                            </span>
                        </div>

                        <article
                            id="platform-operations-build-flow-detail"
                            className="min-w-0 rounded-2xl border border-zinc-200 bg-white p-4 sm:p-5"
                            aria-label="Chi tiết publish release manifest"
                        >
                            <header className="flex min-w-0 items-start gap-3 border-b border-zinc-200 pb-4">
                                <span className="flex size-10 shrink-0 flex-col items-center justify-center rounded-xl border border-zinc-200 bg-white text-center leading-none shadow-sm">
                                    <span className="text-[8px] font-medium uppercase tracking-[0.12em] text-zinc-500">
                                        Bước
                                    </span>
                                    <span className="mt-1 font-mono text-xs font-semibold tabular-nums text-zinc-950">
                                        04
                                    </span>
                                </span>
                                <div className="min-w-0">
                                    <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-zinc-500">
                                        Từ image đến release record
                                    </p>
                                    <h4 className="mt-1 text-base font-semibold leading-6 text-zinc-950">
                                        Publish release manifest
                                    </h4>
                                </div>
                            </header>

                            <div className="mt-4 grid min-w-0 gap-3 sm:grid-cols-2">
                                <PlatformOperationsFlowDetailItem
                                    eyebrow="Mục đích"
                                    title="Khóa artifact để deploy đúng bản đã kiểm tra"
                                >
                                    <>
                                        Release không dùng tag{' '}
                                        <strong>latest</strong> vì tag này có
                                        thể trỏ sang nội dung khác.{' '}
                                        <strong>
                                            Full commit SHA và digest
                                        </strong>{' '}
                                        giúp production luôn chạy đúng image đã
                                        được CI build và security scan.
                                    </>
                                </PlatformOperationsFlowDetailItem>
                                <PlatformOperationsFlowDetailItem
                                    eyebrow="Artifact được tạo"
                                    title="Image, digest, SBOM và kết quả scan"
                                >
                                    <>
                                        Mỗi service có{' '}
                                        <strong>
                                            image reference, digest, kết quả
                                            Trivy và SBOM SPDX
                                        </strong>
                                        . Các artifact này được upload cùng
                                        release để reviewer và người vận hành có
                                        thể đối chiếu sau này.
                                    </>
                                </PlatformOperationsFlowDetailItem>
                                <PlatformOperationsFlowDetailItem
                                    eyebrow="Điều kiện publish"
                                    title="Build, push và scan đều thành công"
                                >
                                    <>
                                        Manifest chỉ được tạo sau khi{' '}
                                        <strong>
                                            image build thành công, push lên
                                            GHCR hoàn tất
                                        </strong>{' '}
                                        và policy bảo mật không chặn release.
                                        Nếu một service fail, mapping release
                                        không được coi là hoàn chỉnh.
                                    </>
                                </PlatformOperationsFlowDetailItem>
                                <PlatformOperationsFlowDetailItem
                                    eyebrow="Truy nguyên & kiểm soát"
                                    title="Đối chiếu được source với workload đang chạy"
                                >
                                    <>
                                        Manifest nối{' '}
                                        <strong>
                                            release SHA với service, tag và
                                            digest
                                        </strong>
                                        . Khi deploy, rollback hoặc điều tra
                                        lỗi, đội vận hành dùng record này để xác
                                        minh cluster đang chạy đúng artifact đã
                                        được phê duyệt.
                                    </>
                                </PlatformOperationsFlowDetailItem>
                            </div>

                            <div className="mt-3 grid min-w-0 gap-2 sm:grid-cols-2">
                                <p className="rounded-xl border border-zinc-200 bg-white px-4 py-3 text-xs leading-5 text-zinc-600">
                                    <span className="font-semibold text-zinc-950">
                                        PASS
                                    </span>
                                    <span className="px-1.5 text-zinc-400">
                                        ·
                                    </span>
                                    Release manifest sẵn sàng cho production
                                    approval.
                                </p>
                                <p className="rounded-xl border border-zinc-200 bg-white px-4 py-3 text-xs leading-5 text-zinc-600">
                                    <span className="font-semibold text-zinc-950">
                                        FAIL
                                    </span>
                                    <span className="px-1.5 text-zinc-400">
                                        ·
                                    </span>
                                    Dừng build release, giữ lại bằng chứng lỗi
                                    và không deploy image chưa được xác nhận.
                                </p>
                            </div>
                        </article>
                    </div>
                </ShowcaseDisclosure>

                <ShowcaseDisclosure
                    id="platform-operations-production-deploy-flow"
                    number="1.1.3"
                    title="Luồng Deploy Production · approval và SSM"
                    description="Deploy Production nhận đúng release SHA, yêu cầu reviewer approve rồi dùng OIDC và SSM thay cho SSH trực tiếp vào EC2."
                >
                    <PlatformOperationsStaticFlow
                        detailId="platform-operations-production-deploy-flow-detail"
                        steps={[
                            {
                                number: '01',
                                title: 'Resolve release',
                                description: (
                                    <>
                                        Chọn đúng <strong>release SHA</strong>,
                                        image reference và danh sách workload
                                        cần đưa lên production.
                                    </>
                                ),
                            },
                            {
                                number: '02',
                                title: 'Production approval',
                                description: (
                                    <>
                                        <strong>GitHub Environment</strong> yêu
                                        cầu reviewer xác nhận trước khi workflow
                                        được phép chạm vào access boundary
                                        production.
                                    </>
                                ),
                            },
                            {
                                number: '03',
                                title: 'OIDC và STS',
                                description: (
                                    <>
                                        GitHub Actions đổi identity thành{' '}
                                        <strong>AWS credential ngắn hạn</strong>{' '}
                                        theo trust policy, không lưu SSH key
                                        hoặc access key dài hạn.
                                    </>
                                ),
                            },
                            {
                                number: '04',
                                title: 'SSM execution',
                                description: (
                                    <>
                                        <strong>AWS Systems Manager</strong> gửi
                                        script và release metadata đến node
                                        production đang Online rồi trả kết quả
                                        có audit.
                                    </>
                                ),
                            },
                        ]}
                        detailNumber="04"
                        detailEyebrow="Từ approval đến production entrypoint"
                        detailTitle="SSM thực thi release đã được phê duyệt"
                        detailItems={[
                            {
                                eyebrow: 'Mục đích',
                                title: 'Đưa đúng release vào đúng node',
                                children: (
                                    <>
                                        Workflow{' '}
                                        <strong>
                                            không SSH trực tiếp vào EC2
                                        </strong>
                                        . Nó dùng release SHA và image reference
                                        đã xác định để node production tự thực
                                        thi script deploy trong repository.
                                    </>
                                ),
                            },
                            {
                                eyebrow: 'Quyền truy cập',
                                title: 'Approval và credential ngắn hạn',
                                children: (
                                    <>
                                        Reviewer chặn release ở{' '}
                                        <strong>GitHub Environment</strong>. Sau
                                        khi được approve, OIDC cấp{' '}
                                        <strong>
                                            AWS STS credential ngắn hạn
                                        </strong>{' '}
                                        đúng trust policy của workflow.
                                    </>
                                ),
                            },
                            {
                                eyebrow: 'Điều kiện thực thi',
                                title: 'Node phải Online trong SSM',
                                children: (
                                    <>
                                        Workflow kiểm tra{' '}
                                        <strong>PingStatus Online</strong>,
                                        truyền release metadata và các manifest
                                        cần thiết qua AWS-RunShellScript, sau đó
                                        poll stdout và stderr.
                                    </>
                                ),
                            },
                            {
                                eyebrow: 'Đánh đổi & kiểm soát',
                                title: 'Không để credential dài hạn trong repository',
                                children: (
                                    <>
                                        SSM tạo audit cho command, còn{' '}
                                        <strong>file tạm và secret</strong> được
                                        giới hạn trong phạm vi cần thiết rồi dọn
                                        sau deploy. Trang public không hiển thị
                                        account, instance hoặc token thật.
                                    </>
                                ),
                            },
                        ]}
                        passMessage={
                            <>
                                <strong>SSM nhận lệnh</strong> và chuyển release
                                vào bước K3s rollout.
                            </>
                        }
                        failMessage={
                            <>
                                Dừng trước cluster; kiểm tra{' '}
                                <strong>approval, OIDC, SSM node</strong> và
                                metadata release.
                            </>
                        }
                    />
                    <div className="mt-3">
                        <ShowcaseNote
                            title="Ranh giới secret"
                            tone="white"
                            compact
                        >
                            Secret chỉ được truyền qua bước cần thiết và file
                            tạm được dọn sau command. Trang showcase không hiển
                            thị token, account ID, instance ID hoặc URL
                            production thật.
                        </ShowcaseNote>
                    </div>
                </ShowcaseDisclosure>

                <ShowcaseDisclosure
                    id="platform-operations-rollout-flow"
                    number="1.1.4"
                    title="Luồng rollout · smoke test và rollback"
                    description="K3s rollout tuần tự theo dependency, kiểm tra readiness và smoke test; nếu lỗi thì rollback application đã chạm."
                >
                    <PlatformOperationsStaticFlow
                        detailId="platform-operations-rollout-flow-detail"
                        steps={[
                            {
                                number: '01',
                                title: 'Preflight',
                                description: (
                                    <>
                                        Chờ <strong>Kafka broker Ready</strong>,
                                        kiểm tra topic/leader và render
                                        Kustomize trước khi thay image
                                        application.
                                    </>
                                ),
                            },
                            {
                                number: '02',
                                title: 'Rollout tuần tự',
                                description: (
                                    <>
                                        Đổi image theo{' '}
                                        <strong>dependency order</strong>; mỗi
                                        Deployment phải pass rollout status
                                        trước khi script chuyển sang service kế
                                        tiếp.
                                    </>
                                ),
                            },
                            {
                                number: '03',
                                title: 'Smoke test',
                                description: (
                                    <>
                                        Kiểm tra{' '}
                                        <strong>
                                            health endpoint, Keycloak discovery
                                            và HTTPS
                                        </strong>{' '}
                                        để xác nhận runtime hoạt động sau khi
                                        Pod đã Ready.
                                    </>
                                ),
                            },
                            {
                                number: '04',
                                title: 'Diagnostics và rollback',
                                description: (
                                    <>
                                        Nếu có lỗi, ghi{' '}
                                        <strong>
                                            Deployment/Pod/Events/logs
                                        </strong>{' '}
                                        rồi rollback các workload đã thay đổi;
                                        database migration không tự rollback.
                                    </>
                                ),
                            },
                        ]}
                        detailNumber="04"
                        detailEyebrow="Từ rollout đến trạng thái runtime"
                        detailTitle="Chỉ hoàn tất release khi workload thật sự sẵn sàng"
                        detailItems={[
                            {
                                eyebrow: 'Mục đích',
                                title: 'Đảm bảo dependency sẵn sàng trước application',
                                children: (
                                    <>
                                        <strong>Kafka và manifest</strong> phải
                                        sẵn sàng trước consumer/producer.
                                        Rollout tuần tự giúp phát hiện service
                                        lỗi ở đúng bước thay vì làm toàn bộ
                                        release thất bại khó truy vết.
                                    </>
                                ),
                            },
                            {
                                eyebrow: 'Thứ tự kiểm tra',
                                title: 'Preflight → rollout → smoke test',
                                children: (
                                    <>
                                        Script kiểm tra Kafka, đổi image theo
                                        service order, chờ{' '}
                                        <strong>readiness</strong> rồi mới kiểm
                                        tra health endpoint, OIDC discovery và
                                        HTTPS.{' '}
                                        <strong>
                                            Pod Running một mình chưa đủ
                                        </strong>{' '}
                                        để coi là thành công.
                                    </>
                                ),
                            },
                            {
                                eyebrow: 'Điều kiện pass',
                                title: 'Readiness và dependency đều ổn định',
                                children: (
                                    <>
                                        Từng Deployment phải pass{' '}
                                        <strong>
                                            rollout status trong timeout
                                        </strong>
                                        ; các endpoint chính phải phản hồi hợp
                                        lệ và không xuất hiện lỗi mới ở consumer
                                        hoặc downstream service.
                                    </>
                                ),
                            },
                            {
                                eyebrow: 'Đánh đổi & kiểm soát',
                                title: 'Chậm hơn nhưng rollback có phạm vi rõ',
                                children: (
                                    <>
                                        Rollout tuần tự lâu hơn chạy đồng thời
                                        nhưng giới hạn{' '}
                                        <strong>blast radius</strong>. Khi lỗi,
                                        workflow lưu evidence, rollback
                                        application đã chạm và không tự ý
                                        rollback database migration.
                                    </>
                                ),
                            },
                        ]}
                        passMessage={
                            <>
                                Các <strong>Deployment pass</strong>, smoke test
                                hợp lệ và release được bàn giao.
                            </>
                        }
                        failMessage={
                            <>
                                Dừng rollout, in <strong>diagnostics</strong> và
                                rollback workload đã thay đổi.
                            </>
                        }
                    />
                </ShowcaseDisclosure>

                <ShowcaseDisclosure
                    id="platform-operations-observability-deploy-flow"
                    number="1.1.5"
                    title="Luồng Deploy Observability · metrics và logs"
                    description="Observability được deploy bằng workflow manual riêng để không restart monitoring theo mỗi application release."
                >
                    <PlatformOperationsStaticFlow
                        detailId="platform-operations-observability-deploy-flow-detail"
                        steps={[
                            {
                                number: '01',
                                title: 'Manual dispatch',
                                description: (
                                    <>
                                        Người vận hành chủ động chạy{' '}
                                        <strong>
                                            workflow observability riêng
                                        </strong>
                                        ; production Environment vẫn yêu cầu
                                        approval trước khi thực thi.
                                    </>
                                ),
                            },
                            {
                                number: '02',
                                title: 'Transfer manifest',
                                description: (
                                    <>
                                        Workflow đóng gói{' '}
                                        <strong>YAML và script</strong>, truyền
                                        payload an toàn qua SSM rồi dọn file tạm
                                        sau khi command kết thúc.
                                    </>
                                ),
                            },
                            {
                                number: '03',
                                title: 'Apply và rollout',
                                description: (
                                    <>
                                        K3s apply{' '}
                                        <strong>
                                            namespace, ConfigMap, Service và
                                            Deployment/DaemonSet
                                        </strong>{' '}
                                        cho Prometheus, Grafana, Loki và Alloy.
                                    </>
                                ),
                            },
                            {
                                number: '04',
                                title: 'Verify datasource',
                                description: (
                                    <>
                                        Grafana kết nối được{' '}
                                        <strong>Prometheus và Loki</strong> để
                                        người vận hành xem metrics, logs và điều
                                        tra request sau release.
                                    </>
                                ),
                            },
                        ]}
                        detailNumber="04"
                        detailEyebrow="Từ manifest đến màn hình vận hành"
                        detailTitle="Observability sẵn sàng để theo dõi application"
                        detailItems={[
                            {
                                eyebrow: 'Mục đích',
                                title: 'Tách monitoring khỏi application release',
                                children: (
                                    <>
                                        Observability thay đổi chậm hơn backend
                                        nên có{' '}
                                        <strong>
                                            workflow manual và audit riêng
                                        </strong>
                                        . Application deploy không cần restart
                                        Prometheus, Grafana, Loki hoặc Alloy
                                        theo mỗi image build.
                                    </>
                                ),
                            },
                            {
                                eyebrow: 'Thành phần triển khai',
                                title: 'Metrics, logs và giao diện truy vấn',
                                children: (
                                    <>
                                        <strong>Prometheus</strong> thu metrics,{' '}
                                        <strong>Loki</strong> lưu logs,{' '}
                                        <strong>Alloy</strong> chuyển container
                                        logs và <strong>Grafana</strong> làm
                                        giao diện truy vấn. Các workload nằm
                                        trong namespace observability riêng.
                                    </>
                                ),
                            },
                            {
                                eyebrow: 'Điều kiện pass',
                                title: 'Workload Ready và datasource hoạt động',
                                children: (
                                    <>
                                        Manifest apply thành công,
                                        Deployment/DaemonSet pass rollout,
                                        Grafana nhìn thấy{' '}
                                        <strong>
                                            Prometheus và Loki làm datasource
                                        </strong>{' '}
                                        để người vận hành có thể kiểm tra dữ
                                        liệu.
                                    </>
                                ),
                            },
                            {
                                eyebrow: 'Đánh đổi & kiểm soát',
                                title: 'Ổn định hơn nhưng cần dispatch có chủ đích',
                                children: (
                                    <>
                                        Workflow riêng giảm restart không cần
                                        thiết nhưng yêu cầu người vận hành chọn
                                        đúng release và approval. Public
                                        showcase chỉ mô tả kiến trúc,{' '}
                                        <strong>
                                            không hiển thị endpoint hoặc
                                            credential thật
                                        </strong>
                                        .
                                    </>
                                ),
                            },
                        ]}
                        passMessage={
                            <>
                                Stack observability <strong>Ready</strong> và
                                Grafana truy vấn được metrics/logs.
                            </>
                        }
                        failMessage={
                            <>
                                Dừng rollout, kiểm tra{' '}
                                <strong>manifest, datasource, PVC</strong> và
                                logs của monitoring workload.
                            </>
                        }
                    />
                </ShowcaseDisclosure>

                <ShowcaseDisclosure
                    id="platform-operations-frontend-flow"
                    number="1.1.6"
                    title="Luồng Frontend · Vercel"
                    description="Web được kiểm tra trong CI nhưng deploy bằng Vercel, tách khỏi image backend và K3s application namespace."
                >
                    <PlatformOperationsStaticFlow
                        detailId="platform-operations-frontend-flow-detail"
                        steps={[
                            {
                                number: '01',
                                title: 'Web quality gate',
                                description: (
                                    <>
                                        Khi web bị ảnh hưởng, CI chạy{' '}
                                        <strong>
                                            lint, type-check, unit test và
                                            Next.js build
                                        </strong>{' '}
                                        trước khi branch main được tiếp tục.
                                    </>
                                ),
                            },
                            {
                                number: '02',
                                title: 'Vercel build',
                                description: (
                                    <>
                                        Vercel nhận source từ branch main, build
                                        frontend bằng{' '}
                                        <strong>
                                            environment production riêng
                                        </strong>{' '}
                                        và quản lý deployment ở boundary độc
                                        lập.
                                    </>
                                ),
                            },
                            {
                                number: '03',
                                title: 'Không vào K3s',
                                description: (
                                    <>
                                        Frontend{' '}
                                        <strong>
                                            không tạo backend image, không gửi
                                            qua GHCR
                                        </strong>{' '}
                                        và không nằm trong rollout application
                                        trên EC2/K3s.
                                    </>
                                ),
                            },
                        ]}
                        detailNumber="04"
                        detailEyebrow="Boundary frontend và backend"
                        detailTitle="Frontend deploy độc lập với K3s"
                        detailItems={[
                            {
                                eyebrow: 'Mục đích',
                                title: 'Tách vòng đời giao diện khỏi backend',
                                children: (
                                    <>
                                        Frontend có thể build và phát hành qua{' '}
                                        <strong>Vercel</strong> mà không cần
                                        đóng gói thành image hoặc chờ
                                        application namespace rollout xong.
                                    </>
                                ),
                            },
                            {
                                eyebrow: 'Dữ liệu đầu vào',
                                title: 'Source web và environment phù hợp',
                                children: (
                                    <>
                                        CI kiểm tra source web; Vercel nhận{' '}
                                        <strong>branch main</strong> và dùng
                                        environment frontend đã cấu hình. Trang
                                        public không mô tả hoặc hiển thị giá trị
                                        secret.
                                    </>
                                ),
                            },
                            {
                                eyebrow: 'Điều kiện pass',
                                title: 'Build Next.js và smoke test hợp lệ',
                                children: (
                                    <>
                                        Web phải pass{' '}
                                        <strong>quality gate</strong>, Vercel
                                        build thành công và frontend HTTPS phản
                                        hồi được sau khi phát hành.
                                    </>
                                ),
                            },
                            {
                                eyebrow: 'Đánh đổi & kiểm soát',
                                title: 'Boundary độc lập, rollback độc lập',
                                children: (
                                    <>
                                        Frontend smoke fail không tự động
                                        rollback backend K3s. Hai boundary được
                                        kiểm tra và khôi phục theo quy trình
                                        riêng để tránh{' '}
                                        <strong>rollback nhầm workload</strong>.
                                    </>
                                ),
                            },
                        ]}
                        passMessage={
                            <>
                                Frontend được <strong>Vercel build</strong> và
                                truy cập được qua HTTPS.
                            </>
                        }
                        failMessage={
                            <>
                                Dừng ở frontend boundary; không rollback
                                application K3s tự động.
                            </>
                        }
                    />
                </ShowcaseDisclosure>

                <ShowcaseDisclosure
                    id="platform-operations-data-bootstrap-flow"
                    number="1.1.7"
                    title="Luồng bootstrap Data Infrastructure · Kafka và Keycloak"
                    description="Kafka và Keycloak là hạ tầng data/identity được bootstrap có chủ đích, không bị apply lại trong mỗi application deploy."
                >
                    <PlatformOperationsStaticFlow
                        detailId="platform-operations-data-bootstrap-flow-detail"
                        steps={[
                            {
                                number: '01',
                                title: 'Review manifest',
                                description: (
                                    <>
                                        Data infrastructure chỉ apply hoặc
                                        upgrade sau khi review{' '}
                                        <strong>
                                            manifest, compatibility và kế hoạch
                                            backup
                                        </strong>{' '}
                                        phù hợp.
                                    </>
                                ),
                            },
                            {
                                number: '02',
                                title: 'Kafka và Keycloak Ready',
                                description: (
                                    <>
                                        Kiểm tra{' '}
                                        <strong>
                                            broker, topic leader và OIDC
                                            provider
                                        </strong>{' '}
                                        sẵn sàng trước khi consumer, API hoặc
                                        workflow rollout cần đến chúng.
                                    </>
                                ),
                            },
                            {
                                number: '03',
                                title: 'Không gộp application deploy',
                                description: (
                                    <>
                                        Application rollout chỉ preflight
                                        dependency;{' '}
                                        <strong>
                                            không tự ý apply Kafka, Keycloak
                                            hoặc runtime secret
                                        </strong>{' '}
                                        trong mỗi release.
                                    </>
                                ),
                            },
                        ]}
                        detailNumber="04"
                        detailEyebrow="Boundary data và identity infrastructure"
                        detailTitle="Dependency nền tảng được bootstrap có chủ đích"
                        detailItems={[
                            {
                                eyebrow: 'Mục đích',
                                title: 'Ổn định dependency trước application',
                                children: (
                                    <>
                                        Kafka và Keycloak có vòng đời riêng.
                                        Tách bootstrap giúp application release
                                        chỉ kiểm tra{' '}
                                        <strong>dependency đã sẵn sàng</strong>{' '}
                                        thay vì thay đổi hạ tầng dữ liệu trong
                                        mỗi lần deploy.
                                    </>
                                ),
                            },
                            {
                                eyebrow: 'Dữ liệu cần kiểm tra',
                                title: 'Broker, topic, leader và OIDC',
                                children: (
                                    <>
                                        Kafka cần{' '}
                                        <strong>
                                            broker Ready và topic/leader hoạt
                                            động
                                        </strong>
                                        ; Keycloak cần OIDC discovery phản hồi
                                        để các service xác thực được identity và
                                        token.
                                    </>
                                ),
                            },
                            {
                                eyebrow: 'Điều kiện pass',
                                title: 'Dependency phản hồi trước rollout',
                                children: (
                                    <>
                                        Preflight xác nhận{' '}
                                        <strong>
                                            Kafka broker, topic và Keycloak
                                            discovery
                                        </strong>{' '}
                                        trước khi rollout consumer hoặc API. Nếu
                                        dependency chưa sẵn sàng, application
                                        không nên tiếp tục đổi image.
                                    </>
                                ),
                            },
                            {
                                eyebrow: 'Đánh đổi & kiểm soát',
                                title: 'Không tự động thay đổi data layer',
                                children: (
                                    <>
                                        Tách workflow giảm rủi ro apply nhầm hạ
                                        tầng nhưng yêu cầu operator quản lý{' '}
                                        <strong>
                                            manifest, backup và compatibility
                                        </strong>{' '}
                                        riêng. Runtime secret không được đưa vào
                                        tài liệu public.
                                    </>
                                ),
                            },
                        ]}
                        passMessage={
                            <>
                                <strong>Kafka/Keycloak Ready</strong> và
                                application có thể chạy preflight.
                            </>
                        }
                        failMessage={
                            <>
                                Dừng application rollout; xử lý dependency
                                trước,{' '}
                                <strong>không xóa dữ liệu tự động</strong>.
                            </>
                        }
                    />
                </ShowcaseDisclosure>
            </div>
        </ShowcaseDisclosure>
    );
}

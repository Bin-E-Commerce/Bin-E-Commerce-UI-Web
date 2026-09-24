// Hero mô tả release journey theo layout hai cột; component chỉ trình bày contract CI/CD, không gọi runtime integration.
import type { LucideIcon } from 'lucide-react';
import {
    Activity,
    Box,
    Check,
    GitPullRequest,
    KeyRound,
    ServerCog,
    ShieldCheck,
} from 'lucide-react';

interface PlatformOperationsFlowStepProps {
    number: string;
    title: string;
    description: string;
    icon: LucideIcon;
    last?: boolean;
}

// Render một chặng release trên timeline dọc, giữ icon và đường nối cùng một trục để mắt người đọc theo dõi tự nhiên.
function PlatformOperationsFlowStep({
    number,
    title,
    description,
    icon: Icon,
    last = false,
}: PlatformOperationsFlowStepProps) {
    return (
        <li className="relative flex gap-3">
            {!last ? (
                <span
                    aria-hidden="true"
                    className="absolute left-[13px] top-7 bottom-[-0.25rem] w-px bg-zinc-200"
                />
            ) : null}
            <span className="relative z-10 flex size-7 shrink-0 items-center justify-center rounded-xl border border-zinc-200 bg-white text-zinc-700">
                <Icon aria-hidden="true" className="size-3.5" />
            </span>
            <div className="min-w-0 pb-3">
                <div className="flex items-baseline gap-2">
                    <span className="font-mono text-[9px] font-semibold tracking-[0.12em] text-zinc-400">
                        {number}
                    </span>
                    <h3 className="text-sm font-semibold leading-5 text-zinc-950">
                        {title}
                    </h3>
                </div>
                <p className="mt-1 text-xs leading-5 text-zinc-600">
                    {description}
                </p>
            </div>
        </li>
    );
}

// Giúp người đọc thấy release đi qua source, quality gate, artifact, quyền deploy và evidence sau runtime trong một khung duy nhất.
export function PlatformOperationsRequestOverview() {
    return (
        <section
            id="platform-operations-request-overview"
            tabIndex={-1}
            className="scroll-mt-24 outline-none focus-visible:ring-2 focus-visible:ring-zinc-300"
            aria-labelledby="platform-operations-request-title"
        >
            <div className="overflow-hidden rounded-[1.75rem] border border-zinc-200 bg-white p-4 shadow-[0_18px_52px_-42px_rgba(24,24,27,0.45)] sm:p-5 lg:p-6">
                <div className="grid gap-5 lg:grid-cols-[minmax(0,0.78fr)_minmax(360px,1.22fr)] lg:gap-7">
                    <div className="flex min-w-0 flex-col justify-center px-1 py-2 text-center sm:px-3 lg:px-2 lg:py-5">
                        <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500">
                            Release journey
                        </p>
                        <h2
                            id="platform-operations-request-title"
                            className="mt-3 text-2xl font-semibold leading-tight tracking-[-0.04em] text-zinc-950 sm:text-3xl"
                        >
                            Một thay đổi đi qua hệ thống như thế nào?
                        </h2>
                        <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-zinc-600">
                            CI bảo vệ chất lượng, registry giữ artifact bất
                            biến, SSM tạo đường vào production và K3s giữ
                            workload đúng trạng thái mong muốn.
                        </p>

                        <div className="mt-6 rounded-2xl border border-zinc-200 bg-zinc-50/70 p-3.5 text-left">
                            <div className="text-center">
                                <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500">
                                    Một release đi qua
                                </p>
                                <p className="mt-1 text-[10px] text-zinc-400">
                                    4 lớp kiểm soát trước khi phục vụ traffic
                                </p>
                            </div>
                            <div className="mt-3 flex flex-wrap items-center justify-center gap-1.5 text-[11px] text-zinc-700">
                                <span className="rounded-xl border border-zinc-200 bg-white px-3 py-2 font-medium">
                                    Source
                                </span>
                                <span
                                    aria-hidden="true"
                                    className="text-zinc-400"
                                >
                                    →
                                </span>
                                <span className="rounded-xl border border-zinc-200 bg-white px-3 py-2 font-medium">
                                    Quality
                                </span>
                                <span
                                    aria-hidden="true"
                                    className="text-zinc-400"
                                >
                                    →
                                </span>
                                <span className="rounded-xl border border-zinc-200 bg-white px-3 py-2 font-medium">
                                    Artifact
                                </span>
                                <span
                                    aria-hidden="true"
                                    className="text-zinc-400"
                                >
                                    →
                                </span>
                                <span className="rounded-xl border border-zinc-200 bg-white px-3 py-2 font-medium">
                                    Runtime
                                </span>
                            </div>
                        </div>

                        <dl className="mt-3 grid gap-2 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
                            <div className="flex flex-col items-center gap-1.5 rounded-xl border border-zinc-200 bg-white p-3 text-center">
                                <Box
                                    aria-hidden="true"
                                    className="size-4 text-zinc-700"
                                />
                                <dt className="text-xs font-semibold text-zinc-950">
                                    Release bất biến
                                </dt>
                            </div>
                            <div className="flex flex-col items-center gap-1.5 rounded-xl border border-zinc-200 bg-white p-3 text-center">
                                <KeyRound
                                    aria-hidden="true"
                                    className="size-4 text-zinc-700"
                                />
                                <dt className="text-xs font-semibold text-zinc-950">
                                    Quyền rõ ràng
                                </dt>
                            </div>
                            <div className="flex flex-col items-center gap-1.5 rounded-xl border border-zinc-200 bg-white p-3 text-center">
                                <Activity
                                    aria-hidden="true"
                                    className="size-4 text-zinc-700"
                                />
                                <dt className="text-xs font-semibold text-zinc-950">
                                    Có evidence
                                </dt>
                            </div>
                        </dl>
                    </div>

                    <div className="min-w-0 rounded-2xl border border-zinc-200 bg-white p-3.5 sm:p-4">
                        <header className="flex items-end justify-between gap-3 border-b border-zinc-100 pb-3">
                            <div>
                                <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500">
                                    Luồng tổng quát
                                </p>
                                <h2 className="mt-1 text-base font-semibold tracking-tight text-zinc-950">
                                    Từ source change đến runtime evidence
                                </h2>
                            </div>
                            <span className="shrink-0 rounded-full border border-zinc-200 bg-zinc-50 px-2.5 py-1 font-mono text-[10px] text-zinc-500">
                                6 chặng
                            </span>
                        </header>

                        <ol className="mt-4">
                            <PlatformOperationsFlowStep
                                number="01"
                                title="Pull Request"
                                icon={GitPullRequest}
                                description="Detect affected services đọc Git diff để xác định service, frontend hoặc hạ tầng cần được kiểm tra."
                            />
                            <PlatformOperationsFlowStep
                                number="02"
                                title="CI quality gate"
                                icon={ShieldCheck}
                                description="Lint, type-check, unit test, build, Docker healthcheck và kubeconform chặn lỗi trước artifact."
                            />
                            <PlatformOperationsFlowStep
                                number="03"
                                title="Build image + SBOM"
                                icon={Box}
                                description="Buildx tạo image theo full SHA; GHCR, Trivy, SBOM và release manifest tạo bằng chứng supply chain."
                            />
                            <PlatformOperationsFlowStep
                                number="04"
                                title="Production approval"
                                icon={KeyRound}
                                description="GitHub Environment yêu cầu reviewer approve trước khi workflow nhận AWS credential ngắn hạn."
                            />
                            <PlatformOperationsFlowStep
                                number="05"
                                title="AWS OIDC → SSM → K3s"
                                icon={ServerCog}
                                description="SSM gửi script tới EC2 Online; script kiểm tra Kafka, đổi image bị ảnh hưởng và chờ readiness rollout."
                            />
                            <PlatformOperationsFlowStep
                                number="06"
                                title="Observe và rollback"
                                icon={Check}
                                description="Prometheus/Grafana, Alloy/Loki và diagnostics xác nhận release; lỗi thì rollback Deployment đã đổi."
                                last
                            />
                        </ol>

                        <div className="mt-1 flex items-start gap-2 border-t border-zinc-100 pt-3 text-xs leading-5 text-zinc-600">
                            <ShieldCheck
                                aria-hidden="true"
                                className="mt-0.5 size-4 shrink-0 text-zinc-700"
                            />
                            <p>
                                <span className="font-semibold text-zinc-950">
                                    Điểm kiểm soát:
                                </span>{' '}
                                release chỉ được coi là thành công khi image
                                đúng SHA, Pod Ready và metrics/logs không cho
                                thấy regression rõ ràng.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

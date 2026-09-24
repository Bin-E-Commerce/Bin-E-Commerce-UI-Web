// Mô tả đường đi của release từ artifact và quyền deploy đến EC2, K3s, namespace và public ingress.
import {
    Activity,
    CheckCircle2,
    Database,
    Layers3,
    Network,
    RefreshCw,
    SearchCheck,
    Settings2,
    ShieldCheck,
} from 'lucide-react';

import { ShowcaseArchitectureLane } from '../../../components/shared/ShowcaseArchitectureLane';
import { ShowcaseDisclosure } from '../../../components/shared/ShowcaseDisclosure';
import { ShowcaseNote } from '../../../components/shared/ShowcaseNote';
import { PlatformOperationsK3sManagement } from './PlatformOperationsK3sManagement';

interface PlatformOperationsBoundaryCardProps {
    icon: React.ReactNode;
    name: string;
    purpose: string;
    workloads: React.ReactNode;
    boundary: React.ReactNode;
}

// Mô tả namespace theo vai trò, workload thực tế và giới hạn để người đọc không nhầm boundary với HA hoặc security isolation.
function PlatformOperationsBoundaryCard({
    icon,
    name,
    purpose,
    workloads,
    boundary,
}: PlatformOperationsBoundaryCardProps) {
    return (
        <article className="rounded-2xl border border-zinc-200 bg-white p-4 sm:p-5">
            <header className="flex items-start gap-3 border-b border-zinc-200 pb-3">
                <span className="mt-0.5 shrink-0 text-zinc-700">{icon}</span>
                <div className="min-w-0">
                    <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
                        Namespace
                    </p>
                    <h4 className="mt-1 break-words text-sm font-semibold text-zinc-950">
                        {name}
                    </h4>
                </div>
            </header>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
                        Vai trò
                    </p>
                    <p className="mt-1 text-xs leading-5 text-zinc-600">
                        {purpose}
                    </p>
                </div>
                <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
                        Workload hiện tại
                    </p>
                    <p className="mt-1 text-xs leading-5 text-zinc-600">
                        {workloads}
                    </p>
                </div>
            </div>
            <div className="mt-3 rounded-xl border border-zinc-200 bg-white px-3 py-2.5">
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
                    Boundary cần nhớ
                </p>
                <p className="mt-1 text-xs leading-5 text-zinc-600">
                    {boundary}
                </p>
            </div>
        </article>
    );
}

interface PlatformOperationsK3sProblemCardProps {
    icon: React.ReactNode;
    eyebrow: string;
    title: string;
    description: React.ReactNode;
}

// Giải thích bài toán vận hành mà K3s giải quyết bằng ví dụ gần với workload production hiện tại.
function PlatformOperationsK3sProblemCard({
    icon,
    eyebrow,
    title,
    description,
}: PlatformOperationsK3sProblemCardProps) {
    return (
        <article className="rounded-xl border border-zinc-200 bg-white p-4">
            <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
                <span className="shrink-0 text-zinc-700">{icon}</span>
                <span>{eyebrow}</span>
            </div>
            <h4 className="mt-3 text-sm font-semibold text-zinc-950">
                {title}
            </h4>
            <p className="mt-2 text-xs leading-5 text-zinc-600">
                {description}
            </p>
        </article>
    );
}

// Ghép các boundary production theo thứ tự đọc từ artifact, access control, runtime đến public traffic.
export function PlatformOperationsProductionArchitecture() {
    return (
        <ShowcaseDisclosure
            id="platform-operations-production"
            number="2"
            title="Kiến trúc production và quản lý K3s"
            description="Release được approve đi qua quyền truy cập ngắn hạn, SSM và EC2 trước khi trở thành workload được K3s quản lý."
        >
            <div className="space-y-6">
                <ShowcaseDisclosure
                    id="platform-operations-k3s-use-cases"
                    number="2.1"
                    title="K3s giải quyết những bài toán gì?"
                    description="Các card dưới đây mô tả đúng những gì manifest, workflow và runbook hiện tại đang xử lý; phần giới hạn hoặc hạng mục sẽ triển khai thêm được ghi ngay trong nội dung."
                >
                    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                        <PlatformOperationsK3sProblemCard
                            icon={
                                <RefreshCw
                                    aria-hidden="true"
                                    className="size-4"
                                />
                            }
                            eyebrow="01 · Self-healing"
                            title="Container crash không làm service dừng vĩnh viễn"
                            description={
                                <>
                                    Application đang chạy bằng{' '}
                                    <strong>
                                        Deployment có replica và probe
                                    </strong>
                                    . Khi Pod hoặc process lỗi, controller của
                                    K3s sẽ tạo Pod thay thế theo template. Đây
                                    là self-healing ở mức workload;{' '}
                                    <strong>single-node EC2 chưa có HA</strong>
                                    khi chính node bị hỏng.
                                </>
                            }
                        />
                        <PlatformOperationsK3sProblemCard
                            icon={
                                <CheckCircle2
                                    aria-hidden="true"
                                    className="size-4"
                                />
                            }
                            eyebrow="02 · Desired state"
                            title="Giữ đúng số replica và image mong muốn"
                            description={
                                <>
                                    Manifest và script deploy đã khai báo{' '}
                                    <strong>
                                        replica, image, cấu hình và Pod template
                                    </strong>
                                    . Release dùng full commit SHA, sau đó kiểm
                                    tra rollout.{' '}
                                    <strong>
                                        Autoscaling/HPA chưa triển khai
                                    </strong>
                                    ; số replica hiện được điều chỉnh chủ động.
                                </>
                            }
                        />
                        <PlatformOperationsK3sProblemCard
                            icon={
                                <Network
                                    aria-hidden="true"
                                    className="size-4"
                                />
                            }
                            eyebrow="03 · Service discovery"
                            title="Service không phụ thuộc IP Pod"
                            description={
                                <>
                                    Các service application và data đã có{' '}
                                    <strong>Service + DNS nội bộ</strong>, ví dụ
                                    workload gọi Kafka/Keycloak qua tên Service
                                    trong cluster. Selector trỏ đến Pod phù hợp,
                                    nên Pod thay mới không làm downstream phải
                                    biết IP mới.
                                </>
                            }
                        />
                        <PlatformOperationsK3sProblemCard
                            icon={
                                <ShieldCheck
                                    aria-hidden="true"
                                    className="size-4"
                                />
                            }
                            eyebrow="04 · Safe rollout"
                            title="Release mới không nhận traffic quá sớm"
                            description={
                                <>
                                    Các Deployment đã khai báo{' '}
                                    <strong>readiness/liveness probe</strong>;
                                    script deploy chờ rollout status trước khi
                                    kết thúc release. Nếu revision mới lỗi,
                                    workflow có chẩn đoán và rollback image
                                    application. Đây chưa phải cam kết zero
                                    downtime vì workload hiện chủ yếu{' '}
                                    <strong>1 replica</strong>.
                                </>
                            }
                        />
                        <PlatformOperationsK3sProblemCard
                            icon={
                                <Layers3
                                    aria-hidden="true"
                                    className="size-4"
                                />
                            }
                            eyebrow="05 · Boundary"
                            title="Tách application, data và observability"
                            description={
                                <>
                                    Repository đã tách namespace và manifest cho{' '}
                                    <strong>
                                        application, data và observability
                                    </strong>
                                    ; observability cũng có script deploy riêng.
                                    Tuy nhiên,{' '}
                                    <strong>
                                        NetworkPolicy, quota và RBAC phân tách
                                        chặt chưa triển khai đầy đủ
                                    </strong>
                                    , nên namespace hiện chủ yếu là boundary
                                    quản lý và chẩn đoán.
                                </>
                            }
                        />
                        <PlatformOperationsK3sProblemCard
                            icon={
                                <SearchCheck
                                    aria-hidden="true"
                                    className="size-4"
                                />
                            }
                            eyebrow="06 · Operations"
                            title="Có một cách chuẩn để debug workload"
                            description={
                                <>
                                    Runbook đã có luồng chuẩn bằng{' '}
                                    <strong>
                                        kubectl, Events, logs, probes
                                    </strong>{' '}
                                    và script chẩn đoán; Prometheus, Grafana,
                                    Loki và Alloy cũng đã có manifest.{' '}
                                    <strong>
                                        Alert routing ra kênh ngoài và
                                        distributed tracing chưa triển khai
                                    </strong>
                                    , nên phần quan sát hiện tập trung vào
                                    metrics, logs và readiness.
                                </>
                            }
                        />
                    </div>
                    <ShowcaseNote
                        title="K3s không giải quyết mọi bài toán"
                        tone="white"
                        className="mt-3"
                        compact
                    >
                        <p>
                            Deployment/Service, probe, namespace, rollout và
                            runbook quản trị đã được mô tả trong repository.
                            <strong> Chưa triển khai:</strong> HA nhiều node,
                            autoscaling, NetworkPolicy/RBAC hoàn chỉnh, backup
                            và disaster recovery cho database, secret provider
                            bên ngoài, alert routing và tracing. Các hạng mục
                            này sẽ được bổ sung sau nếu production cần.
                        </p>
                    </ShowcaseNote>
                </ShowcaseDisclosure>

                <ShowcaseDisclosure
                    id="platform-operations-artifact-access"
                    number="2.2"
                    title="Artifact và quyền deploy"
                    description="Release được khóa từ commit đã CI pass đến image digest và approval; production luôn biết chính xác artifact nào được phép chạy."
                >
                    <section className="rounded-2xl border border-zinc-200 bg-white p-4 sm:p-5">
                        <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-500">
                            Khái niệm cốt lõi
                        </p>
                        <h3 className="mt-1 text-base font-semibold tracking-tight text-zinc-950">
                            Artifact và quyền deploy là gì?
                        </h3>
                        <div className="mt-3 grid gap-3 md:grid-cols-2">
                            <div className="rounded-xl border border-zinc-200 bg-white p-3">
                                <p className="text-sm font-semibold text-zinc-950">
                                    Artifact là gì?
                                </p>
                                <p className="mt-1 text-xs leading-5 text-zinc-600">
                                    Artifact là sản phẩm đã được CI kiểm tra và
                                    đóng gói để chạy, ở đây gồm{' '}
                                    <strong>
                                        Docker image, tag SHA, digest và release
                                        manifest
                                    </strong>
                                    . Production pull đúng artifact này thay vì
                                    build lại từ source hoặc dùng tag có thể bị
                                    đổi.
                                </p>
                            </div>
                            <div className="rounded-xl border border-zinc-200 bg-white p-3">
                                <p className="text-sm font-semibold text-zinc-950">
                                    Quyền deploy là gì?
                                </p>
                                <p className="mt-1 text-xs leading-5 text-zinc-600">
                                    Đây là điều kiện để một workflow được phép
                                    đưa artifact vào production. Workflow phải
                                    gắn với <strong>release SHA</strong>, qua{' '}
                                    <strong>GitHub Environment approval</strong>{' '}
                                    rồi mới gửi lệnh deploy; Pull Request chưa
                                    được approve không tự chạy production.
                                </p>
                            </div>
                        </div>
                        <p className="mt-3 rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-xs leading-5 text-zinc-600">
                            Nói ngắn gọn:{' '}
                            <strong>CI tạo và kiểm tra artifact</strong>, còn{' '}
                            <strong>
                                approval quyết định artifact nào được phép chạy
                            </strong>
                            . Commit SHA/digest giúp truy nguyên source và
                            rollback về đúng phiên bản khi có sự cố.
                        </p>
                    </section>
                    <ShowcaseArchitectureLane
                        className="mt-3"
                        label="Commit → release"
                        title="Từ commit SHA đến release manifest"
                        description="Mỗi bước bàn giao một evidence rõ ràng để production biết chính xác source và artifact nào đang được triển khai."
                        nodes={[
                            {
                                name: 'Full commit SHA',
                                responsibility: (
                                    <>
                                        Workflow chốt{' '}
                                        <strong>full 40-character SHA</strong>{' '}
                                        của commit đã CI pass và checkout đúng
                                        commit đó. Nhờ vậy Build Images không
                                        build nhầm working tree hoặc tag{' '}
                                        <code>latest</code>.
                                    </>
                                ),
                            },
                            {
                                name: 'Docker image',
                                responsibility: (
                                    <>
                                        Build Images đóng gói đúng service bị
                                        ảnh hưởng, tạo image reproducible và gắn
                                        tag bằng{' '}
                                        <strong>full commit SHA</strong> để có
                                        thể truy ngược về source.
                                    </>
                                ),
                            },
                            {
                                name: 'GHCR + digest',
                                responsibility: (
                                    <>
                                        GHCR lưu image cùng{' '}
                                        <strong>digest bất biến</strong>. Node
                                        production pull đúng artifact đã scan
                                        thay vì tự build lại hoặc nhận một tag
                                        có thể bị đổi.
                                    </>
                                ),
                            },
                            {
                                name: 'Release manifest',
                                responsibility: (
                                    <>
                                        Manifest ghi mapping giữa{' '}
                                        <strong>
                                            service, image tag, digest và
                                            release SHA
                                        </strong>
                                        . Đây là bằng chứng để biết release đang
                                        chạy thành phần nào.
                                    </>
                                ),
                            },
                            {
                                name: 'Production approval',
                                responsibility: (
                                    <>
                                        Deploy Production chỉ tiếp tục sau khi
                                        reviewer kiểm tra{' '}
                                        <strong>release SHA</strong> và approve{' '}
                                        <strong>
                                            GitHub Environment production
                                        </strong>
                                        ; Pull Request không tự deploy.
                                    </>
                                ),
                            },
                        ]}
                    />
                    <ShowcaseNote
                        title="Ranh giới artifact"
                        tone="white"
                        className="mt-3"
                        compact
                    >
                        <p>
                            Production không dùng <code>latest</code>. Image
                            phải được xác định bằng commit SHA hoặc digest để có
                            thể truy nguyên và rollback.
                        </p>
                    </ShowcaseNote>
                </ShowcaseDisclosure>

                <ShowcaseDisclosure
                    id="platform-operations-oidc-ssm"
                    number="2.3"
                    title="AWS OIDC và SSM"
                    description="Workflow không SSH trực tiếp vào EC2: OIDC tạo identity, STS cấp quyền ngắn hạn và SSM chuyển lệnh deploy đến node production."
                >
                    <section className="rounded-2xl border border-zinc-200 bg-white p-4 sm:p-5">
                        <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-500">
                            Khái niệm cốt lõi
                        </p>
                        <h3 className="mt-1 text-base font-semibold tracking-tight text-zinc-950">
                            AWS OIDC và SSM dùng để làm gì?
                        </h3>
                        <div className="mt-3 grid gap-3 md:grid-cols-2">
                            <div className="rounded-xl border border-zinc-200 bg-white p-3">
                                <p className="text-sm font-semibold text-zinc-950">
                                    OIDC và STS: cấp quyền tạm thời
                                </p>
                                <p className="mt-1 text-xs leading-5 text-zinc-600">
                                    GitHub Actions dùng OIDC để chứng minh
                                    workflow đến từ repository và environment
                                    hợp lệ. AWS STS kiểm tra identity đó rồi cấp{' '}
                                    <strong>
                                        credential ngắn hạn theo IAM role
                                    </strong>
                                    , thay vì lưu AWS access key dài hạn trong
                                    GitHub Secrets.
                                </p>
                            </div>
                            <div className="rounded-xl border border-zinc-200 bg-white p-3">
                                <p className="text-sm font-semibold text-zinc-950">
                                    SSM: gửi lệnh đến EC2
                                </p>
                                <p className="mt-1 text-xs leading-5 text-zinc-600">
                                    AWS Systems Manager kiểm tra node có đang{' '}
                                    <strong>Online</strong> không, sau đó gửi
                                    script deploy đến EC2 qua SSM Run Command.
                                    EC2 không cần mở SSH public và workflow có
                                    thể theo dõi trạng thái lệnh từ xa.
                                </p>
                            </div>
                        </div>
                        <p className="mt-3 rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-xs leading-5 text-zinc-600">
                            Nói ngắn gọn:{' '}
                            <strong>
                                OIDC/STS trả lời “workflow này có được cấp quyền
                                không?”
                            </strong>
                            , còn{' '}
                            <strong>
                                SSM trả lời “gửi script đến node production bằng
                                cách nào?”
                            </strong>
                            . Hai lớp này giúp tách quyền AWS khỏi việc thực thi
                            workload trên EC2/K3s.
                        </p>
                    </section>
                    <ShowcaseArchitectureLane
                        className="mt-3"
                        label="GitHub Actions → EC2"
                        title="Đường vào production có kiểm soát"
                        description="Mỗi node trong flow có một trách nhiệm riêng: cấp quyền, kiểm tra node và thực thi script deploy."
                        nodes={[
                            {
                                name: 'GitHub Actions',
                                responsibility: (
                                    <>
                                        Điều phối release sau khi{' '}
                                        <strong>CI và Build Images</strong>{' '}
                                        thành công; workflow giữ release SHA,
                                        danh sách service và manifest làm đầu
                                        vào deploy.
                                    </>
                                ),
                            },
                            {
                                name: 'GitHub OIDC',
                                responsibility: (
                                    <>
                                        Cung cấp identity có thể xác minh cho
                                        workflow; repository không cần lưu{' '}
                                        <strong>AWS access key dài hạn</strong>{' '}
                                        trong GitHub Secrets.
                                    </>
                                ),
                            },
                            {
                                name: 'AWS STS',
                                responsibility: (
                                    <>
                                        Đổi OIDC token thành{' '}
                                        <strong>credential AWS ngắn hạn</strong>{' '}
                                        theo IAM role. Credential chỉ dùng trong
                                        thời gian workflow và đúng quyền được
                                        cấp.
                                    </>
                                ),
                            },
                            {
                                name: 'SSM Online check',
                                responsibility: (
                                    <>
                                        Kiểm tra instance production đang{' '}
                                        <strong>Online</strong> trong Systems
                                        Manager trước khi gửi lệnh; nếu node
                                        offline, workflow dừng trước bước
                                        deploy.
                                    </>
                                ),
                            },
                            {
                                name: 'AWS-RunShellScript',
                                responsibility: (
                                    <>
                                        SSM truyền{' '}
                                        <strong>
                                            script, release metadata và image
                                            reference
                                        </strong>{' '}
                                        đã kiểm tra đến EC2 để node tự chạy K3s
                                        rollout theo đúng thứ tự.
                                    </>
                                ),
                            },
                        ]}
                    />
                    <ShowcaseNote
                        title="Không đưa secret vào tài liệu public"
                        tone="white"
                        className="mt-3"
                        compact
                    >
                        <p>
                            Tài liệu chỉ dùng placeholder như{' '}
                            <code>&lt;instance-id&gt;</code> hoặc{' '}
                            <code>&lt;role-arn&gt;</code>; không hiển thị
                            account ID, token, IP, database URL hoặc secret
                            value.
                        </p>
                    </ShowcaseNote>
                </ShowcaseDisclosure>

                <ShowcaseDisclosure
                    id="platform-operations-k3s-management"
                    number="2.4"
                    title="Quản lý workload trên K3s"
                    description="K3s là runtime điều phối container trên EC2: từ node health, Pod diagnostics đến rollout, rollback và runtime debug."
                >
                    <PlatformOperationsK3sManagement />
                </ShowcaseDisclosure>

                <ShowcaseDisclosure
                    id="platform-operations-namespaces"
                    number="2.5"
                    title="Namespace và boundary"
                    description="Mỗi namespace gom một nhóm workload có cùng trách nhiệm để deploy, kiểm tra và phân quyền rõ hơn; namespace không tự biến single-node thành HA hay thay thế NetworkPolicy."
                >
                    <div className="rounded-2xl border border-zinc-200 bg-white p-4 sm:p-5">
                        <div className="grid gap-3 md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] md:items-center">
                            <div className="rounded-xl border border-zinc-200 bg-white px-3 py-3">
                                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
                                    01 · Application
                                </p>
                                <p className="mt-1 text-xs font-semibold text-zinc-950">
                                    Nhận request và chạy business workload
                                </p>
                            </div>
                            <span className="hidden text-center text-zinc-400 md:block">
                                →
                            </span>
                            <div className="rounded-xl border border-zinc-200 bg-white px-3 py-3">
                                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
                                    02 · Data
                                </p>
                                <p className="mt-1 text-xs font-semibold text-zinc-950">
                                    Cung cấp dependency nội bộ
                                </p>
                            </div>
                            <span className="hidden text-center text-zinc-400 md:block">
                                →
                            </span>
                            <div className="rounded-xl border border-zinc-200 bg-white px-3 py-3">
                                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
                                    03 · Observability
                                </p>
                                <p className="mt-1 text-xs font-semibold text-zinc-950">
                                    Thu metrics và logs để kiểm tra
                                </p>
                            </div>
                            <span className="hidden text-center text-zinc-400 md:block">
                                →
                            </span>
                            <div className="rounded-xl border border-zinc-200 bg-white px-3 py-3">
                                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
                                    04 · System
                                </p>
                                <p className="mt-1 text-xs font-semibold text-zinc-950">
                                    Thành phần nền của K3s
                                </p>
                            </div>
                        </div>
                        <p className="mt-3 text-xs leading-5 text-zinc-600">
                            Namespace giúp người vận hành khoanh vùng lệnh{' '}
                            <strong>get, logs, events và rollout</strong> đúng
                            nhóm workload. Đây là boundary quản lý trong
                            cluster; muốn cô lập network hoặc quyền truy cập
                            chặt hơn vẫn cần cấu hình NetworkPolicy và RBAC
                            riêng.
                        </p>
                    </div>

                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                        <PlatformOperationsBoundaryCard
                            icon={
                                <Layers3
                                    aria-hidden="true"
                                    className="size-4"
                                />
                            }
                            name="bin-ecommerce-app"
                            purpose="Chạy request path và các service/worker phục vụ nghiệp vụ commerce."
                            workloads="API Gateway, backend services, AI service và AI workers được khai báo bằng Deployment/Service."
                            boundary="Application gọi dependency qua Service DNS; không đặt Kafka, Keycloak hoặc stack monitoring vào đây."
                        />
                        <PlatformOperationsBoundaryCard
                            icon={
                                <Database
                                    aria-hidden="true"
                                    className="size-4"
                                />
                            }
                            name="bin-ecommerce-data"
                            purpose="Cung cấp dependency stateful hoặc identity mà application cần dùng trong cluster."
                            workloads="Kafka chạy bằng StatefulSet; Keycloak chạy bằng Deployment và Service."
                            boundary="Application kết nối qua DNS như kafka.bin-ecommerce-data.svc.cluster.local; database managed bên ngoài không được gọi là workload ở namespace này."
                        />
                        <PlatformOperationsBoundaryCard
                            icon={
                                <Activity
                                    aria-hidden="true"
                                    className="size-4"
                                />
                            }
                            name="bin-ecommerce-observability"
                            purpose="Thu thập metrics/logs và cung cấp dashboard để kiểm tra node, Pod và rollout."
                            workloads="Prometheus, Grafana, Loki, kube-state-metrics, Node Exporter và Alloy có manifest riêng."
                            boundary="Stack được deploy bằng workflow/script observability riêng; Prometheus và Loki không mở public trực tiếp."
                        />
                        <PlatformOperationsBoundaryCard
                            icon={
                                <Settings2
                                    aria-hidden="true"
                                    className="size-4"
                                />
                            }
                            name="kube-system"
                            purpose="Dành cho thành phần nền do K3s và cluster sử dụng để vận hành workload."
                            workloads="Không phải nơi đặt API, worker hoặc data dependency của business application."
                            boundary="Không apply manifest application vào đây; khi debug cần phân biệt lỗi system component với lỗi workload."
                        />
                    </div>
                    <ShowcaseNote
                        title="Phân biệt workload và managed data"
                        tone="white"
                        className="mt-3"
                        compact
                    >
                        <p>
                            <strong>Kafka và Keycloak</strong> hiện có manifest
                            trong K3s nên được mô tả đúng theo resource thực tế.
                            Ngược lại, database managed bên ngoài cluster chỉ là
                            dependency được application kết nối tới; không gọi
                            chúng là StatefulSet nếu manifest không triển khai
                            chúng trong K3s.
                        </p>
                    </ShowcaseNote>
                </ShowcaseDisclosure>

                <ShowcaseDisclosure
                    id="platform-operations-edge-tls"
                    number="2.6"
                    title="Traefik và TLS"
                    description="Traffic public đi qua Vercel và Traefik trước khi đến API Gateway; các dependency nội bộ không được public trực tiếp."
                >
                    <section className="rounded-2xl border border-zinc-200 bg-white p-4 sm:p-5">
                        <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-500">
                            Khái niệm cốt lõi
                        </p>
                        <h3 className="mt-1 text-base font-semibold tracking-tight text-zinc-950">
                            Traefik và TLS là gì?
                        </h3>
                        <div className="mt-3 grid gap-3 md:grid-cols-2">
                            <div className="rounded-xl border border-zinc-200 bg-white p-3">
                                <p className="text-sm font-semibold text-zinc-950">
                                    Traefik làm gì?
                                </p>
                                <p className="mt-1 text-xs leading-5 text-zinc-600">
                                    Traefik là{' '}
                                    <strong>Ingress Controller</strong> của K3s.
                                    Nó đọc rule Ingress, nhận request từ
                                    Internet, kiểm tra host/path rồi chuyển
                                    request đến Service đúng, thay vì public
                                    từng Pod hoặc từng service nội bộ.
                                </p>
                            </div>
                            <div className="rounded-xl border border-zinc-200 bg-white p-3">
                                <p className="text-sm font-semibold text-zinc-950">
                                    TLS làm gì?
                                </p>
                                <p className="mt-1 text-xs leading-5 text-zinc-600">
                                    TLS mã hóa kết nối HTTPS và xác nhận domain
                                    đang truy cập. Trong manifest hiện tại,
                                    cert-manager dùng ACME HTTP-01 để tạo và gia
                                    hạn <strong>TLS certificate/Secret</strong>{' '}
                                    cho Ingress đã cấu hình.
                                </p>
                            </div>
                        </div>
                        <p className="mt-3 rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-xs leading-5 text-zinc-600">
                            Nói ngắn gọn:{' '}
                            <strong>
                                Traefik quyết định request đi vào đâu
                            </strong>
                            , còn{' '}
                            <strong>TLS bảo vệ kết nối trên đường đi</strong>.
                            Hai phần này không thay thế authentication hoặc
                            authorization của API Gateway.
                        </p>
                    </section>
                    <ShowcaseArchitectureLane
                        className="mt-3"
                        label="Public traffic"
                        title="Từ client đến application Pod"
                        description="Traefik nhận HTTPS và chuyển request đến Service; Service chỉ route đến Pod đã vượt qua readiness."
                        nodes={[
                            {
                                name: 'Client + Vercel',
                                responsibility: (
                                    <>
                                        Vercel phục vụ frontend và gọi backend
                                        qua{' '}
                                        <strong>public HTTPS endpoint</strong>;
                                        frontend không chạy như workload trong
                                        K3s.
                                    </>
                                ),
                            },
                            {
                                name: 'Traefik Ingress',
                                responsibility: (
                                    <>
                                        Nhận <strong>HTTPS</strong>, route
                                        host/path và chuyển traffic đến API
                                        Gateway thay vì public từng service nội
                                        bộ.
                                    </>
                                ),
                            },
                            {
                                name: 'cert-manager',
                                responsibility: (
                                    <>
                                        Quản lý vòng đời{' '}
                                        <strong>TLS certificate</strong> cho
                                        Ingress được cấu hình và hỗ trợ gia hạn
                                        trước khi hết hạn.
                                    </>
                                ),
                            },
                            {
                                name: 'API Gateway Service',
                                responsibility: (
                                    <>
                                        Là{' '}
                                        <strong>cửa vào public duy nhất</strong>{' '}
                                        của backend, xác thực request và route
                                        đến downstream service phù hợp.
                                    </>
                                ),
                            },
                            {
                                name: 'Application Pod',
                                responsibility: (
                                    <>
                                        Chỉ xử lý request khi{' '}
                                        <strong>Pod Ready</strong> và các
                                        dependency chính đã sẵn sàng; Pod
                                        Running đơn thuần chưa đủ.
                                    </>
                                ),
                            },
                        ]}
                    />
                    <ShowcaseNote
                        title="Giới hạn single-node"
                        tone="white"
                        className="mt-3"
                        compact
                    >
                        <p>
                            Traefik không biến một EC2 thành HA cluster. Nếu
                            node production hỏng, toàn bộ workload trên K3s có
                            thể bị ảnh hưởng.
                        </p>
                    </ShowcaseNote>
                </ShowcaseDisclosure>
            </div>
        </ShowcaseDisclosure>
    );
}

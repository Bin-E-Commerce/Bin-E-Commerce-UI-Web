// Tài liệu hóa cách kiểm tra, rollout, debug và rollback workload trên K3s bằng các lệnh không chứa secret production.
import { ShowcaseArchitectureLane } from '../../../components/shared/ShowcaseArchitectureLane';
import { ShowcaseDisclosure } from '../../../components/shared/ShowcaseDisclosure';
import { ShowcaseNote } from '../../../components/shared/ShowcaseNote';
import { PlatformOperationsK3sCommandGroup } from './PlatformOperationsK3sCommandGroup';

interface PlatformOperationsK3sIssueCardProps {
    title: string;
    flow: string;
}

interface PlatformOperationsK3sConceptCardProps {
    term: string;
    title: string;
    description: React.ReactNode;
}

// Giải thích các khái niệm K3s bằng vai trò và mối liên hệ thực tế với workload production.
function PlatformOperationsK3sConceptCard({
    term,
    title,
    description,
}: PlatformOperationsK3sConceptCardProps) {
    return (
        <article className="rounded-xl border border-zinc-200 bg-white p-4">
            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
                {term}
            </p>
            <h4 className="mt-1 text-sm font-semibold text-zinc-950">
                {title}
            </h4>
            <p className="mt-2 text-xs leading-5 text-zinc-600">
                {description}
            </p>
        </article>
    );
}

// Hiển thị triệu chứng và hướng điều tra theo flow ngắn để người đọc không bắt đầu bằng lệnh xóa resource.
function PlatformOperationsK3sIssueCard({
    title,
    flow,
}: PlatformOperationsK3sIssueCardProps) {
    return (
        <article className="rounded-xl border border-zinc-200 bg-white p-4">
            <h4 className="text-sm font-semibold text-zinc-950">{title}</h4>
            <p className="mt-2 text-xs leading-5 text-zinc-600">{flow}</p>
        </article>
    );
}

// Trình bày K3s theo vòng đời thực tế: từ node và namespace đến container, rollout, rollback và runtime debug.
export function PlatformOperationsK3sManagement() {
    return (
        <div className="space-y-6">
            <section className="rounded-2xl border border-zinc-200 bg-white p-4 sm:p-5">
                <header className="border-b border-zinc-200 pb-3">
                    <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-500">
                        Đọc trước khi quản trị
                    </p>
                    <h3 className="mt-1 text-base font-semibold tracking-tight text-zinc-950">
                        K3s là gì và hoạt động như thế nào?
                    </h3>
                    <p className="mt-1 text-xs leading-5 text-zinc-600">
                        K3s là bản Kubernetes gọn nhẹ dùng để điều phối
                        container trên node EC2. Bạn khai báo trạng thái mong
                        muốn bằng manifest; K3s liên tục so sánh trạng thái thật
                        với trạng thái đó rồi tạo, thay thế hoặc route workload
                        cho phù hợp.
                    </p>
                </header>

                <div className="mt-3 grid gap-3 md:grid-cols-2">
                    <div className="rounded-xl border border-zinc-200 bg-white p-3">
                        <p className="text-sm font-semibold text-zinc-950">
                            Hiểu đơn giản bằng một ví dụ
                        </p>
                        <p className="mt-1 text-xs leading-5 text-zinc-600">
                            <strong>EC2 là máy chủ</strong>, K3s là người điều
                            phối, Deployment là bản mô tả cần chạy bao nhiêu
                            phiên bản, Pod là nơi chạy container và Service là
                            địa chỉ ổn định để các workload gọi nhau.
                        </p>
                    </div>
                    <div className="rounded-xl border border-zinc-200 bg-white p-3">
                        <p className="text-sm font-semibold text-zinc-950">
                            Vòng lặp tự phục hồi
                        </p>
                        <p className="mt-1 text-xs leading-5 text-zinc-600">
                            Khi một container hoặc Pod lỗi, controller phát hiện
                            desired state bị thiếu và yêu cầu tạo Pod thay thế.
                            Pod mới chỉ nhận traffic sau khi{' '}
                            <strong>readiness probe</strong> thành công.
                        </p>
                    </div>
                </div>

                <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                    <PlatformOperationsK3sConceptCard
                        term="01 · Node"
                        title="EC2 Ubuntu"
                        description="Máy thật hoặc máy ảo cung cấp CPU, memory, disk và network. Với mô hình hiện tại, production chạy trên single-node nên node hỏng có thể ảnh hưởng toàn bộ workload."
                    />
                    <PlatformOperationsK3sConceptCard
                        term="02 · Cluster"
                        title="K3s control plane"
                        description="Lớp điều phối nhận manifest, theo dõi resource và ra quyết định scheduling, rollout, restart hoặc thay thế Pod."
                    />
                    <PlatformOperationsK3sConceptCard
                        term="03 · Runtime"
                        title="containerd"
                        description="Runtime thực sự pull image và chạy container trên node. Docker chủ yếu được dùng để build image ở CI/local, không phải lớp điều phối production."
                    />
                    <PlatformOperationsK3sConceptCard
                        term="04 · Boundary"
                        title="Namespace"
                        description="Nhóm resource theo trách nhiệm như application, data và observability để lệnh kiểm tra, manifest và quyền quản trị dễ khoanh vùng hơn."
                    />
                    <PlatformOperationsK3sConceptCard
                        term="05 · Desired state"
                        title="Deployment và ReplicaSet"
                        description="Deployment lưu image, replica và Pod template; ReplicaSet duy trì đúng số Pod theo cấu hình và tạo revision khi release thay đổi."
                    />
                    <PlatformOperationsK3sConceptCard
                        term="06 · Workload"
                        title="Pod và Container"
                        description="Pod là đơn vị được schedule; container bên trong chạy API hoặc worker. Pod Running chỉ cho biết process đang chạy, chưa chắc đã sẵn sàng nhận traffic."
                    />
                    <PlatformOperationsK3sConceptCard
                        term="07 · Networking"
                        title="Service và Endpoint"
                        description="Service cung cấp DNS nội bộ và selector đến Pod phù hợp, giúp workload gọi nhau qua tên ổn định thay vì lưu Pod IP."
                    />
                    <PlatformOperationsK3sConceptCard
                        term="08 · Health gate"
                        title="Readiness, liveness và startup"
                        description="Readiness quyết định có nhận traffic hay không; liveness phát hiện process treo; startup cho ứng dụng cần thời gian khởi động lâu."
                    />
                    <PlatformOperationsK3sConceptCard
                        term="09 · Change"
                        title="Rollout và rollback"
                        description="Rollout đưa revision mới vào theo từng bước; rollback quay về revision application trước khi release mới không đạt health hoặc smoke test."
                    />
                </div>

                <ShowcaseNote
                    title="Cách đọc một sự cố K3s"
                    tone="white"
                    className="mt-3"
                    compact
                >
                    <p>
                        Đi từ ngoài vào trong:{' '}
                        <strong>
                            node → namespace → Deployment → Pod → container →
                            Service endpoint
                        </strong>
                        . Đừng chỉ nhìn trạng thái <code>Running</code>; hãy đọc
                        thêm readiness, Events, logs và dependency.
                    </p>
                </ShowcaseNote>
            </section>

            <ShowcaseDisclosure
                id="platform-operations-k3s-runtime"
                number="2.4.1"
                title="K3s quản lý container như thế nào?"
                description="EC2 cung cấp máy chủ; K3s duy trì trạng thái mong muốn của Deployment, Pod, Container và Service."
            >
                <ShowcaseArchitectureLane
                    label="EC2 → K3s → workload"
                    title="Từ node đến container ready"
                    description="EC2 cung cấp máy chủ; K3s control plane điều phối containerd, workload và Service. Chỉ Pod vượt qua readiness mới được nhận traffic."
                    nodes={[
                        {
                            name: 'EC2 Ubuntu',
                            responsibility: (
                                <>
                                    Cung cấp{' '}
                                    <strong>
                                        CPU, memory, disk và network
                                    </strong>{' '}
                                    để K3s có nơi chạy workload production.
                                </>
                            ),
                        },
                        {
                            name: 'K3s control plane',
                            responsibility: (
                                <>
                                    Điều phối <strong>desired state</strong>,
                                    scheduling và controller reconciliation trên
                                    node single-node.
                                </>
                            ),
                        },
                        {
                            name: 'containerd runtime',
                            responsibility: (
                                <>
                                    K3s dùng <strong>containerd</strong> để pull
                                    image, tạo container và quản lý process;
                                    Docker chỉ là công cụ build image ở
                                    CI/local.
                                </>
                            ),
                        },
                        {
                            name: 'Namespace',
                            responsibility: (
                                <>
                                    Phân tách{' '}
                                    <strong>
                                        application, data, observability
                                    </strong>{' '}
                                    và system boundary để quản lý quyền và
                                    diagnostics.
                                </>
                            ),
                        },
                        {
                            name: 'Deployment → ReplicaSet',
                            responsibility: (
                                <>
                                    Deployment giữ{' '}
                                    <strong>
                                        replica, image version và Pod template
                                    </strong>
                                    ; ReplicaSet bảo đảm đủ số Pod theo desired
                                    state.
                                </>
                            ),
                        },
                        {
                            name: 'Pod → Container',
                            responsibility: (
                                <>
                                    Pod là đơn vị được schedule; bên trong Pod,{' '}
                                    <strong>
                                        container chạy application hoặc worker
                                    </strong>{' '}
                                    với probe và resource limit.
                                </>
                            ),
                        },
                        {
                            name: 'Service endpoint',
                            responsibility: (
                                <>
                                    Cung cấp <strong>DNS nội bộ</strong>, chọn
                                    Pod bằng selector và chỉ route traffic đến
                                    Pod đã pass <strong>readiness</strong>.
                                </>
                            ),
                        },
                    ]}
                />
                <ShowcaseNote
                    title="Điểm cần nhớ"
                    tone="white"
                    className="mt-3"
                    compact
                >
                    <p>
                        Pod ở trạng thái <code>Running</code> chưa đồng nghĩa
                        service đã sẵn sàng. Cần kiểm tra readiness, health
                        endpoint và dependency trước khi kết luận rollout thành
                        công.
                    </p>
                </ShowcaseNote>
            </ShowcaseDisclosure>

            <ShowcaseDisclosure
                id="platform-operations-k3s-cluster-checks"
                number="2.4.2"
                title="Kiểm tra node và cluster"
                description="Bắt đầu từ trạng thái K3s và node trước khi kiểm tra Pod hoặc service cụ thể."
            >
                <div className="grid gap-3 lg:grid-cols-2">
                    <PlatformOperationsK3sCommandGroup
                        eyebrow="01 · Node health"
                        title="Kiểm tra K3s service và node"
                        purpose="Xác nhận K3s đang chạy và node có thể schedule workload."
                        commands={`sudo systemctl status k3s
sudo k3s kubectl version
sudo k3s kubectl cluster-info
sudo k3s kubectl get nodes -o wide
sudo k3s kubectl describe node <node-name>`}
                        result="Node cần có trạng thái Ready; đọc Conditions, taint, capacity và allocatable khi có lỗi scheduling."
                    />
                    <PlatformOperationsK3sCommandGroup
                        eyebrow="02 · Cluster inventory"
                        title="Xem namespace và resource tổng quát"
                        purpose="Có cái nhìn nhanh về workload đang tồn tại trên cluster."
                        commands={`sudo k3s kubectl get namespaces
sudo k3s kubectl get pods --all-namespaces -o wide
sudo k3s kubectl get deployments -A
sudo k3s kubectl get services -A
sudo k3s kubectl get ingress -A`}
                        result="Dùng output để xác định namespace, Pod, Deployment hoặc Ingress đang có vấn đề trước khi đi sâu hơn."
                    />
                </div>
            </ShowcaseDisclosure>

            <ShowcaseDisclosure
                id="platform-operations-k3s-workloads"
                number="2.4.3"
                title="Kiểm tra namespace và workload"
                description="Đi theo thứ tự Deployment → ReplicaSet → Pod → Container → Service endpoint để tìm đúng lớp đang lỗi."
            >
                <div className="grid gap-3 lg:grid-cols-2">
                    <PlatformOperationsK3sCommandGroup
                        eyebrow="01 · Workload detail"
                        title="Kiểm tra một service cụ thể"
                        purpose="Xác định image, replica, condition và Pod thuộc về Deployment."
                        commands={`sudo k3s kubectl get deployment <deployment-name> \\
  -n <namespace> -o wide

sudo k3s kubectl get pods \\
  -n <namespace> \\
  -l app.kubernetes.io/name=<service-name> \\
  -o wide

sudo k3s kubectl get service <service-name> \\
  -n <namespace>`}
                        result="Đối chiếu desired replicas, available replicas, Pod IP, image SHA và selector của Service."
                    />
                    <PlatformOperationsK3sCommandGroup
                        eyebrow="02 · Resource detail"
                        title="Describe Deployment và Pod"
                        purpose="Đọc condition, probe, scheduling message, image pull và các event gắn với workload."
                        commands={`sudo k3s kubectl describe deployment <deployment-name> \\
  -n <namespace>

sudo k3s kubectl describe pod <pod-name> \\
  -n <namespace>`}
                        result="Tập trung vào Events ở cuối output, readiness/liveness probe, container state và image reference."
                    />
                </div>
            </ShowcaseDisclosure>

            <ShowcaseDisclosure
                id="platform-operations-k3s-diagnostics"
                number="2.4.4"
                title="Đọc logs và chẩn đoán lỗi"
                description="Logs cho biết process chết vì lý do gì; Events cho biết Kubernetes đã làm gì trước và sau lỗi đó."
            >
                <div className="grid gap-3 lg:grid-cols-2">
                    <PlatformOperationsK3sCommandGroup
                        eyebrow="01 · Container logs"
                        title="Đọc logs hiện tại và logs trước khi crash"
                        purpose="Bắt đầu bằng log gần đây, sau đó đọc instance trước nếu Pod restart."
                        commands={`sudo k3s kubectl logs <pod-name> \\
  -n <namespace> \\
  --since=10m

sudo k3s kubectl logs <pod-name> \\
  -n <namespace> \\
  -c <container-name> \\
  --tail=200

sudo k3s kubectl logs <pod-name> \\
  -n <namespace> \\
  -c <container-name> \\
  --previous`}
                        result="--since giới hạn thời gian, --tail giới hạn số dòng, còn --previous đọc container instance trước khi crash."
                    />
                    <PlatformOperationsK3sCommandGroup
                        eyebrow="02 · Container shell"
                        title="Exec vào container để kiểm tra sâu"
                        purpose="Kiểm tra filesystem, process và network khi logs chưa đủ thông tin."
                        commands={`sudo k3s kubectl exec -it <pod-name> \\
  -n <namespace> \\
  -c <container-name> \\
  -- sh`}
                        result="Chỉ kiểm tra runtime cần thiết; không in environment có secret và không sửa dữ liệu production trực tiếp trong container."
                    />
                    <PlatformOperationsK3sCommandGroup
                        eyebrow="03 · Events"
                        title="Đọc event theo thời gian"
                        purpose="Tìm nguyên nhân scheduling, image pull, mount, probe hoặc eviction."
                        commands={`sudo k3s kubectl get events \\
  -n <namespace> \\
  --sort-by=.lastTimestamp

sudo k3s kubectl get events \\
  --all-namespaces \\
  --sort-by=.lastTimestamp`}
                        result="Event mới nhất thường giúp phân biệt lỗi image, thiếu resource, PVC, probe hoặc dependency."
                    />
                </div>
                <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    <PlatformOperationsK3sIssueCard
                        title="CrashLoopBackOff"
                        flow="logs --previous → describe Pod → kiểm tra ConfigMap, Secret và dependency."
                    />
                    <PlatformOperationsK3sIssueCard
                        title="ImagePullBackOff"
                        flow="Kiểm tra image SHA → ghcr-pull-secret → quyền pull image."
                    />
                    <PlatformOperationsK3sIssueCard
                        title="Running nhưng NotReady"
                        flow="Kiểm tra readiness probe → health endpoint → Kafka, database hoặc downstream."
                    />
                    <PlatformOperationsK3sIssueCard
                        title="Pending"
                        flow="Kiểm tra node resource → PVC → scheduling events."
                    />
                </div>
            </ShowcaseDisclosure>

            <ShowcaseDisclosure
                id="platform-operations-k3s-rollout"
                number="2.4.5"
                title="Rollout và release workload"
                description="Mỗi thay đổi image phải gắn với commit SHA, được theo dõi rollout và xác nhận readiness sau khi apply."
            >
                <div className="grid gap-3 lg:grid-cols-2">
                    <PlatformOperationsK3sCommandGroup
                        eyebrow="01 · Rollout status"
                        title="Theo dõi Deployment sau thay đổi"
                        purpose="Xác nhận ReplicaSet mới đã tạo đủ Pod và Pod mới đã Available."
                        commands={`sudo k3s kubectl rollout status \\
  deployment/<deployment-name> \\
  -n <namespace> \\
  --timeout=180s

sudo k3s kubectl rollout history \\
  deployment/<deployment-name> \\
  -n <namespace>

sudo k3s kubectl wait \\
  --for=condition=available \\
  deployment/<deployment-name> \\
  -n <namespace> \\
  --timeout=180s`}
                        result="Rollout chỉ thành công khi Deployment Available và readiness của Pod đạt yêu cầu."
                    />
                    <PlatformOperationsK3sCommandGroup
                        eyebrow="02 · Image và replica"
                        title="Đổi image hoặc scale workload"
                        purpose="Dùng image full commit SHA hoặc digest; không dùng latest trong production."
                        commands={`sudo k3s kubectl set image \\
  deployment/<deployment-name> \\
  <container-name>=<registry>/<image>:<full-commit-sha> \\
  -n <namespace>

sudo k3s kubectl scale deployment/<deployment-name> \\
  --replicas=<replica-count> \\
  -n <namespace>`}
                        result="Sau khi set image hoặc scale, luôn chạy rollout status và kiểm tra Pod mới."
                    />
                    <PlatformOperationsK3sCommandGroup
                        eyebrow="03 · Restart có kiểm soát"
                        title="Restart Deployment"
                        purpose="Tạo rollout mới khi cần reload image, config hoặc xử lý process bị treo."
                        commands={`sudo k3s kubectl rollout restart \\
  deployment/<deployment-name> \\
  -n <namespace>

sudo k3s kubectl rollout status \\
  deployment/<deployment-name> \\
  -n <namespace> \\
  --timeout=180s`}
                        result="Restart không thay đổi image; cần kiểm tra nguyên nhân trước nếu workload đang CrashLoopBackOff."
                    />
                </div>
            </ShowcaseDisclosure>

            <ShowcaseDisclosure
                id="platform-operations-k3s-kustomize"
                number="2.4.6"
                title="Apply manifest và Kustomize"
                description="Render manifest trước để phát hiện lỗi YAML, reference hoặc overlay; sau đó mới apply đúng boundary."
            >
                <div className="grid gap-3 lg:grid-cols-2">
                    <PlatformOperationsK3sCommandGroup
                        eyebrow="01 · Render"
                        title="Kiểm tra manifest trước khi apply"
                        purpose="Xem output Kustomize và phát hiện lỗi trước khi thay đổi cluster."
                        commands={`sudo k3s kubectl kustomize \\
  --load-restrictor LoadRestrictionsNone \\
  <manifest-path>`}
                        result="Manifest phải render thành công; application và observability dùng path/boundary riêng."
                    />
                    <PlatformOperationsK3sCommandGroup
                        eyebrow="02 · Apply"
                        title="Apply overlay vào cluster"
                        purpose="Áp dụng manifest đã review vào namespace hoặc overlay tương ứng."
                        commands={`sudo k3s kubectl apply -k <manifest-path>

sudo k3s kubectl get deployments -n <namespace>
sudo k3s kubectl get pods -n <namespace>
sudo k3s kubectl get events -n <namespace> \\
  --sort-by=.lastTimestamp`}
                        result="Không apply toàn bộ data infrastructure trong application rollout; kiểm tra rollout ngay sau apply."
                    />
                </div>
            </ShowcaseDisclosure>

            <ShowcaseDisclosure
                id="platform-operations-k3s-rollback"
                number="2.4.7"
                title="Rollback workload"
                description="Rollback application image khi rollout không đạt; database migration không được rollback tự động."
            >
                <PlatformOperationsK3sCommandGroup
                    eyebrow="Recovery · Application"
                    title="Quay về revision trước"
                    purpose="Dùng khi Pod mới crash, readiness fail hoặc smoke test không đạt."
                    commands={`sudo k3s kubectl rollout undo \\
  deployment/<deployment-name> \\
  -n <namespace>

sudo k3s kubectl rollout status \\
  deployment/<deployment-name> \\
  -n <namespace> \\
  --timeout=180s

sudo k3s kubectl describe deployment <deployment-name> \\
  -n <namespace>`}
                    result="Sau rollback cần kiểm tra Pod readiness, health endpoint, logs và dependency chính."
                    warning="Rollback image không hoàn tác database migration. Migration phải tương thích ngược với release trước."
                />
            </ShowcaseDisclosure>

            <ShowcaseDisclosure
                id="platform-operations-k3s-runtime-debug"
                number="2.4.8"
                title="Container runtime nâng cao"
                description="Chỉ dùng crictl khi cần kiểm tra containerd hoặc container đã biến mất khỏi Pod view."
            >
                <PlatformOperationsK3sCommandGroup
                    eyebrow="Debug nâng cao · containerd"
                    title="Kiểm tra container runtime của K3s"
                    purpose="Đối chiếu container ID, image local và runtime logs khi kubectl không còn đủ thông tin."
                    commands={`sudo k3s crictl ps
sudo k3s crictl ps -a
sudo k3s crictl images
sudo k3s crictl logs <container-id>
sudo k3s crictl inspect <container-id>`}
                    result="Ưu tiên kubectl logs, describe và events; crictl chỉ dành cho sự cố containerd hoặc container lifecycle."
                />
            </ShowcaseDisclosure>

            <ShowcaseDisclosure
                id="platform-operations-k3s-destructive-actions"
                number="2.4.9"
                title="Thay đổi và xóa resource"
                description="Các lệnh quản trị đầy đủ được đặt riêng để người đọc nhận diện rõ thao tác có thể làm thay đổi hoặc mất dữ liệu."
            >
                <PlatformOperationsK3sCommandGroup
                    eyebrow="Danger zone · destructive actions"
                    title="Xóa resource bằng placeholder"
                    purpose="Chỉ dùng sau khi đã xác định chính xác resource, namespace và hậu quả của thao tác."
                    commands={`sudo k3s kubectl delete pod <pod-name> -n <namespace>
sudo k3s kubectl delete deployment <deployment-name> -n <namespace>
sudo k3s kubectl delete job <job-name> -n <namespace>
sudo k3s kubectl delete secret <secret-name> -n <namespace>
sudo k3s kubectl delete pvc <pvc-name> -n <namespace>
sudo k3s kubectl delete namespace <namespace>`}
                    result="Sau thao tác phải kiểm tra resource, events và dependency liên quan; không dùng lệnh xóa như bước debug đầu tiên."
                    warning="delete PVC, Secret hoặc Namespace có thể làm mất dữ liệu hoặc khiến workload không khởi động. Không xóa Secret để xử lý CrashLoopBackOff."
                    danger
                />
            </ShowcaseDisclosure>
        </div>
    );
}

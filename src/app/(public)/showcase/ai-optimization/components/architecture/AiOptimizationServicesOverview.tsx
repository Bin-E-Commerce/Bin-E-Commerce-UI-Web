// Tổng hợp service tham gia AI Image Optimization theo hai tuyến: tạo preview và cập nhật catalog.
import type { LucideIcon } from 'lucide-react';
import { CheckCheck, Image, LockKeyhole, Server, ShieldCheck, Store, Workflow } from 'lucide-react';
import { ShowcaseDisclosure } from '../../../components/shared/ShowcaseDisclosure';

interface ServiceCardProps {
    icon: LucideIcon;
    eyebrow: string;
    title: string;
    description: string;
    emphasized?: boolean;
}

// Chuẩn hóa card service theo mẫu Recommendation: icon nhận diện, nhãn ngắn và mô tả trách nhiệm cụ thể.
function ServiceCard({ icon: Icon, eyebrow, title, description, emphasized = false }: ServiceCardProps) {
    return <li className={`rounded-xl border p-3.5 ${emphasized ? 'border-zinc-400 bg-white' : 'border-zinc-200 bg-white'}`}><div className="flex items-center gap-2.5"><span className="flex size-7 shrink-0 items-center justify-center text-zinc-700"><Icon aria-hidden="true" className="size-3.5" /></span><span className="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-zinc-700">{eyebrow}</span></div><h4 className="mt-2.5 text-sm font-semibold text-zinc-950">{title}</h4><p className="mt-1 text-xs leading-5 text-zinc-600">{description}</p></li>;
}

// Dùng hai nhánh service giống Recommendation để phân biệt request xử lý ảnh với mutation catalog.
export function AiOptimizationServicesOverview() {
    return <ShowcaseDisclosure id="ai-optimization-services-overview" number="1.3" title="Các service tham gia" description="AI Service điều phối job và output; Product Service giữ ownership và mutation catalog; Gateway là lớp xác thực/proxy giữa seller với backend."><div className="space-y-3"><ShowcaseDisclosure id="ai-optimization-preview-services" number="1.3.1" title="Luồng tạo và xử lý preview" description="Từ seller UI đến generated asset REVIEW_REQUIRED; request không chờ provider AI."><ol className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4"><ServiceCard icon={Store} eyebrow="01 · Seller" title="Seller Center" description="Gửi input, đọc overview/job và hiển thị review actions." /><ServiceCard icon={ShieldCheck} eyebrow="02 · Gateway" title="AI proxy controller" description="Bảo vệ view/generate và forward identity/context." /><ServiceCard icon={Server} eyebrow="03 · Orchestrator" title="AI Service" description="Resolve owner, persist batch/job, quota và publish event." /><ServiceCard icon={Workflow} eyebrow="04 · Worker" title="Provider + Media" description="Generate/upload output và trả job về review." /></ol></ShowcaseDisclosure><ShowcaseDisclosure id="ai-optimization-catalog-services" number="1.3.2" title="Luồng duyệt và cập nhật catalog" description="Apply/rollback luôn quay về service sở hữu product để giữ transaction và snapshot."><ol className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4"><ServiceCard icon={Store} eyebrow="01 · Decision" title="Seller review" description="Chọn output hoặc reject; không gửi URL tùy ý làm nguồn sự thật." /><ServiceCard icon={LockKeyhole} eyebrow="02 · Guard" title="Gateway + access" description="Kiểm tra action apply/rollback trước proxy và tại domain." /><ServiceCard icon={Image} eyebrow="03 · Mutation" title="Product Service" description="Lock, version check, snapshot và cập nhật đúng gallery row." /><ServiceCard icon={CheckCheck} eyebrow="04 · Recovery" title="AI job state" description="APPLIED, REJECTED hoặc ROLLED_BACK phản ánh kết quả cuối." emphasized /></ol></ShowcaseDisclosure></div><p className="mt-3 rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-xs leading-5 text-zinc-600"><strong className="font-semibold text-zinc-900">Ranh giới service:</strong> AI Service không sở hữu product gallery; Product Service không gọi provider AI. Hai bên trao đổi qua contract để mỗi service giữ đúng invariant của mình.</p></ShowcaseDisclosure>;
}

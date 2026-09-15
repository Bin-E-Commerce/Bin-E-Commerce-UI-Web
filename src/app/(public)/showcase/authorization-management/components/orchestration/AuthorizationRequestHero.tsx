// Phần mở đầu Authorization Management; trình bày request authorization theo flow ngắn, dễ quét trước khi đọc logic sâu.
import { Check, CircleUserRound, Eye, KeyRound, ShieldCheck } from 'lucide-react';

interface AuthorizationFlowStepProps {
    number: string;
    title: string;
    description: string;
    icon: typeof Check;
    last?: boolean;
}

// Hiển thị một chặng authorization với actor, hành động và kết quả downstream nhận được.
function AuthorizationFlowStep({ number, title, description, icon: Icon, last = false }: AuthorizationFlowStepProps) {
    return (
        <li className="relative flex gap-3">
            {!last ? <span aria-hidden="true" className="absolute left-3.5 top-8 h-[calc(100%+0.5rem)] w-px bg-zinc-200" /> : null}
            <span className="relative z-10 grid size-7 shrink-0 place-items-center rounded-lg border border-zinc-200 bg-white text-zinc-700"><Icon aria-hidden="true" className="size-3.5" /></span>
            <div className="min-w-0 flex-1 pb-3"><div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5"><span className="font-mono text-[10px] text-zinc-500">{number}</span><h3 className="text-sm font-semibold text-zinc-950">{title}</h3></div><p className="mt-1 text-xs leading-5 text-zinc-600">{description}</p></div>
        </li>
    );
}

// Giải thích vì sao một request được phép: xác minh identity, quyền route, policy hiệu lực và resource trước UX.
export function AuthorizationRequestHero() {
    return (
        <section id="authorization-request-overview" tabIndex={-1} className="scroll-mt-24 rounded-[1.5rem] border border-zinc-200 bg-white p-4 shadow-[0_16px_48px_-40px_rgba(24,24,27,0.45)] outline-none focus-visible:ring-2 focus-visible:ring-zinc-300 sm:p-5">
            <div className="grid gap-5 lg:grid-cols-[minmax(0,0.78fr)_minmax(360px,1.22fr)] lg:gap-8">
                <div className="flex h-full min-w-0 flex-col justify-center">
                    <p className="text-center font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500">Vì sao cần phân quyền?</p>
                    <h2 className="mt-2.5 text-center text-xl font-semibold leading-tight tracking-tight text-zinc-950 sm:text-2xl">Đảm bảo đúng người, đúng hành động, đúng tài nguyên</h2>
                    <p className="mt-2.5 text-center text-sm leading-6 text-zinc-600">Authorization không chỉ kiểm tra user đã đăng nhập. Hệ thống còn phải biết user được làm gì và có được chạm vào tài nguyên cụ thể đó hay không.</p>
                    <div className="mt-4 rounded-xl border border-zinc-200 bg-zinc-50 p-3"><div className="flex flex-col items-center gap-1"><p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-500">Một request đi qua</p><span className="font-mono text-[10px] text-zinc-400">5 lớp kiểm tra</span></div><div className="mt-2.5 flex flex-wrap items-center justify-center gap-1.5 text-[11px] text-zinc-600"><span className="rounded-lg border border-zinc-200 bg-white px-2.5 py-1.5">Identity</span><span aria-hidden="true" className="text-zinc-400">→</span><span className="rounded-lg border border-zinc-200 bg-white px-2.5 py-1.5">Permission</span><span aria-hidden="true" className="text-zinc-400">→</span><span className="rounded-lg border border-zinc-300 bg-white px-2.5 py-1.5 font-medium text-zinc-950">Resource</span></div></div>
                    <dl className="mt-3 grid gap-2 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3"><div className="flex flex-col items-center gap-1.5 rounded-xl border border-zinc-200 bg-white p-2.5 text-center"><CircleUserRound aria-hidden="true" className="size-4 text-zinc-700" /><dt className="text-xs font-semibold text-zinc-950">Đúng người</dt></div><div className="flex flex-col items-center gap-1.5 rounded-xl border border-zinc-200 bg-white p-2.5 text-center"><KeyRound aria-hidden="true" className="size-4 text-zinc-700" /><dt className="text-xs font-semibold text-zinc-950">Đúng quyền</dt></div><div className="flex flex-col items-center gap-1.5 rounded-xl border border-zinc-200 bg-white p-2.5 text-center"><ShieldCheck aria-hidden="true" className="size-4 text-zinc-700" /><dt className="text-xs font-semibold text-zinc-950">Đúng phạm vi</dt></div></dl>
                </div>
                <div className="min-w-0 rounded-xl border border-zinc-200 bg-white p-3.5 sm:p-4"><header className="flex items-end justify-between gap-3 border-b border-zinc-100 pb-3"><div><p className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500">Luồng tổng quát</p><h2 className="mt-1 text-base font-semibold tracking-tight text-zinc-950">Từ identity đến quyết định truy cập</h2></div><span className="shrink-0 rounded-full border border-zinc-200 bg-zinc-50 px-2.5 py-1 font-mono text-[10px] text-zinc-500">5 chặng</span></header><ol className="mt-4"><AuthorizationFlowStep number="01" title="Xác thực identity" icon={CircleUserRound} description="Gateway xác minh JWT bằng JWKS, loại identity header giả và tạo user context đáng tin cậy." /><AuthorizationFlowStep number="02" title="Kiểm tra permission" icon={KeyRound} description="Permissions Guard so grant của user với quyền mà route yêu cầu; thiếu quyền thì dừng tại Gateway." /><AuthorizationFlowStep number="03" title="Resolve policy hiệu lực" icon={ShieldCheck} description="Auth Service hợp nhất role, assignment, permission và scope đang active thành access profile." /><AuthorizationFlowStep number="04" title="Kiểm tra resource" icon={ShieldCheck} description="Domain service kiểm tra ownership và scope trên shop, product hoặc resource cụ thể trước mutation." /><AuthorizationFlowStep number="05" title="Trả trải nghiệm phù hợp" icon={Check} last description="Request hợp lệ được forward; UI dùng access profile để hiện đúng navigation, còn request sai nhận 401 hoặc 403." /></ol><div className="mt-1 flex items-start gap-2 border-t border-zinc-100 pt-3 text-xs leading-5 text-zinc-600"><Eye aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-zinc-700" /><p><span className="font-semibold text-zinc-950">Điểm kiểm soát:</span> frontend chỉ trình bày khả năng; quyết định bảo mật luôn nằm ở Gateway và service sở hữu resource.</p></div></div>
            </div>
        </section>
    );
}

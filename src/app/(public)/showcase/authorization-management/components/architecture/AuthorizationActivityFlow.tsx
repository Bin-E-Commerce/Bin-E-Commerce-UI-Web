// Trình bày flow Authorization theo các lớp kiểm tra thực tế và policy change có audit.
import { ArrowDown } from 'lucide-react';
import { ShowcaseLogicLink } from '../../../components/shared/ShowcaseLogicLink';
import { ShowcaseDisclosure } from '../../../components/shared/ShowcaseDisclosure';

type DetailStepProps = {
    number: string;
    phase: string;
    title: string;
    action: string;
    reason: string;
    tradeoff?: string;
    detail?: string;
    logicHref?: string;
    connector?: boolean;
};

// Card giải thích một bước theo cùng nhịp đọc: làm gì, vì sao và đánh đổi.
function DetailStep({
    number,
    phase,
    title,
    action,
    reason,
    logicHref,
    connector = true,
}: DetailStepProps) {
    const showConnector =
        connector &&
        !['Decision', 'Admin', 'Command', 'Trace', 'Runtime'].includes(phase);

    return (
        <>
            <article className="relative h-full rounded-2xl border border-zinc-200 bg-white p-3">
                <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-start gap-3">
                        <span className="flex size-10 shrink-0 flex-col items-center justify-center rounded-xl border border-zinc-200 bg-white shadow-sm shadow-zinc-950/5">
                            <span className="font-mono text-[7px] font-semibold uppercase tracking-[0.12em] text-zinc-500">
                                Bước
                            </span>
                            <span className="text-xs font-semibold leading-4 text-zinc-950">
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
                    {logicHref ? <ShowcaseLogicLink href={logicHref} /> : null}
                </div>

                <div className="mt-3 grid items-stretch gap-2 sm:grid-cols-2 sm:auto-rows-fr">
                    <div className="h-full rounded-xl border border-zinc-100 bg-white p-2.5">
                        <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-zinc-500">
                            Làm gì?
                        </p>
                        <p className="mt-1 text-xs leading-5 text-zinc-600">
                            {action}
                        </p>
                    </div>
                    <div className="h-full rounded-xl border border-zinc-100 bg-white p-2.5">
                        <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-zinc-500">
                            Tại sao?
                        </p>
                        <p className="mt-1 text-xs leading-5 text-zinc-600">
                            {reason}
                        </p>
                    </div>
                </div>
            </article>
            {showConnector ? (
                <div
                    className="flex justify-center py-1.5 text-zinc-400"
                    aria-hidden="true"
                >
                    <ArrowDown className="size-4" />
                </div>
            ) : null}
        </>
    );
}

// Request flow đi một cột để người đọc theo đúng thứ tự kiểm tra từ trên xuống.
function AuthorizationRequestFlow() {
    return (
        <ShowcaseDisclosure
            id="authorization-request-flow"
            number="1.1.1"
            title="Luồng kiểm tra request · đúng người, đúng quyền, đúng phạm vi"
            description="Một request chỉ chạy business logic sau khi vượt qua identity, permission ở route và ownership/scope trên resource thật."
        >
            <div className="rounded-2xl border border-zinc-200 bg-white p-2.5 sm:p-3">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-100 px-1 pb-3">
                    <div>
                        <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-zinc-500">
                            Request path · sáu chặng
                        </p>
                        <p className="mt-1 text-xs font-medium text-zinc-800">
                            Frontend gửi tín hiệu, backend mới ra quyết định
                        </p>
                    </div>
                    <span className="rounded-full border border-zinc-200 px-2.5 py-1 font-mono text-[10px] text-zinc-500">
                        401 / 403 rõ nghĩa
                    </span>
                </div>
                <ol className="mt-3 space-y-0">
                    <li className="grid gap-2 md:grid-cols-2">
                        <DetailStep
                            number="01"
                            phase="Client"
                            title="Gửi request"
                            action="Browser gửi Bearer token kèm endpoint, action và dữ liệu cần xử lý. Identity header do client tự gắn chỉ là thông tin tham khảo."
                            reason="Mọi dữ liệu từ browser đều có thể bị sửa. Nếu tin userId, role hoặc permission do client gửi, người dùng có thể tự nhận danh tính và quyền cao hơn."
                            tradeoff="Thêm bước xác minh ở backend, đổi lại request giả không thể tự tạo danh tính hoặc tự nâng quyền."
                            connector={false}
                        />
                        <DetailStep
                            number="02"
                            phase="Identity"
                            title="Verify JWT"
                            action="Gateway đọc Bearer token. JWKS (JSON Web Key Set) là endpoint công khai các public key mà hệ thống phát hành token dùng để ký JWT; Gateway lấy đúng key để kiểm tra chữ ký, issuer, audience và thời hạn rồi tạo trusted user context."
                            reason="JWKS giúp Gateway xác minh token mà không cần biết private key. Khi auth service đổi key, danh sách public key được cập nhật để việc xác minh vẫn an toàn; các service phía sau chỉ nhận danh tính đã kiểm tra."
                            tradeoff="Phụ thuộc auth/JWKS và có thêm thời gian kiểm tra, đổi lại toàn hệ thống có một nguồn identity thống nhất."
                            connector={false}
                        />
                    </li>
                    <li>
                        <div
                            className="flex justify-center py-1.5 text-zinc-400"
                            aria-hidden="true"
                        >
                            <ArrowDown className="size-4" />
                        </div>
                    </li>
                    <li>
                        <DetailStep
                            number="03"
                            phase="Route"
                            title="Kiểm tra permission"
                            action="Permissions Guard đọc permission metadata của route rồi đối chiếu với grant có trong access profile của user. Thiếu grant thì dừng request và trả 403."
                            reason="JWT chỉ chứng minh user là ai; nó không tự chứng minh user được gọi endpoint nào. Vì vậy đăng nhập thành công vẫn có thể bị chặn ở lớp route."
                            logicHref="#authorization-logic-route-permission"
                        />
                    </li>
                    <li>
                        <DetailStep
                            number="04"
                            phase="Proxy"
                            title="Forward context"
                            action="Gateway loại bỏ identity header do browser gửi, sau đó chuyển request cùng trusted user context tới service sở hữu dữ liệu."
                            reason="Service phía sau chỉ nhận một contract identity thống nhất: user đã xác minh, grant đã kiểm tra và thông tin request cần thiết."
                        />
                    </li>
                    <li>
                        <DetailStep
                            number="05"
                            phase="Resource"
                            title="Kiểm tra ownership và scope"
                            action="Domain service lấy resource thật rồi kiểm tra actor có đúng shop, product hoặc resource hay không; đồng thời xác nhận action nằm trong scope trước khi mutation."
                            reason="Permission route chỉ cho phép gọi đúng loại endpoint, không cấp quyền lên mọi dữ liệu. User có thể được apply nhưng vẫn không được sửa sản phẩm thuộc shop khác."
                            logicHref="#authorization-logic-resource-scope"
                        />
                    </li>
                    <li>
                        <DetailStep
                            number="06"
                            phase="Decision"
                            title="Cho phép hoặc từ chối"
                            action="Hệ thống tổng hợp kết quả của identity, route grant và resource scope. Chỉ khi cả ba hợp lệ request mới vào handler nghiệp vụ; nếu không, request kết thúc tại lớp kiểm tra tương ứng."
                            reason="UI và backend cần phân biệt đúng nguyên nhân: 401 là chưa xác thực được token, còn 403 là đã biết user nhưng user không đủ quyền hoặc không thuộc phạm vi resource."
                        />
                    </li>
                </ol>
            </div>
        </ShowcaseDisclosure>
    );
}

// Policy change phải được audit và làm mới version trước khi request kế tiếp nhận quyền mới.
function AuthorizationPolicyChangeFlow() {
    return (
        <ShowcaseDisclosure
            id="authorization-policy-change-flow"
            number="1.1.2"
            title="Luồng thay đổi policy · cập nhật xong phải truy vết được"
            description="Admin thay đổi role-permission; hệ thống ghi audit, tăng version và invalidate access profile cũ."
        >
            <div className="grid gap-2 sm:grid-cols-2">
                <DetailStep
                    number="01"
                    phase="Admin"
                    title="Xem policy hiện tại"
                    action="Admin đọc danh sách role, permission, assignment và scope đang áp dụng cho từng shop hoặc resource."
                    reason="Phải biết policy hiện tại trước khi sửa để tránh cấp nhầm quyền, tạo grant trùng hoặc ảnh hưởng ngoài phạm vi quản lý."
                    tradeoff="Thêm bước đọc, đổi lại giảm sửa nhầm grant."
                />
                <DetailStep
                    number="02"
                    phase="Command"
                    title="Gửi yêu cầu đổi policy"
                    action="Admin gửi PATCH với grant mới cùng actor context đã xác thực; backend kiểm tra payload và quyền quản trị trước khi ghi."
                    reason="Thay đổi policy là một mutation nhạy cảm, nên không thể chỉ dựa vào userId do client gửi hoặc cho mọi user gọi trực tiếp."
                    tradeoff="Request chặt hơn, đổi lại thay đổi sai bị chặn sớm."
                    detail="Command xác định rõ ai đang thay đổi role-permission nào, trên shop hoặc scope nào. Guard kiểm tra quyền quản trị, service kiểm tra payload hợp lệ và ownership của phạm vi thay đổi; chỉ khi tất cả hợp lệ mới cập nhật policy."
                    logicHref="#authorization-logic-policy-command"
                />
                <DetailStep
                    number="03"
                    phase="Trace"
                    title="Lưu audit và xoá cache cũ"
                    action="Sau khi ghi policy, hệ thống lưu actor, before/after change và thời điểm; đồng thời tăng permissionVersion và loại access profile cũ khỏi cache."
                    reason="Nếu cache quyền cũ còn tồn tại, request sau đó có thể dùng grant đã bị thu hồi; audit cũng cần đủ dữ liệu để truy lại ai đã đổi gì."
                    tradeoff="Lưu thêm lịch sử, đổi lại dễ kiểm toán."
                    detail="Audit tạo dấu vết độc lập với trạng thái hiện tại. permissionVersion giúp nhận ra profile cũ không còn hợp lệ; cache invalidation buộc lần resolve tiếp theo đọc policy mới thay vì tiếp tục dùng quyền đã stale."
                    logicHref="#authorization-logic-policy-audit"
                />
                <DetailStep
                    number="04"
                    phase="Runtime"
                    title="Tạo lại access profile"
                    action="Request tiếp theo resolve lại access profile từ role, assignment, scope và permissionVersion mới; frontend dùng profile đó để cập nhật navigation."
                    reason="Quyền vừa đổi chỉ nên xuất hiện sau khi runtime lấy được profile mới, tránh UI hiển thị quyền mà API chưa chấp nhận hoặc ngược lại."
                    tradeoff="Có cache miss ngắn hạn, đổi lại policy nhất quán."
                    detail="Runtime không tự đoán quyền từ menu frontend. API resolve lại profile sau khi cache cũ bị invalidated, rồi gateway và domain service tiếp tục dùng cùng phiên bản policy cho các request sau."
                    logicHref="#authorization-logic-profile-resolve"
                />
            </div>
        </ShowcaseDisclosure>
    );
}

// Ghép hai flow chính thành mục 1.1 theo đúng thứ tự đọc.
export function AuthorizationActivityFlow() {
    return (
        <div className="space-y-3">
            <AuthorizationRequestFlow />
            <AuthorizationPolicyChangeFlow />
        </div>
    );
}

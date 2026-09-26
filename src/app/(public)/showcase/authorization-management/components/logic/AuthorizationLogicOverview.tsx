// Trình bày năm logic Authorization bằng các bố cục riêng, bám theo vai trò kỹ thuật của từng bước.
import {
    ArrowDown,
    ArrowRight,
    Database,
    KeyRound,
    RefreshCw,
    ShieldAlert,
} from 'lucide-react';
import { ShowcaseDisclosure } from '../../../components/shared/ShowcaseDisclosure';

// Khung nội dung chung chỉ giữ nền, border và spacing; phần bên trong được thiết kế riêng cho từng logic.
function LogicContentFrame({ children }: { children: React.ReactNode }) {
    return (
        <div className="rounded-2xl border border-zinc-200 bg-white p-4 sm:p-5">
            {children}
        </div>
    );
}

// Phần mở đầu dịch thuật ngữ kỹ thuật sang bài toán nghiệp vụ trước khi người đọc đi vào implementation.
function LogicPurposeIntro({
    what,
    problem,
}: {
    what: string;
    problem: string;
}) {
    return (
        <div className="mb-4 grid gap-4 border-b border-zinc-200 pb-4 md:grid-cols-2">
            <div>
                <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-zinc-500">
                    Nó là gì?
                </p>
                <p className="mt-1 text-sm leading-6 text-zinc-800">{what}</p>
            </div>
            <div className="md:border-l md:border-zinc-200 md:pl-5">
                <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-zinc-500">
                    Giải quyết bài toán gì?
                </p>
                <p className="mt-1 text-sm leading-6 text-zinc-800">
                    {problem}
                </p>
            </div>
        </div>
    );
}

// Logic 2.1 cần đọc như một quyết định tuần tự: xác thực, đối chiếu grant rồi mới forward.
function AuthorizationRoutePermissionLogic() {
    return (
        <ShowcaseDisclosure
            id="authorization-logic-route-permission"
            number="2.1"
            title="Kiểm tra permission trước khi forward"
            description="Trước khi request đi vào service, Gateway kiểm tra token đã xác thực có đúng permission mà endpoint yêu cầu hay không."
        >
            <LogicContentFrame>
                <LogicPurposeIntro
                    what="Permission là quyền cho phép một user thực hiện một action cụ thể trên một endpoint, ví dụ xem, tạo, apply hoặc rollback."
                    problem="Đăng nhập chỉ cho biết user là ai, không có nghĩa user được gọi mọi API. Lớp này ngăn request thiếu quyền đi sâu vào service và tránh frontend tự thêm role/permission để nâng quyền."
                />
                <div className="grid gap-3 lg:grid-cols-[minmax(0,1.4fr)_minmax(16rem,0.6fr)]">
                    <ol className="space-y-2">
                        <li className="flex gap-3 rounded-xl border border-zinc-200 bg-white p-3">
                            <span className="flex size-10 shrink-0 flex-col items-center justify-center rounded-xl border border-zinc-200 bg-white font-mono text-zinc-700">
                                <span className="text-[7px] uppercase tracking-[0.12em]">
                                    Bước
                                </span>
                                <span className="text-xs font-semibold">
                                    01
                                </span>
                            </span>
                            <div>
                                <p className="text-sm font-semibold text-zinc-950">
                                    Route khai báo action cần có
                                </p>
                                <p className="mt-1 text-xs leading-5 text-zinc-600">
                                    Decorator{' '}
                                    <code className="rounded border border-zinc-200 bg-white px-1 py-0.5 text-[11px]">
                                        @RequirePermissions
                                    </code>{' '}
                                    gắn permission metadata vào endpoint. Ví dụ
                                    image optimization tách riêng view,
                                    generate, apply và rollback.
                                </p>
                            </div>
                        </li>
                        <li className="flex gap-3 rounded-xl border border-zinc-200 bg-white p-3">
                            <span className="flex size-10 shrink-0 flex-col items-center justify-center rounded-xl border border-zinc-200 bg-white font-mono text-zinc-700">
                                <span className="text-[7px] uppercase tracking-[0.12em]">
                                    Bước
                                </span>
                                <span className="text-xs font-semibold">
                                    02
                                </span>
                            </span>
                            <div>
                                <p className="text-sm font-semibold text-zinc-950">
                                    PermissionsGuard đối chiếu grant
                                </p>
                                <p className="mt-1 text-xs leading-5 text-zinc-600">
                                    Guard đọc trusted context do JwtAuthGuard
                                    tạo, lấy access profile của user và tìm
                                    grant có code/action khớp route. Permission
                                    không lấy từ body hoặc header do browser tự
                                    gửi.
                                </p>
                            </div>
                        </li>
                        <li className="flex gap-3 rounded-xl border border-zinc-200 bg-white p-3">
                            <span className="flex size-10 shrink-0 flex-col items-center justify-center rounded-xl border border-zinc-200 bg-white font-mono text-zinc-700">
                                <span className="text-[7px] uppercase tracking-[0.12em]">
                                    Bước
                                </span>
                                <span className="text-xs font-semibold">
                                    03
                                </span>
                            </span>
                            <div>
                                <p className="text-sm font-semibold text-zinc-950">
                                    Chỉ request hợp lệ mới được forward
                                </p>
                                <p className="mt-1 text-xs leading-5 text-zinc-600">
                                    Đủ grant thì Gateway chuyển request cùng
                                    context xuống proxy; thiếu grant thì dừng
                                    ngay tại Gateway, không để business handler
                                    phía sau chạy.
                                </p>
                            </div>
                        </li>
                    </ol>
                    <aside className="rounded-xl border border-zinc-200 bg-white p-3">
                        <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-zinc-500">
                            Quyết định trả về
                        </p>
                        <div className="mt-3 space-y-2">
                            <div className="rounded-lg border border-zinc-200 bg-white p-2.5">
                                <p className="font-mono text-xs font-semibold text-zinc-900">
                                    401 · Unauthorized
                                </p>
                                <p className="mt-1 text-xs leading-5 text-zinc-600">
                                    Token thiếu, sai chữ ký, sai issuer/audience
                                    hoặc hết hạn.
                                </p>
                            </div>
                            <div className="rounded-lg border border-zinc-200 bg-white p-2.5">
                                <p className="font-mono text-xs font-semibold text-zinc-900">
                                    403 · Forbidden
                                </p>
                                <p className="mt-1 text-xs leading-5 text-zinc-600">
                                    User đã xác thực nhưng access profile không
                                    có grant route yêu cầu.
                                </p>
                            </div>
                        </div>
                    </aside>
                </div>
            </LogicContentFrame>
        </ShowcaseDisclosure>
    );
}

// Logic 2.2 dùng ma trận scope vì permission chỉ nói được làm gì, còn resource check nói được làm ở đâu.
function AuthorizationResourceScopeLogic() {
    return (
        <ShowcaseDisclosure
            id="authorization-logic-resource-scope"
            number="2.2"
            title="Kiểm tra ownership và scope trên resource thật"
            description="Có quyền gọi endpoint chưa đủ; domain service còn phải xác nhận resource thuộc đúng user, shop hoặc phạm vi được phân công."
        >
            <LogicContentFrame>
                <LogicPurposeIntro
                    what="Ownership và scope là giới hạn dữ liệu mà một permission được phép tác động tới: của chính user, của shop, shop được phân công hoặc toàn hệ thống."
                    problem="Một user có thể có permission đúng nhưng vẫn không được sửa resource của shop khác. Domain service cần kiểm tra resource thật để ngăn truy cập chéo dữ liệu."
                />
                <div className="grid gap-4 border-b border-zinc-200 pb-4 md:grid-cols-2">
                    <div>
                        <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-zinc-500">
                            Permission trả lời “được làm gì?”
                        </p>
                        <p className="mt-1 text-xs leading-5 text-zinc-700">
                            Ví dụ{' '}
                            <code className="rounded border border-zinc-200 bg-white px-1 py-0.5 text-[11px]">
                                SELLER_PRODUCT_UPDATE
                            </code>{' '}
                            chỉ nói user được gọi hành động cập nhật product. Nó
                            chưa nói product đó thuộc shop nào.
                        </p>
                    </div>
                    <div className="md:border-l md:border-zinc-200 md:pl-5">
                        <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-zinc-500">
                            Scope trả lời “được làm ở đâu?”
                        </p>
                        <p className="mt-1 text-xs leading-5 text-zinc-700">
                            Domain service phải lấy resource thật và đối chiếu
                            owner/shop/assignment với actor context trước khi
                            đọc hoặc ghi dữ liệu. Vì vậy UI ẩn nút không thay
                            thế được kiểm tra backend.
                        </p>
                    </div>
                </div>
                <div className="mt-4 border-b border-zinc-200 pb-3">
                    <p className="text-xs leading-5 text-zinc-700">
                        <strong className="font-semibold text-zinc-950">
                            Cách đọc:
                        </strong>{' '}
                        permission xác định action như{' '}
                        <code className="rounded border border-zinc-200 bg-white px-1 py-0.5 font-mono text-[11px]">
                            product.update
                        </code>
                        ; scope giới hạn resource mà action đó được phép tác
                        động. Domain service luôn lấy actor từ trusted context
                        và lấy owner/shop từ database, không dùng ownerId hoặc
                        shopId do client tự khai báo.
                    </p>
                </div>
                <div className="mt-4 overflow-x-auto rounded-xl border border-zinc-200">
                    <table className="w-full min-w-[1080px] text-left text-xs">
                        <thead className="bg-white text-[9px] uppercase tracking-[0.14em] text-zinc-500">
                            <tr>
                                <th className="px-3 py-2.5">Scope</th>
                                <th className="px-3 py-2.5">
                                    Ý nghĩa nghiệp vụ
                                </th>
                                <th className="px-3 py-2.5">
                                    Domain lấy và đối chiếu
                                </th>
                                <th className="px-3 py-2.5">
                                    Ví dụ trong hệ thống
                                </th>
                                <th className="px-3 py-2.5">
                                    Kết quả khi không đạt
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100 text-zinc-700">
                            <tr>
                                <td className="px-3 py-3 align-top font-mono">
                                    global
                                </td>
                                <td className="px-3 py-3 align-top">
                                    Action được phép trên phạm vi toàn hệ thống,
                                    không bị giới hạn bởi owner hoặc shop.
                                </td>
                                <td className="px-3 py-3 align-top">
                                    Gateway/domain vẫn phải thấy đúng permission
                                    global; không được suy ra global chỉ vì user
                                    có role admin.
                                </td>
                                <td className="px-3 py-3 align-top">
                                    Tác vụ quản trị policy hoặc dữ liệu dùng
                                    chung.
                                </td>
                                <td className="px-3 py-3 align-top">
                                    403 nếu action không có grant global tương
                                    ứng.
                                </td>
                            </tr>
                            <tr>
                                <td className="px-3 py-3 align-top font-mono">
                                    own
                                </td>
                                <td className="px-3 py-3 align-top">
                                    User chỉ được thao tác bản ghi mà chính user
                                    đó sở hữu.
                                </td>
                                <td className="px-3 py-3 align-top">
                                    Domain lấy ownerId của resource từ database
                                    và so với actorId trong trusted context;
                                    ownerId trong body không có giá trị quyết
                                    định.
                                </td>
                                <td className="px-3 py-3 align-top">
                                    Đọc hoặc sửa bản ghi thuộc user hiện tại.
                                </td>
                                <td className="px-3 py-3 align-top">
                                    Trả 403 trước khi đọc tiếp hoặc thực hiện
                                    mutation.
                                </td>
                            </tr>
                            <tr>
                                <td className="px-3 py-3 align-top font-mono">
                                    own_shop
                                </td>
                                <td className="px-3 py-3 align-top">
                                    Seller được thao tác resource thuộc shop mà
                                    seller sở hữu/quản lý.
                                </td>
                                <td className="px-3 py-3 align-top">
                                    Domain lấy shopId của product/resource thật,
                                    sau đó đối chiếu với shop
                                    membership/ownership đã resolve từ actor.
                                </td>
                                <td className="px-3 py-3 align-top">
                                    Seller cập nhật product trong shop của mình.
                                </td>
                                <td className="px-3 py-3 align-top">
                                    Trả 403 và không chạy câu lệnh UPDATE lên
                                    resource shop khác.
                                </td>
                            </tr>
                            <tr>
                                <td className="px-3 py-3 align-top font-mono">
                                    assigned_shop
                                </td>
                                <td className="px-3 py-3 align-top">
                                    Staff chỉ được thao tác các shop được phân
                                    công trong thời gian còn hiệu lực.
                                </td>
                                <td className="px-3 py-3 align-top">
                                    Domain kiểm tra assignment đúng actor, đúng
                                    shop, chưa revoked/inactive và chưa hết hạn.
                                </td>
                                <td className="px-3 py-3 align-top">
                                    Staff xử lý dữ liệu của shop được phân công.
                                </td>
                                <td className="px-3 py-3 align-top">
                                    Trả 403; không tin shopId từ body để chuyển
                                    sang shop khác.
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div className="mt-4 flex items-start gap-2 border-t border-zinc-200 pt-3 text-xs leading-5 text-zinc-700">
                    <ShieldAlert className="mt-0.5 size-4 shrink-0 text-zinc-700" />
                    <p>
                        <strong className="font-semibold text-zinc-950">
                            Thứ tự bảo vệ:
                        </strong>{' '}
                        Gateway kiểm tra route permission trước; domain service
                        kiểm tra ownership và scope sau. Chỉ khi cả hai lớp hợp
                        lệ, business logic mới được phép chạy.
                    </p>
                </div>
            </LogicContentFrame>
        </ShowcaseDisclosure>
    );
}

// Logic 2.3 mô tả mutation policy như một pipeline, từ actor context tới PostgreSQL.
function AuthorizationPolicyCommandLogic() {
    return (
        <ShowcaseDisclosure
            id="authorization-logic-policy-command"
            number="2.3"
            title="Ghi thay đổi role-permission có kiểm soát"
            description="Mọi thay đổi role và permission đều phải xác thực actor, kiểm tra payload và phạm vi trước khi ghi policy."
        >
            <LogicContentFrame>
                <LogicPurposeIntro
                    what="Policy command là request dùng để cấp, gỡ hoặc thay đổi role, permission, assignment và scope trong hệ thống."
                    problem="Đây là thao tác có thể làm thay đổi quyền của nhiều user. Nếu không xác thực actor, payload và phạm vi, admin giả hoặc client có thể tự cấp quyền vượt giới hạn."
                />
                <div className="grid gap-2 md:grid-cols-4">
                    <div className="rounded-xl border border-zinc-200 bg-white p-3">
                        <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-zinc-500">
                            Bước 1 · Actor
                        </p>
                        <h4 className="mt-1 text-sm font-semibold text-zinc-950">
                            Xác định ai đang thay đổi
                        </h4>
                        <p className="mt-1 text-xs leading-5 text-zinc-600">
                            Actor lấy từ JWT context đã verify, không lấy userId
                            do client gửi trong body. Gateway kiểm tra grant
                            quản trị rồi mới chuyển request tới auth-service.
                        </p>
                    </div>
                    <div className="rounded-xl border border-zinc-200 bg-white p-3">
                        <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-zinc-500">
                            Bước 2 · Payload
                        </p>
                        <h4 className="mt-1 text-sm font-semibold text-zinc-950">
                            Xác định thay đổi
                        </h4>
                        <p className="mt-1 text-xs leading-5 text-zinc-600">
                            PATCH mô tả role, permission, assignment hoặc scope
                            cần cấp/gỡ. DTO validation loại field sai, thiếu
                            field bắt buộc và dữ liệu ngoài contract.
                        </p>
                    </div>
                    <div className="rounded-xl border border-zinc-200 bg-white p-3">
                        <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-zinc-500">
                            Bước 3 · Policy check
                        </p>
                        <h4 className="mt-1 text-sm font-semibold text-zinc-950">
                            Kiểm tra phạm vi
                        </h4>
                        <p className="mt-1 text-xs leading-5 text-zinc-600">
                            Auth Service xác minh admin có được sửa policy của
                            shop/resource đó không, tránh cấp quyền vượt quá
                            phạm vi quản trị.
                        </p>
                    </div>
                    <div className="rounded-xl border border-zinc-200 bg-white p-3">
                        <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-zinc-500">
                            Bước 4 · Commit
                        </p>
                        <h4 className="mt-1 text-sm font-semibold text-zinc-950">
                            Ghi PostgreSQL
                        </h4>
                        <p className="mt-1 text-xs leading-5 text-zinc-600">
                            Chỉ khi các kiểm tra đều đạt, auth-service mới
                            commit policy. Lỗi validation, thiếu quyền hoặc sai
                            scope dừng trước mutation.
                        </p>
                    </div>
                </div>
                <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs text-zinc-500">
                    <span className="rounded-full border border-zinc-200 bg-white px-3 py-1.5">
                        JWT context
                    </span>
                    <ArrowRight className="size-4" />
                    <span className="rounded-full border border-zinc-200 bg-white px-3 py-1.5">
                        Guard + DTO validation
                    </span>
                    <ArrowRight className="size-4" />
                    <span className="rounded-full border border-zinc-200 bg-white px-3 py-1.5">
                        Auth Service
                    </span>
                    <ArrowRight className="size-4" />
                    <span className="rounded-full border border-zinc-200 bg-white px-3 py-1.5">
                        PostgreSQL
                    </span>
                </div>
            </LogicContentFrame>
        </ShowcaseDisclosure>
    );
}

// Logic 2.4 dùng timeline để thể hiện tính nguyên tử về mặt nghiệp vụ giữa policy, audit và cache.
function AuthorizationPolicyAuditLogic() {
    return (
        <ShowcaseDisclosure
            id="authorization-logic-policy-audit"
            number="2.4"
            title="Audit thay đổi và vô hiệu access profile cũ"
            description="Sau khi policy đổi, hệ thống ghi lại lịch sử và loại access profile cũ để quyền mới có hiệu lực."
        >
            <LogicContentFrame>
                <LogicPurposeIntro
                    what="Audit là nhật ký thay đổi quyền; invalidate là loại access profile cũ khỏi Redis sau khi policy đã thay đổi."
                    problem="Nếu chỉ cập nhật database mà giữ cache cũ, user có thể tiếp tục dùng quyền đã bị thu hồi. Nếu không có audit, hệ thống không trả lời được ai đã cấp/gỡ quyền và thay đổi lúc nào."
                />
                <ol className="grid gap-2 md:grid-cols-4">
                    <li className="rounded-xl border border-zinc-200 bg-white p-3">
                        <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-zinc-500">
                            Bước 1 · Change
                        </p>
                        <p className="mt-1 text-sm font-semibold text-zinc-950">
                            Commit policy mới
                        </p>
                        <p className="mt-1 text-xs leading-5 text-zinc-600">
                            Role/permission change hợp lệ được ghi vào
                            PostgreSQL, nguồn dữ liệu chuẩn của policy. Bản ghi
                            chỉ được tạo sau khi actor, payload và phạm vi đã
                            qua kiểm tra.
                        </p>
                    </li>
                    <li className="rounded-xl border border-zinc-200 bg-white p-3">
                        <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-zinc-500">
                            Bước 2 · Audit
                        </p>
                        <p className="mt-1 text-sm font-semibold text-zinc-950">
                            Lưu before/after
                        </p>
                        <p className="mt-1 text-xs leading-5 text-zinc-600">
                            Auth Service ghi actorUserId, nội dung trước/sau,
                            thời điểm và request context để trả lời ai đã đổi
                            gì, đổi lúc nào và đổi trong phạm vi nào.
                        </p>
                    </li>
                    <li className="rounded-xl border border-zinc-200 bg-white p-3">
                        <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-zinc-500">
                            Bước 3 · Version
                        </p>
                        <p className="mt-1 text-sm font-semibold text-zinc-950">
                            Đánh dấu profile cũ
                        </p>
                        <p className="mt-1 text-xs leading-5 text-zinc-600">
                            permissionVersion tăng sau thay đổi. Profile đang
                            mang version cũ được xem là stale, không còn đại
                            diện cho policy hiện tại.
                        </p>
                    </li>
                    <li className="rounded-xl border border-zinc-200 bg-white p-3">
                        <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-zinc-500">
                            Bước 4 · Invalidate
                        </p>
                        <p className="mt-1 text-sm font-semibold text-zinc-950">
                            Buộc resolve lại
                        </p>
                        <p className="mt-1 text-xs leading-5 text-zinc-600">
                            Redis bị invalidate; lần /me hoặc /refresh sau phải
                            tạo access profile mới. Quyền vừa bị gỡ không thể
                            tiếp tục sống vô thời hạn trong cache.
                        </p>
                    </li>
                </ol>
                <div className="mt-3 flex items-start gap-2 rounded-xl border border-zinc-200 bg-white p-3 text-xs leading-5 text-zinc-700">
                    <RefreshCw className="mt-0.5 size-4 shrink-0 text-zinc-700" />
                    <p>
                        <strong className="font-semibold text-zinc-950">
                            Ranh giới dữ liệu:
                        </strong>{' '}
                        PostgreSQL giữ policy và audit; Redis chỉ giữ bản sao
                        access profile để đọc nhanh. Dù cache có lỗi,
                        JwtAuthGuard, PermissionsGuard và domain ownership check
                        vẫn không bị bỏ qua.
                    </p>
                </div>
            </LogicContentFrame>
        </ShowcaseDisclosure>
    );
}

// Logic 2.5 trình bày các nguồn dữ liệu được hợp nhất thành access profile và cách cache được dùng.
function AuthorizationProfileResolveLogic() {
    return (
        <ShowcaseDisclosure
            id="authorization-logic-profile-resolve"
            number="2.5"
            title="Tạo bảng quyền hiện tại cho user"
            description="Auth Service hợp nhất danh tính và policy thành bảng quyền hiện tại để web và backend dùng cùng một kết quả."
        >
            <LogicContentFrame>
                <LogicPurposeIntro
                    what="Access profile là “bảng quyền hiện tại” đã được Auth Service tổng hợp cho một user: user là ai, được làm action nào, trên phạm vi nào và thấy khu vực nào trên web."
                    problem="Role, assignment, permission và scope nằm ở nhiều nguồn. Nếu mỗi service tự đọc và tự hiểu khác nhau, UI có thể hiển thị sai quyền hoặc request dùng policy không đồng nhất."
                />
                <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] lg:items-center">
                    <div className="grid gap-2 sm:grid-cols-2">
                        <div className="rounded-xl border border-zinc-200 bg-white p-3">
                            <div className="flex items-center gap-2">
                                <KeyRound className="size-4 text-zinc-700" />
                                <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-zinc-500">
                                    Bước 1 · Identity
                                </p>
                            </div>
                            <p className="mt-2 text-sm font-semibold text-zinc-950">
                                Xác định user
                            </p>
                            <p className="mt-1 text-xs leading-5 text-zinc-600">
                                Gateway đã xác minh JWT nên Auth Service biết
                                request thuộc user nào. Hệ thống lấy role trong
                                token để tương thích và lấy thêm user-role
                                assignment trong database, nhưng chỉ giữ
                                assignment còn active, chưa revoked và chưa hết
                                hạn.
                            </p>
                        </div>
                        <div className="rounded-xl border border-zinc-200 bg-white p-3">
                            <div className="flex items-center gap-2">
                                <Database className="size-4 text-zinc-700" />
                                <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-zinc-500">
                                    Bước 2 · Policy
                                </p>
                            </div>
                            <p className="mt-2 text-sm font-semibold text-zinc-950">
                                Đọc luật quyền
                            </p>
                            <p className="mt-1 text-xs leading-5 text-zinc-600">
                                Auth Service đọc role-permission, grant, scope,
                                area access, navigation và permissionVersion từ
                                PostgreSQL. Đây là policy server-side; user
                                không thể gửi body để tự thêm role hoặc
                                permission.
                            </p>
                        </div>
                    </div>
                    <div className="flex justify-center text-zinc-400">
                        <ArrowRight className="hidden size-5 lg:block" />
                        <ArrowDown className="size-5 lg:hidden" />
                    </div>
                    <div className="rounded-xl border border-zinc-200 bg-white p-4">
                        <div className="flex items-center gap-2">
                            <KeyRound className="size-4 text-zinc-700" />
                            <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-zinc-500">
                                Bước 3 · Kết quả
                            </p>
                        </div>
                        <p className="mt-2 text-sm font-semibold text-zinc-950">
                            Bảng quyền hiện tại của user
                        </p>
                        <p className="mt-1 text-xs leading-5 text-zinc-600">
                            Auth Service lọc role không còn hiệu lực rồi merge
                            grant và scope thành access profile. Profile này trả
                            lời được user có action nào, trên phạm vi nào và
                            được hiển thị khu vực nào trong web.
                        </p>
                    </div>
                </div>
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                    <div className="rounded-xl border border-zinc-200 bg-white p-3">
                        <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-zinc-500">
                            Bổ sung · Cache
                        </p>
                        <p className="mt-2 text-sm font-semibold text-zinc-950">
                            Khi nào dùng cache?
                        </p>
                        <p className="mt-1 text-xs leading-5 text-zinc-700">
                            Profile được cache theo userId + permissionVersion
                            để không phải join lại role/permission ở mọi lần
                            đọc. Cache chỉ là bản sao tăng tốc; khi version đổi
                            hoặc cache bị invalidate, hệ thống phải đọc policy
                            và tạo profile mới.
                        </p>
                    </div>
                    <div className="rounded-xl border border-zinc-200 bg-white p-3">
                        <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-zinc-500">
                            Bổ sung · Ví dụ
                        </p>
                        <p className="mt-2 text-sm font-semibold text-zinc-950">
                            Khi admin gỡ quyền
                        </p>
                        <p className="mt-1 text-xs leading-5 text-zinc-700">
                            Auth Service tăng version và xóa profile cũ; lần /me
                            hoặc /refresh sau không còn grant update, web ẩn nút
                            sửa, nhưng Gateway/domain vẫn kiểm tra quyền độc lập
                            khi seller gọi API.
                        </p>
                    </div>
                </div>
            </LogicContentFrame>
        </ShowcaseDisclosure>
    );
}

// Ghép năm logic theo thứ tự đọc của chương 2.
export function AuthorizationLogicOverview() {
    return (
        <div className="space-y-3">
            <AuthorizationRoutePermissionLogic />
            <AuthorizationResourceScopeLogic />
            <AuthorizationPolicyCommandLogic />
            <AuthorizationPolicyAuditLogic />
            <AuthorizationProfileResolveLogic />
        </div>
    );
}

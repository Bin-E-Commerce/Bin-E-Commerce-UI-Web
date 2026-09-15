// Phần mở đầu Authorization Management; mô tả request đi qua identity, policy resolution, gateway và resource boundary.
import { ShowcaseNote } from '../../../components/shared/ShowcaseNote';
import { ShowcaseStepExplorer } from '../../../components/shared/ShowcaseStepExplorer';
import type { ShowcaseFlowStep } from '../../../types/showcase.types';

// Mô hình hóa một request authorization đầy đủ để người đọc thấy quyết định được tạo ở đâu và được kiểm tra lại ở đâu.
const authorizationRequestSteps: ShowcaseFlowStep[] = [
    {
        id: 'identity',
        title: 'Xác thực identity',
        summary: 'JWT Auth Guard xác minh token trước khi tin user context.',
        detail: 'API Gateway đọc Bearer JWT bằng JWKS, loại các identity header do client tự gửi rồi inject x-user-id, email, name, avatar, roles và permissions đã xác thực. Request guest/public được xử lý theo rule riêng; request protected không đi tiếp nếu token không hợp lệ.',
        output: 'Downstream nhận một identity context có nguồn từ token đã verify.',
        implementation: 'JwtAuthGuard + x-user-* context',
    },
    {
        id: 'route',
        title: 'Chặn ở route',
        summary: 'Permissions Guard so required permission với grant của user.',
        detail: 'Controller khai báo @RequirePermissions cho endpoint. Gateway đọc metadata route, so sánh với x-user-permissions và trả 403 trước khi proxy nếu thiếu một permission cần thiết. Client không thể tự thêm header để nâng quyền vì header identity đã bị guard ghi đè.',
        output: 'Request hợp lệ mới được forward; request thiếu grant dừng tại Gateway.',
        implementation: 'RequirePermissions + PermissionsGuard',
    },
    {
        id: 'profile',
        title: 'Resolve policy',
        summary: 'Auth Service tạo access profile từ role và assignment hiệu lực.',
        detail: 'Access Control Service hợp nhất role legacy, role trong token và user_role_assignments đang active/trong thời hạn. Nó loại permission inactive, merge scope, gắn permissionVersion và lọc area/navigation theo quyền thực tế. Profile được cache theo userId + version.',
        output: 'PermissionGrant, scope, area access, defaultRoute và navigation đã lọc.',
        implementation: 'AccessControlService.getAccessProfile',
    },
    {
        id: 'resource',
        title: 'Kiểm tra resource',
        summary: 'Domain service đối chiếu action với ownership và scope.',
        detail: 'Route permission chỉ chứng minh user được gọi loại endpoint đó; service sở hữu dữ liệu phải kiểm tra product/shop/resource cụ thể. Ví dụ own_shop chỉ hợp lệ khi resource thuộc shop của actor. Đây là lớp chặn truy cập chéo tài nguyên ngay trước mutation.',
        output: '200 khi đúng action + đúng phạm vi; 403 khi không có quyền hoặc không sở hữu resource.',
        implementation: 'SellerProductAccessService / domain access rule',
    },
    {
        id: 'navigation',
        title: 'Trả trải nghiệm',
        summary: 'Frontend dùng access profile để điều hướng đúng khả năng.',
        detail: 'Seller/Admin shell lấy navigation backend-driven, ẩn route không có quyền và chọn defaultRoute phù hợp. Nếu user truy cập trực tiếp URL cấm, route shell đưa về access denied; UI chỉ là lớp hỗ trợ trải nghiệm, không phải security boundary.',
        output: 'Menu, route guard và thông báo access denied nhất quán với policy backend.',
        implementation: 'SellerLayoutShell + map-seller-navigation',
    },
];

// Giúp người đọc hiểu toàn bộ vòng đời request trước khi xem kiến trúc và thuật toán effective grant.
export function AuthorizationRequestOverview() {
    return (
        <div className="space-y-4">
            <ShowcaseStepExplorer
                steps={authorizationRequestSteps}
                label="IDENTITY → POLICY → ENFORCEMENT → UX"
                title="Một request được phép vì sao?"
                description="Authorization không dừng ở việc gắn role vào user. Hệ thống xác thực identity, resolve grant hiệu lực, chặn route, kiểm tra resource và dùng cùng profile đó để dựng navigation phù hợp."
                detailId="authorization-request-step-detail"
            />
            <div className="grid gap-3 sm:grid-cols-2">
                <ShowcaseNote title="403 có nhiều điểm dừng"><p>Gateway chặn thiếu route permission; downstream chặn sai owner/scope. Hai lớp bổ sung cho nhau vì một lớp không đủ hiểu toàn bộ business context.</p></ShowcaseNote>
                <ShowcaseNote title="Role không phải quyết định cuối"><p>Role chỉ là đầu vào. Quyết định thực tế là permission + scope sau khi assignment, trạng thái active và thời hạn được resolve.</p></ShowcaseNote>
            </div>
        </div>
    );
}

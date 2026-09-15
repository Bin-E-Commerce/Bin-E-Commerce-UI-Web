// Chương kiến trúc Authorization Management; tổ chức flow, technology stack và service overview theo cùng cấu trúc Recommendation.
import { ShowcaseDisclosure } from '../../../components/shared/ShowcaseDisclosure';
import { AuthorizationActivityFlow } from './AuthorizationActivityFlow';
import { AuthorizationServicesOverview } from './AuthorizationServicesOverview';
import { AuthorizationTechnologyStack } from './AuthorizationTechnologyStack';

// Đặt flow request và policy change trước stack/service để người đọc hiểu hệ thống vận hành trước khi xem component.
export function AuthorizationArchitecture() {
    return (
        <section className="space-y-4">
            <ShowcaseDisclosure id="authorization-architecture-flow" number="1.1" title="Luồng hoạt động của hệ thống" description="Một request được phép phải đúng identity, action và scope; một thay đổi policy phải được audit và làm mới access profile.">
                <AuthorizationActivityFlow />
            </ShowcaseDisclosure>
            <AuthorizationTechnologyStack />
            <AuthorizationServicesOverview />
        </section>
    );
}

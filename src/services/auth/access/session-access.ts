// File này chuẩn hóa quyết định truy cập và route mặc định theo session backend trả về.
// File không tự cấp permission; các endpoint vẫn phải được bảo vệ ở API Gateway và service sở hữu nghiệp vụ.
import type {
    PermissionAwareUser,
    SessionPermission,
} from '../types/session-access.types';

export const ADMIN_ACCESS_DENIED_PATH = '/admin/access-denied';
export const ADMIN_DASHBOARD_PATH = '/admin/dashboard';
export const ADMIN_SELLER_APPLICATIONS_PATH = '/admin/sellers/applications';
export const SELLER_PRODUCT_UPDATE_PERMISSION = 'seller.product.update';

// Kiểm tra permission trong session user do backend trả về.
// Hàm này là tiện ích generic cho nút/block nhỏ; route chính ưu tiên accessProfile thay vì hard-code permission ở FE.
export function hasPermission(
    user: PermissionAwareUser | null | undefined,
    permission: SessionPermission,
): boolean {
    return Boolean(
        user?.permissions?.includes(permission) ||
            user?.permissionGrants?.some((grant) => grant.code === permission),
    );
}

// Kiểm tra nhiều permission cùng lúc cho các vùng UI lớn như Admin Center.
// Hàm này chỉ là tiện ích đọc session, không tự định nghĩa quyền nghiệp vụ mới ở FE.
export function hasAnyPermission(
    user: PermissionAwareUser | null | undefined,
    permissions: readonly SessionPermission[],
): boolean {
    return permissions.some((permission) => hasPermission(user, permission));
}

// Kiểm tra một area có route cụ thể trong navigation backend trả về hay không.
// Backend đã lọc navigation theo permission, nên FE chỉ cần đọc route hợp lệ thay vì giữ mã quyền nghiệp vụ.
function hasNavigationPath(
    user: PermissionAwareUser | null | undefined,
    area: 'admin' | 'seller',
    pathname: string,
): boolean {
    const navigation = user?.accessProfile?.areas[area].navigation ?? [];
    return navigation.some((item) => {
        const href = item.href;
        return pathname === href || pathname.startsWith(`${href}/`);
    });
}

// Dashboard admin được quyết định bởi navigation backend, FE không giữ mã quyền của màn hình này.
export function canAccessAdminDashboard(
    user: PermissionAwareUser | null | undefined,
): boolean {
    return hasNavigationPath(user, 'admin', ADMIN_DASHBOARD_PATH);
}

// Hồ sơ seller được quyết định bởi navigation backend, FE không giữ mã quyền của màn hình này.
export function canReadSellerApplications(
    user: PermissionAwareUser | null | undefined,
): boolean {
    return hasNavigationPath(user, 'admin', ADMIN_SELLER_APPLICATIONS_PATH);
}

// Kiểm tra user có được vào vùng Admin Center hay không dựa trên accessProfile backend trả về.
// Nếu backend chưa trả accessProfile thì FE không tự đoán quyền để tránh mở nhầm khu vực quản trị.
export function canAccessAdmin(
    user: PermissionAwareUser | null | undefined,
): boolean {
    return Boolean(user?.accessProfile?.areas.admin.canAccess);
}

// Chọn trang admin đầu tiên user được phép xem.
// Backend ưu tiên trả defaultRoute; FE chỉ fallback bằng vài route đã triển khai thật.
export function getDefaultAdminPath(
    user: PermissionAwareUser | null | undefined,
): string {
    const backendRoute = user?.accessProfile?.areas.admin.defaultRoute;
    if (backendRoute) return backendRoute;

    return ADMIN_ACCESS_DENIED_PATH;
}

// Chọn trang mặc định theo role nghiệp vụ; Admin luôn vào Admin Center trước cả khi accessProfile chưa kịp hydrate đầy đủ.
export function getDefaultAuthenticatedPath(
    user: PermissionAwareUser | null | undefined,
): string {
    const roles = [user?.role, ...(user?.roles ?? [])]
        .filter((role): role is string => Boolean(role))
        .map((role) => role.toUpperCase());
    const isBackOfficeRole = roles.includes('ADMIN') || roles.includes('SUPPORT_AGENT');
    const isSellerRole = roles.includes('SELLER');

    if (isBackOfficeRole) {
        const adminRoute = user?.accessProfile?.areas.admin.defaultRoute;
        return adminRoute?.startsWith('/admin')
            ? adminRoute
            : ADMIN_DASHBOARD_PATH;
    }

    if (isSellerRole && canAccessSellerCenter(user)) {
        const sellerRoute = user?.accessProfile?.areas.seller.defaultRoute;
        return sellerRoute?.startsWith('/seller') ? sellerRoute : '/seller';
    }

    // Fallback cho session cũ chưa trả role đầy đủ; vẫn ưu tiên admin nếu accessProfile xác nhận khu vực này.
    if (canAccessAdmin(user)) return getDefaultAdminPath(user);
    if (canAccessSellerCenter(user)) {
        const sellerRoute = user?.accessProfile?.areas.seller.defaultRoute;
        return sellerRoute?.startsWith('/seller') ? sellerRoute : '/seller';
    }

    return '/';
}

// Kiểm tra quyền theo path admin hiện tại bằng navigation backend trả trong accessProfile.
// Route access-denied luôn mở; route còn lại phải xuất hiện trong navigation backend.
export function canAccessAdminPath(
    pathname: string,
    user: PermissionAwareUser | null | undefined,
): boolean {
    if (pathname === ADMIN_ACCESS_DENIED_PATH) return true;

    const adminNavigation = user?.accessProfile?.areas.admin.navigation ?? [];
    if (adminNavigation.length > 0) {
        return adminNavigation.some((item) => {
            const href = item.href;
            return pathname === href || pathname.startsWith(`${href}/`);
        });
    }

    return false;
}

// Seller Center mở theo accessProfile backend trả về; FE không giữ mã quyền cửa vào khu vực này.
export function canAccessSellerCenter(
    user: PermissionAwareUser | null | undefined,
): boolean {
    return Boolean(user?.accessProfile?.areas.seller.canAccess);
}

// Kiểm tra route Seller Center bằng navigation backend đã lọc permission.
// Dùng so khớp chính xác để các trang con chưa có permission riêng như tạo sản phẩm không được mở nhờ route cha.
export function canAccessSellerPath(
    pathname: string,
    user: PermissionAwareUser | null | undefined,
): boolean {
    if (pathname === '/seller/access-denied') return true;

    const navigation = user?.accessProfile?.areas.seller.navigation ?? [];
    if (navigation.some((item) => pathname === item.href)) return true;

    // Route UUID là màn chi tiết của danh sách sản phẩm nên kế thừa quyền đọc route cha; `/new` không khớp UUID và vẫn cần quyền tạo riêng.
    const isSellerProductDetail =
        /^\/seller\/products\/[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
            pathname,
        );
    const isSellerProductEdit =
        /^\/seller\/products\/[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\/edit$/i.test(
            pathname,
        );
    const isSellerOrderDetail =
        /^\/seller\/orders\/[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
            pathname,
        );
    if (isSellerProductEdit) {
        // Edit dùng permission riêng; không suy ra từ quyền đọc để tránh mở nhầm thao tác ghi.
        return hasPermission(user, SELLER_PRODUCT_UPDATE_PERMISSION);
    }
    return (
        isSellerProductDetail &&
        navigation.some((item) => item.href === '/seller/products')
    ) || (
        isSellerOrderDetail &&
        navigation.some((item) => item.href === '/seller/orders')
    );
}

// Dashboard seller được quyết định bởi navigation backend, FE không giữ mã quyền của màn hình này.
export function canViewSellerDashboard(
    user: PermissionAwareUser | null | undefined,
): boolean {
    return hasNavigationPath(user, 'seller', '/seller');
}

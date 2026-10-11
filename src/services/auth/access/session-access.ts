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
    const isBackOfficeRole =
        roles.includes('ADMIN') || roles.includes('SUPPORT_AGENT');
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

// Chỉ khôi phục đường dẫn nội bộ sau login khi tài khoản mới có quyền vào đúng khu vực.
// Redirect được giữ lại qua logout để quay về trang đang xem, nên không thể tin query này là quyền của session trước.
// URL ngoài hệ thống, route xác thực và route admin/seller trái quyền đều rơi về trang mặc định của user vừa đăng nhập.
export function getSafeAuthenticatedRedirectPath(
    requestedPath: string | null | undefined,
    user: PermissionAwareUser | null | undefined,
): string {
    const fallbackPath = getDefaultAuthenticatedPath(user);
    if (
        !requestedPath?.startsWith('/') ||
        requestedPath.startsWith('//') ||
        requestedPath.includes('\\') ||
        /[\u0000-\u001f\u007f]/.test(requestedPath)
    ) {
        return fallbackPath;
    }

    let requestedUrl: URL;
    try {
        // URL parser chuẩn hóa dấu chấm và xác định origin trước khi quyết định có thể khôi phục đường dẫn.
        requestedUrl = new URL(requestedPath, 'https://bin.local');
    } catch {
        return fallbackPath;
    }

    if (requestedUrl.origin !== 'https://bin.local') return fallbackPath;

    let pathname: string;
    try {
        // Giải mã path một lần để biến thể mã hóa như `/%61dmin` cũng phải qua đúng kiểm tra quyền.
        pathname = decodeURIComponent(requestedUrl.pathname);
    } catch {
        return fallbackPath;
    }
    if (
        pathname.startsWith('//') ||
        pathname.includes('\\') ||
        /%(?:2f|5c|2e)/i.test(pathname)
    ) {
        return fallbackPath;
    }

    const isAdminPath = pathname === '/admin' || pathname.startsWith('/admin/');
    const isSellerPath =
        pathname === '/seller' || pathname.startsWith('/seller/');
    const isSellerRegistrationPath =
        pathname === '/seller/register' || pathname.startsWith('/seller/register/');

    // Onboarding là luồng public sau khi đăng nhập của customer, không phải quyền truy cập Seller Center.
    if (isSellerRegistrationPath) {
        return canAccessAdmin(user) || canAccessSellerCenter(user)
            ? fallbackPath
            : `${pathname}${requestedUrl.search}${requestedUrl.hash}`;
    }

    // Route quản trị cần cả quyền vào Admin Center lẫn permission của chính trang được yêu cầu.
    if (isAdminPath) {
        return canAccessAdmin(user) && canAccessAdminPath(pathname, user)
            ? `${pathname}${requestedUrl.search}${requestedUrl.hash}`
            : fallbackPath;
    }

    // Route Seller Center không được thừa hưởng chỉ vì URL cũ thuộc session trước; kiểm tra lại navigation hiện tại.
    if (isSellerPath) {
        return canAccessSellerCenter(user) && canAccessSellerPath(pathname, user)
            ? `${pathname}${requestedUrl.search}${requestedUrl.hash}`
            : fallbackPath;
    }

    // Trang public như checkout vẫn được giữ lại, nhưng trang đăng nhập không thể tự redirect vòng lặp.
    if (
        pathname === '/login' ||
        pathname === '/register' ||
        pathname === '/forgot-password' ||
        pathname === '/reset-password' ||
        pathname === '/callback' ||
        pathname === '/auth/callback'
    ) {
        return fallbackPath;
    }

    return `${pathname}${requestedUrl.search}${requestedUrl.hash}`;
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
// Chỉ các màn detail được xác định rõ mới kế thừa quyền đọc từ route danh sách; thao tác tạo/sửa vẫn cần quyền riêng.
export function canAccessSellerPath(
    pathname: string,
    user: PermissionAwareUser | null | undefined,
): boolean {
    if (pathname === '/seller/access-denied') return true;

    const navigation = user?.accessProfile?.areas.seller.navigation ?? [];
    if (navigation.some((item) => pathname === item.href)) return true;

    // Conversation là tài nguyên con của BinGPT nên kế thừa đúng quyền mở trang chat,
    // nhưng chỉ với một path segment; route lồng sâu hoặc URL không liên quan vẫn bị chặn.
    const isSellerCopilotConversation = /^\/seller\/ai\/bingpt\/[^/]+$/.test(
        pathname,
    );
    if (
        isSellerCopilotConversation &&
        navigation.some((item) => item.href === '/seller/ai/bingpt')
    ) {
        return true;
    }

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
        (isSellerProductDetail &&
            navigation.some((item) => item.href === '/seller/products')) ||
        (isSellerOrderDetail &&
            navigation.some((item) => item.href === '/seller/orders'))
    );
}

// Dashboard seller được quyết định bởi navigation backend, FE không giữ mã quyền của màn hình này.
export function canViewSellerDashboard(
    user: PermissionAwareUser | null | undefined,
): boolean {
    return hasNavigationPath(user, 'seller', '/seller');
}

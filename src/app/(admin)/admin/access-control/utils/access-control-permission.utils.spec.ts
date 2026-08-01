import type {
    AdminAccessPermission,
    AdminAccessRole,
    AdminRolePermission,
} from '@/services/admin';
import { resolveRolePermissionState } from './access-control-permission.utils';

const SELLER_ROLE: AdminAccessRole = {
    id: 'seller-role-id',
    code: 'SELLER',
    name: 'Người bán',
    description: null,
    isSystem: true,
    isActive: true,
};

const SHOP_PROFILE_PERMISSION: AdminAccessPermission = {
    id: 'shop-profile-permission-id',
    code: 'seller.shop_profile.read',
    name: 'Xem hồ sơ shop',
    description: null,
    resource: 'seller.shop_profile',
    action: 'read',
    permissionVersion: 'test',
    isActive: true,
};

// Tạo role-permission tối thiểu để từng test chỉ tập trung vào quy tắc chọn scope và trạng thái.
function createRolePermission(
    scope: string,
    isActive: boolean,
): AdminRolePermission {
    return {
        id: `${scope}-${isActive}`,
        scope,
        isActive,
        role: SELLER_ROLE,
        permission: SHOP_PROFILE_PERMISSION,
    };
}

describe('resolveRolePermissionState', () => {
    it('should resolve active own_shop grant when seller permission exists in database', () => {
        // Sắp xếp
        const rolePermissions = [
            createRolePermission('global', false),
            createRolePermission('own_shop', true),
        ];

        // Thực thi
        const result = resolveRolePermissionState(
            SELLER_ROLE.code,
            SHOP_PROFILE_PERMISSION,
            rolePermissions,
        );

        // Kiểm tra
        expect(result).toEqual({
            scope: 'own_shop',
            active: true,
            activeScopes: ['own_shop'],
        });
    });

    it('should expose every active scope so revoke action can clean legacy grants', () => {
        // Sắp xếp
        const rolePermissions = [
            createRolePermission('global', true),
            createRolePermission('own_shop', true),
        ];

        // Thực thi
        const result = resolveRolePermissionState(
            SELLER_ROLE.code,
            SHOP_PROFILE_PERMISSION,
            rolePermissions,
        );

        // Kiểm tra
        expect(result).toEqual({
            scope: 'own_shop',
            active: true,
            activeScopes: ['global', 'own_shop'],
        });
    });

    it('should fall back to own_shop for a new seller feature without database records', () => {
        // Sắp xếp
        const rolePermissions: AdminRolePermission[] = [];

        // Thực thi
        const result = resolveRolePermissionState(
            SELLER_ROLE.code,
            SHOP_PROFILE_PERMISSION,
            rolePermissions,
        );

        // Kiểm tra
        expect(result).toEqual({
            scope: 'own_shop',
            active: false,
            activeScopes: [],
        });
    });
});

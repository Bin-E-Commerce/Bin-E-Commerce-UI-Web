import { API_VERSION } from '@/config/api.config';
import authorizedAxios from '@/utils/authorizedAxios';
import type {
    AdminAccessControlOverviewResponse,
    UpdateRolePermissionPayload,
    UpdateRolePermissionResponse,
} from '../types/access-control.types';

export const adminAccessControlService = {
    // Lấy toàn bộ dữ liệu cấu hình quyền hiện tại để Admin UI hiển thị role, permission, scope và menu.
    getOverview: () =>
        authorizedAxios
            .get<AdminAccessControlOverviewResponse>(
                `${API_VERSION}/admin/access-control/admin/overview`,
            )
            .then((response) => response.data),

    // Cấp hoặc gỡ một permission cho role; backend sẽ ghi audit log và xóa Redis cache quyền.
    updateRolePermission: (
        roleCode: string,
        payload: UpdateRolePermissionPayload,
    ) =>
        authorizedAxios
            .patch<UpdateRolePermissionResponse>(
                `${API_VERSION}/admin/access-control/admin/roles/${roleCode}/permissions`,
                payload,
            )
            .then((response) => response.data),
};

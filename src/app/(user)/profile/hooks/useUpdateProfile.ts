// Hook lưu hồ sơ qua Auth Service và đồng bộ Redux để header cùng trang profile cập nhật ngay.
'use client';

import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';

import { authService, type UpdateProfilePayload } from '@/services/auth';
import { useAppDispatch } from '@/store/hooks';
import { updateAuthUser } from '@/store/slices/authSlice';

// Gom side effect lưu, đồng bộ phiên hiện tại và phản hồi lỗi vào một mutation dùng riêng cho hồ sơ.
export function useUpdateProfile() {
    const dispatch = useAppDispatch();
    const mutation = useMutation({
        // Chỉ gửi qua Auth Service; backend là nguồn chuẩn cho quy tắc tên và số điện thoại.
        mutationFn: (payload: UpdateProfilePayload) =>
            authService.updateProfile(payload),
        // Chỉ đồng bộ hai trường có thể chỉnh sửa để giữ nguyên role, quyền và dữ liệu phiên đang có.
        onSuccess: (response) => {
            dispatch(
                updateAuthUser({
                    name: response.data.name,
                    phone: response.data.phone,
                }),
            );
            toast.success('Đã cập nhật thông tin cá nhân.');
        },
        // Báo lỗi nhưng không xóa bản nháp trong dialog để người dùng sửa hoặc thử lại.
        onError: () => {
            toast.error('Không thể lưu thông tin. Vui lòng thử lại.');
        },
    });

    return {
        isPending: mutation.isPending,
        updateProfile: mutation.mutateAsync,
    };
}

// Types của dialog chỉnh sửa hồ sơ, tái sử dụng Auth contract thay vì định nghĩa lại dữ liệu user.
import type { z } from 'zod';

import type { AuthUser } from '@/services/auth';
import type { profileEditSchema } from '../schemas/profile-edit.schema';

export interface ProfileEditDialogProps {
    user: Pick<AuthUser, 'name' | 'email' | 'phone'>;
}

export type ProfileEditFormValues = z.infer<typeof profileEditSchema>;

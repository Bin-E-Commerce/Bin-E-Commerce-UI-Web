// File này gom các Auth API thành facade ổn định cho các feature frontend.

import { changePassword } from './api/password.api';
import { getMe, updateProfile } from './api/profile.api';
import { getViewer, login, refresh } from './api/login.api';
import { logout } from './api/logout.api';
import { registerInitiate, registerVerify } from './api/register.api';
import {
    getSessions,
    logoutAllSessions,
    revokeOtherSessions,
    revokeSession,
} from './api/session.api';
import { getSocialAuthUrl, socialCallback } from './api/social-auth.api';
import {
    createAddress,
    deleteAddress,
    getAddresses,
    updateAddress,
} from './api/address.api';

// Facade auth gom các endpoint theo một contract ổn định để UI không phải biết cấu trúc API nội bộ.
export const authService = {
    login,
    refresh,
    getViewer,
    logout,
    registerInitiate,
    registerVerify,
    changePassword,
    getSocialAuthUrl,
    socialCallback,
    getMe,
    updateProfile,
    getSessions,
    revokeSession,
    revokeOtherSessions,
    logoutAllSessions,
    getAddresses,
    createAddress,
    updateAddress,
    deleteAddress,
};

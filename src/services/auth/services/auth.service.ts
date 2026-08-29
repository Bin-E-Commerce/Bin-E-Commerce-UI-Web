// File này gom các Auth API thành facade ổn định cho các feature frontend.

import { changePassword } from '../endpoints/password.api';
import { getMe, updateProfile } from '../endpoints/profile.api';
import { getViewer, login, refresh } from '../endpoints/login.api';
import { logout } from '../endpoints/logout.api';
import { registerInitiate, registerVerify } from '../endpoints/register.api';
import {
    getSessions,
    logoutAllSessions,
    revokeOtherSessions,
    revokeSession,
} from '../endpoints/session.api';
import { getSocialAuthUrl, socialCallback } from '../endpoints/social-auth.api';
import { createAddress, getAddresses } from '../endpoints/address.api';

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
};

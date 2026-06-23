import { changePassword } from './endpoints/password.api';
import { getMe, updateProfile } from './endpoints/profile.api';
import { login, refresh } from './endpoints/login.api';
import { logout } from './endpoints/logout.api';
import { registerInitiate, registerVerify } from './endpoints/register.api';
import {
    getSessions,
    logoutAllSessions,
    revokeOtherSessions,
    revokeSession,
} from './endpoints/session.api';
import { getSocialAuthUrl, socialCallback } from './endpoints/social-auth.api';

export const authService = {
    login,
    refresh,
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
};


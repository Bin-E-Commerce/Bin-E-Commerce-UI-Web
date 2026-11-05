// File này gom các Auth API thành facade ổn định cho các feature frontend.

// Facade gom các API Auth theo contract ổn định để feature không phụ thuộc đường dẫn transport.

import {
    changePassword,
    forgotPassword,
    resetPassword,
} from './api/password.api';
import {
    getMe,
    getRefundBankAccount,
    updateProfile,
    updateRefundBankAccount,
} from './api/profile.api';
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

export const authService = {
    login,
    refresh,
    getViewer,
    logout,
    registerInitiate,
    registerVerify,
    changePassword,
    forgotPassword,
    resetPassword,
    getSocialAuthUrl,
    socialCallback,
    getMe,
    updateProfile,
    getRefundBankAccount,
    updateRefundBankAccount,
    getSessions,
    revokeSession,
    revokeOtherSessions,
    logoutAllSessions,
    getAddresses,
    createAddress,
    updateAddress,
    deleteAddress,
};

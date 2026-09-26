// Tiện ích tính cooldown resend từ metadata điều hướng; không đọc OTP, mật khẩu hay dữ liệu tài khoản.
export const RESET_PASSWORD_RESEND_COOLDOWN_SECONDS = 60;

// Tính số giây còn lại từ mốc gửi OTP, giúp cooldown không bị reset sai khi người dùng refresh trang.
export function getRemainingResetPasswordCooldown(
    sentAtParam: string | null,
    now = Date.now(),
): number {
    const sentAt = Number(sentAtParam);
    if (!Number.isFinite(sentAt) || sentAt <= 0) return 0;

    const remainingMilliseconds =
        sentAt + RESET_PASSWORD_RESEND_COOLDOWN_SECONDS * 1000 - now;

    return Math.max(0, Math.ceil(remainingMilliseconds / 1000));
}

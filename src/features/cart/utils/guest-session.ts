// Utility này lưu một UUID guest ổn định cho trình duyệt hiện tại.
// Utility không lưu thông tin cá nhân và không thay thế access token của Customer.

const GUEST_CART_SESSION_KEY = "bin-ecommerce.cart-session.v1";

// Lấy lại guest session cũ hoặc tạo session mới để các lần refresh vẫn thấy cùng một cart.
export function getGuestCartSessionId(): string {
    const currentSessionId = window.localStorage.getItem(GUEST_CART_SESSION_KEY);
    if (currentSessionId) return currentSessionId;

    const newSessionId = window.crypto.randomUUID();
    window.localStorage.setItem(GUEST_CART_SESSION_KEY, newSessionId);
    return newSessionId;
}

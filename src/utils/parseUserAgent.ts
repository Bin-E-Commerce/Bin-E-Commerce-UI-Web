export type DeviceType = 'desktop' | 'mobile' | 'tablet';

export interface ParsedUserAgent {
    browser: string;
    os: string;
    deviceType: DeviceType;
}

export function parseUserAgent(ua: string | null): ParsedUserAgent {
    if (!ua) return { browser: 'Không rõ', os: 'Không rõ', deviceType: 'desktop' };

    let deviceType: DeviceType = 'desktop';
    if (/tablet|ipad|playbook|silk/i.test(ua)) {
        deviceType = 'tablet';
    } else if (/mobile|android|iphone|ipod|blackberry|opera mini|iemobile|wpdesktop/i.test(ua)) {
        deviceType = 'mobile';
    }

    let os = 'Không rõ';
    if (/windows nt 10/i.test(ua)) os = 'Windows 10/11';
    else if (/windows nt 6\.3/i.test(ua)) os = 'Windows 8.1';
    else if (/windows nt 6\.1/i.test(ua)) os = 'Windows 7';
    else if (/windows/i.test(ua)) os = 'Windows';
    else if (/mac os x/i.test(ua)) {
        const match = ua.match(/mac os x [\d_]+/i);
        os = match
            ? `macOS ${match[0].replace('mac os x ', '').replace(/_/g, '.')}`
            : 'macOS';
    } else if (/iphone/i.test(ua)) os = 'iPhone';
    else if (/ipad/i.test(ua)) os = 'iPad';
    else if (/android/i.test(ua)) {
        const match = ua.match(/android [\d.]+/i);
        os = match ? `Android ${match[0].replace('android ', '')}` : 'Android';
    } else if (/linux/i.test(ua)) os = 'Linux';
    else if (/cros/i.test(ua)) os = 'Chrome OS';

    let browser = 'Không rõ';
    if (/edg\//i.test(ua)) browser = 'Microsoft Edge';
    else if (/opr\//i.test(ua) || /opera/i.test(ua)) browser = 'Opera';
    else if (/chrome\/[\d.]+/i.test(ua) && !/chromium/i.test(ua)) browser = 'Chrome';
    else if (/firefox\/[\d.]+/i.test(ua)) browser = 'Firefox';
    else if (/safari\/[\d.]+/i.test(ua) && !/chrome/i.test(ua)) browser = 'Safari';
    else if (/msie|trident/i.test(ua)) browser = 'Internet Explorer';
    else if (/chromium/i.test(ua)) browser = 'Chromium';

    return { browser, os, deviceType };
}

export function formatRelativeTime(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (mins < 1) return 'Vừa xong';
    if (mins < 60) return `${mins} phút trước`;
    if (hours < 24) return `${hours} giờ trước`;
    if (days < 30) return `${days} ngày trước`;

    return new Date(dateStr).toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    });
}

export function formatAbsoluteTime(dateStr: string): string {
    return new Date(dateStr).toLocaleString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

import { Monitor, Smartphone, Tablet } from 'lucide-react';

// Chọn icon phù hợp với loại thiết bị được parse từ user-agent.
export function DeviceIcon({
    deviceType,
    className,
}: {
    deviceType: string;
    className?: string;
}) {
    if (deviceType === 'mobile') return <Smartphone className={className} />;
    if (deviceType === 'tablet') return <Tablet className={className} />;
    return <Monitor className={className} />;
}

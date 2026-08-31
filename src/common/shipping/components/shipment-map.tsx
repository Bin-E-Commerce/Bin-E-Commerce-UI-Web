// File này render bản đồ route shipment ở client để tránh Leaflet truy cập window trong SSR.
// Map chỉ nhận tọa độ từ API, không geocode hoặc gửi địa chỉ khách hàng ra ngoài.

'use client';

import { useEffect, useMemo } from 'react';
import {
    CircleMarker,
    MapContainer,
    Polyline,
    Popup,
    TileLayer,
    useMap,
} from 'react-leaflet';
import type { LatLngBoundsExpression, LatLngTuple } from 'leaflet';
import type { ShipmentRoutePoint } from '@/services/shipping/shipping.api';

interface ShipmentMapProps {
    routePoints: ShipmentRoutePoint[];
    currentLocation: ShipmentRoutePoint;
    demoMode: boolean;
}

const DEFAULT_MAP_POINT: ShipmentRoutePoint = {
    latitude: 10.7769,
    longitude: 106.7009,
    label: 'Shop · Điểm lấy hàng',
};

// Ép tọa độ từ JSON cũ về số hợp lệ trước khi Leaflet nhận dữ liệu.
function normalizeCoordinate(value: number): number | null {
    const coordinate = Number(value);
    return Number.isFinite(coordinate) ? coordinate : null;
}

// Loại bỏ điểm route bị hỏng để một dữ liệu legacy không làm crash toàn bộ bản đồ.
function normalizeRoutePoint(point: ShipmentRoutePoint): ShipmentRoutePoint | null {
    const latitude = normalizeCoordinate(point.latitude);
    const longitude = normalizeCoordinate(point.longitude);
    if (latitude === null || longitude === null) return null;
    return { ...point, latitude, longitude };
}

// Tự căn khung theo toàn bộ route để người dùng luôn nhìn thấy cả chặng đã đi và chặng sắp tới.
function RouteViewport({ points }: { points: ShipmentRoutePoint[] }) {
    const map = useMap();

    useEffect(() => {
        if (points.length < 2) return;
        const bounds: LatLngBoundsExpression = points.map(toPosition);
        map.fitBounds(bounds, { padding: [28, 28] });
    }, [map, points]);

    return null;
}

// Chuyển một điểm API thành tuple Leaflet ổn định để cả polyline và marker dùng cùng một tọa độ.
function toPosition(point: ShipmentRoutePoint): LatLngTuple {
    return [Number(point.latitude), Number(point.longitude)];
}

// Bổ sung route minh họa cho shipment cũ chỉ lưu một điểm, tránh bản đồ bị rỗng khi demo dữ liệu legacy.
function buildDisplayRoute(routePoints: ShipmentRoutePoint[], currentLocation: ShipmentRoutePoint): ShipmentRoutePoint[] {
    const latitude = Number(currentLocation.latitude);
    const longitude = Number(currentLocation.longitude);
    const normalizedRoute = (Array.isArray(routePoints) ? routePoints : []).map(normalizeRoutePoint);
    if (normalizedRoute.length >= 2 && normalizedRoute.every((point) => point !== null)) {
        return normalizedRoute.filter((point): point is ShipmentRoutePoint => point !== null);
    }
    return [
        { ...currentLocation, latitude, longitude, label: 'Shop · Điểm lấy hàng' },
        { latitude: latitude - 0.0038, longitude: longitude + 0.0062, label: 'Trạm GHN · Đã tiếp nhận' },
        { latitude: latitude - 0.0094, longitude: longitude + 0.0028, label: 'Kho trung chuyển · Đang luân chuyển' },
        { latitude: latitude - 0.0065, longitude: longitude + 0.0138, label: 'Khu vực giao · Shipper đang giao' },
        { latitude: latitude - 0.0017, longitude: longitude + 0.0182, label: 'Điểm nhận · Giao thành công' },
    ];
}

// Chọn điểm route gần marker hiện tại nhất để tách phần đường đã đi và phần sắp đi.
function findCurrentIndex(points: ShipmentRoutePoint[], currentLocation: ShipmentRoutePoint): number {
    if (!points.length) return 0;
    return points.reduce((nearestIndex, point, index) => {
        const nearest = points[nearestIndex];
        if (!nearest) return index;
        const nearestDistance = (nearest.latitude - currentLocation.latitude) ** 2 + (nearest.longitude - currentLocation.longitude) ** 2;
        const pointDistance = (point.latitude - currentLocation.latitude) ** 2 + (point.longitude - currentLocation.longitude) ** 2;
        return pointDistance < nearestDistance ? index : nearestIndex;
    }, 0);
}

// Vẽ route hai lớp, đánh dấu chặng hiện tại và giữ màu trung tính để giao diện giống sản phẩm thương mại.
export default function ShipmentMap({ routePoints, currentLocation, demoMode }: ShipmentMapProps) {
    const currentLatitude = Number(currentLocation.latitude);
    const currentLongitude = Number(currentLocation.longitude);
    const currentLabel = currentLocation.label;
    const normalizedCurrentLocation = useMemo(
        () => normalizeRoutePoint({ latitude: currentLatitude, longitude: currentLongitude, label: currentLabel }) ?? DEFAULT_MAP_POINT,
        [currentLatitude, currentLongitude, currentLabel],
    );
    const displayRoute = useMemo(
        () => buildDisplayRoute(routePoints, normalizedCurrentLocation),
        [routePoints, normalizedCurrentLocation],
    );
    const currentIndex = findCurrentIndex(displayRoute, normalizedCurrentLocation);
    const completedRoute = displayRoute.slice(0, currentIndex + 1);
    const upcomingRoute = displayRoute.slice(Math.max(0, currentIndex), displayRoute.length);
    const center = toPosition(normalizedCurrentLocation);

    return (
        <div className="relative h-[320px] overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-100 shadow-sm sm:h-[360px]">
            <MapContainer center={center} zoom={13} scrollWheelZoom={false} className="h-full w-full">
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <RouteViewport points={displayRoute} />
                <Polyline positions={displayRoute.map(toPosition)} pathOptions={{ color: '#a1a1aa', weight: 5, opacity: 0.72, dashArray: '8 10' }} />
                {upcomingRoute.length > 1 ? <Polyline positions={upcomingRoute.map(toPosition)} pathOptions={{ color: '#d4d4d8', weight: 5, opacity: 0.9, dashArray: '3 8' }} /> : null}
                {completedRoute.length > 1 ? <Polyline positions={completedRoute.map(toPosition)} pathOptions={{ color: '#18181b', weight: 6, opacity: 0.9 }} /> : null}
                {displayRoute.map((point, index) => {
                    const isCurrent = index === currentIndex;
                    const isCompleted = index <= currentIndex;
                    return (
                        <CircleMarker
                            key={`${point.label}-${index}`}
                            center={toPosition(point)}
                            radius={isCurrent ? 10 : index === 0 || index === displayRoute.length - 1 ? 7 : 5}
                            pathOptions={{ color: isCurrent ? '#059669' : '#52525b', fillColor: isCurrent ? '#10b981' : isCompleted ? '#18181b' : '#ffffff', fillOpacity: 1, weight: isCurrent ? 4 : 2 }}
                        >
                            <Popup>{point.label}</Popup>
                        </CircleMarker>
                    );
                })}
            </MapContainer>
            <div className="pointer-events-none absolute inset-x-3 top-3 z-[500] flex items-start justify-between gap-2">
                <div className="max-w-[72%] rounded-xl border border-zinc-200/90 bg-white/95 px-3 py-2 shadow-lg backdrop-blur">
                    <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-zinc-400">Hành trình vận chuyển</p>
                    <p className="mt-0.5 truncate text-xs font-semibold text-zinc-950">{normalizedCurrentLocation.label}</p>
                </div>
                <span className="rounded-full bg-zinc-950 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-white shadow-lg">
                    {demoMode ? 'Demo' : 'GHN Test'}
                </span>
            </div>
            <div className="pointer-events-none absolute bottom-3 left-3 z-[500] flex items-center gap-3 rounded-lg border border-zinc-200/90 bg-white/95 px-3 py-2 text-[10px] font-medium text-zinc-600 shadow-lg backdrop-blur">
                <span className="flex items-center gap-1.5"><span className="h-1.5 w-5 rounded-full bg-zinc-950" />Đã đi</span>
                <span className="flex items-center gap-1.5"><span className="h-1.5 w-5 rounded-full border-t-2 border-dashed border-zinc-400" />Sắp đi</span>
            </div>
        </div>
    );
}

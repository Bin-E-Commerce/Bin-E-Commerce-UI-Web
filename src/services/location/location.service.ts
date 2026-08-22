import { API_VERSION } from '@/config/api.config';
import publicAxios from '@/utils/publicAxios';
import type {
    ListLocationsParams,
    LocationDto,
    PaginatedLocationResponse,
} from './types/location.types';

export const locationService = {
    // Lấy dữ liệu địa chỉ từ location-service thông qua API Gateway để FE không phụ thuộc API nguồn bên ngoài.
    listLocations: (params: ListLocationsParams = {}) =>
        publicAxios
            .get<PaginatedLocationResponse<LocationDto>>(
                `${API_VERSION}/locations`,
                { params },
            )
            .then((response) => response.data),

    // Lấy một địa điểm theo id để các màn hình chi tiết có thể hiển thị tên thay vì UUID kỹ thuật.
    getLocationById: (id: string) =>
        publicAxios
            .get<LocationDto>(`${API_VERSION}/locations/${id}`)
            .then((response) => response.data),
};

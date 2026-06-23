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
};


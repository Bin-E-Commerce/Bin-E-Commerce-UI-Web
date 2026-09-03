// Hook này hydrate active cart sau khi frontend biết auth restore đã hoàn tất.
// Hook không gọi Add Item hay Merge Cart; đó là các nghiệp vụ của phase sau.

"use client";

import { useQuery } from "@tanstack/react-query";
import { useAppSelector } from "@/store/hooks";
import { getActiveCart } from "@/services/cart";

// Tải cart chỉ sau khi auth restore xác nhận Customer; Guest sẽ được chuyển tới login ở UI.
export function useCart() {
    const { initialized, accessToken, user } = useAppSelector(
        (state) => state.auth,
    );
    const userId = user?.id ?? null;
    const isAuthenticated = Boolean(initialized && accessToken && userId);

    return useQuery({
        queryKey: ["cart", userId ?? "anonymous"],
        queryFn: () => getActiveCart(),
        enabled: isAuthenticated,
        staleTime: 30_000,
    });
}

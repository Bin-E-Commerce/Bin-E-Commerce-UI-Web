// Adapter lấy snapshot ví shop qua Gateway; mọi khoản tiền và shop scope do backend xác định.
import { API_BASE_URL, API_VERSION } from '@/config/api.config';
import authorizedAxios from '@/utils/authorizedAxios';
import type { SellerWalletSnapshot } from '@/services/seller/types/seller-wallet.types';

// Lấy một trang ledger và hai số dư; endpoint không có mutation rút tiền.
export async function getSellerWallet(page = 1, pageSize = 20): Promise<SellerWalletSnapshot> {
    const response = await authorizedAxios.get<SellerWalletSnapshot>(
        `${API_BASE_URL}${API_VERSION}/seller/finance/wallet`,
        { params: { page, pageSize } },
    );
    return response.data;
}

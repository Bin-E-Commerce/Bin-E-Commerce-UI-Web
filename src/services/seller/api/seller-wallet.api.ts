// Adapter lấy snapshot ví shop qua Gateway; mọi khoản tiền và shop scope do backend xác định.
import { API_BASE_URL, API_VERSION } from '@/config/api.config';
import authorizedAxios from '@/utils/authorizedAxios';
import type {
    SellerWalletDepositResponse,
    SellerWalletSnapshot,
    SellerWalletWithdrawal,
} from '@/services/seller/types/seller-wallet.types';

// Lấy một trang ledger và hai số dư; endpoint không có mutation rút tiền.
export async function getSellerWallet(
    page = 1,
    pageSize = 20,
): Promise<SellerWalletSnapshot> {
    const response = await authorizedAxios.get<SellerWalletSnapshot>(
        `${API_BASE_URL}${API_VERSION}/seller/finance/wallet`,
        { params: { page, pageSize } },
    );
    return response.data;
}

// Tạo top-up độc lập với order payment và nhận URL Pay2S Sandbox để điều hướng người bán.
export async function createSellerWalletDeposit(
    amount: string,
): Promise<SellerWalletDepositResponse> {
    const response = await authorizedAxios.post<SellerWalletDepositResponse>(
        `${API_BASE_URL}${API_VERSION}/seller/finance/wallet/deposits`,
        { amount },
    );
    return response.data;
}

// Tạo yêu cầu rút; backend lấy tài khoản nhận từ hồ sơ shop và tự giữ chỗ số dư.
export async function createSellerWalletWithdrawal(
    amount: string,
): Promise<SellerWalletWithdrawal> {
    const response = await authorizedAxios.post<SellerWalletWithdrawal>(
        `${API_BASE_URL}${API_VERSION}/seller/finance/wallet/withdrawals`,
        { amount },
    );
    return response.data;
}

// Lấy trạng thái các yêu cầu rút của shop hiện tại; backend không trả số tài khoản đầy đủ.
export async function getSellerWalletWithdrawals(
    page = 1,
    pageSize = 20,
): Promise<{ items: SellerWalletWithdrawal[]; total: number }> {
    const response = await authorizedAxios.get<{
        items: SellerWalletWithdrawal[];
        total: number;
    }>(`${API_BASE_URL}${API_VERSION}/seller/finance/wallet/withdrawals`, {
        params: { page, pageSize },
    });
    return response.data;
}

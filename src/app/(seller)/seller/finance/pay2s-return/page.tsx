import { WalletDepositReturnContent } from '../components/WalletDepositReturnContent';

// Pay2S trả seller về route riêng để xác minh giao dịch nạp rồi điều hướng lại ví shop.
export default function SellerWalletDepositReturnPage() {
    return <WalletDepositReturnContent />;
}

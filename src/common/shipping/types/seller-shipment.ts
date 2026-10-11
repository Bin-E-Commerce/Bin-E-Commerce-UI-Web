// Hợp đồng UI cho panel tracking và các thao tác vận đơn phía Seller.

import type { ReactNode } from 'react';

import type { ShipmentResponse } from '@/services/shipping';

export interface SellerShipmentPanelProps {
    orderId: string;
    orderStage?: string | null;
}

export interface SellerCancelShipmentDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    loading: boolean;
    onConfirm: (reason: string) => Promise<void>;
}

export interface ShipmentTrackingCardProps {
    shipment: ShipmentResponse;
    sellerActions?: ReactNode;
    viewer?: 'seller' | 'customer';
}

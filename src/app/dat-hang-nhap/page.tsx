import PurchaseOrderPage from '@/components/PurchaseOrder/PurchaseOrderPage';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Gas Tuấn Đạt - Đặt hàng nhập',
};

export default function PurchaseOrder() {
  return <PurchaseOrderPage />;
}

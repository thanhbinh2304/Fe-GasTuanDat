import OrderProcessingPage from '@/components/OrderProcessing/OrderProcessingPage';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Gas Tuấn Đạt - Xử lý đặt hàng nhập',
};

export default function OrderProcessing() {
  return <OrderProcessingPage />;
}

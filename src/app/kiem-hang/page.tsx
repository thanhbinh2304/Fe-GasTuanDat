import StockCheckPage from '@/components/StockCheck/StockCheckPage';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Gas Tuấn Đạt - Kiểm hàng hóa',
};

export default function StockCheck() {
  return <StockCheckPage />;
}

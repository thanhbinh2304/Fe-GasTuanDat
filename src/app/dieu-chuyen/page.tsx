import StockTransferPage from '@/components/StockTransfer/StockTransferPage';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Gas Tuấn Đạt - Điều chuyển hàng hóa',
  description: 'Quản lý điều chuyển hàng hóa Gas Tuấn Đạt',
};

export default function Page() {
  return <StockTransferPage />;
}

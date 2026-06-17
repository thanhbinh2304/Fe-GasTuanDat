import GasBookPage from '@/components/GasBook/GasBookPage';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Gas Tuấn Đạt - Sổ gas',
  description: 'Quản lý danh sách sổ gas khách hàng',
};

export default function SoGasRoute() {
  return <GasBookPage />;
}

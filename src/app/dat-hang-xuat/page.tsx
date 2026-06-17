import ExportOrderPage from '@/components/ExportOrder/ExportOrderPage';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Gas Tuấn Đạt - Đặt hàng xuất',
};

export default function DatHangXuatRoute() {
  return <ExportOrderPage />;
}

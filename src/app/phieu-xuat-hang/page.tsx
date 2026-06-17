import ExportReceiptPage from '@/components/ExportReceipt/ExportReceiptPage';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Gas Tuấn Đạt - Phiếu xuất hàng',
};

export default function PhieuXuatHangRoute() {
  return <ExportReceiptPage />;
}

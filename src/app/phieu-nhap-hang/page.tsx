import ImportReceiptPage from '@/components/ImportReceipt/ImportReceiptPage';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Gas Tuấn Đạt - Phiếu nhập hàng',
};

export default function PhieuNhapHangRoute() {
  return <ImportReceiptPage />;
}

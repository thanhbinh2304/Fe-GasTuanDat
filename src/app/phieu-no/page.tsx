import DebtReceiptPage from '@/components/DebtReceipt/DebtReceiptPage';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Gas Tuấn Đạt - Phiếu nợ',
};

export default function DebtReceipt() {
  return <DebtReceiptPage />;
}

import ExportProcessingPage from '@/components/ExportProcessing/ExportProcessingPage';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Gas Tuấn Đạt - Xử lý đặt hàng xuất',
};

export default function XuLyXuatHangRoute() {
  return <ExportProcessingPage />;
}

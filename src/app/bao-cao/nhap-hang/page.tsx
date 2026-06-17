import ImportReportPage from '@/components/Report/ImportReportPage';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Gas Tuấn Đạt - Báo cáo Nhập hàng',
};

export default function ImportReport() {
  return <ImportReportPage />;
}

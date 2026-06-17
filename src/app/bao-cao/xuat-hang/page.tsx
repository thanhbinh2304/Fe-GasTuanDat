import ExportReportPage from '@/components/Report/ExportReportPage';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Gas Tuấn Đạt - Báo cáo Xuất hàng',
};

export default function ExportReport() {
  return <ExportReportPage />;
}

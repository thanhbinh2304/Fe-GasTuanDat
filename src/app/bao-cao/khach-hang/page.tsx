import CustomerReportPage from '@/components/Report/CustomerReportPage';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Gas Tuấn Đạt - Báo cáo Khách hàng',
};

export default function CustomerReport() {
  return <CustomerReportPage />;
}

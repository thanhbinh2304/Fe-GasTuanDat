import SupplierReportPage from '@/components/Report/SupplierReportPage';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Gas Tuấn Đạt - Báo cáo Nhà cung cấp',
};

export default function SupplierReport() {
  return <SupplierReportPage />;
}

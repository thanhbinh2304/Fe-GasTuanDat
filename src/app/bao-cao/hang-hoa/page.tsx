import ProductReportPage from '@/components/Report/ProductReportPage';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Gas Tuấn Đạt - Báo cáo Hàng hóa',
};

export default function ProductReport() {
  return <ProductReportPage />;
}

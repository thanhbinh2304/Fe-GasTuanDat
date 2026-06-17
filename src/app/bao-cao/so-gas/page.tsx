import GasBookReportPage from '@/components/Report/GasBookReportPage';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Gas Tuấn Đạt - Báo cáo Sổ gas',
};

export default function GasBookReport() {
  return <GasBookReportPage />;
}

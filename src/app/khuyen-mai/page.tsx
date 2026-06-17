import PromotionPage from '@/components/Promotion/PromotionPage';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Gas Tuấn Đạt - Khuyến mại',
  description: 'Quản lý chương trình khuyến mại',
};

export default function KhuyenMaiRoute() {
  return <PromotionPage />;
}

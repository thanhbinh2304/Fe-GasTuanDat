import type { Metadata } from 'next';
import ProductListPage from '@/components/ProductList/ProductListPage';

export const metadata: Metadata = {
  title: 'Gas Tuấn Đạt - Danh sách hàng hóa',
  description: 'Quản lý toàn bộ hàng hóa trong hệ thống',
};

export default function Page() {
  return <ProductListPage />;
}

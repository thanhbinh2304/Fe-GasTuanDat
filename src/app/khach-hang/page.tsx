import CustomerPage from '@/components/Customer/CustomerPage';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Gas Tuấn Đạt - Khách hàng',
  description: 'Quản lý danh sách khách hàng',
};

export default function KhachHangRoute() {
  return <CustomerPage />;
}

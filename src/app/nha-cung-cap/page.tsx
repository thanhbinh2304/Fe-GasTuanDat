import SupplierPage from '@/components/Supplier/SupplierPage';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Gas Tuấn Đạt - Nhà cung cấp',
  description: 'Quản lý danh sách nhà cung cấp',
};

export default function NhaCungCapRoute() {
  return <SupplierPage />;
}

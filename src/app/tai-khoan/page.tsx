import AccountPage from '@/components/Account/AccountPage';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Quản lý Tài khoản',
};

export default function AccountRoute() {
  return <AccountPage />;
}
